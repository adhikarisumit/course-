import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "super") {
      return NextResponse.json(
        { error: "Unauthorized: Only super admin can export data" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")

    switch (type) {
      case "students":
        return await exportStudents()
      case "payments":
        return await exportPayments()
      case "enrollments":
        return await exportEnrollments()
      case "courses":
        return await exportCourses()
      case "all-users":
        return await exportAllUsers()
      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}

async function exportStudents() {
  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          enrollments: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const csv = [
    ["ID", "Name", "Email", "Joined Date", "Email Verified", "Enrollments", "Payments"],
    ...students.map((student) => [
      student.id,
      student.name || "N/A",
      student.email,
      new Date(student.createdAt).toLocaleDateString(),
      student.emailVerified ? "Yes" : "No",
      student._count.enrollments.toString(),
      student._count.payments.toString(),
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="students-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}

async function exportAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          enrollments: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const csv = [
    ["ID", "Name", "Email", "Role", "Joined Date", "Email Verified", "Enrollments", "Payments"],
    ...users.map((user) => [
      user.id,
      user.name || "N/A",
      user.email,
      user.role,
      new Date(user.createdAt).toLocaleDateString(),
      user.emailVerified ? "Yes" : "No",
      user._count.enrollments.toString(),
      user._count.payments.toString(),
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="all-users-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}

async function exportPayments() {
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const csv = [
    ["ID", "Student Name", "Student Email", "Course", "Amount", "Currency", "Status", "Date", "Stripe Payment ID"],
    ...payments.map((payment) => [
      payment.id,
      payment.user.name || "N/A",
      payment.user.email,
      payment.course.title,
      payment.amount.toFixed(2),
      payment.currency,
      payment.status,
      new Date(payment.createdAt).toLocaleDateString(),
      payment.stripePaymentId || "N/A",
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}

async function exportEnrollments() {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
          price: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  const csv = [
    ["ID", "Student Name", "Student Email", "Course Title", "Course Price", "Progress", "Completed", "Enrolled Date"],
    ...enrollments.map((enrollment) => [
      enrollment.id,
      enrollment.user.name || "N/A",
      enrollment.user.email,
      enrollment.course.title,
      enrollment.course.price.toString(),
      `${enrollment.progress}%`,
      enrollment.completed ? "Yes" : "No",
      new Date(enrollment.enrolledAt).toLocaleDateString(),
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="enrollments-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}

async function exportCourses() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  })

  // Get counts separately
  const coursesWithCounts = await Promise.all(
    courses.map(async (course) => {
      const [enrollmentCount, lessonCount] = await Promise.all([
        prisma.enrollment.count({ where: { courseId: course.id } }),
        prisma.lesson.count({ where: { courseId: course.id } }),
      ])
      return { ...course, enrollmentCount, lessonCount }
    })
  )

  const csv = [
    ["ID", "Title", "Category", "Price", "Level", "Published", "Duration", "Access Months", "Enrollments", "Lessons", "Created Date"],
    ...coursesWithCounts.map((course) => [
      course.id,
      course.title,
      course.category || "N/A",
      course.price.toString(),
      course.level || "N/A",
      course.isPublished ? "Yes" : "No",
      course.duration || "N/A",
      course.accessDurationMonths.toString(),
      course.enrollmentCount.toString(),
      course.lessonCount.toString(),
      new Date(course.createdAt).toLocaleDateString(),
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="courses-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
