import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Clock, BookOpen, Lock, CheckCircle } from "lucide-react"
import { CoursesClient } from "./courses-client"

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const session = await auth()
  const { search } = await searchParams
  
  // @ts-ignore: isDeleted may not be in generated types, but exists in DB
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      lessons: true,
      payments: session?.user ? {
        where: { userId: session.user.id, status: "completed" },
        take: 1,
      } : undefined,
    },
    orderBy: { createdAt: "desc" },
  }) as any[];

  // Map payments to enrollments format for backward compatibility with client component
  const coursesWithEnrollments = courses.map((course: any) => ({
    ...course,
    enrollments: course.payments?.length > 0 ? course.payments : [],
  }));

  return (
    <CoursesClient courses={coursesWithEnrollments} initialSearch={search || ""} />
  )
}
