import { BookOpen, Target, Users, Award, GraduationCap, Zap, Shield, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InArticleAd, HeaderAd } from "@/components/ads"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeaderAd />
      <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Proteclink</h1>
        <p className="text-lg text-muted-foreground mb-12">
          A comprehensive learning management platform designed to empower educators and students with modern tools for
          exceptional online education experiences.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <GraduationCap className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Complete LMS Solution</h3>
              <p className="text-muted-foreground">
                Full-featured learning management system with course creation, student enrollment, progress tracking,
                and comprehensive analytics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Users className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Multi-Role Platform</h3>
              <p className="text-muted-foreground">
                Supports administrators, instructors, mentors, and students with role-based access and personalized
                dashboards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Zap className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Modern Technology</h3>
              <p className="text-muted-foreground">
                Built with Next.js, TypeScript, and cutting-edge web technologies for fast, secure, and scalable
                performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Shield className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with authentication, data protection, and reliable infrastructure for
                peace of mind.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-muted-foreground mb-4">
            Proteclink was built to revolutionize online education by providing institutions and educators with a
            powerful, user-friendly platform that simplifies course management and enhances the learning experience.
          </p>
          <p className="text-muted-foreground mb-4">
            Our platform combines intuitive course creation tools, robust student management, real-time communication,
            and comprehensive analytics to create an ecosystem where education thrives. From individual instructors
            to large educational institutions, Proteclink scales to meet diverse needs.
          </p>
          <p className="text-muted-foreground mb-6">
            We believe in the power of education to transform lives, and we're committed to providing the tools that
            make exceptional online learning possible.
          </p>

          {/* In-Article Ad */}
          <div className="my-6 not-prose">
            <InArticleAd />
          </div>

          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">For Educators</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Course creation and management</li>
                <li>• Student progress monitoring</li>
                <li>• Interactive lessons and resources</li>
                <li>• Communication tools</li>
                <li>• Performance analytics</li>
                <li>• Live course sessions</li>
                <li>• Resource sharing and uploads</li>
                <li>• Notice board access</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">For Students</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Personalized learning paths</li>
                <li>• Progress tracking</li>
                <li>• Direct instructor communication</li>
                <li>• Notice board for updates</li>
                <li>• Cheat sheets and study materials</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Platform Features</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Multi-role user management</li>
                <li>• Admin dashboard and analytics</li>
                <li>• Secure payment processing</li>
                <li>• Mobile-responsive design</li>
                <li>• Dark/light theme support</li>
                <li>• Notice board for updates</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Learning Tools</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Video content integration</li>
                <li>• Progress tracking and reports</li>
                <li>• Mentor-student matching</li>
                <li>• Cheat sheets and study materials</li>
                <li>• Direct messaging system</li>
                <li>• Resource library access</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Built for the Future</h2>
          <p className="text-muted-foreground">
            Proteclink is designed with modern educational needs in mind. Our platform supports various content types,
            adaptive learning, and integrates seamlessly with existing educational workflows. Whether you're teaching
            programming, design, business, or any other subject, Proteclink provides the foundation for successful
            online education.
          </p>
          
          {/* In-Article Ad */}
          <div className="mt-8">
            <InArticleAd />
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  )
}

