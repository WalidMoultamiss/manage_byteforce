"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import Login from "@/components/auth/Login"
import Dashboard from "@/components/dashboard/Dashboard"
import LoadingScreen from "@/components/ui/LoadingScreen"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if auth is initialized
    if (!auth) {
      setError("Firebase authentication is not initialized. Please check your environment variables.")
      setLoading(false)
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      },
      (error) => {
        console.error("Auth state error:", error)
        setError("Authentication error: " + error.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-red-600 dark:text-red-400">Configuration Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Please ensure all Firebase environment variables are correctly set in your .env.local file or Vercel project
            settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">{user ? <Dashboard user={user} /> : <Login />}</main>
  )
}

