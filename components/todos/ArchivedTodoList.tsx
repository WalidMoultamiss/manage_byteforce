"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { collection, query, orderBy, onSnapshot, updateDoc, doc, serverTimestamp, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Todo } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ExternalLink, Image } from "lucide-react"

interface ArchivedTodoListProps {
  currentUser: User
}

export default function ArchivedTodoList({ currentUser }: ArchivedTodoListProps) {
  const [archivedTodos, setArchivedTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!db) return

    // Only show archived todos
    const q = query(collection(db, "todos"), where("status", "==", "archived"), orderBy("updatedAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const todosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Todo[]

        setArchivedTodos(todosData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching archived todos:", error)
        setError("Failed to load archived todos")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const restoreTodo = async (id: string) => {
    if (!db) return

    try {
      await updateDoc(doc(db, "todos", id), {
        status: "todo",
        updatedAt: serverTimestamp(),
        // Remove the archivedBy field
        archivedBy: null,
      })
    } catch (error) {
      console.error("Error restoring todo:", error)
      setError("Failed to restore todo")
    }
  }

  const toggleExpand = (todoId: string) => {
    const newExpanded = new Set(expandedTodos)
    if (newExpanded.has(todoId)) {
      newExpanded.delete(todoId)
    } else {
      newExpanded.add(todoId)
    }
    setExpandedTodos(newExpanded)
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
      {archivedTodos.length === 0 ? (
        <div className="text-center p-8 border rounded-md border-dashed">
          <p className="text-muted-foreground">No archived todos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedTodos.map((todo) => (
            <Card key={todo.id} className="overflow-hidden">
              <CardContent className="p-4">
                <Collapsible open={expandedTodos.has(todo.id)} onOpenChange={() => toggleExpand(todo.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{todo.title}</h3>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-6 w-6 ml-2">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${expandedTodos.has(todo.id) ? "transform rotate-180" : ""}`}
                            />
                            <span className="sr-only">Toggle details</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      {/* Archived by */}
                      {todo.archivedBy && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>Archived by: </span>
                          <Avatar className="h-4 w-4 ml-1">
                            <AvatarImage src={todo.archivedBy.photoURL || ""} />
                            <AvatarFallback className="text-[8px]">
                              {todo.archivedBy.displayName ? getInitials(todo.archivedBy.displayName) : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="ml-1">{todo.archivedBy.displayName || "Unknown"}</span>
                        </div>
                      )}
                    </div>

                    <Button size="sm" variant="outline" onClick={() => restoreTodo(todo.id)}>
                      Restore
                    </Button>
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
                            <div
                              key={index}
                              className="flex items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                            >
                              {attachment.type === "image" ? (
                                <div className="flex items-center">
                                  <Image className="h-4 w-4 mr-2" />
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline truncate"
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
                                  >
                                    {attachment.url.length > 30
                                      ? `${attachment.url.substring(0, 30)}...`
                                      : attachment.url}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

