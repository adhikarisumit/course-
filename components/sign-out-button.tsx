"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton({ variant = "outline" }: { variant?: "outline" | "ghost" | "link" }) {
  return (
    <button
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </button>
  )
}
