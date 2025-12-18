import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Redirect admins to admin panel
  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role === "admin") {
      redirect("/admin")
    }
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function () {
              document.body.addEventListener('copy', function(e) { e.preventDefault(); });
              document.body.addEventListener('cut', function(e) { e.preventDefault(); });
              document.body.addEventListener('paste', function(e) { e.preventDefault(); });
              document.body.addEventListener('contextmenu', function(e) { e.preventDefault(); });
            });
          `,
        }}
      />
      {children}
    </>
  )
}
