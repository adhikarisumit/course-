"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChatModalWrapper } from "../users/chat-modal-wrapper"
import { MessageCircle, Mail } from "lucide-react"
import { toast } from "sonner"

interface Conversation {
  userId: string
  userName: string
  userEmail: string
  userImage?: string
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      // Get all users who have messaged with the admin
      const response = await fetch("/api/admin/messages/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      } else {
        toast.error("Failed to load conversations")
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast.error("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Messages</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage conversations with users
        </p>
      </div>

      <div className="grid gap-4">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Messages from users will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conversation) => (
            <Card key={conversation.userId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.userImage} />
                      <AvatarFallback>
                        {conversation.userName?.[0]?.toUpperCase() || conversation.userEmail[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">
                          {conversation.userName || conversation.userEmail}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.userEmail}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {conversation.lastMessage.senderId === conversation.userId ? "" : "You: "}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    <ChatModalWrapper
                      user={{ id: conversation.userId, name: conversation.userName }}
                      trigger={
                        <Button size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}