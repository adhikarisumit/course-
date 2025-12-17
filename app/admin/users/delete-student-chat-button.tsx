"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DeleteStudentChatButton({ userId, userName }: { userId: string, userName?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleDelete = async () => {
    if (!window.confirm(`Delete all chat history with ${userName || 'this user'}?`)) return;
    setLoading(true);
    setSuccess(false);
    await fetch(`/api/message/delete?userId=${userId}`, { method: "DELETE" });
    setLoading(false);
    setSuccess(true);
  };
  return (
    <div className="flex flex-col gap-1">
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete Chat"}
      </Button>
      {success && <span className="text-green-600 text-xs">Chat deleted!</span>}
    </div>
  );
}
