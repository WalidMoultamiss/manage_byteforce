"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function useOnlineStatus(user: User | null) {
  const userStatusRef = useRef<string | null>(null)
  const [access, setAccess] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!user || !db) return

    userStatusRef.current = doc(db, "onlineUsers", user.uid).path

    const checkAccess = async () => {
      try {
        if (!user) return
    
        const userDoc = await getDoc(doc(db, "onlineUsers", user.uid))
    
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setAccess(userData.access ?? false)
          console.log("not accepted yet", JSON.stringify(userDoc))
          if (!userData.access) {
            // router.replace("/wait-for-acceptance")
          }
        } else {
          // Vérifier si l'utilisateur s'est connecté via Google
          const isGoogleUser = user.providerData.some((provider) => provider.providerId === "google.com")
    
          if (!isGoogleUser) {
            // 🔹 Seulement pour les utilisateurs NON Google, on crée un profil Firestore
            await setDoc(doc(db, "onlineUsers", user.uid), {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
              lastActive: serverTimestamp(),
              access: false, // 👈 En attente d'approbation
            })
            setAccess(false)
            router.replace("/wait-for-acceptance")
          } else {
            console.log("Google sign-in detected, skipping Firestore user creation.")
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'accès :", error)
      }
    }
    

    const updateOnlineStatus = async () => {
      try {
        await setDoc(doc(db, "onlineUsers", user.uid), {
          lastActive: serverTimestamp(),
        }, { merge: true }) // Merge pour éviter d'écraser d'autres champs
      } catch (error) {
        console.error("Erreur mise à jour du statut en ligne :", error)
      }
    }

    checkAccess()
    updateOnlineStatus()
    const intervalId = setInterval(updateOnlineStatus, 5 * 60 * 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [user, router])
}
