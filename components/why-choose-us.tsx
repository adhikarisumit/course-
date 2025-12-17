"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  GraduationCap,
  Briefcase,
  MapPin,
  Shield,
  Users,
  Award,
  TrendingUp,
  Globe,
  CheckCircle2
} from "lucide-react"

export function WhyChooseUs() {
  const features = [
    {
      icon: Users,
      title: "Experienced mentorship",
      description: "Learn from industry experts with years of real-world experience who provide personalized guidance and support.",
      color: "text-blue-500",
      badge: null
    },
    {
      icon: GraduationCap,
      title: "Live/recorded class",
      description: "Flexible learning options with both live interactive sessions and recorded classes you can access anytime, anywhere.",
      color: "text-purple-500",
      badge: null
    },
    {
      icon: CheckCircle2,
      title: "Practical implement",
      description: "Hands-on projects and real-world implementations to build your portfolio and gain practical experience.",
      color: "text-green-500",
      badge: null
    },
    {
      icon: TrendingUp,
      title: "Future support",
      description: "Continuous support even after course completion to help you stay updated and advance in your career.",
      color: "text-teal-500",
      badge: null
    },
    {
      icon: Briefcase,
      title: "Job support",
      description: "Comprehensive job placement assistance for IT positions in Japan. We guide you through the entire job search process.",
      color: "text-orange-500",
      badge: "Featured"
    },
    {
      icon: Award,
      title: "Affordable price",
      description: "Quality education at competitive prices with flexible payment options to make learning accessible to everyone.",
      color: "text-yellow-500",
      badge: null
    },
    {
      icon: Shield,
      title: "Familiar environment",
      description: "Comfortable and supportive learning atmosphere where you can ask questions freely and grow at your own pace.",
      color: "text-pink-500",
      badge: null
    }
  ]

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1">Your Path to Success</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Why choose us?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
              Industry-certified courses combined with comprehensive job placement support. 
              We don't just teach—we guide you to secure IT positions in Japan's thriving tech industry.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12 px-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Industry Verified</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Job support</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Expert Mentors</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Career Guidance</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                
                <Card className="relative h-full border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden">
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color.replace('text-', 'from-')} to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                  
                  {feature.badge && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white shadow text-[10px] px-2 py-0.5 animate-pulse">
                        ★
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-2 pt-5 px-5">
                    {/* Icon with animated background */}
                    <div className="relative mb-3">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color.replace('text-', 'from-')} to-primary/30 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-background to-muted flex items-center justify-center border border-primary/20 group-hover:border-primary/50 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-md`}>
                        <feature.icon className={`w-6 h-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                    </div>
                    
                    <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors duration-300 leading-tight">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-5 pb-5">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
