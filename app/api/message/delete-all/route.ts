import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// DELETE /api/message/delete-all
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Delete all messages in the database
  await prisma.message.deleteMany({});
  return NextResponse.json({ success: true });
}
