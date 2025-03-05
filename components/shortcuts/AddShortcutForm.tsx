"use client"

import type React from "react"

import { useState } from "react"
import type { Shortcut } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface AddShortcutFormProps {
  onSubmit: (shortcut: Omit<Shortcut, "id" | "createdAt">) => void
  onCancel: () => void
}

// Predefined colors for shortcuts
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

export default function AddShortcutForm({ onSubmit, onCancel }: AddShortcutFormProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !url) return

    setIsSubmitting(true)
    onSubmit({
      title,
      url,
      color,
    })
  }

  return (
    <Card className="h-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              {/* <Label htmlFor="title">Title</Label> */}
              <Input
                id="title"
                placeholder="My Favorite Site"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 flex gap-3">
              {/* <Label htmlFor="url">URL</Label> */}
              <Input id="url" placeholder="example.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
              <Button style={{marginTop : 0 }} className="mt-0" type="submit" disabled={!title || !url }>
                Add Shortcut
              </Button>
            </div>

            <div className="space-y-2">
              {/* <Label>Background Color</Label> */}
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}

