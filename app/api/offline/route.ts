import { type NextRequest, NextResponse } from "next/server"
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId || !db) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }

  try {
    await deleteDoc(doc(db, "onlineUsers", userId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting offline status:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

