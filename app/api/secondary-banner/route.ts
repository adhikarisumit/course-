import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch all active secondary banners (public API)
// Accepts optional ?section=after-hero query param to filter by section
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const section = request.nextUrl.searchParams.get('section');
    
    const banners = await prisma.secondaryBanner.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by section if provided (sections is a JSON string array)
    const filtered = section
      ? banners.filter((b) => {
          try {
            const sections: string[] = JSON.parse(b.sections);
            return sections.includes(section);
          } catch {
            return false;
          }
        })
      : banners;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching active secondary banners:', error);
    return NextResponse.json([]);
  }
}
