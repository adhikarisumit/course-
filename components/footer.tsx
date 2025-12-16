"use client"

import type React from "react"
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const pathname = usePathname()

  const handleResourceClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (pathname === "/") {
      const element = document.getElementById("resources")
      if (element) element.scrollIntoView({ behavior: "smooth" })
    } else {
      router.push("/")
      setTimeout(() => {
        const element = document.getElementById("resources")
        if (element) element.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (pathname === "/") {
      const element = document.getElementById("categories")
      if (element) element.scrollIntoView({ behavior: "smooth" })
    } else {
      router.push("/")
      setTimeout(() => {
        const element = document.getElementById("categories")
        if (element) element.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="font-semibold text-lg">Proteclink</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your centralized platform for discovering quality online courses and educational resources.
            </p>
            <div className="mt-4 space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Programming
                </a>
              </li>
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Design
                </a>
              </li>
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Business
                </a>
              </li>
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Data Science
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#resources" onClick={handleResourceClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Study Notes
                </a>
              </li>
              <li>
                <a href="/#resources" onClick={handleResourceClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Video Tutorials
                </a>
              </li>
              <li>
                <a href="/#resources" onClick={handleResourceClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Proteclink. All rights reserved. Built for educational purposes.</p>
        </div>
      </div>
    </footer>
  )
}

