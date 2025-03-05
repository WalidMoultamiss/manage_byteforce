"use client"

import type { TodoSeenBy } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface SeenByModalProps {
  isOpen: boolean
  onClose: () => void
  seenBy: TodoSeenBy[]
}

export default function SeenByModal({ isOpen, onClose, seenBy }: SeenByModalProps) {
  // Get user initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    }
    return "U"
  }

  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "Unknown time"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seen by</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {seenBy.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No one has seen this todo yet</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {seenBy.map((user) => (
                <div key={user.uid} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.displayName || "Anonymous User"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(user.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

