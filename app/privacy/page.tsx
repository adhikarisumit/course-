export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {currentDate}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
        <p className="text-muted-foreground">
          Proteclink ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we
          collect, use, and safeguard your information when you visit our website.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
        <p className="text-muted-foreground mb-4">
          Proteclink is a frontend-only application that does not collect or store personal information. We do not require
          user accounts, and we do not track your browsing behavior.
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>We do not collect personal identification information</li>
          <li>We do not use cookies for tracking purposes</li>
          <li>We only use localStorage for theme preferences (light/dark mode)</li>
          <li>We do not share any data with third parties</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">External Links</h2>
        <p className="text-muted-foreground">
          Our website contains links to external course platforms and educational resources. When you click these links,
          you will be directed to third-party websites that have their own privacy policies. We are not responsible for
          the privacy practices of these external sites.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Local Storage</h2>
        <p className="text-muted-foreground">
          We use browser localStorage solely to remember your theme preference (light or dark mode). This data is stored
          locally on your device and is never transmitted to our servers.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
          revision date.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p className="text-muted-foreground">
          If you have questions about this Privacy Policy, please contact us at sumitadhikari2341@gmail.com
        </p>
      </div>
    </div>
  )
}

