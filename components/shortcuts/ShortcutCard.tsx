"use client"

import { useState } from "react"
import type { Shortcut } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, Lock } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface ShortcutCardProps {
  shortcut: Shortcut
  onDelete: (id: string) => void
}

export default function ShortcutCard({ shortcut, onDelete }: ShortcutCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleOpenLink = () => {
    window.open(ensureHttpPrefix(shortcut.url), "_blank", "noopener,noreferrer")
  }

  const ensureHttpPrefix = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`
    }
    return url
  }

  return (
    <Card
      className="relative overflow-hidden  transition-all duration-200 hover:shadow-md h-full"
      style={{ backgroundColor: shortcut.color || "#f3f4f6" }}
    >
      {/* Private icon on top right if shortcut is private */}
      {shortcut.status === "private" && (
        <div className="absolute top-2 right-2">
          <Lock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
      <CardContent className="p-0 h-full">
        <div className="p-4 h-42 cursor-pointer flex flex-col " onClick={handleOpenLink}>
          <h3 className={`text-gray-900 dark:text-gray-100 text-center font-bold text-${shortcut.title.length < 12 ? 3 : shortcut.title.length <20 ? 2 : "" }xl my-10`}>
            {shortcut.title}
          </h3>
          <div className="flex-grow"></div>
        </div>
        <div className="flex border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
          <a
          href="#" onClick={()=>window.location.href=`${shortcut.url}`}
            title={shortcut.url}
            className="flex-1 w-full text-center flex items-center justify-center rounded-none h-10 text-xs"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open here
          </a>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 rounded-none h-10 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Shortcut</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{shortcut.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(shortcut.id)} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
