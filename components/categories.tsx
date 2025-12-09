"use client"

import { Code, Palette, TrendingUp, Brain, Globe, Database } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
	{
		icon: Code,
		title: "Programming",
		count: "8 courses available. uploading more...",
		color: "text-blue-600 dark:text-blue-400",
		bgGradient: "from-blue-500/10 to-blue-600/5 dark:from-blue-400/20 dark:to-blue-500/10",
	},
	{
		icon: Palette,
		title: "Design",
		count: "2 course available. uploading more...",
		color: "text-pink-600 dark:text-pink-400",
		bgGradient: "from-pink-500/10 to-pink-600/5 dark:from-pink-400/20 dark:to-pink-500/10",
	},
	{
		icon: TrendingUp,
		title: "Business",
		count: "1 course available. uploading more...",
		color: "text-green-600 dark:text-green-400",
		bgGradient: "from-green-500/10 to-green-600/5 dark:from-green-400/20 dark:to-green-500/10",
	},
	{
		icon: Brain,
		title: "Data Science",
		count: "1 courses available. uploading more...",
		color: "text-purple-600 dark:text-purple-400",
		bgGradient: "from-purple-500/10 to-purple-600/5 dark:from-purple-400/20 dark:to-purple-500/10",
	},
	{
		icon: Globe,
		title: "Languages",
		count: "2 courses available. uploading more...",
		color: "text-orange-600 dark:text-orange-400",
		bgGradient: "from-orange-500/10 to-orange-600/5 dark:from-orange-400/20 dark:to-orange-500/10",
	},
	{
		icon: Database,
		title: "Databases",
		count: "uploading...",
		color: "text-teal-600 dark:text-teal-400",
		bgGradient: "from-teal-500/10 to-teal-600/5 dark:from-teal-400/20 dark:to-teal-500/10",
	},
]

interface CategoriesProps {
	selectedCategory: string | null
	onSelectCategory: (category: string | null) => void
}

export function Categories({ selectedCategory, onSelectCategory }: CategoriesProps) {
	const handleCategoryClick = (categoryTitle: string) => {
		console.log("Category clicked:", categoryTitle) // <-- debug: verify correct title
		if (selectedCategory === categoryTitle) {
			onSelectCategory(null)
		} else {
			onSelectCategory(categoryTitle)
		}
		// Scroll to courses section
		const coursesSection = document.getElementById("courses")
		if (coursesSection) {
			coursesSection.scrollIntoView({ behavior: "smooth" })
		}
	}

	return (
		<section className="py-16 md:py-24" id="categories">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Browse by Category
					</h2>
					<p className="text-muted-foreground text-lg">
						Find courses and resources tailored to your learning goals
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
					{categories.map((category) => {
						const Icon = category.icon // use capitalized local variable for the component
						return (
							<Card
								key={category.title}
								onClick={() => handleCategoryClick(category.title)}
								className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 ${
									selectedCategory === category.title
										? "ring-2 ring-primary shadow-xl scale-105 z-10 border-primary"
										: "hover:border-primary/50"
								}`}
								data-category={category.title}
							>
								<div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
								<CardContent className="p-6 text-center relative z-10">
									<div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${category.bgGradient} mb-3`}>
										<Icon
											className={`h-8 w-8 ${category.color} group-hover:scale-110 transition-transform duration-300`}
										/>
									</div>
									<h3 className="font-semibold mb-1">{category.title}</h3>
									<p className="text-sm text-muted-foreground">
										{category.count}
									</p>
								</CardContent>
							</Card>
						)
					})}
				</div>

				{selectedCategory && (
					<div className="text-center mt-6">
						<button
							onClick={() => onSelectCategory(null)}
							className="text-sm text-muted-foreground hover:text-foreground underline"
						>
							Clear filter
						</button>
					</div>
				)}
			</div>
		</section>
	)
}

