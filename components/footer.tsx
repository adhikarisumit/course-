"use client"

import type React from "react"
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { FooterAd } from "@/components/ads"

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
              A comprehensive learning management platform designed to empower educators and students with modern tools for exceptional online education experiences.
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
            <h4 className="font-semibold mb-4">Course Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Programming & Development
                </a>
              </li>
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Design & Creative
                </a>
              </li>
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Business & Marketing
                </a>
              </li>
              <li>
                <a href="/#categories" onClick={handleCategoryClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Data Science & AI
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Learning Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#resources" onClick={handleResourceClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Course Library
                </a>
              </li>
              <li>
                <a href="/#resources" onClick={handleResourceClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Study Materials
                </a>
              </li>
              <li>
                <a href="/#resources" onClick={handleResourceClick} className="hover:text-foreground transition-colors cursor-pointer">
                  Interactive Lessons
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-foreground transition-colors">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/portal/dashboard" className="hover:text-foreground transition-colors">
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <FooterAd />
          <p>© {currentYear} Proteclink. All rights reserved. Empowering education through innovative learning management solutions.</p>
        </div>
      </div>
    </footer>
  )
}

