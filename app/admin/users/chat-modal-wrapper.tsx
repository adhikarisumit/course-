"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ChatModal } from "@/components/chat-modal";

export function ChatModalWrapper({ user, trigger }: { user: { id: string, name?: string }, trigger: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  if (!session?.user) return null;
  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <ChatModal
        open={open}
        onOpenChange={setOpen}
        userId={user.id}
        currentUserId={session.user.id}
        userName={user.name}
      />
    </>
  );
}
