"use client";
import { useState } from "react";
import { ChatModal } from "@/components/chat-modal";

export default function ChatWithTeacherModalWrapper({ currentUserId, teacherId, teacherName }: { currentUserId: string, teacherId: string, teacherName?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        onClick={() => setOpen(true)}
      >
        Chat with Teacher
      </button>
      <ChatModal
        open={open}
        onOpenChange={setOpen}
        userId={teacherId}
        currentUserId={currentUserId}
        userName={teacherName}
      />
    </>
  );
}
