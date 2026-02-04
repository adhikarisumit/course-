import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || '';

// GET - Fetch ad settings (super admin only)
export async function GET() {
  try {
    const session = await auth();
    
    // Only super admin can access ads settings
    const isSuperAdmin = session?.user?.role === 'super' || session?.user?.email === SUPER_ADMIN_EMAIL;
    
    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Super admin access required' }, { status: 401 });
    }

    let settings = await prisma.adSettings.findFirst();

    // If no settings exist, return default values
    if (!settings) {
      settings = {
        id: '',
        activeProvider: 'none',
        excludedPages: null,
        // Ad Placement Controls
        showHeaderAd: true,
        showFooterAd: true,
        showSidebarAd: true,
        showInArticleAd: true,
        showHomePageAd: true,
        showCoursePageAd: true,
        showPortalAd: true,
        showBlogAd: true,
        // AdSense
        adsenseEnabled: false,
        adsensePublisherId: null,
        adsenseAutoAds: false,
        adsenseHeaderSlot: null,
        adsenseFooterSlot: null,
        adsenseSidebarSlot: null,
        adsenseInArticleSlot: null,
        // Media.net
        medianetEnabled: false,
        medianetCustomerId: null,
        medianetHeaderCode: null,
        medianetFooterCode: null,
        medianetSidebarCode: null,
        medianetInArticleCode: null,
        // Amazon
        amazonEnabled: false,
        amazonTrackingId: null,
        amazonAdInstanceId: null,
        amazonHeaderCode: null,
        amazonFooterCode: null,
        amazonSidebarCode: null,
        amazonInArticleCode: null,
        // PropellerAds
        propellerEnabled: false,
        propellerZoneId: null,
        propellerHeaderCode: null,
        propellerFooterCode: null,
        propellerSidebarCode: null,
        propellerInArticleCode: null,
        // Adsterra
        adsterraEnabled: false,
        adsterraKey: null,
        adsterraHeaderCode: null,
        adsterraFooterCode: null,
        adsterraSidebarCode: null,
        adsterraInArticleCode: null,
        // Custom
        customEnabled: false,
        customProviderName: null,
        customHeadScript: null,
        customHeaderCode: null,
        customFooterCode: null,
        customSidebarCode: null,
        customInArticleCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching ad settings:', error);
    return NextResponse.json({ error: 'Failed to fetch ad settings' }, { status: 500 });
  }
}

// POST - Create or update ad settings (super admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Only super admin can modify ads settings
    const isSuperAdmin = session?.user?.role === 'super' || session?.user?.email === SUPER_ADMIN_EMAIL;
    
    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Super admin access required' }, { status: 401 });
    }

    const body = await request.json();

    // Check if settings already exist
    const existingSettings = await prisma.adSettings.findFirst();

    const data = {
      activeProvider: body.activeProvider || 'none',
      excludedPages: body.excludedPages || null,
      // Ad Placement Controls (use ?? to preserve false values)
      showHeaderAd: body.showHeaderAd ?? true,
      showFooterAd: body.showFooterAd ?? true,
      showSidebarAd: body.showSidebarAd ?? true,
      showInArticleAd: body.showInArticleAd ?? true,
      showHomePageAd: body.showHomePageAd ?? true,
      showCoursePageAd: body.showCoursePageAd ?? true,
      showPortalAd: body.showPortalAd ?? true,
      showBlogAd: body.showBlogAd ?? true,
      // AdSense
      adsenseEnabled: body.adsenseEnabled || false,
      adsensePublisherId: body.adsensePublisherId || null,
      adsenseAutoAds: body.adsenseAutoAds || false,
      adsenseHeaderSlot: body.adsenseHeaderSlot || null,
      adsenseFooterSlot: body.adsenseFooterSlot || null,
      adsenseSidebarSlot: body.adsenseSidebarSlot || null,
      adsenseInArticleSlot: body.adsenseInArticleSlot || null,
      // Media.net
      medianetEnabled: body.medianetEnabled || false,
      medianetCustomerId: body.medianetCustomerId || null,
      medianetHeaderCode: body.medianetHeaderCode || null,
      medianetFooterCode: body.medianetFooterCode || null,
      medianetSidebarCode: body.medianetSidebarCode || null,
      medianetInArticleCode: body.medianetInArticleCode || null,
      // Amazon
      amazonEnabled: body.amazonEnabled || false,
      amazonTrackingId: body.amazonTrackingId || null,
      amazonAdInstanceId: body.amazonAdInstanceId || null,
      amazonHeaderCode: body.amazonHeaderCode || null,
      amazonFooterCode: body.amazonFooterCode || null,
      amazonSidebarCode: body.amazonSidebarCode || null,
      amazonInArticleCode: body.amazonInArticleCode || null,
      // PropellerAds
      propellerEnabled: body.propellerEnabled || false,
      propellerZoneId: body.propellerZoneId || null,
      propellerHeaderCode: body.propellerHeaderCode || null,
      propellerFooterCode: body.propellerFooterCode || null,
      propellerSidebarCode: body.propellerSidebarCode || null,
      propellerInArticleCode: body.propellerInArticleCode || null,
      // Adsterra
      adsterraEnabled: body.adsterraEnabled || false,
      adsterraKey: body.adsterraKey || null,
      adsterraHeaderCode: body.adsterraHeaderCode || null,
      adsterraFooterCode: body.adsterraFooterCode || null,
      adsterraSidebarCode: body.adsterraSidebarCode || null,
      adsterraInArticleCode: body.adsterraInArticleCode || null,
      // Custom
      customEnabled: body.customEnabled || false,
      customProviderName: body.customProviderName || null,
      customHeadScript: body.customHeadScript || null,
      customHeaderCode: body.customHeaderCode || null,
      customFooterCode: body.customFooterCode || null,
      customSidebarCode: body.customSidebarCode || null,
      customInArticleCode: body.customInArticleCode || null,
    };

    let settings;
    if (existingSettings) {
      settings = await prisma.adSettings.update({
        where: { id: existingSettings.id },
        data,
      });
    } else {
      settings = await prisma.adSettings.create({
        data,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving ad settings:', error);
    return NextResponse.json({ error: 'Failed to save ad settings' }, { status: 500 });
  }
}
