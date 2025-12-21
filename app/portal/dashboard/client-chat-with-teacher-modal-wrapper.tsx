"use client";
import { ChatModal } from "@/components/chat-modal";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ClientChatWithTeacherModalWrapper({ currentUserId, teacherId, teacherName }: { currentUserId: string, teacherId: string, teacherName?: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread count for this teacher
  useEffect(() => {
    if (session?.user) {
      loadUnreadCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session, teacherId]);

  // Refresh unread count when chat modal opens or closes
  useEffect(() => {
    if (open || !open) {
      loadUnreadCount();
    }
  }, [open]);

  const loadUnreadCount = async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/message/unread-counts");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCounts[teacherId] || 0);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Refresh unread count when modal opens or closes
    if (newOpen || (!newOpen && unreadCount > 0)) {
      loadUnreadCount();
    }
  };

  return (
    <>
      <button
        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition relative"
        onClick={() => handleOpenChange(true)}
      >
        <div className="flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Chat with Teacher
        </div>
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </button>
      <ChatModal
        open={open}
        onOpenChange={handleOpenChange}
        userId={teacherId}
        currentUserId={currentUserId}
        userName={teacherName}
      />
    </>
  );
}
