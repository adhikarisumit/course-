import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeaderAd, InArticleAd } from "@/components/ads"

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="min-h-screen">
      <Header />
      <HeaderAd />
      <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {currentDate}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Agreement to Terms</h2>
        <p className="text-muted-foreground">
          By accessing and using Proteclink, you agree to be bound by these Terms of Service and all applicable laws and
          regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Platform Description</h2>
        <p className="text-muted-foreground">
          Proteclink is a comprehensive learning management system (LMS) that provides educational institutions,
          instructors, and students with tools for course creation, management, and delivery. Our platform facilitates
          online education through structured courses, interactive lessons, progress tracking, and communication features.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">User Accounts and Roles</h2>
        <p className="text-muted-foreground mb-4">Proteclink supports multiple user roles:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li><strong>Students:</strong> Access courses, track progress, communicate with instructors</li>
          <li><strong>Instructors:</strong> Create and manage courses, interact with students</li>
          <li><strong>Administrators:</strong> Oversee platform operations and user management</li>
        </ul>
        <p className="text-muted-foreground mt-4">
          Users must provide accurate information and maintain the security of their account credentials.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Course Content and Intellectual Property</h2>
        <p className="text-muted-foreground mb-4">
          Course content uploaded by instructors remains their intellectual property. By uploading content to Proteclink:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>You grant Proteclink a license to host and distribute your content within the platform</li>
          <li>You warrant that you have rights to share the content and it doesn't violate third-party rights</li>
          <li>You agree not to upload copyrighted material without proper authorization</li>
          <li>Content may be subject to platform review and removal if it violates these terms</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Payment Terms</h2>
        <p className="text-muted-foreground mb-4">
          Some courses and resources may require payment. Payment terms include:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>All payments are processed through secure third-party payment processors</li>
          <li>Course access is granted upon successful payment completion</li>
          <li>Refunds are subject to the refund policy of the course instructor or institution</li>
          <li>Payment information is not stored on Proteclink servers</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">User Conduct and Responsibilities</h2>
        <p className="text-muted-foreground mb-4">Users agree to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Use the platform for lawful educational purposes only</li>
          <li>Respect intellectual property rights of content creators</li>
          <li>Maintain academic integrity and avoid plagiarism</li>
          <li>Communicate respectfully with other users</li>
          <li>Not attempt to circumvent platform security measures</li>
          <li>Report inappropriate content or behavior to administrators</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Platform Availability and Maintenance</h2>
        <p className="text-muted-foreground">
          While we strive for high availability, Proteclink may experience occasional downtime for maintenance,
          updates, or unforeseen technical issues. We will provide reasonable notice for scheduled maintenance through our notice board
          and work to minimize disruptions to the learning experience.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Data Privacy and Security</h2>
        <p className="text-muted-foreground">
          Your privacy is important to us. Personal information is collected, used, and protected in accordance with
          our Privacy Policy. We implement security measures to protect user data, but users are also responsible
          for maintaining their account security.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Termination and Account Suspension</h2>
        <p className="text-muted-foreground">
          We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent
          activity, or disrupt the learning environment. Users may also request account deletion at any time.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Modifications</h2>
        <p className="text-muted-foreground">
          We reserve the right to revise these Terms of Service at any time. We will notify users of any changes through our notice board. By continuing to use this website after changes are posted, you agree to be bound by the updated terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
        <p className="text-muted-foreground">
          If you have any questions about these Terms of Service, please contact us at proteclink.com@gmail.com
        </p>
        
        {/* In-Article Ad */}
        <div className="mt-10">
          <InArticleAd />
        </div>
      </div>
    </div>
    <Footer />
    </div>
  )
}

