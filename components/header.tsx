"use client"

import { useState } from "react"
import { Cpu, Search, Menu, X, User, LogOut, LayoutDashboard, Settings, Book, Code2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession, signOut } from "next-auth/react" // import useSession
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HeaderAd } from "@/components/ads"

interface HeaderProps {
  searchQuery?: string
  setSearchQuery?: (query: string) => void
}

export function Header({ searchQuery = "", setSearchQuery }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const router = useRouter()
  const pathname = usePathname()
  
  const handleSearch = () => {
    const query = localSearchQuery || searchQuery
    if (query.trim()) {
      // Navigate to courses page with search query
      router.push(`/courses?search=${encodeURIComponent(query.trim())}`)
      setMobileOpen(false)
    } else {
      // If no query, just go to courses page
      router.push('/courses')
      setMobileOpen(false)
    }
  }

  const handleSearchInputChange = (value: string) => {
    setLocalSearchQuery(value)
    if (setSearchQuery) {
      setSearchQuery(value)
    }
  }

  const handleMentorClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === "/") {
      const mentorSection = document.getElementById("mentor")
      if (mentorSection) {
        mentorSection.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      router.push("/#mentor")
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

  // Mobile signup button component (visible on small screens when not logged in)
  function MobileSignupButton() {
    const { data: session, status } = useSession()
    
    if (status === "loading" || session?.user) {
      return null
    }
    
    return (
      <Button asChild size="sm" className="sm:hidden">
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    )
  }

  // Mobile hamburger button - only shown when user is NOT logged in
  function MobileHamburgerButton() {
    const { data: session } = useSession()
    
    // If user is logged in, the profile avatar acts as menu toggle, so hide hamburger
    if (session?.user) {
      return null
    }
    
    return (
      <button
        type="button"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((s) => !s)}
        className="md:hidden p-2 rounded hover:bg-accent/10"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    )
  }

  // Mobile user profile section - shown in mobile nav for logged-in users
  function MobileUserSection() {
    const { data: session } = useSession()
    
    if (!session?.user) {
      return null
    }
    
    return (
      <div className="w-full border-t border-border pt-3 mt-1">
        <div className="flex items-center gap-3 mb-3 justify-end">
          <div className="text-right">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Link 
            href="/portal/dashboard" 
            className="text-sm font-medium hover:text-primary transition-colors py-1 flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            href="/portal/profile" 
            className="text-sm font-medium hover:text-primary transition-colors py-1 flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          {(session.user.role === "admin" || session.user.role === "super") && (
            <Link 
              href="/admin/courses" 
              className="text-sm font-medium hover:text-primary transition-colors py-1 flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Manage Courses
            </Link>
          )}
          <button
            className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors py-1 flex items-center gap-2"
            onClick={() => {
              setMobileOpen(false)
              signOut({ callbackUrl: "/" })
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
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
          <div className="h-9 w-20 bg-muted animate-pulse rounded-md hidden sm:block" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded-md hidden sm:block" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full md:hidden" />
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

    // Mobile: Avatar acts as menu toggle (replaces hamburger)
    const MobileAvatar = (
      <Button 
        variant="ghost" 
        className="relative h-8 w-8 rounded-full md:hidden"
        onClick={() => setMobileOpen((s) => !s)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Button>
    )

    // Desktop: Avatar with dropdown
    const DesktopMenu = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full hidden md:flex">
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
          {(session.user.role === "admin" || session.user.role === "super") && (
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

    return (
      <>
        {MobileAvatar}
        {DesktopMenu}
      </>
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

          {setSearchQuery && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={localSearchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
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
          )}
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              About
            </Link>
            <Link href="/#mentor" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" onClick={handleMentorClick}>
              Mentor
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Contact
            </Link>
            {/* Free Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary">
                  Tools
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Free Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/jisho" className="cursor-pointer">
                    <Book className="mr-2 h-4 w-4" />
                    <span>Japanese Dictionary</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/playground" className="cursor-pointer">
                    <Code2 className="mr-2 h-4 w-4" />
                    <span>Code Playground</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserMenu />
            <MobileSignupButton />
            <ThemeToggle />
            {/* mobile menu toggle - only for non-authenticated users */}
            <MobileHamburgerButton />
          </nav>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
            {/* Mobile search */}
            {setSearchQuery && (
              <div className="relative w-full flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={localSearchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
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
            )}
            {/* Mobile nav links */}
            <div className="flex flex-col gap-3 border-t border-border pt-3 items-end">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>
                About
              </Link>
              <Link href="/#mentor" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={(e) => { handleMentorClick(e); setMobileOpen(false); }}>
                Mentor
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors py-1" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>
              <div className="w-full border-t border-border pt-3 mt-1">
                <p className="text-xs text-muted-foreground mb-2 text-right">Free Tools</p>
                <div className="flex flex-col gap-2 items-end">
                  <Link href="/jisho" className="text-sm font-medium hover:text-primary transition-colors py-1 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <Book className="h-4 w-4" />
                    Japanese Dictionary
                  </Link>
                  <Link href="/playground" className="text-sm font-medium hover:text-primary transition-colors py-1 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <Code2 className="h-4 w-4" />
                    Code Playground
                  </Link>
                </div>
              </div>
              {/* Mobile user profile section for logged-in users */}
              <MobileUserSection />
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

// Header Ad component - displayed below the navigation header
export function HeaderWithAd({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <HeaderAd />
    </>
  )
}

