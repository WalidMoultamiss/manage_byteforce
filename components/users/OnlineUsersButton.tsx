"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface OnlineUsersButtonProps {
  onClick: () => void
}

export default function OnlineUsersButton({ onClick }: OnlineUsersButtonProps) {
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    if (!db) return

    // Get online users from the last 15 minutes
    const fifteenMinutesAgo = new Date()
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)

    const q = query(collection(db, "onlineUsers"), orderBy("lastActive", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setOnlineCount(querySnapshot.size)
    })

    return () => unsubscribe()
  }, [])

  return (
    <Button size="sm" onClick={onClick} variant="outline" className="relative">
      <Users className="h-4 w-4 mr-2" />
      <span>Users</span>
      {onlineCount > 0 && (
        <Badge variant="secondary" className="ml-2 bg-green-500 text-white">
          {onlineCount}
        </Badge>
      )}
    </Button>
  )
}

