import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// DELETE /api/message/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: messageId } = await params;
  if (!messageId) {
    return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
  }

  // Find the message to ensure the user can delete it
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Only allow deletion if the current user is the sender
  if (message.senderId !== session.user.id) {
    return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 });
  }

  await prisma.message.delete({
    where: { id: messageId },
  });

  return NextResponse.json({ success: true });
}