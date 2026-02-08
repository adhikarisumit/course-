'use client';

import { useEffect, useState, useCallback, createContext, useContext, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Types for ad settings
interface AdSenseConfig {
  publisherId: string | null;
  headScript?: string | null;
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
  const currentPath = pathname.toLowerCase();
  
  // Always exclude admin pages from ads
  if (currentPath.startsWith('/admin')) return true;
  
  if (!excludedPages) return false;
  
  const excludedPaths = excludedPages.split(',').map((p) => p.trim().toLowerCase());
  
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
  
  const currentPath = pathname.toLowerCase();
  
  // Never show ads on admin pages
  if (currentPath.startsWith('/admin')) return false;
  
  if (!settings) return true;
  
  // Check page-specific settings
  if (currentPath === '/' && settings.showHomePageAd === false) return false;
  if (currentPath.startsWith('/courses') && settings.showCoursePageAd === false) return false;
  if (currentPath.startsWith('/portal') && settings.showPortalAd === false) return false;
  if ((currentPath.startsWith('/blog') || currentPath.startsWith('/articles')) && settings.showBlogAd === false) return false;
  
  return true;
}

// Helper to extract script content or src from HTML that may contain script tags
function parseScriptCode(code: string): { type: 'inline' | 'external' | 'invalid'; content?: string; src?: string; attrs?: Record<string, string> } {
  try {
    if (!code || !code.trim()) {
      return { type: 'invalid' };
    }
    
    const trimmed = code.trim();
    
    // Check if the code contains script tags
    const scriptMatch = trimmed.match(/<script([^>]*)>([\s\S]*?)<\/script>/i);
    
    if (scriptMatch) {
      const attrs = scriptMatch[1] || '';
      const inner = scriptMatch[2] || '';
      
      // Extract src attribute if present
      const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
      
      if (srcMatch) {
        // External script
        const attrObj: Record<string, string> = {};
        const asyncMatch = attrs.match(/\basync\b/i);
        const deferMatch = attrs.match(/\bdefer\b/i);
        const crossOriginMatch = attrs.match(/crossorigin\s*=\s*["']([^"']+)["']/i);
        
        if (asyncMatch) attrObj.async = 'true';
        if (deferMatch) attrObj.defer = 'true';
        if (crossOriginMatch) attrObj.crossOrigin = crossOriginMatch[1];
        
        return { type: 'external', src: srcMatch[1], attrs: attrObj };
      } else if (inner.trim()) {
        // Inline script
        return { type: 'inline', content: inner.trim() };
      }
    }
    
    // No script tags found - treat as raw inline JavaScript
    // But first check if it starts with < (likely HTML, not JS)
    if (trimmed.startsWith('<')) {
      // This looks like HTML but not a valid script tag - unsafe to execute as JS
      console.warn('Ad script code appears to be HTML but not a valid script tag');
      return { type: 'invalid' };
    }
    
    // Raw JavaScript code
    return { type: 'inline', content: trimmed };
  } catch (error) {
    console.error('Error parsing script code:', error);
    return { type: 'invalid' };
  }
}

// Provider component to fetch and share settings
export function AdProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const pathname = usePathname();
  const isAdminPage = pathname.toLowerCase().startsWith('/admin');

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

  // Global footer scripts (like Social Bar) are NOT injected here.
  // Footer ads are handled by the FooterAd component to avoid duplicate/floating ads.

  // Render provider-specific head scripts
  const renderHeadScripts = () => {
    if (!settings || settings.activeProvider === 'none' || isAdminPage) return null;

    switch (settings.activeProvider) {
      case 'adsense':
        if (settings.adsense?.publisherId) {
          // Use custom headScript if provided, otherwise auto-generate from publisherId
          if (settings.adsense.headScript) {
            const parsed = parseScriptCode(settings.adsense.headScript);
            if (parsed.type === 'external' && parsed.src) {
              return (
                <Script
                  id="adsense-script"
                  src={parsed.src}
                  strategy="lazyOnload"
                  {...(parsed.attrs?.async && { async: true })}
                  {...(parsed.attrs?.crossOrigin && { crossOrigin: parsed.attrs.crossOrigin as 'anonymous' | 'use-credentials' })}
                />
              );
            } else if (parsed.type === 'inline' && parsed.content) {
              return (
                <Script
                  id="adsense-script"
                  strategy="lazyOnload"
                  dangerouslySetInnerHTML={{ __html: parsed.content }}
                />
              );
            }
          }
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
          const parsed = parseScriptCode(settings.custom.headScript);
          if (parsed.type === 'external' && parsed.src) {
            return (
              <Script
                id="custom-ad-script"
                src={parsed.src}
                strategy="lazyOnload"
                {...(parsed.attrs?.async && { async: true })}
                {...(parsed.attrs?.crossOrigin && { crossOrigin: parsed.attrs.crossOrigin as 'anonymous' | 'use-credentials' })}
              />
            );
          } else if (parsed.type === 'inline' && parsed.content) {
            return (
              <Script
                id="custom-ad-script"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{ __html: parsed.content }}
              />
            );
          }
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const scriptInjected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !code || !containerRef.current || scriptInjected.current) return;
    scriptInjected.current = true;

    const container = containerRef.current;
    
    // Parse and inject the ad code
    const temp = document.createElement('div');
    temp.innerHTML = code;
    
    // Extract and execute scripts separately
    const scripts = temp.querySelectorAll('script');
    const nonScriptContent = code.replace(/<script[\s\S]*?<\/script>/gi, '').trim();
    
    // Insert non-script HTML first
    if (nonScriptContent) {
      container.innerHTML = nonScriptContent;
    }
    
    // Then execute scripts
    scripts.forEach((oldScript) => {
      try {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (!oldScript.hasAttribute('src') && oldScript.textContent) {
          const content = oldScript.textContent.trim();
          if (content && !content.startsWith('<')) {
            newScript.textContent = content;
          }
        }
        container.appendChild(newScript);
      } catch (error) {
        console.error('Error executing ad script:', error);
      }
    });

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptInjected.current = false;
    };
  }, [mounted, code]);

  // Return empty div on server to avoid hydration mismatch
  if (!mounted) {
    return <div className={`ad-container ${className}`} />;
  }

  if (!code) return null;

  return (
    <div
      ref={containerRef}
      className={`ad-container ${className}`}
      style={{
        width: '100%',
        minHeight: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
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
  const singleAdClass = `flex-1 max-w-md flex justify-center`;

  // Helper to render a single ad unit
  const renderAdUnit = (key: string) => {
    switch (effectiveProvider) {
      case 'adsense':
        if (settings.adsense?.headerSlot && settings.adsense?.publisherId) {
          return (
            <AdSenseUnit
              key={key}
              slot={settings.adsense.headerSlot}
              publisherId={settings.adsense.publisherId}
              format="horizontal"
              className={singleAdClass}
              style={containerStyle}
            />
          );
        }
        return null;
      case 'medianet':
        return <HtmlAd key={key} code={settings.medianet?.headerCode} className={singleAdClass} style={containerStyle} />;
      case 'amazon':
        return <HtmlAd key={key} code={settings.amazon?.headerCode} className={singleAdClass} style={containerStyle} />;
      case 'propeller':
        return <HtmlAd key={key} code={settings.propeller?.headerCode} className={singleAdClass} style={containerStyle} />;
      case 'adsterra':
        return <HtmlAd key={key} code={settings.adsterra?.headerCode} className={singleAdClass} style={containerStyle} />;
      case 'custom':
        return <HtmlAd key={key} code={settings.custom?.headerCode} className={singleAdClass} style={containerStyle} />;
      default:
        return null;
    }
  };

  const adUnit1 = renderAdUnit('header-ad-1');
  const adUnit2 = renderAdUnit('header-ad-2');
  const adUnit3 = renderAdUnit('header-ad-3');

  if (!adUnit1) return null;

  return (
    <div className={`w-full py-2 ${className}`}>
      {/* Desktop: 3 ads side by side */}
      <div className="hidden md:flex justify-center gap-4 max-w-7xl mx-auto px-4">
        {adUnit1}
        {adUnit2}
        {adUnit3}
      </div>
      {/* Mobile: single ad */}
      <div className="md:hidden flex justify-center px-4">
        {adUnit1}
      </div>
    </div>
  );
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
  const singleAdClass = `flex-1 max-w-md flex justify-center`;

  // Helper to render a single ad unit
  const renderAdUnit = (key: string) => {
    switch (effectiveProvider) {
      case 'adsense':
        if (settings.adsense?.footerSlot && settings.adsense?.publisherId) {
          return (
            <AdSenseUnit
              key={key}
              slot={settings.adsense.footerSlot}
              publisherId={settings.adsense.publisherId}
              format="horizontal"
              className={singleAdClass}
              style={containerStyle}
            />
          );
        }
        return null;
      case 'medianet': {
        const code = settings.medianet?.footerCode || settings.medianet?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'amazon': {
        const code = settings.amazon?.footerCode || settings.amazon?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'propeller': {
        const code = settings.propeller?.footerCode || settings.propeller?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'adsterra': {
        const code = settings.adsterra?.footerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'custom': {
        const code = settings.custom?.footerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      default:
        return null;
    }
  };

  const adUnit1 = renderAdUnit('footer-ad-1');
  const adUnit2 = renderAdUnit('footer-ad-2');
  const adUnit3 = renderAdUnit('footer-ad-3');

  if (!adUnit1) return null;

  return (
    <div className={`w-full py-2 ${className}`}>
      {/* Desktop: 3 ads side by side */}
      <div className="hidden md:flex justify-center gap-4 max-w-7xl mx-auto px-4">
        {adUnit1}
        {adUnit2}
        {adUnit3}
      </div>
      {/* Mobile: single ad */}
      <div className="md:hidden flex justify-center px-4">
        {adUnit1}
      </div>
    </div>
  );
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
  const singleAdClass = `flex-1 max-w-md flex justify-center`;

  // Helper to render a single ad unit
  const renderAdUnit = (key: string) => {
    switch (effectiveProvider) {
      case 'adsense':
        if (settings.adsense?.inArticleSlot && settings.adsense?.publisherId) {
          return (
            <AdSenseUnit
              key={key}
              slot={settings.adsense.inArticleSlot}
              publisherId={settings.adsense.publisherId}
              format="auto"
              className={singleAdClass}
              style={containerStyle}
            />
          );
        }
        return null;
      case 'medianet': {
        const code = settings.medianet?.inArticleCode || settings.medianet?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'amazon': {
        const code = settings.amazon?.inArticleCode || settings.amazon?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'propeller': {
        const code = settings.propeller?.inArticleCode || settings.propeller?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'adsterra': {
        const code = settings.adsterra?.inArticleCode || settings.adsterra?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      case 'custom': {
        const code = settings.custom?.inArticleCode || settings.custom?.headerCode;
        return code ? <HtmlAd key={key} code={code} className={singleAdClass} style={containerStyle} /> : null;
      }
      default:
        return null;
    }
  };

  const adUnit1 = renderAdUnit('inarticle-ad-1');
  const adUnit2 = renderAdUnit('inarticle-ad-2');
  const adUnit3 = renderAdUnit('inarticle-ad-3');

  if (!adUnit1) return null;

  return (
    <div className={`w-full py-2 ${className}`}>
      {/* Desktop: 3 ads side by side */}
      <div className="hidden md:flex justify-center gap-4 max-w-7xl mx-auto px-4">
        {adUnit1}
        {adUnit2}
        {adUnit3}
      </div>
      {/* Mobile: single ad */}
      <div className="md:hidden flex justify-center px-4">
        {adUnit1}
      </div>
    </div>
  );
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
