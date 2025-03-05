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
import { Card } from "../ui/card"
import Link from "next/link"

interface TodosModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

export default function AppsModal({ isOpen, onClose, currentUser }: TodosModalProps) {
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [activeTab, setActiveTab] = useState("active")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Apps</span>
          </DialogTitle>
          <DialogDescription>All default apps</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI apps</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <div className="py-4">


            <TabsContent value="ai" className="mt-0">
              <div className="grid grid-cols-3 gap-3">
                <Link target="_blank" href="https://chatgpt.com/">
                  <Card>
                    <div className="flex flex-col items-center justify-center">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMdM9MEQ0ExL1PmInT3U5I8v63YXBEdoIT0Q&s" alt="" className="w-10 object-cover object-center mt-3 h-10 rounded-full shadow-md" />
                      <p className="font-bold my-3">
                        Chat GPT
                      </p>
                    </div>
                  </Card>
                </Link>
                <Link target="_blank" href="https://chat.deepseek.com/">
                  <Card>
                    <div className="flex flex-col items-center justify-center">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRPj6SSbTOghXAje90eXbT0KkfNiuhA1Fgrg&s" alt="" className="w-10 object-cover object-center mt-3 h-10 rounded-full shadow-md" />
                      <p className="font-bold my-3">
                        DeepSeek
                      </p>
                    </div>
                  </Card>
                </Link>
                <Link target="_blank" href="https://v0.dev/">
                  <Card>
                    <div className="flex flex-col items-center justify-center">
                      <img src="https://vercel.com/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F3CSHPVw6n6ZPBWXZfFycpp%2Fb499dbf7977ad404be660a892da2100a%2F600x300.png&w=1920&q=75" alt="" className="w-10 object-cover object-center mt-3 h-10 rounded-full shadow-md" />
                      <p className="font-bold my-3">
                        V0
                      </p>
                    </div>
                  </Card>
                </Link>
                <Link target="_blank" href="https://bolt.new/">
                  <Card>
                    <div className="flex flex-col items-center justify-center">
                      <img src="https://images.prismic.io/sacra/Z37NF5bqstJ99MG0_bolt-new-logo.jpg?auto=format,compress" alt="" className="w-10 object-cover object-center mt-3 h-10 rounded-full shadow-md" />
                      <p className="font-bold my-3">
                        Bolt
                      </p>
                    </div>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="other" className="mt-0">
              <div className="grid grid-cols-3 gap-3">
                <Link target="_blank" href="https://web.whatsapp.com/">
                  <Card>
                    <div className="flex flex-col items-center justify-center">
                      <img src="https://www.citypng.com/public/uploads/preview/outline-whatsapp-wa-watsup-green-logo-icon-symbol-sign-png-701751695124303npsmzlcjyh.png" alt="" className="w-10 object-cover object-center mt-3 h-10 rounded-full bg-white shadow-md" />
                      <p className="font-bold my-3">
                        WhatsApp
                      </p>
                    </div>
                  </Card>
                </Link>
                <Link target="_blank" href="https://www.instagram.com/">
                  <Card>
                    <div className="flex flex-col items-center justify-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png" alt="" className="w-10 object-cover object-center mt-3 h-10 rounded-lg bg-white shadow-md" />
                      <p className="font-bold my-3">
                        Instagram
                      </p>
                    </div>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

