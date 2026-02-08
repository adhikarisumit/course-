import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Serve ads.txt dynamically based on AdSense settings from database
export async function GET() {
  try {
    const settings = await prisma.adSenseSettings.findFirst({
      select: {
        publisherId: true,
        isEnabled: true,
      },
    });

    if (!settings?.isEnabled || !settings?.publisherId) {
      return new NextResponse('# No ads configured', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Extract just the pub ID (remove ca- prefix if present)
    const pubId = settings.publisherId.replace(/^ca-/, '');

    const adsTxt = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0`;

    return new NextResponse(adsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating ads.txt:', error);
    return new NextResponse('# Error generating ads.txt', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
