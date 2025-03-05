"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { ListTodo } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TodosButtonProps {
  onClick: () => void
}

export default function TodosButton({ onClick }: TodosButtonProps) {
  const [todoCount, setTodoCount] = useState(0)

  useEffect(() => {
    if (!db) return

    // Simplified query that doesn't require a composite index
    const q = query(collection(db, "todos"), where("status", "in", ["todo", "in-progress"]))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setTodoCount(querySnapshot.size)
    })

    return () => unsubscribe()
  }, [])

  return (
    <Button size="sm" onClick={onClick} className="relative">
      <ListTodo className="h-4 w-4 mr-2" />
      <span>Todos</span>
      {todoCount > 0 && (
        <Badge variant="secondary" className="ml-2">
          {todoCount}
        </Badge>
      )}
    </Button>
  )
}

