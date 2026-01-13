'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface PromoBanner {
  id: string;
  title: string;
  description: string | null;
  badgeText: string | null;
  linkUrl: string | null;
  linkText: string | null;
  backgroundColor: string | null;
  textColor: string | null;
}

export function PromoBanner() {
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/promo-banner');
        if (response.ok) {
          const data = await response.json();
          setBanner(data);
        }
      } catch (error) {
        console.error('Error fetching promo banner:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanner();
  }, []);

  if (isLoading || !banner || !isVisible) {
    return null;
  }

  const bgColor = banner.backgroundColor || '#ef4444';
  const txtColor = banner.textColor || '#ffffff';

  const BannerContent = () => (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2 px-4">
      {banner.badgeText && (
        <span 
          className="px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase shrink-0"
          style={{ 
            backgroundColor: `${txtColor}20`,
            color: txtColor 
          }}
        >
          {banner.badgeText}
        </span>
      )}
      <span className="font-semibold text-sm sm:text-base text-center" style={{ color: txtColor }}>
        {banner.title}
      </span>
      {banner.description && (
        <span 
          className="text-xs sm:text-sm text-center hidden sm:inline"
          style={{ color: txtColor, opacity: 0.9 }}
        >
          {banner.description}
        </span>
      )}
      {banner.linkText && (
        <span 
          className="underline text-xs sm:text-sm font-medium shrink-0"
          style={{ color: txtColor }}
        >
          {banner.linkText} →
        </span>
      )}
    </div>
  );

  return (
    <div 
      className="relative w-full"
      style={{ backgroundColor: bgColor }}
    >
      {banner.linkUrl ? (
        <Link href={banner.linkUrl} className="block hover:opacity-95 transition-opacity">
          <BannerContent />
        </Link>
      ) : (
        <BannerContent />
      )}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        style={{ color: txtColor }}
        aria-label="Close banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
