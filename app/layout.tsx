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
import prisma from "@/lib/prisma"
// Import database initialization to ensure admin user exists
import "@/lib/init-db"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "proteclink",
  description: "proteclink — learning resources and curated courses",
  generator: "v0.app",
}

// Fetch AdSense settings from database
async function getAdSenseSettings() {
  try {
    const settings = await prisma.adSenseSettings.findFirst({
      select: {
        publisherId: true,
        isEnabled: true,
      },
    });
    return settings;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adsenseSettings = await getAdSenseSettings();
  const showAdsense = adsenseSettings?.isEnabled && adsenseSettings?.publisherId;
  
  // Ensure publisher ID has ca- prefix
  const publisherId = adsenseSettings?.publisherId?.startsWith('ca-') 
    ? adsenseSettings.publisherId 
    : `ca-${adsenseSettings?.publisherId || ''}`;

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

