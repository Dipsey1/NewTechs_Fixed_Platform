'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adLayout?: string;
  adLayoutKey?: string;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSense({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  style = { display: 'block' },
  className = '',
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with actual publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Sidebar Ad Component
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Advertisement
      </div>
      <AdSense
        adSlot="1234567890" // Replace with actual ad slot
        adFormat="rectangle"
        style={{ display: 'block', width: '100%', height: '250px' }}
        className="rounded-lg"
      />
    </div>
  );
}

// In-Article Ad Component
export function InArticleAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Advertisement
      </div>
      <AdSense
        adSlot="0987654321" // Replace with actual ad slot
        adFormat="auto"
        adLayout="in-article"
        style={{ display: 'block', textAlign: 'center' }}
        className="rounded-lg"
      />
    </div>
  );
}

// Banner Ad Component
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Advertisement
      </div>
      <AdSense
        adSlot="1122334455" // Replace with actual ad slot
        adFormat="horizontal"
        style={{ display: 'block', width: '100%', height: '90px' }}
        className="rounded-lg"
      />
    </div>
  );
}

// Mobile Ad Component
export function MobileAd({ className = '' }: { className?: string }) {
  return (
    <div className={`md:hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Advertisement
      </div>
      <AdSense
        adSlot="5566778899" // Replace with actual ad slot
        adFormat="auto"
        style={{ display: 'block', width: '100%' }}
        className="rounded-lg"
      />
    </div>
  );
}

