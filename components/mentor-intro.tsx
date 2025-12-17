import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Award, Users, BookOpen, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"

interface Mentor {
  id: string
  name: string
  role: string
  company: string | null
  bio: string
  image: string | null
  expertise: string
  experience: string | null
  achievements: string | null
  totalStudents: number
  totalCourses: number
  rating: number
}

export async function MentorIntro() {
  // Skip mentor section if no database is configured
  if (!process.env.DATABASE_URL) {
    return null
  }

  let mentors: Mentor[] = []
  
  try {
    // Fetch all active mentors - automatically updates when new mentors are added
    mentors = await prisma.mentor.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" }
    }) as Mentor[]
  } catch (error) {
    console.error("Failed to fetch mentors:", error)
    return null
  }

  if (mentors.length === 0) {
    return null
  }

  const totalStudents = mentors.reduce((acc: number, m: Mentor) => acc + m.totalStudents, 0)
  const totalCourses = mentors.reduce((acc: number, m: Mentor) => acc + m.totalCourses, 0)
  const avgRating = (mentors.reduce((acc: number, m: Mentor) => acc + m.rating, 0) / mentors.length).toFixed(1)

  return (
    <section id="mentor" className="py-16 md:py-24 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 text-sm px-4 py-1">
              {mentors.length === 1 ? "Meet Your Mentor" : "Meet Our Mentors"}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Learn from Experienced Educators
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our educational mentors are dedicated to guiding you through your learning journey with curated content and expert resources.
            </p>
          </div>

          {/* Mentors Grid - Automatically displays all active mentors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
            {mentors.map((mentor: Mentor) => {
              const achievements = mentor.achievements ? mentor.achievements.split(',').map((a: string) => a.trim()) : []
              
              return (
                <Card key={mentor.id} className="overflow-hidden border hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Image Section */}
                    <div className="relative h-[140px] bg-gradient-to-br from-primary/20 to-primary/5">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {mentor.image ? (
                          <div className="relative w-28 h-28 rounded-full overflow-hidden border-3 border-white shadow-lg">
                            <Image
                              src={mentor.image}
                              alt={mentor.name}
                              fill
                              quality={100}
                              priority
                              sizes="(max-width: 640px) 112px, 112px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                            <GraduationCap className="w-14 h-14 text-white" />
                          </div>
                        )}
                      </div>
                      {/* Rating Badge */}
                      {mentor.rating && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="shadow-lg">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {mentor.rating}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-base font-bold mb-1">{mentor.name}</h3>
                      <p className="text-primary font-semibold mb-1 text-xs">{mentor.role}</p>
                      {mentor.company && (
                        <p className="text-xs text-muted-foreground mb-2">{mentor.company}</p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                        {mentor.bio}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-1.5 mb-2">
                        <Badge variant="outline" className="text-[10px] py-0">
                          <Users className="w-2.5 h-2.5 mr-0.5" />
                          {mentor.totalStudents}+
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0">
                          <BookOpen className="w-2.5 h-2.5 mr-0.5" />
                          {mentor.totalCourses}
                        </Badge>
                      </div>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mentor.expertise.split(',').slice(0, 2).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] py-0">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex-1" />
                      <Button asChild className="w-full mt-auto" size="sm">
                        <Link href="/courses">
                          View Courses
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{totalCourses}+</div>
                <p className="text-sm text-muted-foreground">Curated Courses</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{totalStudents}+</div>
                <p className="text-sm text-muted-foreground">Active Learners</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{avgRating}★</div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Access Anytime</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
