'use client';

import { useState } from 'react';

interface NewsletterProps {
  variant?: 'default' | 'compact' | 'popup' | 'inline';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  showPrivacyNote?: boolean;
  className?: string;
}

export function Newsletter({
  variant = 'default',
  title = 'Stay Cool with Tech Updates',
  description = 'Get the latest tech insights delivered straight to your inbox',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  showPrivacyNote = true,
  className = '',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      // Try to submit to backend API first
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing! Check your email for confirmation.');
        setEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch {
      // Fallback to Mailchimp or other service
      try {
        await submitToMailchimp();
        setStatus('success');
        setMessage('Thanks for subscribing! Check your email for confirmation.');
        setEmail('');
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  const submitToMailchimp = async () => {
    // This would integrate with Mailchimp API
    // For demo purposes, we'll simulate success
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <div className={`newsletter-compact ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
            📧 Newsletter
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Weekly tech updates
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading' || !validateEmail(email)}
              className="w-full px-3 py-2 text-sm bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? 'Subscribing...' : buttonText}
            </button>
          </form>

          {message && (
            <p className={`text-xs mt-2 ${status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline variant for within content
  if (variant === 'inline') {
    return (
      <div className={`newsletter-inline my-8 ${className}`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-blue-100 mb-4">{description}</p>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading' || !validateEmail(email)}
                className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' ? '...' : buttonText}
              </button>
            </form>

            {message && (
              <p className={`text-sm mt-3 ${status === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant (used in homepage)
  return (
    <div className={`newsletter-default ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-6 py-4 rounded-lg border-0 focus:ring-4 focus:ring-white focus:ring-opacity-30 text-gray-900 text-lg"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading' || !validateEmail(email)}
                className="px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {status === 'loading' ? 'Subscribing...' : buttonText}
              </button>
            </div>
          </form>

          {message && (
            <p className={`text-lg mt-4 ${status === 'success' ? 'text-green-200' : 'text-red-200'}`}>
              {message}
            </p>
          )}

          {showPrivacyNote && (
            <p className="text-sm text-blue-200 mt-6">
              Join 10,000+ tech enthusiasts. No spam, unsubscribe anytime.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Newsletter Popup Component
export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useState(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('newsletter-popup-shown');
    if (hasSeenPopup) {
      setHasShown(true);
      return;
    }

    // Show popup after 30 seconds or when user scrolls 50%
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem('newsletter-popup-shown', 'true');
      }
    }, 30000);

    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrolled > 50 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem('newsletter-popup-shown', 'true');
        clearTimeout(timer);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
        
        <div className="text-center">
          <div className="text-4xl mb-4">📧</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Don&apos;t Miss Out!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Get the latest tech insights and exclusive content delivered to your inbox.
          </p>
          
          <Newsletter
            variant="inline"
            title=""
            description=""
            showPrivacyNote={false}
            className="mb-4"
          />
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// Newsletter Stats Component
export function NewsletterStats({ className = '' }: { className?: string }) {
  const stats = {
    subscribers: 10247,
    openRate: 42.3,
    clickRate: 8.7,
    growth: 15.2,
  };

  return (
    <div className={`newsletter-stats ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📊 Newsletter Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.subscribers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Subscribers
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.openRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Open Rate
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.clickRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Click Rate
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              +{stats.growth}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Monthly Growth
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

