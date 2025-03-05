"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function WaitForAcceptance() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.replace("/")
  }

  useEffect(() => {
    document.title = "En attente d'acceptation"
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900">Votre compte est en attente d'acceptation</h1>
        <p className="text-gray-600 mt-3">Un administrateur doit valider votre accès avant que vous puissiez continuer.</p>

        <div className="my-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-blue-500 opacity-50 rounded-full animate-ping"></div>
            <div className="relative bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold">
              ⏳
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm">Nous vous enverrons une notification dès que votre accès sera activé.</p>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
