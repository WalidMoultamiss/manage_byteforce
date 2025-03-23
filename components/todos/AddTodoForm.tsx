"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import type { TodoStatus, TodoAttachment } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCheckIcon, ExternalLink, Image, Mail, MailMinus, MailPlus, X } from "lucide-react"

interface AddTodoFormProps {
  onSubmit: () => void
  onCancel: () => void
  currentUser: User;
  projectID?: any;
}

export default function AddTodoForm({ onSubmit, onCancel, currentUser, projectID }: AddTodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TodoStatus>("todo")
  const [attachments, setAttachments] = useState<
    {
      type: "image" | "link"
      file?: File
      url?: string
    }[]
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [Email, setEmail] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !db) return

    setIsSubmitting(true)
    setError("")

    try {
      // Process attachments
      const processedAttachments: TodoAttachment[] = []

      for (const attachment of attachments) {
        if (attachment.type === "image" && attachment.file && storage) {
          const storageRef = ref(storage, `todo-attachments/${Date.now()}-${attachment.file.name}`)
          await uploadBytes(storageRef, attachment.file)
          const downloadURL = await getDownloadURL(storageRef)

          processedAttachments.push({
            type: "image",
            url: downloadURL,
          })
        } else if (attachment.type === "link" && attachment.url) {
          processedAttachments.push({
            type: "link",
            url: attachment.url,
          })
        }
      }

      const now = serverTimestamp()

      const todoData: any = {
        title,
        description: description || null,
        status,
        attachments: processedAttachments.length > 0 ? processedAttachments : [],
        createdAt: now,
        updatedAt: now,
        price: Price,
        seenBy: [],
        createdBy: {
          uid: currentUser?.uid || null,
          displayName: currentUser?.displayName || null,
          photoURL: currentUser?.photoURL || null,
          timestamp: now,
        },
      }

      // Add projectID if it's available
      if (projectID) {
        todoData.projectID = projectID
      }

      await addDoc(collection(db, "todos"), todoData)

      setTitle("")
      setDescription("")
      setStatus("todo")
      setAttachments([])
      onSubmit()
      if (Email) {
        fetch('/api/email-notification', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: `Nouvelle tâche : ${title}`,
            message: `Une nouvelle tâche a été créée :\n\nTitre: ${title}\nDescription: ${description || "Aucune description"} \nprix:${Price}DH`,
          }),
        });
      }
    } catch (error: any) {
      console.error("Error adding todo:", error)
      setError(error.message || "Failed to add todo")
    } finally {
      setIsSubmitting(false)
    }
  }


  const addAttachment = (type: "image" | "link") => {
    setAttachments([...attachments, { type }])
  }

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments]
    newAttachments.splice(index, 1)
    setAttachments(newAttachments)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const newAttachments = [...attachments]
      newAttachments[index] = {
        ...newAttachments[index],
        file: e.target.files[0],
      }
      setAttachments(newAttachments)
    }
  }

  const handleUrlChange = (url: string, index: number) => {
    const newAttachments = [...attachments]
    newAttachments[index] = {
      ...newAttachments[index],
      url,
    }
    setAttachments(newAttachments)
  }

  const [Price, setPrice] = useState(0);

  useEffect(() => {
    if (Price === 0) {
      setEmail(false)
    }
  }, [Price])


  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex w-full items-end justify-between">
                <Label htmlFor="title">Title</Label>
                {!!Price && (
                  <Button
                    style={{
                      background: Email ? "green" : 'white',
                      color: Email ? "white" : "black",
                    }}
                    title={Email ? 'Admin will be notified with Email' : 'Notify with Email'} onClick={() => setEmail(v => !v)} variant="outline" type="button">
                    {Email ? (
                      <>
                        <Mail className="w-4 h-4" />
                        <CheckCheckIcon />
                        Notified with email
                      </>
                    ) : (
                      <>
                        <MailMinus className="w-4 h-4" />
                        Notify with email
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Input
                id="title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <div className="space-y-2 w-full">
                <Label htmlFor="status">Price (Optional | <em>Please note that tasks with price might take <u><b className="animate-pulse ">less time</b></u> to solve</em>)</Label>
                <div
                
                className="w-full bg-green-600 rounded-md flex items-center">
                  <b className="mx-2 text-white">
                    DH
                  </b>
                  <Input
                    onChange={(e) => setPrice(+e.target.value)}
                    value={Price}
                    type="number" className="outline-green-600 border-green-600 border-2" min={100} placeholder="Add price (DH)" />
                </div>
              </div>
              {Price ? (
                <div
                  className="space-y-2 transition-all flex items-end">
                  <Button
                    onClick={() => setPrice(0)}
                    type="button" size="icon" variant="outline" >
                    <X />
                  </Button>
                </div>
              ) : <div />}
              <div className="space-y-2 w-64 ">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TodoStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Attachments (Optional)</Label>
                <div className="flex space-x-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => addAttachment("image")}>
                    <Image className="h-4 w-4 mr-1" />
                    Add Image
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addAttachment("link")}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Add Link
                  </Button>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-3 mt-3">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {attachment.type === "image" ? (
                        <>
                          <div className="flex-grow">
                            <Input
                              id={`file-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, index)}
                              className={attachment.file ? "hidden" : ""}
                            />
                            {attachment.file && (
                              <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <Image className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm truncate">{attachment.file.name}</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={attachment.url || ""}
                          onChange={(e) => handleUrlChange(e.target.value, index)}
                          className="flex-grow"
                        />
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(index)}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Todo"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

