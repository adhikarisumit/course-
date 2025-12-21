import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, priority, isPublished } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const existingNotice = await prisma.notice.findUnique({
      where: { id: params.id },
    });

    if (!existingNotice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    const notice = await prisma.notice.update({
      where: { id: params.id },
      data: {
        title,
        content,
        priority: priority || 'normal',
        isPublished,
        publishedAt: isPublished && !existingNotice.isPublished ? new Date() : existingNotice.publishedAt,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(notice);
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingNotice = await prisma.notice.findUnique({
      where: { id: params.id },
    });

    if (!existingNotice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    await prisma.notice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}