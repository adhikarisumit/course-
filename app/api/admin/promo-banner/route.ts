import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all promo banners (admin only)
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.promoBanner.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching promo banners:', error);
    return NextResponse.json({ error: 'Failed to fetch promo banners' }, { status: 500 });
  }
}

// POST - Create a new promo banner
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      badgeText, 
      linkUrl, 
      linkText, 
      backgroundColor, 
      textColor, 
      isActive,
      startDate,
      endDate 
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // If activating this banner, deactivate all others
    if (isActive) {
      await prisma.promoBanner.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const banner = await prisma.promoBanner.create({
      data: {
        title,
        description,
        badgeText,
        linkUrl,
        linkText,
        backgroundColor: backgroundColor || '#ef4444',
        textColor: textColor || '#ffffff',
        isActive: isActive || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating promo banner:', error);
    return NextResponse.json({ error: 'Failed to create promo banner' }, { status: 500 });
  }
}
