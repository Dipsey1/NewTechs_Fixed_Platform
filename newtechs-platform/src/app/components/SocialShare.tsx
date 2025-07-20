'use client';

import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  via?: string;
  className?: string;
}

export function SocialShare({
  url,
  title,
  description = '',
  hashtags = [],
  via = 'newtechs',
  className = '',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.join(',');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=${via}&hashtags=${hashtagString}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(
      shareUrl,
      'share-window',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
  };

  return (
    <div className={`social-share ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Share:
        </span>
        
        {/* Twitter */}
        <button
          onClick={() => openShareWindow(shareLinks.twitter)}
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          title="Share on Twitter"
        >
          <span>𝕏</span>
          <span className="hidden sm:inline">Twitter</span>
        </button>

        {/* Facebook */}
        <button
          onClick={() => openShareWindow(shareLinks.facebook)}
          className="flex items-center gap-1 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
          title="Share on Facebook"
        >
          <span>📘</span>
          <span className="hidden sm:inline">Facebook</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => openShareWindow(shareLinks.linkedin)}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          title="Share on LinkedIn"
        >
          <span>💼</span>
          <span className="hidden sm:inline">LinkedIn</span>
        </button>

        {/* Reddit */}
        <button
          onClick={() => openShareWindow(shareLinks.reddit)}
          className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          title="Share on Reddit"
        >
          <span>🔴</span>
          <span className="hidden sm:inline">Reddit</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => openShareWindow(shareLinks.whatsapp)}
          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          title="Share on WhatsApp"
        >
          <span>💬</span>
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Email */}
        <button
          onClick={() => window.location.href = shareLinks.email}
          className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          title="Share via Email"
        >
          <span>📧</span>
          <span className="hidden sm:inline">Email</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          title="Copy Link"
        >
          <span>{copied ? '✅' : '🔗'}</span>
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}

// Floating Social Share Component
export function FloatingSocialShare(props: SocialShareProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show/hide based on scroll position
  useState(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const threshold = 300; // Show after scrolling 300px
      setIsVisible(scrolled > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  if (!isVisible) return null;

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mb-2">
            Share
          </span>
          
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`, 'share-window', 'width=600,height=400')}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Share on Twitter"
          >
            𝕏
          </button>
          
          <button
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`, 'share-window', 'width=600,height=400')}
            className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
            title="Share on Facebook"
          >
            📘
          </button>
          
          <button
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`, 'share-window', 'width=600,height=400')}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Share on LinkedIn"
          >
            💼
          </button>
          
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(props.url);
                // Could add a toast notification here
              } catch (error) {
                console.error('Failed to copy URL:', error);
              }
            }}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            title="Copy Link"
          >
            🔗
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact Social Share for Cards
export function CompactSocialShare({ url, title, className = '' }: { url: string; title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, 'share-window', 'width=600,height=400')}
        className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
        title="Share on Twitter"
      >
        𝕏
      </button>
      
      <button
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, 'share-window', 'width=600,height=400')}
        className="p-1 text-gray-500 hover:text-blue-700 transition-colors"
        title="Share on Facebook"
      >
        📘
      </button>
      
      <button
        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, 'share-window', 'width=600,height=400')}
        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
        title="Share on LinkedIn"
      >
        💼
      </button>
    </div>
  );
}

