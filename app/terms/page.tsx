export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {currentDate}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Agreement to Terms</h2>
        <p className="text-muted-foreground">
          By accessing Proteclink, you agree to be bound by these Terms of Service and all applicable laws and
          regulations. If you do not agree with any of these terms, you are prohibited from using this site.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Use License</h2>
        <p className="text-muted-foreground mb-4">LearnHub grants you permission to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Browse and search for educational courses and resources</li>
          <li>Download provided study materials and resources for personal use</li>
          <li>Access external course links for educational purposes</li>
        </ul>
        <p className="text-muted-foreground mt-4">
          This license shall automatically terminate if you violate any of these restrictions.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer</h2>
        <p className="text-muted-foreground mb-4">
          Proteclink is a course directory and resource aggregator. We provide links to external educational platforms and
          content:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>We do not host or own the courses linked on our platform</li>
          <li>Course availability, pricing, and content are controlled by the respective platforms</li>
          <li>We are not responsible for the quality, accuracy, or availability of external courses</li>
          <li>All course purchases and enrollments are subject to the terms of the hosting platform</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Educational Purpose</h2>
        <p className="text-muted-foreground">
          All resources and materials provided on LearnHub are for educational purposes only. We strive to provide
          accurate and up-to-date information, but we make no warranties about the completeness or accuracy of the
          content.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">External Links</h2>
        <p className="text-muted-foreground">
          LearnHub contains links to external websites. We have no control over the content and nature of these sites
          and are not responsible for their availability or content. The inclusion of any links does not necessarily
          imply a recommendation or endorsement.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Modifications</h2>
        <p className="text-muted-foreground">
          We reserve the right to revise these Terms of Service at any time without notice. By using this website, you
          agree to be bound by the current version of these terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
        <p className="text-muted-foreground">
          If you have any questions about these Terms of Service, please contact us at sumitadhikari2341@gmail.com
        </p>
      </div>
    </div>
  )
}

