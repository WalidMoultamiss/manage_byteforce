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
import Column from "./Column"

import { DndContext, closestCorners } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TodoListProps {
  currentUser: User;
  OpenWide: boolean;
  projectID?: string;
}

const COLUMNS: { title: string; status: TodoStatus }[] = [
  { title: "To Do", status: "todo" },
  { title: "In Progress", status: "in-progress" },
  { title: "Done", status: "done" },
]

/**
 * Wrapper draggable pour TodoItem.
 * Nous utilisons useSortable ici afin d'ajouter le drag-and-drop
 * sans modifier le contenu visuel du composant TodoItem.
 */
interface DraggableTodoItemProps {
  todo: Todo
  currentUser: User
  OpenWide: boolean;
  onStatusChange: (id: string, status: TodoStatus) => void
  onArchive: (id: string) => void
  containerId: TodoStatus
}

function DraggableTodoItem({
  todo,
  currentUser,
  onStatusChange,
  onArchive,
  OpenWide,
  containerId,
}: DraggableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: todo.id,
      data: { containerId },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TodoItem
        todo={todo}
        OpenWide={OpenWide}
        currentUser={currentUser}
        onStatusChange={onStatusChange}
        onArchive={onArchive}
      />
    </div>
  )
}

export default function TodoList({ currentUser , OpenWide, projectID }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const processedTodoIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!db) return
  
    const fetchTodos = async () => {
      try {
        setLoading(true)
        setError(null)
  
        let todosQuery = query(
          collection(db, "todos"),
          where("status", "!=", "archived"),
          orderBy("status"),
          orderBy("updatedAt", "desc")
        )
  
        // Si un projectID est fourni, filtrer les todos pour ce projet
        if (projectID) {
          todosQuery = query(todosQuery, where("projectID", "==", projectID))
        }
  
        const unsubscribe = onSnapshot(
          todosQuery,
          async (querySnapshot) => {
            let todosData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Todo[]
  
            // Si un projectID est fourni, récupérer les détails du projet
            if (projectID) {
              const projectRef = doc(db, "projects", projectID)
              const projectSnap = await getDoc(projectRef)
  
              if (projectSnap.exists()) {
                const projectData = projectSnap.data()
  
                // Ajouter les données du projet à chaque todo
                todosData = todosData.map((todo) => ({
                  ...todo,
                  project: projectData,
                }))
              }
            }
  
            setTodos(todosData)
            setLoading(false)
  
            // Marquer les nouveaux todos comme "vus"
            todosData.forEach((todo) => {
              if (!processedTodoIds.current.has(todo.id)) {
                const alreadySeen = todo.seenBy?.some(
                  (user) => user.uid === currentUser.uid
                )
                if (!alreadySeen) {
                  markTodoAsSeen(todo.id)
                }
                processedTodoIds.current.add(todo.id)
              }
            })
          },
          (error) => {
            console.error("Error fetching todos:", error)
            setError("Failed to load todos")
            setLoading(false)
          }
        )
  
        return () => unsubscribe()
      } catch (error) {
        console.error("Error:", error)
        setError("An error occurred while fetching todos")
        setLoading(false)
      }
    }
  
    fetchTodos()
  }, [currentUser.uid, projectID])
  
  


  const markTodoAsSeen = async (todoId: string) => {
    if (!db || !currentUser) return

    try {
      const todoRef = doc(db, "todos", todoId)
      const todoDoc = await getDoc(todoRef)
      if (!todoDoc.exists()) return

      const todoData = todoDoc.data() as Todo
      const alreadySeen = todoData.seenBy?.some(
        (user) => user.uid === currentUser.uid
      )

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

  /**
   * Lors du lâcher d'un élément, on détermine son nouveau container (colonne)
   * grâce aux données associées. Si le container change, on met à jour son statut.
   */
  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) return

    const activeContainer = active.data.current?.containerId
    // Si l'élément est déposé dans une colonne vide, over.id correspondra à l'id de la colonne.
    const overContainer =
      over.data?.current?.containerId || over.id

    if (!activeContainer || !overContainer) return

    if (activeContainer !== overContainer) {
      updateTodoStatus(active.id, overContainer as TodoStatus)
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
    return (
      <div className="text-red-500 p-4 rounded-md bg-red-50 dark:bg-red-900/20">
        {error}
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((column) => {
          const todosInColumn = todos.filter(
            (todo) => todo.status === column.status
          )
          return (
            <Column key={column.status} title={column.title} status={column.status}>
              <SortableContext
                items={todosInColumn.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                {todosInColumn.map((todo) => (
                  <DraggableTodoItem
                    key={todo.id}
                    todo={todo}
                    OpenWide={OpenWide}
                    currentUser={currentUser}
                    onStatusChange={updateTodoStatus}
                    onArchive={archiveTodo}
                    containerId={column.status}
                  />
                ))}
              </SortableContext>
            </Column>
          )
        })}
      </div>
    </DndContext>
  )
}
