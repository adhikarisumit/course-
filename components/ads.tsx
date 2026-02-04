'use client';

import { useEffect, useState, useCallback, createContext, useContext, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Types for ad settings
interface AdSenseConfig {
  publisherId: string | null;
  autoAds: boolean;
  headerSlot: string | null;
  footerSlot: string | null;
  sidebarSlot: string | null;
  inArticleSlot: string | null;
}

interface GenericAdConfig {
  customerId?: string | null;
  trackingId?: string | null;
  adInstanceId?: string | null;
  zoneId?: string | null;
  key?: string | null;
  providerName?: string | null;
  headScript?: string | null;
  headerCode: string | null;
  footerCode: string | null;
  sidebarCode: string | null;
  inArticleCode: string | null;
}

// Per-page ad configuration
interface PageAdConfig {
  maxAds?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  showInArticle?: boolean;
  showSidebar?: boolean;
  adProvider?: string; // Override global provider for this page
}

interface AdSettings {
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
  // Global ad limits
  maxAdsPerPage?: number;
  maxInArticleAds?: number;
  // Per-page configuration
  pageAdConfig?: Record<string, PageAdConfig>;
  // Provider configs
  adsense?: AdSenseConfig;
  medianet?: GenericAdConfig;
  amazon?: GenericAdConfig;
  propeller?: GenericAdConfig;
  adsterra?: GenericAdConfig;
  custom?: GenericAdConfig;
}

// Ad counter context for tracking rendered ads
interface AdCounterContextType {
  inArticleCount: number;
  totalCount: number;
  incrementInArticle: () => boolean;
  incrementTotal: () => boolean;
  getPageConfig: () => PageAdConfig | null;
  getEffectiveProvider: () => string; // Get the provider for current page (considering page overrides)
}

const AdCounterContext = createContext<AdCounterContextType | null>(null);

// Context to share ad settings across components
const AdContext = createContext<AdSettings | null>(null);

export function useAds() {
  return useContext(AdContext);
}

// Helper to check if current page is excluded
function useIsExcludedPage(excludedPages: string | null) {
  const pathname = usePathname();
  
  if (!excludedPages) return false;
  
  const excludedPaths = excludedPages.split(',').map((p) => p.trim().toLowerCase());
  const currentPath = pathname.toLowerCase();
  
  return excludedPaths.some((excluded) => {
    if (excluded.endsWith('*')) {
      return currentPath.startsWith(excluded.slice(0, -1));
    }
    return currentPath === excluded || currentPath.startsWith(excluded + '/');
  });
}

// Helper to check if ads should show on current page type
function useIsPageTypeAllowed(settings: AdSettings | null) {
  const pathname = usePathname();
  
  if (!settings) return true;
  
  const currentPath = pathname.toLowerCase();
  
  // Check page-specific settings
  if (currentPath === '/' && settings.showHomePageAd === false) return false;
  if (currentPath.startsWith('/courses') && settings.showCoursePageAd === false) return false;
  if (currentPath.startsWith('/portal') && settings.showPortalAd === false) return false;
  if ((currentPath.startsWith('/blog') || currentPath.startsWith('/articles')) && settings.showBlogAd === false) return false;
  
  return true;
}

// Provider component to fetch and share settings
export function AdProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const globalScriptInjected = useRef(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/ads');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching ad settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Inject global footer scripts (like Social Bar) directly into body
  useEffect(() => {
    if (!settings || settings.activeProvider === 'none' || globalScriptInjected.current) return;
    
    let footerCode: string | null | undefined = null;
    
    switch (settings.activeProvider) {
      case 'adsterra':
        footerCode = settings.adsterra?.footerCode;
        break;
      case 'propeller':
        footerCode = settings.propeller?.footerCode;
        break;
      case 'custom':
        footerCode = settings.custom?.footerCode;
        break;
    }
    
    if (footerCode && footerCode.trim()) {
      // Create a container and inject the script
      const container = document.createElement('div');
      container.id = 'global-ad-scripts';
      container.innerHTML = footerCode;
      
      // Execute any scripts
      const scripts = container.getElementsByTagName('script');
      Array.from(scripts).forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      });
      
      globalScriptInjected.current = true;
    }
  }, [settings]);

  // Render provider-specific head scripts
  const renderHeadScripts = () => {
    if (!settings || settings.activeProvider === 'none') return null;

    switch (settings.activeProvider) {
      case 'adsense':
        if (settings.adsense?.publisherId) {
          return (
            <Script
              id="adsense-script"
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsense.publisherId}`}
              crossOrigin="anonymous"
              strategy="lazyOnload"
            />
          );
        }
        break;
      case 'medianet':
        if (settings.medianet?.customerId) {
          return (
            <Script
              id="medianet-script"
              async
              src={`https://contextual.media.net/dmedianet.js?cid=${settings.medianet.customerId}`}
              strategy="lazyOnload"
            />
          );
        }
        break;
      case 'custom':
        if (settings.custom?.headScript) {
          return (
            <Script
              id="custom-ad-script"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{ __html: settings.custom.headScript }}
            />
          );
        }
        break;
    }
    return null;
  };

  return (
    <AdContext.Provider value={settings}>
      {renderHeadScripts()}
      <AdCounterProvider settings={settings}>
        {children}
      </AdCounterProvider>
    </AdContext.Provider>
  );
}

// Ad Counter Provider - tracks ad counts per page
function AdCounterProvider({ children, settings }: { children: React.ReactNode; settings: AdSettings | null }) {
  const pathname = usePathname();
  const [inArticleCount, setInArticleCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Reset counts when pathname changes
  useEffect(() => {
    setInArticleCount(0);
    setTotalCount(0);
  }, [pathname]);
  
  const getPageConfig = useCallback((): PageAdConfig | null => {
    if (!settings?.pageAdConfig) return null;
    
    // Check for exact match first
    if (settings.pageAdConfig[pathname]) {
      return settings.pageAdConfig[pathname];
    }
    
    // Check for prefix matches (e.g., /courses/* matches /courses/123)
    for (const path of Object.keys(settings.pageAdConfig)) {
      if (path.endsWith('*') && pathname.startsWith(path.slice(0, -1))) {
        return settings.pageAdConfig[path];
      }
    }
    
    return null;
  }, [settings?.pageAdConfig, pathname]);
  
  const incrementInArticle = useCallback(() => {
    const pageConfig = getPageConfig();
    const maxInArticle = pageConfig?.maxAds ?? settings?.maxInArticleAds ?? 3;
    const maxTotal = settings?.maxAdsPerPage ?? 5;
    
    if (inArticleCount >= maxInArticle || totalCount >= maxTotal) {
      return false;
    }
    
    setInArticleCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    return true;
  }, [inArticleCount, totalCount, settings, getPageConfig]);
  
  const incrementTotal = useCallback(() => {
    const maxTotal = settings?.maxAdsPerPage ?? 5;
    
    if (totalCount >= maxTotal) {
      return false;
    }
    
    setTotalCount(prev => prev + 1);
    return true;
  }, [totalCount, settings]);
  
  // Get the effective ad provider for current page (considering page-specific overrides)
  const getEffectiveProvider = useCallback(() => {
    const pageConfig = getPageConfig();
    
    // If page has a specific provider set and it's not 'global', use it
    if (pageConfig?.adProvider && pageConfig.adProvider !== 'global') {
      return pageConfig.adProvider;
    }
    
    // Otherwise, use the global provider
    return settings?.activeProvider ?? 'none';
  }, [getPageConfig, settings?.activeProvider]);
  
  return (
    <AdCounterContext.Provider value={{ inArticleCount, totalCount, incrementInArticle, incrementTotal, getPageConfig, getEffectiveProvider }}>
      {children}
    </AdCounterContext.Provider>
  );
}

export function useAdCounter() {
  return useContext(AdCounterContext);
}

// Legacy exports for backward compatibility
export { AdProvider as AdSenseProvider };
export { useAds as useAdSense };

// ============================================
// Generic HTML Ad Component (for non-AdSense providers)
// ============================================
interface HtmlAdProps {
  code: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}

export function HtmlAd({ code, className = '', style }: HtmlAdProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(90);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !code || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!doc) return;

    // Write the ad code into the iframe
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body { 
              margin: 0; 
              padding: 0; 
              overflow: hidden;
              width: 100%;
              height: auto;
            }
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center;
            }
          </style>
        </head>
        <body>
          ${code}
        </body>
      </html>
    `);
    doc.close();

    // Auto-resize iframe based on content
    const resizeIframe = () => {
      try {
        const body = iframe.contentDocument?.body;
        if (body) {
          const height = body.scrollHeight || body.offsetHeight;
          if (height > 0) {
            setIframeHeight(height);
          }
        }
      } catch (e) {
        // Cross-origin error, use default height
      }
    };

    // Check height after scripts load
    setTimeout(resizeIframe, 500);
    setTimeout(resizeIframe, 1000);
    setTimeout(resizeIframe, 2000);
  }, [mounted, code]);

  // Return empty div on server to avoid hydration mismatch
  if (!mounted) {
    return <div className={`ad-container ${className}`} />;
  }

  if (!code) return null;

  return (
    <iframe
      ref={iframeRef}
      className={`ad-container ${className}`}
      style={{ 
        border: 'none', 
        width: '100%', 
        height: `${iframeHeight}px`,
        overflow: 'hidden',
        ...style 
      }}
      scrolling="no"
      title="Advertisement"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    />
  );
}

// ============================================
// AdSense Ad Unit Component
// ============================================
interface AdSenseUnitProps {
  slot: string;
  publisherId: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function AdSenseUnit({ slot, publisherId, format = 'auto', responsive = true, className = '', style }: AdSenseUnitProps) {
  const [adLoaded, setAdLoaded] = useState(false);

  const loadAd = useCallback(() => {
    if (!adLoaded && publisherId && slot) {
      try {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [adLoaded, publisherId, slot]);

  useEffect(() => {
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [loadAd]);

  if (!publisherId || !slot) return null;

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// ============================================
// Universal Ad Components
// ============================================
interface AdPlacementProps {
  className?: string;
  style?: React.CSSProperties;
}

export function HeaderAd({ className = '' }: AdPlacementProps) {
  const settings = useAds();
  const adCounter = useAdCounter();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  const isPageAllowed = useIsPageTypeAllowed(settings);
  
  // Get effective provider for this page (may be overridden by page config)
  const effectiveProvider = adCounter?.getEffectiveProvider() ?? settings?.activeProvider ?? 'none';
  
  // Check placement settings
  if (!settings || effectiveProvider === 'none' || isExcluded || !isPageAllowed) return null;
  if (settings.showHeaderAd === false) return null;
  
  // Check page-specific settings
  const pageConfig = adCounter?.getPageConfig();
  if (pageConfig?.showHeader === false) return null;

  const containerStyle: React.CSSProperties = { minHeight: '50px' };
  const containerClass = `w-full max-w-4xl mx-auto flex justify-center ${className}`;

  switch (effectiveProvider) {
    case 'adsense':
      if (settings.adsense?.headerSlot && settings.adsense?.publisherId) {
        return (
          <AdSenseUnit
            slot={settings.adsense.headerSlot}
            publisherId={settings.adsense.publisherId}
            format="horizontal"
            className={containerClass}
            style={containerStyle}
          />
        );
      }
      break;
    case 'medianet':
      return <HtmlAd code={settings.medianet?.headerCode} className={containerClass} style={containerStyle} />;
    case 'amazon':
      return <HtmlAd code={settings.amazon?.headerCode} className={containerClass} style={containerStyle} />;
    case 'propeller':
      return <HtmlAd code={settings.propeller?.headerCode} className={containerClass} style={containerStyle} />;
    case 'adsterra':
      return <HtmlAd code={settings.adsterra?.headerCode} className={containerClass} style={containerStyle} />;
    case 'custom':
      return <HtmlAd code={settings.custom?.headerCode} className={containerClass} style={containerStyle} />;
  }

  return null;
}

export function FooterAd({ className = '' }: AdPlacementProps) {
  const settings = useAds();
  const adCounter = useAdCounter();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  const isPageAllowed = useIsPageTypeAllowed(settings);
  
  // Get effective provider for this page (may be overridden by page config)
  const effectiveProvider = adCounter?.getEffectiveProvider() ?? settings?.activeProvider ?? 'none';
  
  // Check placement settings
  if (!settings || effectiveProvider === 'none' || isExcluded || !isPageAllowed) return null;
  if (settings.showFooterAd === false) return null;
  
  // Check page-specific settings
  const pageConfig = adCounter?.getPageConfig();
  if (pageConfig?.showFooter === false) return null;

  const containerStyle: React.CSSProperties = { minHeight: '90px' };
  const containerClass = `w-full max-w-4xl mx-auto my-1 flex justify-center ${className}`;

  let adCode: string | null | undefined = null;
  let fallbackCode: string | null | undefined = null;

  switch (effectiveProvider) {
    case 'adsense':
      if (settings.adsense?.footerSlot && settings.adsense?.publisherId) {
        return (
          <AdSenseUnit
            slot={settings.adsense.footerSlot}
            publisherId={settings.adsense.publisherId}
            format="horizontal"
            className={containerClass}
            style={containerStyle}
          />
        );
      }
      break;
    case 'medianet':
      adCode = settings.medianet?.footerCode;
      fallbackCode = settings.medianet?.headerCode;
      break;
    case 'amazon':
      adCode = settings.amazon?.footerCode;
      fallbackCode = settings.amazon?.headerCode;
      break;
    case 'propeller':
      adCode = settings.propeller?.footerCode;
      fallbackCode = settings.propeller?.headerCode;
      break;
    case 'adsterra':
      adCode = settings.adsterra?.footerCode;
      fallbackCode = settings.adsterra?.headerCode;
      break;
    case 'custom':
      adCode = settings.custom?.footerCode;
      fallbackCode = settings.custom?.headerCode;
      break;
  }

  // Return HtmlAd if we have code, fallback to header code if not
  const finalCode = (adCode && adCode.trim()) ? adCode : fallbackCode;
  if (finalCode && finalCode.trim()) {
    return <HtmlAd code={finalCode} className={containerClass} style={containerStyle} />;
  }

  return null;
}

export function SidebarAd({ className = '' }: AdPlacementProps) {
  const settings = useAds();
  const adCounter = useAdCounter();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  const isPageAllowed = useIsPageTypeAllowed(settings);
  
  // Get effective provider for this page (may be overridden by page config)
  const effectiveProvider = adCounter?.getEffectiveProvider() ?? settings?.activeProvider ?? 'none';
  
  // Check placement settings
  if (!settings || effectiveProvider === 'none' || isExcluded || !isPageAllowed) return null;
  if (settings.showSidebarAd === false) return null;
  
  // Check page-specific settings
  const pageConfig = adCounter?.getPageConfig();
  if (pageConfig?.showSidebar === false) return null;

  const containerStyle: React.CSSProperties = { minHeight: '250px' };
  const containerClass = `w-full flex justify-center ${className}`;

  let adCode: string | null | undefined = null;
  let fallbackCode: string | null | undefined = null;

  switch (effectiveProvider) {
    case 'adsense':
      if (settings.adsense?.sidebarSlot && settings.adsense?.publisherId) {
        return (
          <AdSenseUnit
            slot={settings.adsense.sidebarSlot}
            publisherId={settings.adsense.publisherId}
            format="vertical"
            className={containerClass}
            style={containerStyle}
          />
        );
      }
      break;
    case 'medianet':
      adCode = settings.medianet?.sidebarCode;
      fallbackCode = settings.medianet?.headerCode;
      break;
    case 'amazon':
      adCode = settings.amazon?.sidebarCode;
      fallbackCode = settings.amazon?.headerCode;
      break;
    case 'propeller':
      adCode = settings.propeller?.sidebarCode;
      fallbackCode = settings.propeller?.headerCode;
      break;
    case 'adsterra':
      adCode = settings.adsterra?.sidebarCode;
      fallbackCode = settings.adsterra?.headerCode;
      break;
    case 'custom':
      adCode = settings.custom?.sidebarCode;
      fallbackCode = settings.custom?.headerCode;
      break;
  }

  // Return HtmlAd if we have code, fallback to header code if not
  const finalCode = (adCode && adCode.trim()) ? adCode : fallbackCode;
  if (finalCode && finalCode.trim()) {
    return <HtmlAd code={finalCode} className={containerClass} style={containerStyle} />;
  }

  return null;
}

export function InArticleAd({ className = '' }: AdPlacementProps) {
  const settings = useAds();
  const adCounter = useAdCounter();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  const isPageAllowed = useIsPageTypeAllowed(settings);
  const [canShow, setCanShow] = useState(false);
  const checkedRef = useRef(false);
  
  // Get effective provider for this page (may be overridden by page config)
  const effectiveProvider = adCounter?.getEffectiveProvider() ?? settings?.activeProvider ?? 'none';
  
  useEffect(() => {
    if (checkedRef.current) return;
    if (adCounter && adCounter.incrementInArticle()) {
      setCanShow(true);
    }
    checkedRef.current = true;
  }, [adCounter]);
  
  // Check placement settings
  if (!settings || effectiveProvider === 'none' || isExcluded || !isPageAllowed) return null;
  if (settings.showInArticleAd === false) return null;
  
  // Check per-page config
  const pageConfig = adCounter?.getPageConfig();
  if (pageConfig?.showInArticle === false) return null;
  
  // Check if we've exceeded the limit
  if (!canShow && checkedRef.current) return null;

  const containerStyle: React.CSSProperties = { minHeight: '90px' };
  const containerClass = `w-full max-w-4xl mx-auto my-1 flex justify-center ${className}`;

  let adCode: string | null | undefined = null;
  let fallbackCode: string | null | undefined = null;

  switch (effectiveProvider) {
    case 'adsense':
      if (settings.adsense?.inArticleSlot && settings.adsense?.publisherId) {
        return (
          <AdSenseUnit
            slot={settings.adsense.inArticleSlot}
            publisherId={settings.adsense.publisherId}
            format="auto"
            className={containerClass}
            style={containerStyle}
          />
        );
      }
      break;
    case 'medianet':
      adCode = settings.medianet?.inArticleCode;
      fallbackCode = settings.medianet?.headerCode;
      break;
    case 'amazon':
      adCode = settings.amazon?.inArticleCode;
      fallbackCode = settings.amazon?.headerCode;
      break;
    case 'propeller':
      adCode = settings.propeller?.inArticleCode;
      fallbackCode = settings.propeller?.headerCode;
      break;
    case 'adsterra':
      adCode = settings.adsterra?.inArticleCode;
      fallbackCode = settings.adsterra?.headerCode;
      break;
    case 'custom':
      adCode = settings.custom?.inArticleCode;
      fallbackCode = settings.custom?.headerCode;
      break;
  }

  // Return HtmlAd if we have code, fallback to header code if not
  const finalCode = (adCode && adCode.trim()) ? adCode : fallbackCode;
  if (finalCode && finalCode.trim()) {
    return <HtmlAd code={finalCode} className={containerClass} style={containerStyle} />;
  }

  return null;
}

// ============================================
// Generic Ad Unit (for custom placements)
// ============================================
interface AdUnitProps {
  placement: 'header' | 'footer' | 'sidebar' | 'inArticle';
  className?: string;
  style?: React.CSSProperties;
}

export function AdUnit({ placement, className = '', style }: AdUnitProps) {
  switch (placement) {
    case 'header':
      return <HeaderAd className={className} style={style} />;
    case 'footer':
      return <FooterAd className={className} style={style} />;
    case 'sidebar':
      return <SidebarAd className={className} style={style} />;
    case 'inArticle':
      return <InArticleAd className={className} style={style} />;
    default:
      return null;
  }
}

// Auto Ads component (for providers that support auto placement)
export function AutoAds() {
  const settings = useAds();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);

  // Auto ads are primarily for AdSense and are handled by the script
  if (!settings || settings.activeProvider !== 'adsense' || !settings.adsense?.autoAds || isExcluded) {
    return null;
  }

  return null;
}

// ============================================
// Course-Specific Ad Component
// ============================================
interface CourseAdProps {
  adCode: string | null | undefined;
  showAds?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function CourseAd({ adCode, showAds = true, className = '', style }: CourseAdProps) {
  const settings = useAds();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  const isPageAllowed = useIsPageTypeAllowed(settings);
  
  // Don't render if ads are disabled for this course
  if (!showAds) return null;
  
  // Don't render if page is excluded or course ads are disabled globally
  if (isExcluded || !isPageAllowed) return null;
  
  // Don't render if no ad code provided
  if (!adCode || adCode.trim() === '') {
    // Fall back to global in-article ad if no course-specific ad
    return <InArticleAd className={className} style={style} />;
  }
  
  // Render course-specific ad
  return (
    <div className={`course-ad ${className}`} style={style}>
      <HtmlAd code={adCode} />
    </div>
  );
}
