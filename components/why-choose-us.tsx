"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Shield, 
  Clock, 
  TrendingUp, 
  Users, 
  Award,
  CheckCircle,
  Zap
} from "lucide-react"

export function WhyChooseUs() {
  const features = [
    {
      icon: Sparkles,
      title: "Curated Quality Content",
      description: "Every course is handpicked and reviewed to ensure top-notch quality and relevance to current industry needs.",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Trusted Resources",
      description: "We partner with reputable platforms and educators to bring you verified and reliable learning materials.",
      color: "text-blue-500"
    },
    {
      icon: Clock,
      title: "Learn at Your Pace",
      description: "Flexible learning schedules that fit your lifestyle. Access courses anytime, anywhere, on any device.",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      title: "Career Growth Focus",
      description: "Courses designed to boost your career prospects with skills that employers are actively seeking.",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a vibrant community of learners. Share knowledge, get help, and grow together.",
      color: "text-pink-500"
    },
    {
      icon: Award,
      title: "Certificates & Recognition",
      description: "Earn certificates upon completion to showcase your achievements and enhance your professional profile.",
      color: "text-orange-500"
    },
    {
      icon: CheckCircle,
      title: "Structured Learning Paths",
      description: "Clear roadmaps from beginner to advanced levels. Know exactly what to learn and in what order.",
      color: "text-teal-500"
    },
    {
      icon: Zap,
      title: "Regular Updates",
      description: "Content is constantly updated to keep pace with industry trends and technological advancements.",
      color: "text-red-500"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 text-sm px-4 py-1">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Your Success is Our Priority
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We don't just provide courses—we create complete learning experiences designed to transform your career and skills.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <Card className="inline-block border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3">Ready to Start Your Learning Journey?</h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands of learners who are already advancing their careers with our curated courses.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/courses" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2">
                    Explore All Courses
                  </a>
                  <a href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2">
                    Contact Us
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
