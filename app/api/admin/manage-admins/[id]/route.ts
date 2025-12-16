import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "sumitadhikari2341@gmail.com"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized: Only super admin can remove admins" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if trying to delete super admin
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Cannot delete super admin" },
        { status: 403 }
      )
    }

    // Delete the admin user
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    )
  }
}
