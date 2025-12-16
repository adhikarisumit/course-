import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { promises as fs } from "fs"
import path from "path"

const SETTINGS_FILE = path.join(process.cwd(), "settings.json")

const defaultSettings = {
  site: {
    name: "ProtecLink",
    description: "Master technology skills with expert-curated courses and resources",
    url: "https://proteclink.com",
    contactEmail: "sumitadhikari2341@gmail.com",
  },
  payment: {
    currency: "JPY",
    stripeEnabled: false,
    paypalEnabled: false,
    bankTransferEnabled: true,
    bankDetails: "Bank: Nepal Bank\nAccount Name: ProtecLink\nAccount Number: XXXXX-XXXXX\nBranch: Kathmandu",
  },
  email: {
    fromEmail: "noreply@proteclink.com",
    fromName: "ProtecLink",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
  },
  security: {
    requireEmailVerification: false,
    allowSignup: true,
    sessionTimeout: 30,
  },
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    try {
      const data = await fs.readFile(SETTINGS_FILE, "utf-8")
      const settings = JSON.parse(data)
      return NextResponse.json(settings)
    } catch (error) {
      // If file doesn't exist, return default settings
      return NextResponse.json(defaultSettings)
    }
  } catch (error) {
    console.error("Error reading settings:", error)
    return NextResponse.json(
      { error: "Failed to read settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await request.json()

    // Save settings to file
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      "utf-8"
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
