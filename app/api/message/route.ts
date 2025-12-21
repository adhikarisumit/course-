import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET /api/message?userId=otherUserId or /api/message?unread=true
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const currentUserId = session.user.id;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const unread = searchParams.get("unread");

  if (unread === "true") {
    // Get count of unread messages for current user
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: currentUserId,
        read: false,
      },
    });
    return NextResponse.json({ unreadCount });
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  // Fetch messages between current user and userId
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ messages });
}

// POST /api/message
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = session.user.id;
  const { receiverId, content } = await req.json();

  if (!receiverId || !content) {
    return NextResponse.json({ error: "Missing receiverId or content" }, { status: 400 });
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      senderId: currentUserId,
      receiverId,
      content,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
