"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { LayoutDashboardIcon, ListTodo } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AppsButtonProps {
  onClick: () => void
}

export default function AppsButton({ onClick }: AppsButtonProps) {
  

  return (
    <Button size="sm" onClick={onClick} className="relative bg-green-700 hover:bg-green-900">
      <LayoutDashboardIcon className="h-4 w-4 mr-2" />
      <span>Apps </span>
    </Button>
  )
}

