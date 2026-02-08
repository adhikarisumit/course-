import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { AdProvider } from "@/components/ads"
import { Toaster } from "@/components/ui/sonner"
// Import database initialization to ensure admin user exists
import "@/lib/init-db"

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
  // Use environment variables for AdSense (safe for static build)
  const publisherId = process.env.ADSENSE_PUBLISHER_ID;
  const adsenseEnabled = process.env.ADSENSE_ENABLED === 'true';
  const showAdsense = adsenseEnabled && publisherId;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>proteclink</title>
        <meta name="application-name" content="proteclink" />
        <meta name="description" content="proteclink — learning resources and curated courses" />
        <meta property="og:title" content="proteclink" />
        <meta name="twitter:title" content="proteclink" />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {showAdsense && (
          <Script
            id="adsense-script"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} enableColorScheme={false}>
          <AuthProvider>
            <AdProvider>
              {children}
            </AdProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

