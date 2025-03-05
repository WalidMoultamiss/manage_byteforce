"use client"

import { useEffect, useRef } from "react"
import type { User } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function useOnlineStatus(user: User) {
  const userStatusRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user || !db) return

    userStatusRef.current = doc(db, "onlineUsers", user.uid).path

    // When the user comes online
    const updateOnlineStatus = async () => {
      try {
        await setDoc(doc(db, "onlineUsers", user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastActive: serverTimestamp(),
        })
      } catch (error) {
        console.error("Error updating online status:", error)
      }
    }

    // Update status when component mounts
    updateOnlineStatus()

    // Set up a periodic update (every 5 minutes)
    const intervalId = setInterval(updateOnlineStatus, 5 * 60 * 1000)

    // Set up window events for online/offline status
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateOnlineStatus()
      }
    }

    const handleOnline = () => {
      updateOnlineStatus()
    }

    const handleBeforeUnload = () => {
      // This won't always work reliably, but it's a best effort
      if (userStatusRef.current) {
        // Using navigator.sendBeacon for more reliable cleanup
        const url = `${window.location.origin}/api/offline?userId=${user.uid}`
        navigator.sendBeacon(url)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("online", handleOnline)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Clean up on unmount
    return () => {
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [user])
}

