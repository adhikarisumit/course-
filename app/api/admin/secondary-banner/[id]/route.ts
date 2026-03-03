import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET - Fetch a single secondary banner
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const banner = await prisma.secondaryBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: 'Secondary banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching secondary banner:', error);
    return NextResponse.json({ error: 'Failed to fetch secondary banner' }, { status: 500 });
  }
}

// PUT - Update a secondary banner
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    const banner = await prisma.secondaryBanner.update({
      where: { id },
      data: {
        title,
        description,
        badgeText,
        linkUrl,
        linkText,
        backgroundColor,
        textColor,
        isActive,
        sections: sections ? (typeof sections === 'string' ? sections : JSON.stringify(sections)) : undefined,
        showTimer: showTimer !== undefined ? showTimer : undefined,
        marqueeSpeed: marqueeSpeed !== undefined ? parseInt(marqueeSpeed) : undefined,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating secondary banner:', error);
    return NextResponse.json({ error: 'Failed to update secondary banner' }, { status: 500 });
  }
}

// DELETE - Delete a secondary banner
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.secondaryBanner.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Secondary banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting secondary banner:', error);
    return NextResponse.json({ error: 'Failed to delete secondary banner' }, { status: 500 });
  }
}
