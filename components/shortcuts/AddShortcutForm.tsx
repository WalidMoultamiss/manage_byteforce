"use client"

import type React from "react"
import { useState } from "react"
import type { Shortcut } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeClosed, Globe } from "lucide-react"

const COLORS = [
  "#f3f4f6", // Default light gray
  "#fee2e2", // Light red
  "#fef3c7", // Light yellow
  "#d1fae5", // Light green
  "#dbeafe", // Light blue
  "#e0e7ff", // Light indigo
  "#ede9fe", // Light purple
  "#fce7f3", // Light pink
]

interface AddShortcutFormProps {
  onSubmit: (shortcut: Omit<Shortcut, "id" | "createdAt">) => void
  onCancel: () => void
}

export default function AddShortcutForm({ onSubmit, onCancel }: AddShortcutFormProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !url) return

    setIsSubmitting(true)
    onSubmit({
      title,
      url,
      color,
      status: isPublic ? "public" : "private",
    })
  }

  return (
    <Card
    style={{
      background: color
    }}
    className="h-full">
      <form onSubmit={handleSubmit}>
        <CardContent
          
          className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 shadow-sm border-2 border-white h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                    title={`${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2 flex gap-2">
              <Input
                id="title"
                placeholder="My Favorite Site"
                value={title}
                className="w-full"
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                style={{
                  marginTop: 0
                }}
                onClick={() => setIsPublic((prev) => !prev)}
                className=" mt-0"
                title={isPublic ? "This shortcut will be public" : 'This shortcut is private only you ca see it'}
              >
                {isPublic ? (
                  <Eye className="w-4 h-4" />
                ) : <EyeClosed className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-2 flex gap-2">
              <Input
                id="url"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Button
                style={{
                  marginTop: 0
                }}
                type="submit" disabled={!title || !url || isSubmitting}>
                Add Shortcut
              </Button>
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
