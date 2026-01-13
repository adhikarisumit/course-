import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch active promo banner (public API)
export async function GET() {
  try {
    const now = new Date();
    
    const banner = await prisma.promoBanner.findFirst({
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

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching active promo banner:', error);
    return NextResponse.json(null);
  }
}
