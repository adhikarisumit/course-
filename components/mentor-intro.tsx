
import prisma from "@/lib/prisma";
import MentorIntroClient from "./mentor-intro-client";
import type { Mentor } from "./mentor-intro-client";

export async function MentorIntro() {
  // Server component: fetch data only
  if (!process.env.DATABASE_URL) return null;
  let mentors: Mentor[] = [];
  try {
    mentors = await prisma.mentor.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" }
    }) as Mentor[];
  } catch (error) {
    console.error("Failed to fetch mentors:", error);
    return null;
  }
  if (mentors.length === 0) return null;
  const totalStudents = mentors.reduce((acc: number, m: Mentor) => acc + m.totalStudents, 0);
  const totalCourses = mentors.reduce((acc: number, m: Mentor) => acc + m.totalCourses, 0);
  const avgRating = (mentors.reduce((acc: number, m: Mentor) => acc + m.rating, 0) / mentors.length).toFixed(1);
  return <MentorIntroClient mentors={mentors} totalStudents={totalStudents} totalCourses={totalCourses} avgRating={avgRating} />;
}



