import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Safe defaults when anything goes wrong
const SAFE_DEFAULTS = {
  activeProvider: 'none',
  excludedPages: null,
};

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
  // Mobile placement controls
  showHeaderAdMobile?: boolean;
  showFooterAdMobile?: boolean;
  showSidebarAdMobile?: boolean;
  showInArticleAdMobile?: boolean;
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
    headScript: string | null;
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
      // Mobile placement controls
      showHeaderAdMobile: (settings as Record<string, unknown>).showHeaderAdMobile as boolean ?? true,
      showFooterAdMobile: (settings as Record<string, unknown>).showFooterAdMobile as boolean ?? true,
      showSidebarAdMobile: (settings as Record<string, unknown>).showSidebarAdMobile as boolean ?? false,
      showInArticleAdMobile: (settings as Record<string, unknown>).showInArticleAdMobile as boolean ?? true,
      // Ad limits
      maxAdsPerPage: (settings as Record<string, unknown>).maxAdsPerPage as number ?? 5,
      maxInArticleAds: (settings as Record<string, unknown>).maxInArticleAds as number ?? 3,
      // Per-page configuration - safely parse JSON
      pageAdConfig: (() => {
        try {
          const config = (settings as Record<string, unknown>).pageAdConfig;
          if (!config) return undefined;
          if (typeof config === 'string') return JSON.parse(config);
          return config;
        } catch {
          return undefined;
        }
      })(),
    };

    // Helper to check if string has real content
    const hasContent = (str: string | null | undefined): boolean => 
      typeof str === 'string' && str.trim().length > 0;

    // Only include provider configs if they have actual content configured
    // AdSense - needs publisherId AND at least one slot
    const adsenseHasContent = hasContent(settings.adsensePublisherId) && (
      hasContent(settings.adsenseHeaderSlot) || 
      hasContent(settings.adsenseFooterSlot) || 
      hasContent(settings.adsenseSidebarSlot) || 
      hasContent(settings.adsenseInArticleSlot)
    );
    if (adsenseHasContent) {
      response.adsense = {
        publisherId: settings.adsensePublisherId,
        headScript: settings.adsenseHeadScript,
        autoAds: settings.adsenseAutoAds,
        headerSlot: settings.adsenseHeaderSlot,
        footerSlot: settings.adsenseFooterSlot,
        sidebarSlot: settings.adsenseSidebarSlot,
        inArticleSlot: settings.adsenseInArticleSlot,
      };
    }
    
    // Media.net - needs at least one code
    const medianetHasContent = hasContent(settings.medianetHeaderCode) || 
      hasContent(settings.medianetFooterCode) || 
      hasContent(settings.medianetSidebarCode) || 
      hasContent(settings.medianetInArticleCode);
    if (medianetHasContent) {
      response.medianet = {
        customerId: settings.medianetCustomerId,
        headerCode: settings.medianetHeaderCode,
        footerCode: settings.medianetFooterCode,
        sidebarCode: settings.medianetSidebarCode,
        inArticleCode: settings.medianetInArticleCode,
      };
    }
    
    // Amazon - needs at least one code
    const amazonHasContent = hasContent(settings.amazonHeaderCode) || 
      hasContent(settings.amazonFooterCode) || 
      hasContent(settings.amazonSidebarCode) || 
      hasContent(settings.amazonInArticleCode);
    if (amazonHasContent) {
      response.amazon = {
        trackingId: settings.amazonTrackingId,
        adInstanceId: settings.amazonAdInstanceId,
        headerCode: settings.amazonHeaderCode,
        footerCode: settings.amazonFooterCode,
        sidebarCode: settings.amazonSidebarCode,
        inArticleCode: settings.amazonInArticleCode,
      };
    }
    
    // PropellerAds - needs at least one code
    const propellerHasContent = hasContent(settings.propellerHeaderCode) || 
      hasContent(settings.propellerFooterCode) || 
      hasContent(settings.propellerSidebarCode) || 
      hasContent(settings.propellerInArticleCode);
    if (propellerHasContent) {
      response.propeller = {
        zoneId: settings.propellerZoneId,
        headerCode: settings.propellerHeaderCode,
        footerCode: settings.propellerFooterCode,
        sidebarCode: settings.propellerSidebarCode,
        inArticleCode: settings.propellerInArticleCode,
      };
    }
    
    // Adsterra - needs at least one code
    const adsterraHasContent = hasContent(settings.adsterraHeaderCode) || 
      hasContent(settings.adsterraFooterCode) || 
      hasContent(settings.adsterraSidebarCode) || 
      hasContent(settings.adsterraInArticleCode);
    if (adsterraHasContent) {
      response.adsterra = {
        key: settings.adsterraKey,
        headerCode: settings.adsterraHeaderCode,
        footerCode: settings.adsterraFooterCode,
        sidebarCode: settings.adsterraSidebarCode,
        inArticleCode: settings.adsterraInArticleCode,
      };
    }
    
    // Custom - needs at least one code
    const customHasContent = hasContent(settings.customHeaderCode) || 
      hasContent(settings.customFooterCode) || 
      hasContent(settings.customSidebarCode) || 
      hasContent(settings.customInArticleCode);
    if (customHasContent) {
      response.custom = {
        providerName: settings.customProviderName,
        headScript: settings.customHeadScript,
        headerCode: settings.customHeaderCode,
        footerCode: settings.customFooterCode,
        sidebarCode: settings.customSidebarCode,
        inArticleCode: settings.customInArticleCode,
      };
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
