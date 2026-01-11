import { randomInt } from 'crypto'
import prisma from '@/lib/prisma'

export async function generateVerificationToken(email: string) {
  // Generate 6-digit code
  const code = randomInt(100000, 999999).toString()
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  })

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
    }
  })

  return verificationToken
}

export async function verifyToken(email: string, code: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { 
      identifier: email,
      token: code 
    }
  })

  if (!verificationToken) {
    return { success: false, error: 'Invalid verification code' }
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        }
      }
    })
    return { success: false, error: 'Verification code has expired' }
  }

  // Update user's email verification status
  const user = await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() }
  })

  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      }
    }
  })

  return { success: true, user }
}

export async function generatePasswordResetToken(email: string) {
  // Generate 6-digit code
  const code = randomInt(100000, 999999).toString()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Delete any existing password reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { 
      identifier: `password-reset:${email}` 
    }
  })

  // Create new token
  const resetToken = await prisma.verificationToken.create({
    data: {
      identifier: `password-reset:${email}`,
      token: code,
      expires,
    }
  })

  return resetToken
}

export async function verifyPasswordResetToken(email: string, code: string) {
  const resetToken = await prisma.verificationToken.findFirst({
    where: { 
      identifier: `password-reset:${email}`,
      token: code
    }
  })

  if (!resetToken) {
    return { success: false, error: 'Invalid reset code' }
  }

  if (resetToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: resetToken.identifier,
          token: resetToken.token,
        }
      }
    })
    return { success: false, error: 'Reset code has expired' }
  }
  
  return { success: true, email, token: resetToken }
}

export async function deletePasswordResetToken(email: string, code: string) {
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: `password-reset:${email}`,
        token: code,
      }
    }
  })
}
