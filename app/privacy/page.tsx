import { Header } from "@/components/header"

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {currentDate}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
        <p className="text-muted-foreground">
          Proteclink ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we
          collect, use, and safeguard your information when you use our comprehensive learning management platform.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
        <p className="text-muted-foreground mb-4">
          As a learning management platform, Proteclink collects and processes certain information to provide our educational
          services. We collect information you provide directly and automatically through platform usage.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Personal Information</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Name, email address, and profile information when you create an account</li>
          <li>Course enrollment and progress data</li>
          <li>Communication records between students, instructors, and administrators</li>
          <li>Payment information for course purchases (processed securely through third-party providers)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">Usage Information</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Learning progress and completion statistics</li>
          <li>Course access logs and study patterns</li>
          <li>Device and browser information for platform optimization</li>
          <li>Theme preferences and user interface settings</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
        <p className="text-muted-foreground mb-4">We use collected information to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Provide and personalize your learning experience</li>
          <li>Track and report on course progress and completion</li>
          <li>Facilitate communication between students and instructors</li>
          <li>Process payments and manage enrollments</li>
          <li>Improve platform functionality and user experience</li>
          <li>Ensure platform security and prevent unauthorized access</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Information Sharing</h2>
        <p className="text-muted-foreground mb-4">
          We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>With instructors and administrators for course management purposes</li>
          <li>With payment processors for transaction processing</li>
          <li>When required by law or to protect platform security</li>
          <li>With your explicit consent for specific purposes</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
        <p className="text-muted-foreground">
          We implement industry-standard security measures to protect your personal information, including encryption,
          secure servers, and regular security audits. However, no method of transmission over the internet is 100%
          secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Data Retention</h2>
        <p className="text-muted-foreground">
          We retain your personal information for as long as necessary to provide our services and comply with legal
          obligations. Course progress data and learning records are maintained to support your educational journey
          and provide accurate progress reporting.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
        <p className="text-muted-foreground mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Access and review your personal information</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt out of non-essential communications</li>
          <li>Export your learning data and course progress</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Cookies and Tracking</h2>
        <p className="text-muted-foreground">
          We use cookies and similar technologies to enhance your experience, maintain session security, and analyze
          platform usage. You can control cookie preferences through your browser settings, though this may affect
          platform functionality.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
          revision date and notified through our notice board.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p className="text-muted-foreground">
          If you have questions about this Privacy Policy, please contact us at proteclink.com@gmail.com
        </p>
      </div>
    </div>
    </div>
  )
}

