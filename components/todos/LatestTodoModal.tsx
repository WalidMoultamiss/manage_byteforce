"use client"

import type React from "react"

import { useState } from "react"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Todo, TodoStatus } from "@/lib/types"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Image } from "lucide-react"

interface LatestTodoModalProps {
  todo: Todo
  isOpen: boolean
  onClose: () => void
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

export default function LatestTodoModal({ todo, isOpen, onClose }: LatestTodoModalProps) {
  const [title, setTitle] = useState(todo.title)
  const [status, setStatus] = useState<TodoStatus>(todo.status)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) return

    setIsSubmitting(true)

    try {
      await updateDoc(doc(db, "todos", todo.id), {
        title,
        status,
        updatedAt: serverTimestamp(),
      })

      onClose()
    } catch (error) {
      console.error("Error updating todo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Latest Todo</DialogTitle>
          <DialogDescription>View and update the most recently updated todo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TodoStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {todo.attachment && (
              <div className="space-y-2">
                <Label>Attachment</Label>
                <div className="flex items-center text-sm p-2 bg-muted rounded-md">
                  {todo.attachment.type === "image" ? (
                    <div className="flex items-center">
                      <Image className="h-4 w-4 mr-2" />
                      <a
                        href={todo.attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Image
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <a
                        href={todo.attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                      >
                        {todo.attachment.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!title || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

