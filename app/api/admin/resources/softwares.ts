import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all software & links
export async function GET() {
  const softwares = await prisma.softwareLink.findMany();
  return NextResponse.json(softwares);
}

// POST create a new software/link
export async function POST(req: NextRequest) {
  const data = await req.json();
  const software = await prisma.softwareLink.create({ data });
  return NextResponse.json(software);
}
