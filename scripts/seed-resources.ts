import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedResources() {
  try {
    console.log("📚 Seeding resources...")

    // Check if Resource model exists
    try {
      await prisma.resource.findFirst()
    } catch (error) {
      console.log("⚠️  Resource model not available yet. Skipping resource seeding.")
      console.log("   Run 'npm run seed' after database is fully set up.")
      return
    }

    const resources = [
      {
        title: "React Hooks Cheat Sheet",
        description: "Complete guide to React Hooks with practical examples and best practices.",
        type: "cheatsheet",
        fileUrl: "/resources/react-hooks-cheatsheet.txt",
        category: "React",
        tags: "react,hooks,frontend,cheatsheet",
        isFree: true,
        isActive: true,
      },
      {
        title: "Git Cheat Sheet",
        description: "Essential Git commands and workflows for version control.",
        type: "cheatsheet",
        fileUrl: "/resources/git-cheat-sheet.pdf",
        category: "Git",
        tags: "git,version-control,workflow",
        isFree: true,
        isActive: true,
      },
      {
        title: "Python Code Examples",
        description: "Collection of useful Python code snippets and examples.",
        type: "cheatsheet",
        fileUrl: "/resources/pythonCode.txt",
        category: "Python",
        tags: "python,programming,examples",
        isFree: true,
        isActive: true,
      },
      {
        title: "Advanced JavaScript Patterns",
        description: "Advanced JavaScript design patterns and best practices for professional development.",
        type: "cheatsheet",
        fileUrl: "/resources/git-cheat-sheet.pdf",
        category: "JavaScript",
        tags: "javascript,patterns,advanced,professional",
        isFree: false,
        price: 14.99,
        isActive: true,
      },
      {
        title: "VS Code Productivity Extensions",
        description: "Curated list of essential VS Code extensions to boost your development productivity.",
        type: "software",
        url: "https://marketplace.visualstudio.com/search?term=productivity&target=VSCode&category=All%20categories&sortBy=Relevance",
        category: "Development Tools",
        tags: "vscode,extensions,productivity,tools",
        isFree: true,
        isActive: true,
      },
      {
        title: "Postman API Testing Collection",
        description: "Complete Postman collection with examples for API testing and development.",
        type: "software",
        url: "https://www.postman.com/downloads/",
        category: "API Development",
        tags: "postman,api,testing,development",
        isFree: true,
        isActive: true,
      },
      {
        title: "MDN Web Docs",
        description: "The definitive resource for web developers - comprehensive documentation for HTML, CSS, and JavaScript.",
        type: "link",
        url: "https://developer.mozilla.org",
        category: "Documentation",
        tags: "documentation,web,html,css,javascript",
        isFree: true,
        isActive: true,
      },
      {
        title: "React Official Documentation",
        description: "Official React documentation with guides, API reference, and tutorials.",
        type: "link",
        url: "https://react.dev",
        category: "Documentation",
        tags: "react,documentation,frontend",
        isFree: true,
        isActive: true,
      },
      {
        title: "Advanced CSS Grid Masterclass",
        description: "Complete CSS Grid course with advanced techniques and real-world examples.",
        type: "link",
        url: "https://cssgridmasterclass.com",
        category: "CSS",
        tags: "css,grid,layout,advanced",
        isFree: false,
        price: 29.99,
        isActive: true,
      },
      {
        title: "TypeScript Handbook Pro",
        description: "Advanced TypeScript concepts, patterns, and best practices for enterprise development.",
        type: "link",
        url: "https://typescriptpro.dev",
        category: "TypeScript",
        tags: "typescript,advanced,patterns,enterprise",
        isFree: false,
        price: 39.99,
        isActive: true,
      },
      {
        title: "React Advanced Patterns Course",
        description: "Master advanced React patterns including render props, compound components, and custom hooks.",
        type: "link",
        url: "https://reactpatterns.dev",
        category: "React",
        tags: "react,patterns,advanced,hooks",
        isFree: false,
        price: 49.99,
        isActive: true,
      },
      {
        title: "Node.js Microservices Architecture",
        description: "Complete guide to building scalable microservices with Node.js, Docker, and Kubernetes.",
        type: "link",
        url: "https://nodejs-microservices.dev",
        category: "Node.js",
        tags: "nodejs,microservices,docker,kubernetes",
        isFree: false,
        price: 59.99,
        isActive: true,
      },
      {
        title: "Full-Stack Development Bootcamp",
        description: "Comprehensive full-stack development course covering modern web technologies and best practices.",
        type: "link",
        url: "https://fullstack-bootcamp.dev",
        category: "Full Stack",
        tags: "fullstack,web-development,bootcamp,comprehensive",
        isFree: false,
        price: 79.99,
        isActive: true,
      },
    ]

    for (const resource of resources) {
      await prisma.resource.upsert({
        where: { title: resource.title },
        update: { ...resource },
        create: { ...resource },
      })
    }

    console.log("Resources seeded successfully!")
  } catch (error) {
    console.error("Error seeding resources:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedResources()