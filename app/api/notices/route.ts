import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      where: {
        isPublished: true,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' }, // urgent > important > normal
        { publishedAt: 'desc' },
      ],
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}