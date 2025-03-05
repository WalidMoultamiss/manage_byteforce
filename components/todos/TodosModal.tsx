"use client"

import { useState } from "react"
import type { User } from "firebase/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TodoList from "./TodoList"
import ArchivedTodoList from "./ArchivedTodoList"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import AddTodoForm from "./AddTodoForm"

interface TodosModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

export default function TodosModal({ isOpen, onClose, currentUser }: TodosModalProps) {
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [activeTab, setActiveTab] = useState("active")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Todo List</span>
            <Button size="sm" onClick={() => setIsAddingTodo(true)} disabled={isAddingTodo}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </DialogTitle>
          <DialogDescription>Manage your tasks and track progress</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <div className="py-4">
            {isAddingTodo && (
              <AddTodoForm
                onSubmit={() => setIsAddingTodo(false)}
                onCancel={() => setIsAddingTodo(false)}
                currentUser={currentUser}
              />
            )}

            <TabsContent value="active" className="mt-0">
              <TodoList currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="archived" className="mt-0">
              <ArchivedTodoList currentUser={currentUser} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

