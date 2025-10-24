"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, BarChart } from "lucide-react"

const courses = [
	{
		// Programming
		title: "Complete HTML Course",
		platform: "YouTube",
		url: "https://www.youtube.com/watch?v=HcOc7P5BMi4&t=5620s&pp=ygULaHRtbCBjb3Vyc2U%3D",
		level: "Beginner",
		duration: "32 Minutes",
		category: "Programming",
		description: "Learn Basic HTML in 30 minutes",
	},
	{
		title: "Complete CSS Course",
		platform: "YouTube",
		url: "https://www.youtube.com/watch?v=EUtlj7xdO1o&t=80s&pp=ygUKY3NzIGNvdXJzZQ%3D%3D",
		level: "Beginner",
		duration: "1 hour 32 Minutes",
		category: "Programming",
		description: "Learn full CSS course",
	},
	{
		title: "Complete JavaScript Course",
		platform: "YouTube",
		url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37",
		level: "Intermediate",
		duration: "15 Days",
		category: "Programming",
		description: "Learn JavaScript from Zero to Hero",
	},
	{
		title: "Complete Web Development Course",
		platform: "YouTube",
		url: "https://www.youtube.com/watch?v=-WN74rN9OPI&list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w",
		level: "Intermediate",
		duration: "1 Month",
		category: "Programming",
		description: "Comprehensive web development curriculum covering frontend and backend topics.",
	},
	{
		title: "UI/UX Design Fundamentals",
		platform: "Skillshare",
		url: "https://www.skillshare.com",
		level: "Beginner",
		duration: "12 hours",
		category: "Design",
		description: "Learn the principles of user interface and user experience design from scratch.",
	},
	{
		title: "Advanced React Patterns",
		platform: "Frontend Masters",
		url: "https://frontendmasters.com",
		level: "Advanced",
		duration: "8 hours",
		category: "Programming",
		description: "Deep dive into advanced React patterns, hooks, and performance optimization.",
	},
	{
		title: "Digital Marketing Masterclass",
		platform: "LinkedIn Learning",
		url: "https://www.linkedin.com/learning",
		level: "Intermediate",
		duration: "20 hours",
		category: "Business",
		description: "Complete guide to SEO, social media marketing, email campaigns, and analytics.",
	},
	{
		title: "Python for Data Analysis",
		platform: "DataCamp",
		url: "https://www.datacamp.com",
		level: "Intermediate",
		duration: "30 hours",
		category: "Data Science",
		description: "Learn to analyze and visualize data using Python, Pandas, and Matplotlib.",
	},
	{
		// languages
		title: "Japanese language N5 to N1",
		platform: "japanesetest4you",
		url: "https://japanesetest4you.com/",
		level: "Intermediate",
		duration: "unlimited",
		category: "Languages",
		description: "Learn Japanese language from beginner to pro.",
	},
	{
		title: "Japanese language N5 to N1",
		platform: "nihongopro",
		url: "https://www.nihongo-pro.com/",
		level: "Intermediate",
		duration: "unlimited",
		category: "Languages",
		description: "Practice N5 to N1 Japanese language lessons.",
	},
]

const levelColors = {
	Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	Intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	Advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

interface FeaturedCoursesProps {
	searchQuery: string
	selectedCategory: string | null
}

function normalize(s?: string | null) {
	return (s ?? "").toString().trim().toLowerCase()
}

export function FeaturedCourses({ searchQuery, selectedCategory }: FeaturedCoursesProps) {
	// Debug: show what category was passed
	// Remove or comment out console.debug in production
	console.debug("FeaturedCourses selectedCategory:", selectedCategory)

	const filteredCourses = courses.filter((course) => {
		if (selectedCategory) {
			if (normalize(course.category) !== normalize(selectedCategory)) return false
		}

		if (!searchQuery) return true
		const query = searchQuery.toLowerCase()
		return (
			course.title.toLowerCase().includes(query) ||
			course.description.toLowerCase().includes(query) ||
			course.category.toLowerCase().includes(query) ||
			course.platform.toLowerCase().includes(query) ||
			course.level.toLowerCase().includes(query)
		)
	})

	console.debug("filteredCourses length:", filteredCourses.length)

	return (
		<section id="courses" className="py-16 md:py-24 bg-secondary/50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
					<p className="text-muted-foreground text-lg">Hand-picked courses from top learning platforms</p>
					{(searchQuery || selectedCategory) && (
						<p className="text-sm text-muted-foreground mt-2">
							Found {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
							{selectedCategory && ` in ${selectedCategory}`}
							{searchQuery && ` matching "${searchQuery}"`}
						</p>
					)}
				</div>

				{filteredCourses.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground text-lg">No courses found matching your search.</p>
						<p className="text-sm text-muted-foreground mt-2">Try different keywords or clear the category filter.</p>
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredCourses.map((course) => (
							<Card key={course.title} className="flex flex-col hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="flex items-start justify-between gap-2 mb-2">
										<Badge variant="secondary">{course.category}</Badge>
										<Badge className={levelColors[course.level as keyof typeof levelColors]}>{course.level}</Badge>
									</div>
									<h3 className="font-semibold text-lg leading-tight">{course.title}</h3>
									<p className="text-sm text-muted-foreground">{course.platform}</p>
								</CardHeader>

								<CardContent className="flex-1">
									<p className="text-sm text-muted-foreground mb-4">{course.description}</p>
									<div className="flex items-center gap-4 text-sm text-muted-foreground">
										<div className="flex items-center gap-1">
											<Clock className="h-4 w-4" />
											<span>{course.duration}</span>
										</div>
										<div className="flex items-center gap-1">
											<BarChart className="h-4 w-4" />
											<span>{course.level}</span>
										</div>
									</div>
								</CardContent>

								<CardFooter>
									<Button className="w-full gap-2 bg-transparent" variant="outline" asChild>
										<a href={course.url} target="_blank" rel="noopener noreferrer">
											View Course
											<ExternalLink className="h-4 w-4" />
										</a>
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</div>
		</section>
	)
}
