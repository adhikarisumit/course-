"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ChatModal } from "@/components/chat-modal";

export function ChatModalWrapper({ user, trigger, onMessageRead }: { 
  user: { id: string, name?: string }, 
  trigger: React.ReactNode,
  onMessageRead?: () => void 
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Refresh unread counts when modal opens or closes
    if (newOpen || (!newOpen && onMessageRead)) {
      onMessageRead?.();
    }
  };
  
  if (!session?.user) return null;
  return (
    <>
      <span onClick={() => handleOpenChange(true)}>{trigger}</span>
      <ChatModal
        open={open}
        onOpenChange={handleOpenChange}
        userId={user.id}
        currentUserId={session.user.id}
        userName={user.name}
      />
    </>
  );
}
