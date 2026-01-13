import nodemailer from 'nodemailer'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Course Platform'

// Create SMTP transporter
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  console.log('SMTP Config:', {
    host: smtpHost || 'NOT SET',
    port: smtpPort || 'NOT SET', 
    user: smtpUser || 'NOT SET',
    passLength: smtpPassword?.length || 0
  })

  if (!smtpUser || !smtpPassword) {
    throw new Error('SMTP credentials not configured. Set SMTP_USER and SMTP_PASSWORD.')
  }
  
  return nodemailer.createTransport({
    host: smtpHost || 'smtp.gmail.com',
    port: parseInt(smtpPort || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })
}

// Helper to send email
async function sendEmail(to: string, subject: string, html: string) {
  const fromEmail = process.env.SMTP_USER || 'noreply@example.com'
  
  const transporter = createTransporter()
  const info = await transporter.sendMail({
    from: `"${APP_NAME}" <${fromEmail}>`,
    to,
    subject,
    html,
  })
  
  console.log('Email sent:', info.messageId)
  return { success: true, data: info }
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
) {
  try {
    const subject = `Your verification code: ${code} - ${APP_NAME}`
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
              <p>Hi${name ? ` ${name}` : ''},</p>
              <p>Thank you for creating an account with ${APP_NAME}! Use the verification code below to complete your registration:</p>
              <div style="text-align: center; margin: 35px 0;">
                <div style="background: #f5f5f5; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                  <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
                </div>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in <strong>15 minutes</strong>.</p>
              <p style="color: #666; font-size: 14px;">If you didn't create an account with us, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">Do not share this code with anyone.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `

    return await sendEmail(email, subject, html)
  } catch (error: any) {
    console.error('Error sending verification email:', error?.message || error)
    return { success: false, error: error?.message || 'Failed to send email' }
  }
}

export async function sendPasswordResetEmail(
  email: string,
  code: string,
  name?: string
) {
  try {
    const subject = `Your password reset code: ${code} - ${APP_NAME}`
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
              <p>Hi${name ? ` ${name}` : ''},</p>
              <p>We received a request to reset your password. Use the code below:</p>
              <div style="text-align: center; margin: 35px 0;">
                <div style="background: #f5f5f5; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                  <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
                </div>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in <strong>1 hour</strong>.</p>
              <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">Do not share this code with anyone.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `

    return await sendEmail(email, subject, html)
  } catch (error: any) {
    console.error('Error sending password reset email:', error?.message || error)
    return { success: false, error: error?.message || 'Failed to send email' }
  }
}
