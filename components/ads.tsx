'use client';

import { useEffect, useState, useCallback, createContext, useContext, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface PageAdConfig {
  maxAds?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  showInArticle?: boolean;
  showSidebar?: boolean;
  adProvider?: string;
}

interface AdSettings {
  activeProvider: string;
  excludedPages: string | null;
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
  showSidebarAd?: boolean;
  showInArticleAd?: boolean;
  showHomePageAd?: boolean;
  showCoursePageAd?: boolean;
  showPortalAd?: boolean;
  showBlogAd?: boolean;
  showHeaderAdMobile?: boolean;
  showFooterAdMobile?: boolean;
  showSidebarAdMobile?: boolean;
  showInArticleAdMobile?: boolean;
  maxAdsPerPage?: number;
  maxInArticleAds?: number;
  pageAdConfig?: Record<string, PageAdConfig>;
  adsense?: AdSenseConfig;
  medianet?: GenericAdConfig;
  amazon?: GenericAdConfig;
  propeller?: GenericAdConfig;
  adsterra?: GenericAdConfig;
  custom?: GenericAdConfig;
}

interface AdCounterContextType {
  inArticleCount: number;
  totalCount: number;
  incrementInArticle: () => boolean;
  incrementTotal: () => boolean;
  getPageConfig: () => PageAdConfig | null;
  getEffectiveProvider: () => string;
}

const AdCounterContext = createContext<AdCounterContextType | null>(null);
const AdContext = createContext<AdSettings | null>(null);

export function useAds() {
  return useContext(AdContext);
}

function useIsExcludedPage(excludedPages: string | null) {
  const pathname = usePathname();
  const currentPath = pathname.toLowerCase();
  if (currentPath.startsWith('/admin')) return true;
  if (!excludedPages) return false;
  const excludedPaths = excludedPages.split(',').map((p) => p.trim().toLowerCase());
  return excludedPaths.some((excluded) => {
    if (excluded.endsWith('*')) return currentPath.startsWith(excluded.slice(0, -1));
    return currentPath === excluded || currentPath.startsWith(excluded + '/');
  });
}

function useIsPageTypeAllowed(settings: AdSettings | null) {
  const pathname = usePathname();
  const currentPath = pathname.toLowerCase();
  if (currentPath.startsWith('/admin')) return false;
  if (!settings) return true;
  if (currentPath === '/' && settings.showHomePageAd === false) return false;
  if (currentPath.startsWith('/courses') && settings.showCoursePageAd === false) return false;
  if (currentPath.startsWith('/portal') && settings.showPortalAd === false) return false;
  if ((currentPath.startsWith('/blog') || currentPath.startsWith('/articles')) && settings.showBlogAd === false) return false;
  return true;
}

function parseScriptCode(code: string): { type: 'inline' | 'external' | 'invalid'; content?: string; src?: string; attrs?: Record<string, string> } {
  try {
    if (!code || !code.trim()) return { type: 'invalid' };
    const trimmed = code.trim();
    const scriptMatch = trimmed.match(/<script([^>]*)>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      const attrs = scriptMatch[1] || '';
      const inner = scriptMatch[2] || '';
      const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
      if (srcMatch) {
        const attrObj: Record<string, string> = {};
        if (attrs.match(/\basync\b/i)) attrObj.async = 'true';
        if (attrs.match(/\bdefer\b/i)) attrObj.defer = 'true';
        const crossOriginMatch = attrs.match(/crossorigin\s*=\s*["']([^"']+)["']/i);
        if (crossOriginMatch) attrObj.crossOrigin = crossOriginMatch[1];
        return { type: 'external', src: srcMatch[1], attrs: attrObj };
      } else if (inner.trim()) {
        return { type: 'inline', content: inner.trim() };
      }
    }
    if (trimmed.startsWith('<')) return { type: 'invalid' };
    return { type: 'inline', content: trimmed };
  } catch {
    return { type: 'invalid' };
  }
}

// ============================================
// Provider Component
// ============================================
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

  const renderHeadScripts = () => {
    if (!settings || settings.activeProvider === 'none' || isAdminPage) return null;
    switch (settings.activeProvider) {
      case 'adsense':
        if (settings.adsense?.publisherId) {
          if (settings.adsense.headScript) {
            const parsed = parseScriptCode(settings.adsense.headScript);
            if (parsed.type === 'external' && parsed.src) {
              return <Script id="adsense-script" src={parsed.src} strategy="lazyOnload" {...(parsed.attrs?.async && { async: true })} {...(parsed.attrs?.crossOrigin && { crossOrigin: parsed.attrs.crossOrigin as 'anonymous' | 'use-credentials' })} />;
            } else if (parsed.type === 'inline' && parsed.content) {
              return <Script id="adsense-script" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: parsed.content }} />;
            }
          }
          return <Script id="adsense-script" async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsense.publisherId}`} crossOrigin="anonymous" strategy="lazyOnload" />;
        }
        break;
      case 'medianet':
        if (settings.medianet?.customerId) {
          return <Script id="medianet-script" async src={`https://contextual.media.net/dmedianet.js?cid=${settings.medianet.customerId}`} strategy="lazyOnload" />;
        }
        break;
      case 'custom':
        if (settings.custom?.headScript) {
          const parsed = parseScriptCode(settings.custom.headScript);
          if (parsed.type === 'external' && parsed.src) {
            return <Script id="custom-ad-script" src={parsed.src} strategy="lazyOnload" {...(parsed.attrs?.async && { async: true })} {...(parsed.attrs?.crossOrigin && { crossOrigin: parsed.attrs.crossOrigin as 'anonymous' | 'use-credentials' })} />;
          } else if (parsed.type === 'inline' && parsed.content) {
            return <Script id="custom-ad-script" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: parsed.content }} />;
          }
        }
        break;
    }
    return null;
  };

  return (
    <AdContext.Provider value={settings}>
      {renderHeadScripts()}
      <AdCounterProvider settings={settings}>{children}</AdCounterProvider>
    </AdContext.Provider>
  );
}

function AdCounterProvider({ children, settings }: { children: React.ReactNode; settings: AdSettings | null }) {
  const pathname = usePathname();
  const [inArticleCount, setInArticleCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { setInArticleCount(0); setTotalCount(0); }, [pathname]);

  const getPageConfig = useCallback((): PageAdConfig | null => {
    if (!settings?.pageAdConfig) return null;
    if (settings.pageAdConfig[pathname]) return settings.pageAdConfig[pathname];
    for (const path of Object.keys(settings.pageAdConfig)) {
      if (path.endsWith('*') && pathname.startsWith(path.slice(0, -1))) return settings.pageAdConfig[path];
    }
    return null;
  }, [settings?.pageAdConfig, pathname]);

  const incrementInArticle = useCallback(() => {
    const pageConfig = getPageConfig();
    const maxInArticle = pageConfig?.maxAds ?? settings?.maxInArticleAds ?? 3;
    const maxTotal = settings?.maxAdsPerPage ?? 5;
    if (inArticleCount >= maxInArticle || totalCount >= maxTotal) return false;
    setInArticleCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    return true;
  }, [inArticleCount, totalCount, settings, getPageConfig]);

  const incrementTotal = useCallback(() => {
    const maxTotal = settings?.maxAdsPerPage ?? 5;
    if (totalCount >= maxTotal) return false;
    setTotalCount(prev => prev + 1);
    return true;
  }, [totalCount, settings]);

  const getEffectiveProvider = useCallback(() => {
    const pageConfig = getPageConfig();
    if (pageConfig?.adProvider && pageConfig.adProvider !== 'global') return pageConfig.adProvider;
    return settings?.activeProvider ?? 'none';
  }, [getPageConfig, settings?.activeProvider]);

  return (
    <AdCounterContext.Provider value={{ inArticleCount, totalCount, incrementInArticle, incrementTotal, getPageConfig, getEffectiveProvider }}>
      {children}
    </AdCounterContext.Provider>
  );
}

export function useAdCounter() { return useContext(AdCounterContext); }

export { AdProvider as AdSenseProvider };
export { useAds as useAdSense };

// ============================================
// Generic HTML Ad Component (direct injection per instance)
// ============================================
interface HtmlAdProps {
  code: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}

// Global counter for unique ad container IDs
let adContainerCounter = 0;

export function HtmlAd({ code, className = '', style }: HtmlAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [containerId] = useState(() => `ad-container-${++adContainerCounter}-${Date.now()}`);
  const injectedRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !code || !containerRef.current || injectedRef.current) return;
    injectedRef.current = true;
    
    const container = containerRef.current;
    
    // Parse the code and extract scripts
    const temp = document.createElement('div');
    temp.innerHTML = code;
    
    // Get all scripts
    const scripts = Array.from(temp.querySelectorAll('script'));
    
    // Get non-script content
    const nonScriptContent = code.replace(/<script[\s\S]*?<\/script>/gi, '').trim();
    if (nonScriptContent) {
      container.innerHTML = nonScriptContent;
    }
    
    // Execute scripts sequentially with delays to prevent race conditions
    const executeScripts = async () => {
      for (let i = 0; i < scripts.length; i++) {
        const oldScript = scripts[i];
        const newScript = document.createElement('script');
        
        // Copy attributes
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy inline content
        if (!oldScript.hasAttribute('src') && oldScript.textContent) {
          const content = oldScript.textContent.trim();
          if (content && !content.startsWith('<')) {
            newScript.textContent = content;
          }
        }
        
        // Append and wait for external scripts to load
        if (oldScript.hasAttribute('src')) {
          await new Promise<void>((resolve) => {
            newScript.onload = () => resolve();
            newScript.onerror = () => resolve();
            container.appendChild(newScript);
            // Timeout fallback
            setTimeout(resolve, 2000);
          });
        } else {
          container.appendChild(newScript);
          // Small delay between inline scripts
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };
    
    executeScripts();
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      injectedRef.current = false;
    };
  }, [mounted, code, containerId]);

  // Don't render anything if no code is provided
  if (!code || !code.trim()) return null;
  // Return null during SSR, will render on client
  if (!mounted) return null;

  return (
    <div 
      id={containerId}
      ref={containerRef} 
      className={`ad-container ${className}`}
      style={{ width: '100%', minHeight: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }} 
    />
  );
}

// ============================================
// AdSense Ad Unit
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  
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
    if (!mounted) return;
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [loadAd, mounted]);

  // Don't render anything if missing required config
  if (!publisherId || !slot) return null;
  // Return null during SSR
  if (!mounted) return null;
  
  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins className="adsbygoogle" style={{ display: 'block', ...style }}
        data-ad-client={publisherId} data-ad-slot={slot} data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'} />
    </div>
  );
}

// ============================================
// Shared Ad Rendering
// ============================================
type AdSlot = 'header' | 'footer' | 'sidebar' | 'inArticle';

// Check if provider config exists in settings
function hasProviderConfig(settings: AdSettings, provider: string): boolean {
  switch (provider) {
    case 'adsense': return !!settings.adsense;
    case 'medianet': return !!settings.medianet;
    case 'amazon': return !!settings.amazon;
    case 'propeller': return !!settings.propeller;
    case 'adsterra': return !!settings.adsterra;
    case 'custom': return !!settings.custom;
    default: return false;
  }
}

function useAdVisibility(slot: AdSlot) {
  const settings = useAds();
  const adCounter = useAdCounter();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  const isPageAllowed = useIsPageTypeAllowed(settings);
  const isMobile = useIsMobile();
  const effectiveProvider = adCounter?.getEffectiveProvider() ?? settings?.activeProvider ?? 'none';

  const noRender = { visible: false as const, settings, effectiveProvider, isMobile, adCounter };
  
  // Early exit conditions
  if (!settings || effectiveProvider === 'none' || isExcluded || !isPageAllowed) return noRender;
  
  // Check if provider config exists (API only returns configs with real content)
  if (!hasProviderConfig(settings, effectiveProvider)) return noRender;

  const slotCap = slot === 'inArticle' ? 'InArticle' : slot.charAt(0).toUpperCase() + slot.slice(1);
  const desktopKey = `show${slotCap}Ad` as keyof AdSettings;
  const mobileKey = `show${slotCap}AdMobile` as keyof AdSettings;
  if ((isMobile ? settings[mobileKey] : settings[desktopKey]) === false) return noRender;

  const pageConfig = adCounter?.getPageConfig();
  const pageKey = slot === 'inArticle' ? 'showInArticle' : `show${slotCap}`;
  if (pageConfig && (pageConfig as Record<string, unknown>)[pageKey] === false) return noRender;

  return { visible: true as const, settings, effectiveProvider, isMobile, adCounter };
}

// Helper to check if a string has real content
function hasContent(str: string | null | undefined): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

function hasValidAdCode(settings: AdSettings, provider: string, slotType: AdSlot): boolean {
  if (!settings || !provider || provider === 'none') return false;
  
  // Get the specific slot code - NO fallback to other slots
  const getSlotCode = (cfg: GenericAdConfig | undefined | null): string | null => {
    if (!cfg) return null;
    const slotMap: Record<AdSlot, string | null | undefined> = {
      header: cfg.headerCode,
      footer: cfg.footerCode,
      sidebar: cfg.sidebarCode,
      inArticle: cfg.inArticleCode,
    };
    const code = slotMap[slotType];
    return hasContent(code) ? code! : null;
  };

  switch (provider) {
    case 'adsense': {
      const a = settings.adsense;
      if (!a || !hasContent(a.publisherId)) return false;
      const slotId = slotType === 'header' ? a.headerSlot : slotType === 'footer' ? a.footerSlot : slotType === 'sidebar' ? a.sidebarSlot : a.inArticleSlot;
      return hasContent(slotId);
    }
    case 'medianet': return getSlotCode(settings.medianet) !== null;
    case 'amazon': return getSlotCode(settings.amazon) !== null;
    case 'propeller': return getSlotCode(settings.propeller) !== null;
    case 'adsterra': return getSlotCode(settings.adsterra) !== null;
    case 'custom': return getSlotCode(settings.custom) !== null;
    default: return false;
  }
}

function renderProviderAd(settings: AdSettings, provider: string, slotType: AdSlot, cls: string, style: React.CSSProperties) {
  // Get the specific slot code - NO fallback to other slots
  const getCode = (cfg: GenericAdConfig | undefined): string | null => {
    if (!cfg) return null;
    const slotMap: Record<AdSlot, string | null | undefined> = {
      header: cfg.headerCode,
      footer: cfg.footerCode,
      sidebar: cfg.sidebarCode,
      inArticle: cfg.inArticleCode,
    };
    const code = slotMap[slotType];
    return hasContent(code) ? code! : null;
  };

  // First check if there's valid ad code
  if (!hasValidAdCode(settings, provider, slotType)) return null;

  switch (provider) {
    case 'adsense': {
      const a = settings.adsense;
      if (!a?.publisherId) return null;
      const slotId = slotType === 'header' ? a.headerSlot : slotType === 'footer' ? a.footerSlot : slotType === 'sidebar' ? a.sidebarSlot : a.inArticleSlot;
      if (!slotId) return null;
      const fmt = slotType === 'sidebar' ? 'vertical' : slotType === 'header' || slotType === 'footer' ? 'horizontal' : 'auto';
      return <AdSenseUnit slot={slotId} publisherId={a.publisherId} format={fmt} className={cls} style={style} />;
    }
    case 'medianet': { const c = getCode(settings.medianet); return c ? <HtmlAd code={c} className={cls} style={style} /> : null; }
    case 'amazon': { const c = getCode(settings.amazon); return c ? <HtmlAd code={c} className={cls} style={style} /> : null; }
    case 'propeller': { const c = getCode(settings.propeller); return c ? <HtmlAd code={c} className={cls} style={style} /> : null; }
    case 'adsterra': { const c = getCode(settings.adsterra); return c ? <HtmlAd code={c} className={cls} style={style} /> : null; }
    case 'custom': { const c = getCode(settings.custom); return c ? <HtmlAd code={c} className={cls} style={style} /> : null; }
    default: return null;
  }
}

// ============================================
// Ad Placement Components
// ============================================
interface AdPlacementProps {
  className?: string;
  style?: React.CSSProperties;
}

export function HeaderAd({ className = '' }: AdPlacementProps) {
  const { visible, settings, effectiveProvider } = useAdVisibility('header');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  
  if (!visible || !settings) return null;
  // Check if ad code exists before rendering container
  if (!hasValidAdCode(settings, effectiveProvider!, 'header')) return null;
  // Avoid hydration mismatch
  if (!mounted) return null;
  
  const ad = renderProviderAd(settings, effectiveProvider!, 'header', 'w-full flex justify-center', { minHeight: '90px' });
  if (!ad) return null;
  return (
    <div className={`w-full animate-in fade-in duration-500 ${className}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border border-border/40 backdrop-blur-sm">
          <div className="absolute top-1 right-2 z-10">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium select-none">Ad</span>
          </div>
          {ad}
        </div>
      </div>
    </div>
  );
}

export function FooterAd({ className = '' }: AdPlacementProps) {
  const { visible, settings, effectiveProvider } = useAdVisibility('footer');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  
  if (!visible || !settings) return null;
  // Check if ad code exists before rendering container
  if (!hasValidAdCode(settings, effectiveProvider!, 'footer')) return null;
  // Avoid hydration mismatch
  if (!mounted) return null;
  
  const ad = renderProviderAd(settings, effectiveProvider!, 'footer', 'w-full flex justify-center', { minHeight: '90px' });
  if (!ad) return null;
  return (
    <div className={`w-full animate-in fade-in duration-500 ${className}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border border-border/40 backdrop-blur-sm">
          <div className="absolute top-1 right-2 z-10">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium select-none">Ad</span>
          </div>
          {ad}
        </div>
      </div>
    </div>
  );
}

export function SidebarAd({ className = '' }: AdPlacementProps) {
  const { visible, settings, effectiveProvider } = useAdVisibility('sidebar');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  
  if (!visible || !settings) return null;
  // Check if ad code exists before rendering container
  if (!hasValidAdCode(settings, effectiveProvider!, 'sidebar')) return null;
  // Avoid hydration mismatch
  if (!mounted) return null;
  
  const ad = renderProviderAd(settings, effectiveProvider!, 'sidebar', 'w-full flex justify-center', { minHeight: '250px' });
  if (!ad) return null;
  return (
    <div className={`w-full animate-in fade-in slide-in-from-right-2 duration-500 ${className}`}>
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10 border border-border/40 backdrop-blur-sm p-1">
        <div className="absolute top-1.5 right-2 z-10">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium select-none">Sponsored</span>
        </div>
        {ad}
      </div>
    </div>
  );
}

export function InArticleAd({ className = '' }: AdPlacementProps) {
  const { visible, settings, effectiveProvider, adCounter } = useAdVisibility('inArticle');
  const [canShow, setCanShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const checkedRef = useRef(false);
  
  useEffect(() => { setMounted(true); }, []);
  
  useEffect(() => {
    if (checkedRef.current) return;
    if (adCounter && adCounter.incrementInArticle()) setCanShow(true);
    checkedRef.current = true;
  }, [adCounter]);
  
  if (!visible || !settings) return null;
  if (!canShow && checkedRef.current) return null;
  // Check if ad code exists before rendering container
  if (!hasValidAdCode(settings, effectiveProvider!, 'inArticle')) return null;
  // Avoid hydration mismatch
  if (!mounted) return null;
  
  const ad = renderProviderAd(settings, effectiveProvider!, 'inArticle', 'w-full flex justify-center', { minHeight: '90px' });
  if (!ad) return null;
  return (
    <div className={`w-full my-6 sm:my-8 animate-in fade-in duration-700 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="pt-4 pb-4">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-muted/30 via-muted/15 to-muted/30 border border-border/30 backdrop-blur-sm">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium select-none">Advertisement</span>
              </div>
              {ad}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Generic Ad Unit
// ============================================
interface AdUnitProps {
  placement: 'header' | 'footer' | 'sidebar' | 'inArticle';
  className?: string;
  style?: React.CSSProperties;
}

export function AdUnit({ placement, className = '', style }: AdUnitProps) {
  switch (placement) {
    case 'header': return <HeaderAd className={className} style={style} />;
    case 'footer': return <FooterAd className={className} style={style} />;
    case 'sidebar': return <SidebarAd className={className} style={style} />;
    case 'inArticle': return <InArticleAd className={className} style={style} />;
    default: return null;
  }
}

export function AutoAds() {
  const settings = useAds();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  if (!settings || settings.activeProvider !== 'adsense' || !settings.adsense?.autoAds || isExcluded) return null;
  return null;
}

// ============================================
// Course-Specific Ad
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
  if (!showAds || isExcluded || !isPageAllowed) return null;
  if (!adCode || adCode.trim() === '') return <InArticleAd className={className} style={style} />;
  return (
    <div className={`course-ad ${className}`} style={style}>
      <HtmlAd code={adCode} />
    </div>
  );
}
