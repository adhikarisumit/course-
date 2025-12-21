"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string; // The other user's id (student or admin)
  currentUserId: string; // The logged-in user's id
  userName?: string;
}

export function ChatModal({ open, onOpenChange, userId, currentUserId, userName }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Fetch messages (initial and polling)
  useEffect(() => {
    if (!open) return;
    let stopped = false;
    const fetchMessages = () => {
      fetch(`/api/message?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (!stopped) setMessages(data.messages || []);
        });
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [open, userId]);

  // Mark messages as read when modal opens
  useEffect(() => {
    if (open && messages.length > 0) {
      const unreadMessages = messages.filter(msg => msg.receiverId === currentUserId && !msg.read);
      if (unreadMessages.length > 0) {
        // Mark messages as read
        fetch("/api/message/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }).catch(console.error);
      }
    }
  }, [open, messages, currentUserId, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: userId, content: input }),
    });
    setLoading(false);
    if (res.ok) {
      setInput("");
      fetch(`/api/message?userId=${userId}`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []));
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    const res = await fetch(`/api/message/${messageId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      // Remove the message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Chat with Teacher</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-80 py-2 pr-3">
          <div className="flex flex-col gap-2 pr-2">
            {messages.length === 0 && <div className="text-center text-muted-foreground text-xs">No messages yet.</div>}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
                <div className={`group relative rounded-lg px-3 py-2 text-sm max-w-[70%] ${msg.senderId === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.content}
                  <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.createdAt).toLocaleString()}</div>
                  {msg.senderId === currentUserId && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      title="Delete message"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <DialogFooter className="pt-2">
          <div className="flex w-full gap-2 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              className="resize-none flex-1 min-h-[40px] max-h-[80px]"
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={loading}
              style={{ minHeight: 40, maxHeight: 80 }}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-10 px-6"
              type="button"
            >
              Send
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
