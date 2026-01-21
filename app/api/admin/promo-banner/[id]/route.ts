import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET - Fetch a single promo banner
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

    const banner = await prisma.promoBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: 'Promo banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching promo banner:', error);
    return NextResponse.json({ error: 'Failed to fetch promo banner' }, { status: 500 });
  }
}

// PUT - Update a promo banner
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
      startDate,
      endDate 
    } = body;

    // If activating this banner, deactivate all others
    if (isActive) {
      await prisma.promoBanner.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false },
      });
    }

    const banner = await prisma.promoBanner.update({
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
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating promo banner:', error);
    return NextResponse.json({ error: 'Failed to update promo banner' }, { status: 500 });
  }
}

// DELETE - Delete a promo banner
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

    await prisma.promoBanner.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Promo banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting promo banner:', error);
    return NextResponse.json({ error: 'Failed to delete promo banner' }, { status: 500 });
  }
}
