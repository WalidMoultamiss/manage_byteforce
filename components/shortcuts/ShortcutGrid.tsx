"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Shortcut } from "@/lib/types"
import ShortcutCard from "./ShortcutCard"
import AddShortcutForm from "./AddShortcutForm"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default function ShortcutGrid() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddingShortcut, setIsAddingShortcut] = useState(false)

  useEffect(() => {
    const q = query(collection(db, "shortcuts"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const shortcutsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Shortcut[]

        setShortcuts(shortcutsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching shortcuts:", error)
        setError("Failed to load shortcuts")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const addShortcut = async (shortcut: Omit<Shortcut, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "shortcuts"), {
        ...shortcut,
        createdAt: serverTimestamp(),
      })
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
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setIsAddingShortcut(true)} disabled={isAddingShortcut}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Shortcut
        </Button>
      </div>

      {isAddingShortcut && <AddShortcutForm onSubmit={addShortcut} onCancel={() => setIsAddingShortcut(false)} />}

      {shortcuts.length === 0 && !isAddingShortcut ? (
        <div className="text-center p-8 border rounded-md border-dashed">
          <p className="text-muted-foreground">No shortcuts yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shortcuts.map((shortcut) => (
            <ShortcutCard key={shortcut.id} shortcut={shortcut} onDelete={deleteShortcut} />
          ))}
        </div>
      )}
    </div>
  )
}

