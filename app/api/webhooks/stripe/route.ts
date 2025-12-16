import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: NextRequest) {
  try {
    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 503 }
      )
    }

    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { courseId, userId } = session.metadata!

        // Update payment status
        await prisma.payment.updateMany({
          where: {
            stripePaymentId: session.id,
            status: "pending",
          },
          data: {
            status: "completed",
          },
        })

        // Create enrollment
        await prisma.enrollment.create({
          data: {
            userId: userId,
            courseId: courseId,
          },
        })

        console.log(`Enrollment created for user ${userId} in course ${courseId}`)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment status
        await prisma.payment.updateMany({
          where: {
            stripePaymentId: paymentIntent.id,
          },
          data: {
            status: "failed",
          },
        })

        console.log(`Payment failed: ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
