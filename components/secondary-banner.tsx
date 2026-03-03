'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Clock } from 'lucide-react';

interface SecondaryBannerData {
  id: string;
  title: string;
  description: string | null;
  badgeText: string | null;
  linkUrl: string | null;
  linkText: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  showTimer: boolean;
  marqueeSpeed: number | null;
  endDate: string | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownTimer({ endDate, textColor }: { endDate: string; textColor: string }) {
  const calcTimeLeft = useCallback((): TimeLeft | null => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calcTimeLeft();
      setTimeLeft(tl);
      if (!tl) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-bold tracking-wider tabular-nums"
      style={{
        backgroundColor: `${textColor}15`,
        border: `1px solid ${textColor}30`,
      }}
    >
      <Clock className="h-3.5 w-3.5" />
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
    </span>
  );
}

interface SecondaryBannerProps {
  section?: string;
}

export function SecondaryBanner({ section = 'after-hero' }: SecondaryBannerProps) {
  const [banners, setBanners] = useState<SecondaryBannerData[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`/api/secondary-banner?section=${encodeURIComponent(section)}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
          }
        }
      } catch (error) {
        console.error('Error fetching secondary banners:', error);
      }
    };

    fetchBanners();
  }, [section]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      {banners.map((banner) => {
        const bg = banner.backgroundColor || '#1e40af';
        const txt = banner.textColor || '#ffffff';
        const hasTimer = banner.showTimer && banner.endDate;
        const speed = banner.marqueeSpeed || 30;
        return (
          <div
            key={banner.id}
            className="w-full overflow-hidden"
            style={{ backgroundColor: bg, color: txt }}
          >
            <div className="py-4 md:py-5">
              <div className="relative flex overflow-hidden">
                <div className="flex shrink-0 items-center" style={{ animation: `marquee ${speed}s linear infinite` }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="inline-flex items-center gap-3 whitespace-nowrap text-base md:text-lg lg:text-xl font-semibold px-6">
                      {banner.badgeText && (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${txt}20`,
                            border: `1px solid ${txt}40`,
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {banner.badgeText}
                        </span>
                      )}
                      <span className="font-bold">{banner.title}</span>
                      {banner.description && (
                        <span className="opacity-80 font-normal">— {banner.description}</span>
                      )}
                      {hasTimer && (
                        <CountdownTimer endDate={banner.endDate!} textColor={txt} />
                      )}
                      {banner.linkText && banner.linkUrl && (
                        <Link
                          href={banner.linkUrl}
                          className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
                        >
                          {banner.linkText} →
                        </Link>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex shrink-0 items-center" aria-hidden style={{ animation: `marquee2 ${speed}s linear infinite` }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="inline-flex items-center gap-3 whitespace-nowrap text-base md:text-lg lg:text-xl font-semibold px-6">
                      {banner.badgeText && (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${txt}20`,
                            border: `1px solid ${txt}40`,
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {banner.badgeText}
                        </span>
                      )}
                      <span className="font-bold">{banner.title}</span>
                      {banner.description && (
                        <span className="opacity-80 font-normal">— {banner.description}</span>
                      )}
                      {hasTimer && (
                        <CountdownTimer endDate={banner.endDate!} textColor={txt} />
                      )}
                      {banner.linkText && banner.linkUrl && (
                        <Link
                          href={banner.linkUrl}
                          className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
                        >
                          {banner.linkText} →
                        </Link>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  );
}
