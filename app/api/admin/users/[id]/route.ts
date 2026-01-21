import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// PATCH /api/admin/users/[id] - Toggle profile verification or ban/unban user
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { action, reason } = await req.json()

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Handle ban/unban actions
  if (action === "ban" || action === "unban") {
    // Only super admin or admin can ban/unban users
    if (session.user.role !== "super" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admin can ban/unban users" }, { status: 403 })
    }

    // Cannot ban super admin or admin users
    if (user.role === "super" || user.role === "admin") {
      return NextResponse.json({ error: "Cannot ban admin users" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        isBanned: action === "ban",
        bannedAt: action === "ban" ? new Date() : null,
        banReason: action === "ban" ? (reason || "No reason provided") : null,
        sessionVersion: { increment: 1 }, // Invalidate all sessions when banned
      },
      select: { id: true, isBanned: true, bannedAt: true, banReason: true }
    })

    return NextResponse.json(updatedUser)
  }

  // Handle verify/unverify actions
  if (action === "verify" || action === "unverify") {
    // Only super admin can verify profiles
    if (session.user.role !== "super") {
      return NextResponse.json({ error: "Forbidden: Only super admin can verify profiles" }, { status: 403 })
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

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// PUT /api/admin/users/[id] - Update user details
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { name, email } = await req.json()

  // Validate input
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
  }

  // Check if user exists
  const userToUpdate = await prisma.user.findUnique({ where: { id } })
  if (!userToUpdate) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Permission checks
  if (session.user.role === "admin") {
    // Admins can only edit students
    if (userToUpdate.role !== "student") {
      return NextResponse.json({ error: "Forbidden: Admins can only edit student profiles" }, { status: 403 })
    }
  } else if (session.user.role === "super") {
    // Super admins can edit anyone except other super admins
    if (userToUpdate.role === "super") {
      return NextResponse.json({ error: "Forbidden: Cannot edit super admin profiles" }, { status: 403 })
    }
  } else {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
  }

  // Check for email duplicates (excluding current user)
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      id: { not: id }
    }
  })

  if (existingUser) {
    return NextResponse.json({ error: "Email already in use by another user" }, { status: 400 })
  }

  // Check if email is being changed
  const emailChanged = userToUpdate.email !== email.toLowerCase().trim()
  const nameChanged = userToUpdate.name !== name.trim()

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      sessionVersion: { increment: 1 }, // Increment to invalidate all existing sessions
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileVerified: true,
    }
  })

  // No need to delete sessions anymore since we're using sessionVersion invalidation

  return NextResponse.json({
    ...updatedUser,
    userSignedOut: emailChanged || nameChanged // Include this flag so frontend knows to show appropriate message
  })
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
