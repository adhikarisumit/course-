import { BookOpen, Target, Users, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About LearnHub</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Your centralized platform for discovering quality online courses and educational resources from around the
          web.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <Target className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                To make quality education accessible by curating the best online courses and learning resources in one
                place.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Users className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Built by learners, for learners. We continuously update our catalog based on community feedback and
                trends.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <BookOpen className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Curated Content</h3>
              <p className="text-muted-foreground">
                Every course and resource is carefully selected to ensure high quality and relevance to modern learning
                needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Award className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Quality First</h3>
              <p className="text-muted-foreground">
                We prioritize courses from reputable platforms with proven track records of student success and
                satisfaction.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4">
            LearnHub was created to solve a common problem: finding quality educational content scattered across the
            internet. With thousands of courses available on various platforms, it can be overwhelming to discover the
            right learning path.
          </p>
          <p className="text-muted-foreground mb-4">
            We bring together courses from leading platforms like Udemy, Coursera, edX, Youtube and more, along with free
            resources like study notes, documentation, and video tutorials. Our goal is to be your one-stop destination
            for continuous learning.
          </p>
          <p className="text-muted-foreground">
            Whether you're a beginner starting your journey or an experienced professional looking to upskill, LearnHub
            helps you find the perfect resources to achieve your learning goals.
          </p>
        </div>
      </div>
    </div>
  )
}
