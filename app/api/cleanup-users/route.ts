import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, deleteDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ success: false, error: "Database not initialized" }, { status: 500 })
  }

  try {
    // Get users who haven't been active in the last 15 minutes
    const fifteenMinutesAgo = new Date()
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)

    const q = query(collection(db, "onlineUsers"), where("lastActive", "<", Timestamp.fromDate(fifteenMinutesAgo)))

    const snapshot = await getDocs(q)

    // Delete stale user records
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    return NextResponse.json({
      success: true,
      removed: snapshot.size,
    })
  } catch (error) {
    console.error("Error cleaning up stale users:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

