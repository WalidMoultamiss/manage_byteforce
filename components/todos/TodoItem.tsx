"use client"

import { useState } from "react"
import type { User } from "firebase/auth"
import type { Todo, TodoStatus } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Image, Archive, Eye, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import SeenByModal from "./SeenByModal"

interface TodoItemProps {
  todo: Todo
  currentUser: User
  OpenWide: boolean
  onStatusChange: (id: string, status: TodoStatus) => void
  onArchive: (id: string) => void
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

export default function TodoItem({ OpenWide, todo, currentUser, onStatusChange, onArchive }: TodoItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [seenByModalOpen, setSeenByModalOpen] = useState(false)

  const handleStatusChange = (value: string) => {
    onStatusChange(todo.id, value as TodoStatus)
  }

  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "archived":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-grow">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{todo.title}</h3>
                {(todo.description && OpenWide) && (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6 ml-2"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}
                      />
                      <span className="sr-only">Toggle details</span>
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>

              {/* Created by */}
              {(todo.createdBy && OpenWide) && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Created by: </span>
                  <Avatar className="h-4 w-4 ml-1">
                    <AvatarImage src={todo.createdBy.photoURL || ""} />
                    <AvatarFallback className="text-[8px]">
                      {todo.createdBy.displayName ? getInitials(todo.createdBy.displayName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-1">{todo.createdBy.displayName || "Unknown"}</span>
                </div>
              )}

              {/* Seen by users */}
              {todo.seenBy && todo.seenBy.length > 0 && (
                <div className="flex items-center mt-2">
                  <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div
                    className="flex -space-x-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSeenByModalOpen(true)
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <TooltipProvider>
                      {todo.seenBy.slice(0, 5).map((user) => (
                        <Tooltip key={user.uid}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={user.photoURL || ""} />
                              <AvatarFallback className="text-xs">{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.displayName || "Anonymous User"}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>

                    {todo.seenBy.length > 5 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar
                              className="h-6 w-6 border-2 border-background bg-muted"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <AvatarFallback className="text-xs">+{todo.seenBy.length - 5}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{todo.seenBy.length - 5} more users</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="space-x-2 flex">
              {OpenWide && (
                <Select defaultValue={todo.status} onValueChange={handleStatusChange}>
                  <SelectTrigger
                    className={`w-[130px] h-8 text-xs ${getStatusColor(todo.status)}`}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                {OpenWide && (
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                )}
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive Todo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to archive this todo? It will be moved to the archive.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchive(todo.id)
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      Archive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <CollapsibleContent className="mt-3">
            {todo.description && (
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-3">
                {todo.description}
              </div>
            )}

            {todo.attachments && todo.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Attachments:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {todo.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {attachment.type === "image" ? (
                        <div className="flex items-center">
                          <Image className="h-4 w-4 mr-2" />
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            View Image
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            {attachment.url.length > 30 ? `${attachment.url.substring(0, 30)}...` : attachment.url}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      {seenByModalOpen && (
        <SeenByModal isOpen={seenByModalOpen} onClose={() => setSeenByModalOpen(false)} seenBy={todo.seenBy || []} />
      )}
    </Card>
  )
}
