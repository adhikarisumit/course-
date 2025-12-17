"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sandip Sharma",
      role: "Software Developer",
      company: "Tech Solutions Nepal",
      image: null,
      rating: 5,
      text: "The curated courses helped me transition from a different career into software development. The structured learning paths made it so much easier to know what to study next.",
      initials: "SS"
    },
    {
      name: "Rajendra Khadka",
      role: "Web Designer",
      company: "Creative Studio KTM",
      image: null,
      rating: 5,
      text: "Amazing collection of resources! The cheat sheets and downloadable materials have become my daily references. Worth every rupee!",
      initials: "RK"
    },
    {
      name: "Anju Sharma",
      role: "Data Analyst",
      company: "Analytics Plus Nepal",
      image: null,
      rating: 5,
      text: "I love how organized everything is. The mentor really understands what students need and provides exactly that. Highly recommended!",
      initials: "AS"
    },
    {
      name: "Bikesh Shrestha",
      role: "Marketing Manager",
      company: "Digital Agency Nepal",
      image: null,
      rating: 5,
      text: "The courses are practical and relevant. I was able to apply what I learned immediately in my job. Great value for money!",
      initials: "BS"
    },
    {
      name: "Ramesh Gauli",
      role: "UI/UX Designer",
      company: "Design Studio Pokhara",
      image: null,
      rating: 5,
      text: "Best investment in my career! The quality of courses and support materials exceeded my expectations. Thank you!",
      initials: "RG"
    },
    {
      name: "Anuska Khadka",
      role: "Full Stack Developer",
      company: "Startup Nepal",
      image: null,
      rating: 5,
      text: "From beginner to professional—this platform guided me every step of the way. The mentor's expertise shows in every course selection.",
      initials: "AK"
    }
  ]

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1">Student Success Stories</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              What Our Students Say
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Real feedback from real learners who have transformed their careers through our curated courses.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20 relative overflow-hidden"
              >
                {/* Quote decoration */}
                <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-10 h-10 text-primary" />
                </div>
                
                <CardContent className="p-4 sm:p-5 relative">
                  {/* Rating */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-muted-foreground mb-4 leading-relaxed italic text-xs sm:text-sm">
                    "{testimonial.text}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-primary/20">
                      <AvatarImage src={testimonial.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-[10px] text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">98%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">4.9/5</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">500+</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Happy Students</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">95%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Course Completion</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
