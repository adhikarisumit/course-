"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Users, 
  Target,
  Zap,
  CheckCircle,
  BarChart
} from "lucide-react"

export function SuccessMetrics() {
  const metrics = [
    {
      icon: TrendingUp,
      value: "95%",
      label: "Course Completion Rate",
      description: "Students who start finish strong",
      color: "text-green-500"
    },
    {
      icon: Award,
      value: "4.9/5",
      label: "Average Student Rating",
      description: "Based on 500+ reviews",
      color: "text-yellow-500"
    },
    {
      icon: Clock,
      value: "6 Months",
      label: "Course Access Period",
      description: "Learn at your own pace",
      color: "text-blue-500"
    },
    {
      icon: Users,
      value: "500+",
      label: "Active Students",
      description: "Join our learning community",
      color: "text-purple-500"
    },
    {
      icon: Target,
      value: "85%",
      label: "Career Advancement",
      description: "Students report career growth",
      color: "text-orange-500"
    },
    {
      icon: Zap,
      value: "24/7",
      label: "Instant Access",
      description: "Start learning immediately",
      color: "text-pink-500"
    }
  ]

  const benefits = [
    "✓ 6 months access to course materials",
    "✓ Downloadable resources and cheat sheets",
    "✓ Certificate of completion",
    "✓ Regular content updates",
    "✓ Mobile-friendly learning experience",
    "✓ Community support and discussions"
  ]

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 text-sm px-4 py-1">Our Impact</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Real Results, Real Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of students who have transformed their careers and achieved their learning goals with our platform.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {metrics.map((metric, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:scale-110 transition-transform`}>
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-3xl font-bold mb-1">{metric.value}</div>
                      <div className="font-semibold mb-1">{metric.label}</div>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits & Stats Combined */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* What You Get */}
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">What You Get</h3>
                </div>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-primary font-bold mt-0.5">{benefit.split(' ')[0]}</span>
                      <span>{benefit.substring(benefit.indexOf(' ') + 1)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Statistics */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Student Success</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Career Growth</span>
                      <span className="text-sm text-primary font-bold">85%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/50" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Skill Improvement</span>
                      <span className="text-sm text-primary font-bold">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/50" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Would Recommend</span>
                      <span className="text-sm text-primary font-bold">98%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/50" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Course Satisfaction</span>
                      <span className="text-sm text-primary font-bold">96%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/50" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-6 text-center">
                  Based on feedback from 500+ students
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
