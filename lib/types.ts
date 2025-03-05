export interface Shortcut {
  id: string
  title: string
  url: string
  color: string
  createdAt: any
}

export type TodoStatus = "todo" | "in-progress" | "done" | "archived"

export interface TodoSeenBy {
  uid: string
  displayName: string | null
  photoURL: string | null
  timestamp: string
}

export interface TodoAttachment {
  type: "image" | "link"
  url: string
}

export interface TodoCreatedBy {
  uid: string | null
  displayName: string | null
  photoURL: string | null
  timestamp: any
}

export interface TodoArchivedBy {
  uid: string
  displayName: string | null
  photoURL: string | null
  timestamp: any
}

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  attachments?: TodoAttachment[]
  createdAt: any
  updatedAt: any
  seenBy?: TodoSeenBy[]
  createdBy?: TodoCreatedBy
  archivedBy?: TodoArchivedBy
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface OnlineUser {
  uid: string
  displayName: string | null
  photoURL: string | null
  lastActive: any
  access: boolean | undefined
}

