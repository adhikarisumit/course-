import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
      image?: string
    }
  }

  interface JWT {
    id: string
    role: string
    email: string
    sessionVersion: number
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" }, // Reverted back to JWT strategy
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user?.password) {
          throw new Error("Invalid credentials")
        }

        // Check if email is verified (skip for admin users)
        if (!user.emailVerified && user.role !== "admin") {
          throw new Error("Please verify your email before signing in")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        // Get sessionVersion from database for new sessions
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { sessionVersion: true }
        })
        token.sessionVersion = dbUser?.sessionVersion ?? 0
      } else if (token.id) {
        // Check sessionVersion on subsequent calls
        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { sessionVersion: true }
          })
          
          if (!currentUser || currentUser.sessionVersion !== token.sessionVersion) {
            // Session is invalid, return null to clear the token
            return null
          }
        } catch {
          // If there's an error checking the user, invalidate the session
          return null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.image = token.picture as string || undefined
      }
      return session
    },
    async signIn({ user, account }) {
      // For OAuth providers, ensure user has a role
      if (account?.provider === "google" || account?.provider === "github") {
        // Fetch user from database to get their role
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        
        if (dbUser && !dbUser.role) {
          // Set default role if not set
          await prisma.user.update({
            where: { email: user.email! },
            data: { role: "student" },
          })
        }
      }
      return true
    },
  },
})
