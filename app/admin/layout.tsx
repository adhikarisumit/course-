"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, LayoutDashboard, Menu, User, LogOut, Megaphone } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || ""

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    // Ensure admin user exists (backup safety measure)
    fetch('/api/ensure-admin')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('✅ Admin user verified/created')
        }
      })
      .catch(error => {
        console.warn('⚠️ Could not verify admin user:', error)
      })

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    // Simple role check - only redirect if definitely a student
    if (session.user.role === "student") {
      router.push("/portal/dashboard")
    }
  }, [session, status, router])

  if (status === "loading" || !session?.user) {
    return null
  }

  // Allow access if role is admin, super, or not yet set (let API routes handle actual authorization)
  if (session.user.role === "student") {
    return null
  }

  // Super admin check - either by role or email
  const isSuperAdmin = session.user.role === "super" || session.user.email === SUPER_ADMIN_EMAIL

  const userInitials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || session.user.email?.[0].toUpperCase() || "A"

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const linkClass = mobile 
      ? "block py-2 px-4 text-sm font-medium transition-colors hover:bg-accent rounded-md"
      : "text-sm font-medium transition-colors hover:text-primary"
    
    const handleClick = () => {
      if (mobile) setMobileOpen(false)
    }

    return (
      <>
        <Link href="/" className={linkClass} onClick={handleClick}>
          Home
        </Link>
        <Link href="/admin" className={linkClass} onClick={handleClick}>
          Dashboard
        </Link>
        <Link href="/admin/courses" className={linkClass} onClick={handleClick}>
          Courses
        </Link>
        <Link href="/admin/enrollments" className={linkClass} onClick={handleClick}>
          Enrollments
        </Link>
        <Link href="/admin/users" className={linkClass} onClick={handleClick}>
          Users
        </Link>
        <Link href="/admin/mentors" className={linkClass} onClick={handleClick}>
          Mentors
        </Link>
        <Link href="/admin/resources" className={linkClass} onClick={handleClick}>
          Resources
        </Link>
        <Link href="/admin/promo-banner" className={linkClass} onClick={handleClick}>
          Promo Banner
        </Link>
        <Link href="/admin/analytics" className={linkClass} onClick={handleClick}>
          Analytics
        </Link>
        <Link href="/admin/export" className={linkClass} onClick={handleClick}>
          Export Data
        </Link>
        {isSuperAdmin && (
          <Link href="/admin/manage-admins" className={linkClass} onClick={handleClick}>
            Manage Admins
          </Link>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-bold text-base md:text-lg">Admin Panel</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-2 md:gap-4">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Menu - only show on very small screens */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[40vw] sm:w-[250px]">
                <SheetHeader>
                  <SheetTitle>Admin Menu</SheetTitle>
                  <SheetDescription>Navigate admin panel</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  <NavLinks mobile />
                </nav>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name || "Admin"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
