import { auth } from "@/auth"
import PortalHeader from "@/components/portal-header"

export default async function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Only show portal header if user is logged in
  if (session?.user) {
    return (
      <>
        <PortalHeader />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function () {
                document.body.addEventListener('copy', function(e) {
                  if (e.target && e.target.closest('[data-profile-edit-modal]')) {
                    return;
                  }
                  e.preventDefault();
                });
                document.body.addEventListener('cut', function(e) {
                  if (e.target && e.target.closest('[data-profile-edit-modal]')) {
                    return;
                  }
                  e.preventDefault();
                });
                document.body.addEventListener('paste', function(e) {
                  if (e.target && e.target.closest('[data-profile-edit-modal]')) {
                    return;
                  }
                  e.preventDefault();
                });
                document.body.addEventListener('contextmenu', function(e) {
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

  // For non-logged in users, just show the content (they'll see the main site header from root layout)
  return <>{children}</>
}
