'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PromoBannerData {
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
  const [banner, setBanner] = useState<PromoBannerData | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/promo-banner', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setBanner(data);
          }
        }
      } catch (error) {
        console.error('Error fetching promo banner:', error);
      }
    };

    fetchBanner();
  }, []);

  const handleBannerClick = (e: React.MouseEvent) => {
    if (!banner?.linkUrl) return;
    
    // If user is not signed in, redirect to sign in with callback
    if (!session?.user) {
      e.preventDefault();
      const callbackUrl = encodeURIComponent(banner.linkUrl);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
    }
    // If signed in, the Link will handle navigation normally
  };

  if (!banner) {
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
      className="relative w-full z-40"
      style={{ backgroundColor: bgColor }}
    >
      {banner.linkUrl ? (
        <Link 
          href={banner.linkUrl} 
          className="block hover:opacity-95 transition-opacity"
          onClick={handleBannerClick}
        >
          <BannerContent />
        </Link>
      ) : (
        <BannerContent />
      )}
    </div>
  );
}
