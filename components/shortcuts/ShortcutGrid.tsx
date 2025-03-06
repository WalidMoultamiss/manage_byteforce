"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "firebase/auth"
import type { Shortcut } from "@/lib/types"
import ShortcutCard from "./ShortcutCard"
import AddShortcutForm from "./AddShortcutForm"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default function ShortcutGrid({ currentUser }: { currentUser: User }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddingShortcut, setIsAddingShortcut] = useState(false)

  useEffect(() => {
  if (!currentUser) return

  // Query for shortcuts with status either "public" or "private"
  const q = query(
    collection(db, "shortcuts"),
    orderBy("createdAt", "desc")
  )

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const shortcutsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shortcut[]

      // Filter: if shortcut is private, only include if currentUser is allowed
      const filteredShortcuts = shortcutsData.filter((shortcut) => {
        if (shortcut?.status === "private") {
          return shortcut.allowedUsers && shortcut?.allowedUsers?.includes(currentUser?.uid)
        }
        return true // public shortcuts are always shown
      })

      setShortcuts(filteredShortcuts)
      setLoading(false)
    },
    (error) => {
      console.error("Error fetching shortcuts:", error)
      setError("Failed to load shortcuts")
      setLoading(false)
    }
  )

  return () => unsubscribe()
}, [currentUser])


  const addShortcut = async (
    shortcut: Omit<Shortcut, "id" | "createdAt">,
  ) => {
    try {
      const dataToAdd = {
        ...shortcut,
        createdAt: serverTimestamp(),
        // If the shortcut is private, only allow the current user to see it
        ...(shortcut.status === "private" && { allowedUsers: [currentUser.uid] }),
      }
      await addDoc(collection(db, "shortcuts"), dataToAdd)
      setIsAddingShortcut(false)
    } catch (error) {
      console.error("Error adding shortcut:", error)
      setError("Failed to add shortcut")
    }
  }

  const deleteShortcut = async (id: string) => {
    try {
      await deleteDoc(doc(db, "shortcuts", id))
    } catch (error) {
      console.error("Error deleting shortcut:", error)
      setError("Failed to delete shortcut")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4 rounded-md bg-red-50 dark:bg-red-900/20">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Shortcuts</h2>

      </div>


      {shortcuts.length === 0 && !isAddingShortcut ? (
        <div className="text-center p-8 border rounded-md border-dashed">
          <p className="text-muted-foreground">No shortcuts yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shortcuts.map((shortcut) => (
            <ShortcutCard key={shortcut.id} shortcut={shortcut} onDelete={deleteShortcut} />
          ))}
          <AddShortcutForm onSubmit={addShortcut} onCancel={() => setIsAddingShortcut(false)} />
        </div>
      )}
    </div>
  )
}

