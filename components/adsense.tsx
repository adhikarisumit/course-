'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

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

interface AdSenseSettings {
  publisherId: string | null;
  headScript: string | null;
  isEnabled: boolean;
  enableAutoAds: boolean;
  enableInArticle: boolean;
  enableSidebar: boolean;
  enableHeader: boolean;
  enableFooter: boolean;
  inArticleSlot: string | null;
  sidebarSlot: string | null;
  headerSlot: string | null;
  footerSlot: string | null;
  excludedPages: string | null;
}

// Context to share AdSense settings across components
import { createContext, useContext } from 'react';

const AdSenseContext = createContext<AdSenseSettings | null>(null);

export function useAdSense() {
  return useContext(AdSenseContext);
}

// Provider component to fetch and share settings
export function AdSenseProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdSenseSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/adsense');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching AdSense settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Render the appropriate script based on settings
  const renderScript = () => {
    if (!settings?.isEnabled || !settings?.publisherId) return null;
    
    if (settings?.headScript) {
      const parsed = parseScriptCode(settings.headScript);
      if (parsed.type === 'external' && parsed.src) {
        return (
          <Script
            id="adsense-custom-script"
            src={parsed.src}
            strategy="lazyOnload"
            {...(parsed.attrs?.async && { async: true })}
            {...(parsed.attrs?.crossOrigin && { crossOrigin: parsed.attrs.crossOrigin as 'anonymous' | 'use-credentials' })}
          />
        );
      } else if (parsed.type === 'inline' && parsed.content) {
        return (
          <Script
            id="adsense-custom-script"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{ __html: parsed.content }}
          />
        );
      }
    }
    
    // Default: use the publisherId to generate standard script
    return (
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisherId}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
    );
  };

  return (
    <AdSenseContext.Provider value={settings}>
      {renderScript()}
      {children}
    </AdSenseContext.Provider>
  );
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

// Individual ad unit component
interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdUnit({ slot, format = 'auto', responsive = true, className = '', style }: AdUnitProps) {
  const settings = useAdSense();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);
  const [adLoaded, setAdLoaded] = useState(false);

  const loadAd = useCallback(() => {
    if (!adLoaded && settings?.isEnabled && settings?.publisherId && !isExcluded && slot) {
      try {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [adLoaded, settings, isExcluded, slot]);

  useEffect(() => {
    // Load ad after a short delay to ensure script is loaded
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [loadAd]);

  if (!settings?.isEnabled || !settings?.publisherId || isExcluded || !slot) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client={settings.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Pre-built ad components for different placements
export function HeaderAd({ className = '' }: { className?: string }) {
  const settings = useAdSense();
  
  if (!settings?.enableHeader || !settings?.headerSlot) {
    return null;
  }

  return (
    <AdUnit
      slot={settings.headerSlot}
      format="horizontal"
      className={`w-full max-w-4xl mx-auto my-2 ${className}`}
      style={{ minHeight: '90px' }}
    />
  );
}

export function FooterAd({ className = '' }: { className?: string }) {
  const settings = useAdSense();
  
  if (!settings?.enableFooter || !settings?.footerSlot) {
    return null;
  }

  return (
    <AdUnit
      slot={settings.footerSlot}
      format="horizontal"
      className={`w-full max-w-4xl mx-auto my-4 ${className}`}
      style={{ minHeight: '90px' }}
    />
  );
}

export function SidebarAd({ className = '' }: { className?: string }) {
  const settings = useAdSense();
  
  if (!settings?.enableSidebar || !settings?.sidebarSlot) {
    return null;
  }

  return (
    <AdUnit
      slot={settings.sidebarSlot}
      format="vertical"
      className={`w-full ${className}`}
      style={{ minHeight: '250px' }}
    />
  );
}

export function InArticleAd({ className = '' }: { className?: string }) {
  const settings = useAdSense();
  
  if (!settings?.enableInArticle || !settings?.inArticleSlot) {
    return null;
  }

  return (
    <AdUnit
      slot={settings.inArticleSlot}
      format="auto"
      className={`w-full my-6 ${className}`}
      style={{ minHeight: '280px' }}
    />
  );
}

// Auto Ads component (just needs the script, which is loaded by provider)
export function AutoAds() {
  const settings = useAdSense();
  const isExcluded = useIsExcludedPage(settings?.excludedPages || null);

  // Auto ads are handled automatically by the AdSense script when enabled
  // This component is just a placeholder for clarity
  if (!settings?.isEnabled || !settings?.enableAutoAds || isExcluded) {
    return null;
  }

  return null;
}
