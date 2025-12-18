import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all cheat sheets
export async function GET() {
  const cheatSheets = await prisma.cheatSheet.findMany();
  return NextResponse.json(cheatSheets);
}

// POST create a new cheat sheet
export async function POST(req: NextRequest) {
  const data = await req.json();
  const cheatSheet = await prisma.cheatSheet.create({ data });
  return NextResponse.json(cheatSheet);
}
