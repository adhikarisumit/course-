import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import CartProvider from "@/components/cart-context"
import { ThemeProvider } from "@/components/theme-provider"
import DebugTheme from "@/components/debug-theme"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "proteclink",
  description: "proteclink — learning resources and curated courses",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>proteclink</title>
        <meta name="application-name" content="proteclink" />
        <meta name="description" content="proteclink — learning resources and curated courses" />
        <meta property="og:title" content="proteclink" />
        <meta name="twitter:title" content="proteclink" />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} enableColorScheme={false}>
          <CartProvider>
            {children}
            {process.env.NODE_ENV === "development" && <DebugTheme />}
          </CartProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

