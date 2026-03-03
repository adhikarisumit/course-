import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET - Fetch all secondary banners (admin only) 
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.secondaryBanner.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching secondary banners:', error);
    return NextResponse.json({ error: 'Failed to fetch secondary banners' }, { status: 500 });
  }
}

// POST - Create a new secondary banner
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
      sections,
      showTimer,
      marqueeSpeed,
      startDate,
      endDate 
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const banner = await prisma.secondaryBanner.create({
      data: {
        title,
        description,
        badgeText,
        linkUrl,
        linkText,
        backgroundColor: backgroundColor || '#1e40af',
        textColor: textColor || '#ffffff',
        isActive: isActive || false,
        sections: sections ? (typeof sections === 'string' ? sections : JSON.stringify(sections)) : '["after-hero"]',
        showTimer: showTimer || false,
        marqueeSpeed: marqueeSpeed ? parseInt(marqueeSpeed) : 30,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating secondary banner:', error);
    return NextResponse.json({ error: 'Failed to create secondary banner' }, { status: 500 });
  }
}
