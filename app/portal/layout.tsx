import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import PortalHeader from "@/components/portal-header"

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

    if (user?.role === "admin" || user?.role === "super") {
      redirect("/admin")
    }
  }

  return (
    <>
      <PortalHeader />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function () {
              document.body.addEventListener('copy', function(e) {
                // Allow copy in profile edit modal
                if (e.target && e.target.closest('[data-profile-edit-modal]')) {
                  return;
                }
                e.preventDefault();
              });
              document.body.addEventListener('cut', function(e) {
                // Allow cut in profile edit modal
                if (e.target && e.target.closest('[data-profile-edit-modal]')) {
                  return;
                }
                e.preventDefault();
              });
              document.body.addEventListener('paste', function(e) {
                // Allow paste in profile edit modal
                if (e.target && e.target.closest('[data-profile-edit-modal]')) {
                  return;
                }
                e.preventDefault();
              });
              document.body.addEventListener('contextmenu', function(e) {
                // Allow context menu in profile edit modal
                if (e.target && e.target.closest('[data-profile-edit-modal]')) {
                  return;
                }
                e.preventDefault();
              });
            });
          `,
        }}
      />
      {children}
    </>
  )
}
