import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only allow if the user is not a super admin
  // Assume super admin has role === 'super' (add this role if not present)
  const userToDelete = await prisma.user.findUnique({ where: { id: params.id } })
  if (!userToDelete) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  if (userToDelete.role === "super") {
    return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
