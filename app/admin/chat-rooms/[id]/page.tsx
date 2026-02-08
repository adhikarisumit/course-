'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Hash, Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userImage: string | null;
  createdAt: string;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'just now';
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/admin/chat-rooms/${roomId}`);
        if (!response.ok) throw new Error('Failed to fetch room');
        const data = await response.json();
        setRoom(data);
      } catch (error) {
        console.error('Error fetching room:', error);
        toast.error('Failed to load chat room');
        router.push('/admin/chat-rooms');
      } finally {
        setIsLoadingRoom(false);
      }
    };
    fetchRoom();
  }, [roomId, router]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/chat-rooms">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <Badge variant={room.isActive ? 'default' : 'secondary'}>
              {room.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {room.description && (
            <p className="text-muted-foreground mt-1">{room.description}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchMessages}
          disabled={isLoadingMessages}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="h-[calc(100vh-250px)] min-h-[400px] flex flex-col">
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
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.userId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={message.userImage || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(message.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${isOwnMessage ? 'order-2' : ''}`}>
                          {message.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg text-sm ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              placeholder={`Message #${room.name}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending || !room.isActive}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim() || isSending || !room.isActive}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          {!room.isActive && (
            <p className="text-xs text-muted-foreground mt-2">
              This room is inactive. Activate it to send messages.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
