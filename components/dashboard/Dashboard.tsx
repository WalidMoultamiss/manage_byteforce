"use client"

import { useState } from "react"
import type { User } from "firebase/auth"
import Header from "./Header"
import ShortcutGrid from "../shortcuts/ShortcutGrid"
import TodosButton from "../todos/TodosButton"
import OnlineUsersButton from "../users/OnlineUsersButton"
import TodosModal from "../todos/TodosModal"
import OnlineUsersModal from "../users/OnlineUsersModal"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import AppsButton from "../todos/AppsButton"
import AppsModal from "../todos/AppsModal"

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [todosModalOpen, setTodosModalOpen] = useState(false)
  const [appsModalOpen, setAppsModalOpen] = useState(false)
  const [usersModalOpen, setUsersModalOpen] = useState(false)

  // Update user's online status
  useOnlineStatus(user)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />

      <div className="container mx-auto p-4 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <div className="flex space-x-2">
            <OnlineUsersButton onClick={() => setUsersModalOpen(true)} />
            <TodosButton onClick={() => setTodosModalOpen(true)} />
            <AppsButton onClick={() => setAppsModalOpen(true)} />
          </div>
        </div>

        <div>
          <ShortcutGrid currentUser={user} />
        </div>
      </div>

      {todosModalOpen && (
        <TodosModal isOpen={todosModalOpen} onClose={() => setTodosModalOpen(false)} currentUser={user} />
      )}
      {appsModalOpen && (
        <AppsModal isOpen={appsModalOpen} onClose={() => setAppsModalOpen(false)} currentUser={user} />
      )}

      {usersModalOpen && <OnlineUsersModal isOpen={usersModalOpen} onClose={() => setUsersModalOpen(false)} />}
    </div>
  )
}

