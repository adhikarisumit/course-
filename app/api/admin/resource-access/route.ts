import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const resourceAccess = await prisma.resourcePurchase.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            url: true,
            fileUrl: true,
            category: true,
            tags: true,
            isFree: true,
            price: true,
            isActive: true,
            downloadCount: true,
            clickCount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(resourceAccess)
  } catch (error) {
    console.error("Error fetching resource access:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, resourceId, amount, currency = "usd", status = "completed" } = body

    if ((!userId && !userEmail) || !resourceId) {
      return NextResponse.json(
        { message: "User ID/Email and Resource ID are required" },
        { status: 400 }
      )
    }

    // Find user by ID or email
    let user
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      })
    } else if (userEmail) {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, name: true, email: true }
      })
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Check if the user already has access to this resource
    const existingAccess = await prisma.resourcePurchase.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId,
        },
      },
    })

    if (existingAccess) {
      return NextResponse.json(
        { message: "User already has access to this resource" },
        { status: 400 }
      )
    }

    // Create the resource purchase record
    const resourcePurchase = await prisma.resourcePurchase.create({
      data: {
        userId: user.id,
        resourceId,
        amount: amount || 0,
        currency,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            url: true,
            fileUrl: true,
            category: true,
            tags: true,
            isFree: true,
            price: true,
            isActive: true,
            downloadCount: true,
            clickCount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    return NextResponse.json(resourcePurchase, { status: 201 })
  } catch (error) {
    console.error("Error creating resource access:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}