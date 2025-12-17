"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DeleteAllChatsButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    setSuccess(false);
    await fetch(`/api/message/delete-all`, { method: "DELETE" });
    setLoading(false);
    setSuccess(true);
  };
  return (
    <div className="flex flex-col gap-2 mt-4">
      <Button variant="destructive" onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete All Chat Histories"}
      </Button>
      {success && <span className="text-green-600 text-xs">All chat histories deleted!</span>}
    </div>
  );
}
