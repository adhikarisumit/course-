"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Send, Users, MessageCircle, Loader2, Hash, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type ChatRoom = {
  id: string
  name: string
  description: string | null
  type: string
  _count: { messages: number }
}

type ChatMessage = {
  id: string
  content: string
  userId: string
  userName: string
  userImage: string | null
  createdAt: string
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 1 minute
  if (diff < 60000) return "just now"
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    return `${mins}m ago`
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }
  
  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function CommunityPage() {
  const { data: session } = useSession()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch chat rooms
  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/rooms")
      if (!response.ok) throw new Error("Failed to fetch rooms")
      const data = await response.json()
      setRooms(data)
      
      // Auto-select first room if none selected
      if (data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0])
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive"
      })
    } finally {
      setIsLoadingRooms(false)
    }
  }, [selectedRoom, toast])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // Fetch messages when room changes
  const fetchMessages = useCallback(async () => {
    if (!selectedRoom) return
    
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }, [selectedRoom, toast])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!selectedRoom) return
    
    const interval = setInterval(() => {
      fetchMessages()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [selectedRoom, fetchMessages])

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom || isSending) return
    
    setIsSending(true)
    try {
      const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() })
      })
      
      if (!response.ok) throw new Error("Failed to send message")
      
      const message = await response.json()
      setMessages((prev) => [...prev, message])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoadingRooms) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Community Chat</h1>
          <p className="text-muted-foreground text-sm">Connect with fellow students</p>
        </div>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Chat Rooms Available</h2>
            <p className="text-muted-foreground">
              Chat rooms haven&apos;t been set up yet. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
          {/* Room List - Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedRoom?.id === room.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 shrink-0" />
                      <span className="font-medium truncate">{room.name}</span>
                    </div>
                    {room.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5 ml-6">
                        {room.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            {selectedRoom ? (
              <>
                {/* Room Header */}
                <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      {selectedRoom.name}
                    </CardTitle>
                    {selectedRoom.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedRoom.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchMessages}
                    disabled={isLoadingMessages}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingMessages ? "animate-spin" : ""}`} />
                  </Button>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        No messages yet. Be the first to say hello!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.userId === session?.user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={message.userImage || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(message.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : ""}`}>
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className={`text-sm font-medium ${isOwnMessage ? "order-2" : ""}`}>
                                  {message.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.createdAt)}
                                </span>
                              </div>
                              <div
                                className={`px-3 py-2 rounded-lg text-sm ${
                                  isOwnMessage
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {message.content}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      placeholder={`Message #${selectedRoom.name}`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim() || isSending}>
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a channel to start chatting</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
