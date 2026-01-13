import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch active promo banner (public API)
export async function GET() {
  try {
    const now = new Date();
    
    const banner = await prisma.promoBanner.findFirst({
      where: {
        isActive: true,
        OR: [
          // No date restrictions
          {
            startDate: null,
            endDate: null,
          },
          // Only start date, must be past
          {
            startDate: { lte: now },
            endDate: null,
          },
          // Only end date, must be future
          {
            startDate: null,
            endDate: { gte: now },
          },
          // Both dates, must be within range
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching active promo banner:', error);
    return NextResponse.json(null);
  }
}
