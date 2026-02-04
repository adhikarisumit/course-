import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Public ad settings response type
interface PublicAdSettings {
  activeProvider: string;
  excludedPages: string | null;
  // Placement controls
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
  showSidebarAd?: boolean;
  showInArticleAd?: boolean;
  showHomePageAd?: boolean;
  showCoursePageAd?: boolean;
  showPortalAd?: boolean;
  showBlogAd?: boolean;
  // Ad limits
  maxAdsPerPage?: number;
  maxInArticleAds?: number;
  // Per-page configuration
  pageAdConfig?: Record<string, {
    maxAds?: number;
    showHeader?: boolean;
    showFooter?: boolean;
    showInArticle?: boolean;
    showSidebar?: boolean;
  }>;
  // Provider-specific settings based on active provider
  adsense?: {
    publisherId: string | null;
    autoAds: boolean;
    headerSlot: string | null;
    footerSlot: string | null;
    sidebarSlot: string | null;
    inArticleSlot: string | null;
  };
  medianet?: {
    customerId: string | null;
    headerCode: string | null;
    footerCode: string | null;
    sidebarCode: string | null;
    inArticleCode: string | null;
  };
  amazon?: {
    trackingId: string | null;
    adInstanceId: string | null;
    headerCode: string | null;
    footerCode: string | null;
    sidebarCode: string | null;
    inArticleCode: string | null;
  };
  propeller?: {
    zoneId: string | null;
    headerCode: string | null;
    footerCode: string | null;
    sidebarCode: string | null;
    inArticleCode: string | null;
  };
  adsterra?: {
    key: string | null;
    headerCode: string | null;
    footerCode: string | null;
    sidebarCode: string | null;
    inArticleCode: string | null;
  };
  custom?: {
    providerName: string | null;
    headScript: string | null;
    headerCode: string | null;
    footerCode: string | null;
    sidebarCode: string | null;
    inArticleCode: string | null;
  };
}

// GET - Fetch public ad settings (no auth required)
export async function GET() {
  try {
    const settings = await prisma.adSettings.findFirst();

    if (!settings || settings.activeProvider === 'none') {
      return NextResponse.json({ 
        activeProvider: 'none',
        excludedPages: null,
      });
    }

    const response: PublicAdSettings = {
      activeProvider: settings.activeProvider,
      excludedPages: settings.excludedPages,
      // Placement controls (use nullish coalescing to handle undefined from old records)
      showHeaderAd: settings.showHeaderAd ?? true,
      showFooterAd: settings.showFooterAd ?? true,
      showSidebarAd: settings.showSidebarAd ?? true,
      showInArticleAd: settings.showInArticleAd ?? true,
      showHomePageAd: settings.showHomePageAd ?? true,
      showCoursePageAd: settings.showCoursePageAd ?? true,
      showPortalAd: settings.showPortalAd ?? true,
      showBlogAd: settings.showBlogAd ?? true,
      // Ad limits
      maxAdsPerPage: (settings as Record<string, unknown>).maxAdsPerPage as number ?? 5,
      maxInArticleAds: (settings as Record<string, unknown>).maxInArticleAds as number ?? 3,
      // Per-page configuration
      pageAdConfig: (settings as Record<string, unknown>).pageAdConfig ? JSON.parse((settings as Record<string, unknown>).pageAdConfig as string) : undefined,
    };

    // Only include the active provider's settings
    switch (settings.activeProvider) {
      case 'adsense':
        response.adsense = {
          publisherId: settings.adsensePublisherId,
            autoAds: settings.adsenseAutoAds,
            headerSlot: settings.adsenseHeaderSlot,
            footerSlot: settings.adsenseFooterSlot,
            sidebarSlot: settings.adsenseSidebarSlot,
          inArticleSlot: settings.adsenseInArticleSlot,
        };
        break;
      case 'medianet':
        response.medianet = {
          customerId: settings.medianetCustomerId,
            headerCode: settings.medianetHeaderCode,
            footerCode: settings.medianetFooterCode,
            sidebarCode: settings.medianetSidebarCode,
          inArticleCode: settings.medianetInArticleCode,
        };
        break;
      case 'amazon':
        response.amazon = {
          trackingId: settings.amazonTrackingId,
            adInstanceId: settings.amazonAdInstanceId,
            headerCode: settings.amazonHeaderCode,
            footerCode: settings.amazonFooterCode,
            sidebarCode: settings.amazonSidebarCode,
          inArticleCode: settings.amazonInArticleCode,
        };
        break;
      case 'propeller':
        response.propeller = {
          zoneId: settings.propellerZoneId,
            headerCode: settings.propellerHeaderCode,
            footerCode: settings.propellerFooterCode,
            sidebarCode: settings.propellerSidebarCode,
          inArticleCode: settings.propellerInArticleCode,
        };
        break;
      case 'adsterra':
        response.adsterra = {
          key: settings.adsterraKey,
            headerCode: settings.adsterraHeaderCode,
            footerCode: settings.adsterraFooterCode,
            sidebarCode: settings.adsterraSidebarCode,
          inArticleCode: settings.adsterraInArticleCode,
        };
        break;
      case 'custom':
        response.custom = {
          providerName: settings.customProviderName,
            headScript: settings.customHeadScript,
            headerCode: settings.customHeaderCode,
            footerCode: settings.customFooterCode,
            sidebarCode: settings.customSidebarCode,
          inArticleCode: settings.customInArticleCode,
        };
        break;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching ad settings:', error);
    return NextResponse.json({ 
      activeProvider: 'none',
      excludedPages: null,
    });
  }
}
