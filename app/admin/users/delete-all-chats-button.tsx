"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteAllChatsButton() {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete ALL chat messages? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/message/delete-all", { method: "DELETE" });
      if (res.ok) {
        toast.success("All chat messages deleted.");
      } else {
        toast.error("Failed to delete all chats.");
      }
    } catch (e) {
      toast.error("Failed to delete all chats.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete All Chats"}
    </Button>
  );
}
