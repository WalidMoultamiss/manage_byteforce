"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { OnlineUser } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OnlineUsersModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OnlineUsersModal({ isOpen, onClose }: OnlineUsersModalProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !isOpen) return

    // Get users who have been active in the last 15 minutes
    const fifteenMinutesAgo = new Date()
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)

    const q = query(collection(db, "onlineUsers"), orderBy("lastActive", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as OnlineUser[]

      setOnlineUsers(users)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isOpen])

  // Get user initials for avatar fallback
  const getInitials = (user: OnlineUser) => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    }
    return "U"
  }

  // Update access to true
  const grantAccess = async (userId: string) => {
    const userRef = doc(db, "onlineUsers", userId)
    await updateDoc(userRef, { access: true })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Online Users</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : onlineUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users currently online</p>
          ) : (
            <div className="space-y-4">
              {onlineUsers.map((user) => (
                <div key={user.uid} className="w-full flex items-center justify-between space-x-4">
                  <div className="flex  space-x-4">

                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.displayName || "Anonymous User"}</p>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                  </div>
                  {/* Button to grant access */}
                  {!user?.access && (
                    <button
                      className="ml-4 float-right px-4 py-2 text-white bg-blue-500 rounded"
                      onClick={() => grantAccess(user.uid)}
                    >
                      Grant Access
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
