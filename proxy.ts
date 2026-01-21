import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth(async (req) => {
  // Skip auth checks if no database is configured
  if (!process.env.DATABASE_URL) {
    return NextResponse.next()
  }

  try {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isStudentPortal = req.nextUrl.pathname.startsWith('/portal')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
    const isCoursePage = req.nextUrl.pathname.startsWith('/courses/')
    const userRole = req.auth?.user?.role?.toLowerCase()
    const isAdmin = userRole === 'admin' || userRole === 'super'

    // Redirect logged in users away from auth pages
    if (isLoggedIn && isAuthPage) {
      // Redirect admin to admin panel, others to portal
      const redirectUrl = isAdmin ? '/admin' : '/portal/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    // Protect admin pages - require admin role
    if (isAdminPage && (!isLoggedIn || !isAdmin)) {
      // Redirect to signin if not logged in, otherwise to portal dashboard
      const redirectUrl = !isLoggedIn ? '/auth/signin' : '/portal/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    // Protect student portal and course pages
    if (!isLoggedIn && (isStudentPortal || isCoursePage)) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Proxy middleware error:", error)
    return NextResponse.next()
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
