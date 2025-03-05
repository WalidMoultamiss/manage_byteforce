"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Todo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface LatestTodoButtonProps {
  onLatestTodoClick: (todo: Todo) => void
}

export default function LatestTodoButton({ onLatestTodoClick }: LatestTodoButtonProps) {
  const [latestTodo, setLatestTodo] = useState<Todo | null>(null)

  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("updatedAt", "desc"), limit(1))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        setLatestTodo({
          id: doc.id,
          ...doc.data(),
        } as Todo)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleClick = () => {
    if (latestTodo) {
      onLatestTodoClick(latestTodo)
    }
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={!latestTodo} className="bg-blue-500 hover:bg-blue-600">
      <Bell className="h-4 w-4 mr-2" />
      Latest Todo
    </Button>
  )
}

