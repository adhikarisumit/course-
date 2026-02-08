import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Emergency reset endpoint - disables all ads
// POST /api/admin/ads/reset?key=YOUR_SECRET
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    // Simple security - require a key that matches SUPER_ADMIN_EMAIL or a specific reset key
    const validKey = process.env.SUPER_ADMIN_EMAIL || process.env.ADS_RESET_KEY;
    
    if (!key || key !== validKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset AdSettings table - disable all ads
    await prisma.adSettings.updateMany({
      data: {
        activeProvider: 'none',
        adsenseEnabled: false,
        adsenseHeadScript: null,
        medianetEnabled: false,
        amazonEnabled: false,
        propellerEnabled: false,
        adsterraEnabled: false,
        customEnabled: false,
      },
    });

    // Also reset AdSenseSettings if it exists
    try {
      await prisma.adSenseSettings.updateMany({
        data: {
          isEnabled: false,
          headScript: null,
        },
      });
    } catch {
      // AdSenseSettings table might not exist or be empty
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All ads have been disabled. Site should now load.' 
    });
  } catch (error) {
    console.error('Error resetting ads:', error);
    return NextResponse.json({ 
      error: 'Failed to reset ads',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check current ads status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    const validKey = process.env.SUPER_ADMIN_EMAIL || process.env.ADS_RESET_KEY;
    
    if (!key || key !== validKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.adSettings.findFirst();
    
    return NextResponse.json({
      hasSettings: !!settings,
      activeProvider: settings?.activeProvider || 'none',
      adsenseEnabled: settings?.adsenseEnabled || false,
      adsensePublisherId: settings?.adsensePublisherId || null,
      hasHeadScript: !!settings?.adsenseHeadScript,
    });
  } catch (error) {
    console.error('Error checking ads:', error);
    return NextResponse.json({ 
      error: 'Failed to check ads',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
