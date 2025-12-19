import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// DELETE /api/message?userId=otherUserId or DELETE /api/message/delete-all (for current user's chat history)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const currentUserId = session.user.id;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (userId) {
    // Delete messages between current user and specific userId
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
    });
  } else {
    // Delete all messages for the current user (their entire chat history)
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
    });
  }
  return NextResponse.json({ success: true });
}
