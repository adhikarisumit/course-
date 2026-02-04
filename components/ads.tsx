'use client';

import { useEffect, useState, useCallback, createContext, useContext } from 'react';
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

interface AdSettings {
  activeProvider: string;
  excludedPages: string | null;
  adsense?: AdSenseConfig;
  medianet?: GenericAdConfig;
  amazon?: GenericAdConfig;
  propeller?: GenericAdConfig;
  adsterra?: GenericAdConfig;
  custom?: GenericAdConfig;
}

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

// Provider component to fetch and share settings
export function AdProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdSettings | null>(null);

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
      {children}
    </AdContext.Provider>
  );
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

function HtmlAd({ code, className = '', style }: HtmlAdProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!code || !mounted) return null;

  return (
    <div 
      className={`ad-container ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: code }}
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
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  
  if (!settings || settings.activeProvider === 'none' || isExcluded) return null;

  const containerStyle: React.CSSProperties = { minHeight: '90px' };
  const containerClass = `w-full max-w-4xl mx-auto my-2 ${className}`;

  switch (settings.activeProvider) {
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
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  
  if (!settings || settings.activeProvider === 'none' || isExcluded) return null;

  const containerStyle: React.CSSProperties = { minHeight: '90px' };
  const containerClass = `w-full max-w-4xl mx-auto my-4 ${className}`;

  switch (settings.activeProvider) {
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
      return <HtmlAd code={settings.medianet?.footerCode} className={containerClass} style={containerStyle} />;
    case 'amazon':
      return <HtmlAd code={settings.amazon?.footerCode} className={containerClass} style={containerStyle} />;
    case 'propeller':
      return <HtmlAd code={settings.propeller?.footerCode} className={containerClass} style={containerStyle} />;
    case 'adsterra':
      return <HtmlAd code={settings.adsterra?.footerCode} className={containerClass} style={containerStyle} />;
    case 'custom':
      return <HtmlAd code={settings.custom?.footerCode} className={containerClass} style={containerStyle} />;
  }

  return null;
}

export function SidebarAd({ className = '' }: AdPlacementProps) {
  const settings = useAds();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  
  if (!settings || settings.activeProvider === 'none' || isExcluded) return null;

  const containerStyle: React.CSSProperties = { minHeight: '250px' };
  const containerClass = `w-full ${className}`;

  switch (settings.activeProvider) {
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
      return <HtmlAd code={settings.medianet?.sidebarCode} className={containerClass} style={containerStyle} />;
    case 'amazon':
      return <HtmlAd code={settings.amazon?.sidebarCode} className={containerClass} style={containerStyle} />;
    case 'propeller':
      return <HtmlAd code={settings.propeller?.sidebarCode} className={containerClass} style={containerStyle} />;
    case 'adsterra':
      return <HtmlAd code={settings.adsterra?.sidebarCode} className={containerClass} style={containerStyle} />;
    case 'custom':
      return <HtmlAd code={settings.custom?.sidebarCode} className={containerClass} style={containerStyle} />;
  }

  return null;
}

export function InArticleAd({ className = '' }: AdPlacementProps) {
  const settings = useAds();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  
  if (!settings || settings.activeProvider === 'none' || isExcluded) return null;

  const containerStyle: React.CSSProperties = { minHeight: '280px' };
  const containerClass = `w-full my-6 ${className}`;

  switch (settings.activeProvider) {
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
      return <HtmlAd code={settings.medianet?.inArticleCode} className={containerClass} style={containerStyle} />;
    case 'amazon':
      return <HtmlAd code={settings.amazon?.inArticleCode} className={containerClass} style={containerStyle} />;
    case 'propeller':
      return <HtmlAd code={settings.propeller?.inArticleCode} className={containerClass} style={containerStyle} />;
    case 'adsterra':
      return <HtmlAd code={settings.adsterra?.inArticleCode} className={containerClass} style={containerStyle} />;
    case 'custom':
      return <HtmlAd code={settings.custom?.inArticleCode} className={containerClass} style={containerStyle} />;
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
