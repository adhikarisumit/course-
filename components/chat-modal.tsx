"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Chat with {userName || "User"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto py-2">
          {messages.length === 0 && <div className="text-center text-muted-foreground text-xs">No messages yet.</div>}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg px-3 py-2 text-sm max-w-[70%] ${msg.senderId === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {msg.content}
                <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
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
