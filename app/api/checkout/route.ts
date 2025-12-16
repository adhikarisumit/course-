import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// Note: This endpoint is deprecated. Payment is now handled via PayPay.
// Students should follow the payment instructions on the enrollment page.

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: "This payment method is no longer available. Please use PayPay payment instructions on the enrollment page.",
        message: "Payment system has been updated to PayPay"
      },
      { status: 410 } // 410 Gone - resource no longer available
    )
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
