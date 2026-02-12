'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Hash, Loader2, RefreshCw, MessageCircle, Trash2, Code, Bold, Italic, Braces } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ContentRenderer } from '@/components/content-renderer';

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

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'yaml', label: 'YAML' },
  { value: 'text', label: 'Plain Text' },
];

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
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [selectedCodeLanguage, setSelectedCodeLanguage] = useState('javascript');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUserId = session?.user?.id;

  // Insert formatting around selection or at cursor
  const insertFormatting = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = newMessage.substring(start, end);
    const before = newMessage.substring(0, start);
    const after = newMessage.substring(end);
    const insertText = selectedText || placeholder;
    const newText = `${before}${prefix}${insertText}${suffix}${after}`;
    setNewMessage(newText);
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
      }
    }, 0);
  };

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

  // Delete message (admin can delete any message)
  const deleteMessage = async (messageId: string) => {
    if (deletingMessageId) return;
    
    setDeletingMessageId(messageId);
    try {
      const response = await fetch(
        `/api/chat/rooms/${roomId}/messages?messageId=${messageId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete message');
      }
      
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete message');
    } finally {
      setDeletingMessageId(null);
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
                    className={`group flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
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
                      <div className="flex items-center gap-1">
                        {isOwnMessage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMessage(message.id)}
                            disabled={deletingMessageId === message.id}
                          >
                            {deletingMessageId === message.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        <div
                          className={`px-3 py-2 rounded-lg text-sm select-text ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <ContentRenderer content={message.content} />
                        </div>
                        {!isOwnMessage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMessage(message.id)}
                            disabled={deletingMessageId === message.id}
                          >
                            {deletingMessageId === message.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
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
        <div className="p-3 border-t space-y-2">
          {/* Formatting Toolbar */}
          <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => insertFormatting('**', '**', 'bold text')}
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Bold (Ctrl+B)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => insertFormatting('*', '*', 'italic text')}
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Italic (Ctrl+I)</p></TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-border mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => insertFormatting('`', '`', 'code')}
                  >
                    <Code className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Inline Code</p></TooltipContent>
              </Tooltip>
              <Select value={selectedCodeLanguage} onValueChange={setSelectedCodeLanguage}>
                <SelectTrigger className="h-7 w-auto gap-1 text-[11px] font-medium border-none bg-transparent px-1.5 hover:bg-muted/60 focus:ring-0 focus:ring-offset-0 text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {CODE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="text-xs">
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => insertFormatting(`\`\`\`${selectedCodeLanguage}\n`, '\n```', 'code here')}
                  >
                    <Braces className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Code Block ({selectedCodeLanguage})</p></TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Input + Send */}
          <form onSubmit={sendMessage} className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              placeholder={`Message #${room.name} — Ctrl+Enter to send`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  sendMessage(e);
                }
                // Keyboard shortcuts for formatting
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'b') { e.preventDefault(); insertFormatting('**', '**', 'bold text'); }
                  if (e.key === 'i') { e.preventDefault(); insertFormatting('*', '*', 'italic text'); }
                  if (e.key === 'e') { e.preventDefault(); insertFormatting('`', '`', 'code'); }
                }
              }}
              disabled={isSending || !room.isActive}
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              rows={2}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!newMessage.trim() || isSending || !room.isActive}>
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
