import { NextResponse } from "next/server"
import { sendCustomEmail } from "@/lib/email"
import prisma from "@/lib/prisma"

const CONTACT_EMAIL = "proteclink.com@gmail.com"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, course, jlptLevel, codingLevel, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    // Save inquiry to database
    try {
      await prisma.inquiry.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject: subject || null,
          course: course || null,
          jlptLevel: jlptLevel || null,
          codingLevel: codingLevel || null,
          message,
        },
      })
    } catch (dbError) {
      console.error("Failed to save inquiry to database:", dbError)
      // Continue to send email even if DB save fails
    }

    const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Proteclink"
    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    })

    const emailSubject = subject
      ? `New Inquiry: ${subject} - ${APP_NAME}`
      : `New Inquiry from ${name} - ${APP_NAME}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Inquiry</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📩 New Inquiry Received</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">${APP_NAME}</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #555; width: 120px; vertical-align: top;">Name:</td>
                <td style="padding: 10px 0; color: #333;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #555; vertical-align: top;">Email:</td>
                <td style="padding: 10px 0;">
                  <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #555; vertical-align: top;">Phone:</td>
                <td style="padding: 10px 0;">
                  <a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a>
                </td>
              </tr>
              ` : ""}
              ${subject ? `
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #555; vertical-align: top;">Subject:</td>
                <td style="padding: 10px 0; color: #333;">${subject}</td>
              </tr>
              ` : ""}
              ${course ? `
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #555; vertical-align: top;">Course:</td>
                <td style="padding: 10px 0; color: #333;">${course}</td>
              </tr>
              ` : ""}
              ${jlptLevel ? `
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #555; vertical-align: top;">JLPT Level:</td>
                <td style="padding: 10px 0; color: #333;">${jlptLevel}</td>
              </tr>
              ` : ""}
              ${codingLevel ? `
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #555; vertical-align: top;">Coding Level:</td>
                <td style="padding: 10px 0; color: #333;">${codingLevel}</td>
              </tr>
              ` : ""}
            </table>

            <h2 style="color: #333; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 24px;">Message</h2>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea; white-space: pre-wrap; color: #333; font-size: 14px; line-height: 1.7;">
${message}
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">Submitted on ${submittedAt}</p>
              <p style="color: #888; font-size: 12px; margin: 4px 0 0;">
                Reply directly to <a href="mailto:${email}" style="color: #667eea;">${email}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendCustomEmail({
      to: CONTACT_EMAIL,
      subject: emailSubject,
      html,
    })

    if (!result.success) {
      console.error("Failed to send inquiry email:", (result as any).error)
      return NextResponse.json(
        { error: "Failed to send your inquiry. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: "Inquiry sent successfully!" })
  } catch (error: any) {
    console.error("Inquiry API error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
