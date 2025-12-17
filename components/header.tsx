"use client"

import { useState } from "react"
import { Cpu, Search, Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const handleSearch = () => {
    const coursesSection = document.getElementById("courses")
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Mobile auth buttons component
  function MobileAuthButtons() {
    const { data: session } = useSession()

    if (session?.user) {
      return null
    }

    return (
      <div className="flex flex-col gap-2 border-t border-border pt-3 w-full">
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>Sign In</Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
        </Button>
      </div>
    )
  }

  // User menu component
  function UserMenu() {
    const { data: session, status } = useSession()

    // Show loading skeleton while session is being fetched
    if (status === "loading") {
      return (
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
        </div>
      )
    }

    if (!session?.user) {
      // Show sign in/up on navbar for tablet/desktop only (sm and up), not on mobile
      return (
        <div className="hidden sm:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      )
    }

    const initials = session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/portal/dashboard" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/portal/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          {session.user.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin/courses" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Manage Courses</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu  className="h-8 w-8" />
            <span className="text-xl font-semibold">Proteclink</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, notes, resources..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} size="default">
                Search
              </Button>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              About
            </Link>
            <Link href="/#mentor" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Mentor
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Contact
            </Link>
            <UserMenu />
            <ThemeToggle />
            {/* mobile menu toggle */}
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden p-2 rounded hover:bg-accent/10"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
            {/* Mobile search */}
            <div className="relative w-full flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, notes, resources..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                      setMobileOpen(false)
                    }
                  }}
                />
              </div>
              <Button onClick={() => { handleSearch(); setMobileOpen(false); }} size="default">
                Search
              </Button>
            </div>
            {/* Mobile nav links */}
            <div className="flex flex-col gap-3 border-t border-border pt-3 items-end">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>
                About
              </Link>
              <Link href="/#mentor" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>
                Mentor
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>
            </div>
            {/* Mobile auth buttons for non-authenticated users */}
            <div className="block sm:hidden">
              <MobileAuthButtons />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

