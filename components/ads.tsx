'use client';

import React from 'react';

// Ads system removed - stub exports to keep imports valid

interface StubProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function AdProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export { AdProvider as AdSenseProvider };

export function useAds() {
  return null;
}
export { useAds as useAdSense };

export function HeaderAd(_props?: StubProps) { return null; }
export function FooterAd(_props?: StubProps) { return null; }
export function SidebarAd(_props?: StubProps) { return null; }
export function InArticleAd(_props?: StubProps) { return null; }
export function CourseAd(_props?: StubProps) { return null; }
export function HtmlAd(_props?: StubProps) { return null; }
export function AdPlacement(_props?: StubProps) { return null; }
