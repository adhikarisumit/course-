"use client"

import { useState } from "react"
import { Cpu, Search, ShoppingCart, Menu, X } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

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

  // CartIcon component moved inside header file to keep header self-contained
  function CartIcon() {
    try {
      const { count } = useCart()

      return (
        <Link href="/shop/cart" className="relative flex items-center p-1 rounded hover:bg-accent/20" aria-label="Open cart">
          <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="sr-only">Cart</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-white">
              {count}
            </span>
          )}
        </Link>
      )
    } catch (e) {
      // If cart context isn't available for some reason, render icon without badge
      return (
        <Link href="/shop/cart" className="flex items-center p-1 rounded hover:bg-accent/20" aria-label="Open cart">
          <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="sr-only">Cart</span>
        </Link>
      )
    }
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
            <a href="#courses" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Courses
            </a>
            <a href="#resources" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Resources
            </a>
            <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Shop
            </Link>
            {/* Cart icon only (visible on all sizes). Accessible label provided for screen readers. */}
            <CartIcon />
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
            <div className="flex flex-col gap-2 border-t border-border pt-2 items-end">
              <a href="#courses" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                Courses
              </a>
              <a href="#resources" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                Resources
              </a>
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                Shop
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

