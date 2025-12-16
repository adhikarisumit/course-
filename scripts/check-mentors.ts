import prisma from "../lib/prisma"

async function checkMentors() {
  try {
    const mentors = await prisma.mentor.findMany()
    console.log("Total mentors:", mentors.length)
    console.log("\nMentors:")
    mentors.forEach((mentor) => {
      console.log(`\n- ${mentor.name}`)
      console.log(`  Role: ${mentor.role}`)
      console.log(`  Active: ${mentor.isActive}`)
      console.log(`  Display Order: ${mentor.displayOrder}`)
    })
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMentors()
