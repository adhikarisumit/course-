import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch public AdSense settings (no auth required)
export async function GET() {
  try {
    const settings = await prisma.adSenseSettings.findFirst({
      select: {
        publisherId: true,
        headScript: true,
        isEnabled: true,
        enableAutoAds: true,
        enableInArticle: true,
        enableSidebar: true,
        enableHeader: true,
        enableFooter: true,
        inArticleSlot: true,
        sidebarSlot: true,
        headerSlot: true,
        footerSlot: true,
        excludedPages: true,
      },
    });

    if (!settings || !settings.isEnabled) {
      return NextResponse.json({ 
        isEnabled: false,
        publisherId: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching AdSense settings:', error);
    return NextResponse.json({ 
      isEnabled: false,
      publisherId: null,
    });
  }
}
