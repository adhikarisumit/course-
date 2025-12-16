"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, Mail, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur shadow-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              {/* Decorative Element */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="text-center space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Start Your Learning Journey Today
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Don't wait to transform your career. Access our curated courses, expert resources, 
                  and supportive community right now. Your future self will thank you!
                </p>

                {/* Benefits List */}
                <div className="grid sm:grid-cols-3 gap-4 py-6">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Instant Access</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>6 Months Access</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Downloadable Resources</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all group">
                    <Link href="/courses">
                      Browse All Courses
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="gap-2 border-2">
                    <Link href="/contact">
                      <Mail className="w-4 h-4" />
                      Contact Us
                    </Link>
                  </Button>
                </div>

                {/* Trust Badge */}
                <div className="pt-6 border-t border-border/50 mt-8">
                  <p className="text-sm text-muted-foreground">
                    🎯 <strong>Limited Time:</strong> Get started now and receive exclusive bonus materials
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Questions? <Link href="/contact" className="text-primary hover:underline font-medium">Get in touch</Link> with our team
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
