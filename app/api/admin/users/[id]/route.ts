import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// PATCH /api/admin/users/[id] - Toggle profile verification
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only super admin can verify profiles
  if (session.user.role !== "super") {
    return NextResponse.json({ error: "Forbidden: Only super admin can verify profiles" }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json()

  if (action !== "verify" && action !== "unverify") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (user.role !== "student") {
    return NextResponse.json({ error: "Only student profiles can be verified" }, { status: 400 })
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { profileVerified: action === "verify" },
    select: { id: true, profileVerified: true }
  })

  return NextResponse.json(updatedUser)
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only admin and super admin can delete users
  if (session.user.role !== "super" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Only admin can delete users" }, { status: 403 })
  }

  const { id } = await params

  // Cannot delete super admin
  const userToDelete = await prisma.user.findUnique({ where: { id } })
  if (!userToDelete) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  if (userToDelete.role === "super") {
    return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 })
  }

  // Delete related data in correct order
  // First delete messages (no cascade)
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: id },
        { receiverId: id },
      ],
    },
  });

  // Delete lesson progress for this user
  await prisma.lessonProgress.deleteMany({
    where: { userId: id }
  });

  // Now delete the user - cascade will handle accounts, sessions, enrollments, payments
  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
