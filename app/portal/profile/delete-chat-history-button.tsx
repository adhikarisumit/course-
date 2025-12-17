"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DeleteChatHistoryButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    setSuccess(false);
    await fetch(`/api/message/delete?userId=${userId}`, { method: "DELETE" });
    setLoading(false);
    setSuccess(true);
  };
  return (
    <div className="flex flex-col gap-2">
      <Button variant="destructive" onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete Chat History"}
      </Button>
      {success && <span className="text-green-600 text-xs">Chat history deleted!</span>}
    </div>
  );
}
