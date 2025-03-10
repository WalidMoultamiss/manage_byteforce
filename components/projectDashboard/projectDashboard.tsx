"use client"

import { useState, useEffect } from "react"
import { User } from "firebase/auth"
import ShortcutGrid from "../shortcuts/ShortcutGrid"
import TodosButton from "../todos/TodosButton"
import OnlineUsersButton from "../users/OnlineUsersButton"
import TodosModal from "../todos/TodosModal"
import OnlineUsersModal from "../users/OnlineUsersModal"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import AppsButton from "../todos/AppsButton"
import AppsModal from "../todos/AppsModal"
import ProjectsButton from "../users/ProjectsButton"
import ProjectsModal from "../users/ProjectsModal"
import Header from "../dashboard/Header"
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { ExpandIcon, PlusIcon, Shrink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import AddTodoForm from "../todos/AddTodoForm"
import TodoList from "../todos/TodoList"
import ArchivedTodoList from "../todos/ArchivedTodoList";


import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"  // Your Firestore db instance
import { useRouter, useParams } from "next/navigation"

export const getProjectById = async (id: string) => {
  try {
    const docRef = doc(db, "projects", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() // Returns the project data, including the name
    } else {
      throw new Error("Project not found")
    }
  } catch (error) {
    throw error
  }
}

interface DashboardProps {
  user: User
}

export default function ProjectDashboard({ user }: DashboardProps) {
  const [projectName, setProjectName] = useState<string | null>(null)
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [OpenWide, setOpenWide] = useState(true)
  const router = useRouter()
  const { id } = useParams()  // Get the project ID from the URL
  const currentUser = user

  useOnlineStatus(user)

  useEffect(() => {
    if (id) {
      // Fetch the project name using the `id` from the "projects" collection
      getProjectById(id as string)
        .then((project) => {
          setProjectName(project.name)
        })
        .catch((error) => {
          console.error("Error fetching project:", error)
        })
    }
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      <div className="container mx-auto p-4 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {projectName ? `Project: ${projectName}` : "Loading Project..."}
          </h1>
          <Button size="sm" onClick={() => setIsAddingTodo(true)} disabled={isAddingTodo}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Todo
                </Button>

        </div>

        <div>
         

          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>

            <div className="py-4">
              {isAddingTodo && (
                <AddTodoForm
                  onSubmit={() => setIsAddingTodo(false)}
                  onCancel={() => setIsAddingTodo(false)}
                  currentUser={currentUser}
                  projectID={id}
                />
              )}

                <TodoList
                  projectID={id as string}
                
                OpenWide={OpenWide} currentUser={currentUser} />
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
