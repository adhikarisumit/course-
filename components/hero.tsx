"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  const scrollToCourses = () => {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToResources = () => {
    document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gray-900">
      {/* Programming keyboard background image - very visible */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3')`,
        }}
      ></div>
      
      {/* Dark overlay for both light and dark modes */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-900/70"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60"></div>

      {/* Animated code snippets */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="code-animation text-green-400 font-mono text-xs leading-relaxed whitespace-pre">
{`const learn = async () => {
  const knowledge = await fetchCourses();
  return knowledge.map(k => k.apply());
}

function buildSkills(resources) {
  return resources.reduce((acc, r) => {
    return [...acc, ...r.practice()];
  }, []);
}

class Developer {
  constructor(name) {
    this.name = name;
    this.skills = [];
  }
  
  async learnNew(course) {
    const newSkill = await course.complete();
    this.skills.push(newSkill);
    return this;
  }
}

const student = new Developer('You');
student.learnNew(course).then(dev => {
  console.log('Skills acquired!', dev.skills);
});

const learn = async () => {
  const knowledge = await fetchCourses();
  return knowledge.map(k => k.apply());
}

function buildSkills(resources) {
  return resources.reduce((acc, r) => {
    return [...acc, ...r.practice()];
  }, []);
}`}
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent">
            Your Gateway to Quality Online Learning
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 text-pretty">
            Discover curated courses, educational notes, and learning resources from the best platforms across the web.
            All in one place.<br></br>
            <mark className="bg-yellow-300 dark:bg-yellow-400 text-gray-900 px-3 py-1.5 rounded font-medium">
              Note: We're not course builders or course owner. We just guide and provide the course, resources and ideas.
            </mark>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer" onClick={scrollToCourses}>
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white/80 hover:border-white text-black dark:text-white hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-white transition-all cursor-pointer" onClick={scrollToResources}>
              Browse Resources
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

