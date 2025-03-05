"use client"

import { useState, useEffect, useRef } from "react"
import type { User } from "firebase/auth"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  getDoc,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Todo, TodoStatus } from "@/lib/types"
import TodoItem from "./TodoItem"

interface TodoListProps {
  currentUser: User
}

export default function TodoList({ currentUser }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const processedTodoIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!db) return

    // Only show non-archived todos
    const q = query(
      collection(db, "todos"),
      where("status", "!=", "archived"),
      orderBy("status"),
      orderBy("updatedAt", "desc"),
    )

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const todosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Todo[]

        setTodos(todosData)
        setLoading(false)

        // Only process new todos that haven't been seen yet
        todosData.forEach((todo) => {
          if (!processedTodoIds.current.has(todo.id)) {
            // Check if the current user has already seen this todo
            const alreadySeen = todo.seenBy?.some((user) => user.uid === currentUser.uid)

            if (!alreadySeen) {
              markTodoAsSeen(todo.id)
            }

            // Mark this todo as processed so we don't check it again
            processedTodoIds.current.add(todo.id)
          }
        })
      },
      (error) => {
        console.error("Error fetching todos:", error)
        setError("Failed to load todos")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [currentUser.uid])

  const markTodoAsSeen = async (todoId: string) => {
    if (!db || !currentUser) return

    try {
      const todoRef = doc(db, "todos", todoId)

      // Get the latest version of the todo to ensure we have the most up-to-date seenBy array
      const todoDoc = await getDoc(todoRef)
      if (!todoDoc.exists()) return

      const todoData = todoDoc.data() as Todo

      // Double-check that the user hasn't already been marked as having seen this todo
      const alreadySeen = todoData.seenBy?.some((user) => user.uid === currentUser.uid)

      if (!alreadySeen) {
        await updateDoc(todoRef, {
          seenBy: arrayUnion({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            timestamp: new Date().toISOString(),
          }),
        })
      }
    } catch (error) {
      console.error("Error marking todo as seen:", error)
    }
  }

  const updateTodoStatus = async (id: string, status: TodoStatus) => {
    if (!db) return

    try {
      await updateDoc(doc(db, "todos", id), {
        status,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating todo:", error)
      setError("Failed to update todo")
    }
  }

  const archiveTodo = async (id: string) => {
    if (!db || !currentUser) return

    try {
      await updateDoc(doc(db, "todos", id), {
        status: "archived",
        updatedAt: serverTimestamp(),
        archivedBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          timestamp: serverTimestamp(),
        },
      })
    } catch (error) {
      console.error("Error archiving todo:", error)
      setError("Failed to archive todo")
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
      {todos.length === 0 ? (
        <div className="text-center p-8 border rounded-md border-dashed">
          <p className="text-muted-foreground">No todos yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              currentUser={currentUser}
              onStatusChange={updateTodoStatus}
              onArchive={archiveTodo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

