import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET - Fetch AdSense settings (admin only)
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.adSenseSettings.findFirst();

    // If no settings exist, return default values
    if (!settings) {
      settings = {
        id: '',
        publisherId: '',
        isEnabled: false,
        enableAutoAds: false,
        enableInArticle: false,
        enableSidebar: false,
        enableHeader: false,
        enableFooter: false,
        inArticleSlot: null,
        sidebarSlot: null,
        headerSlot: null,
        footerSlot: null,
        excludedPages: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching AdSense settings:', error);
    return NextResponse.json({ error: 'Failed to fetch AdSense settings' }, { status: 500 });
  }
}

// POST - Create or update AdSense settings
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      publisherId,
      isEnabled,
      enableAutoAds,
      enableInArticle,
      enableSidebar,
      enableHeader,
      enableFooter,
      inArticleSlot,
      sidebarSlot,
      headerSlot,
      footerSlot,
      excludedPages,
    } = body;

    if (isEnabled && !publisherId) {
      return NextResponse.json({ error: 'Publisher ID is required to enable AdSense' }, { status: 400 });
    }

    // Check if settings already exist
    const existingSettings = await prisma.adSenseSettings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.adSenseSettings.update({
        where: { id: existingSettings.id },
        data: {
          publisherId: publisherId || '',
          isEnabled: isEnabled || false,
          enableAutoAds: enableAutoAds || false,
          enableInArticle: enableInArticle || false,
          enableSidebar: enableSidebar || false,
          enableHeader: enableHeader || false,
          enableFooter: enableFooter || false,
          inArticleSlot: inArticleSlot || null,
          sidebarSlot: sidebarSlot || null,
          headerSlot: headerSlot || null,
          footerSlot: footerSlot || null,
          excludedPages: excludedPages || null,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.adSenseSettings.create({
        data: {
          publisherId: publisherId || '',
          isEnabled: isEnabled || false,
          enableAutoAds: enableAutoAds || false,
          enableInArticle: enableInArticle || false,
          enableSidebar: enableSidebar || false,
          enableHeader: enableHeader || false,
          enableFooter: enableFooter || false,
          inArticleSlot: inArticleSlot || null,
          sidebarSlot: sidebarSlot || null,
          headerSlot: headerSlot || null,
          footerSlot: footerSlot || null,
          excludedPages: excludedPages || null,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving AdSense settings:', error);
    return NextResponse.json({ error: 'Failed to save AdSense settings' }, { status: 500 });
  }
}
