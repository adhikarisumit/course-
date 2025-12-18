import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "sumitadhikari2341@gmail.com"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized: Only super admin can freeze/unfreeze accounts" },
        { status: 401 }
      )
    }
    const { id } = params
    const { freeze } = await request.json()
    const user = await prisma.user.update({
      where: { id },
      data: { isFrozen: freeze },
      select: { id: true, isFrozen: true }
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error freezing/unfreezing user:", error)
    return NextResponse.json(
      { error: "Failed to update freeze status" },
      { status: 500 }
    )
  }
}
