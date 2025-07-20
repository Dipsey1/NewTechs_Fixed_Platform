'use client';

import Image from 'next/image';
import Link from 'next/link';

interface AffiliateBannerProps {
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  buttonText?: string;
  sponsored?: boolean;
  className?: string;
}

export function AffiliateBanner({
  title,
  description,
  imageUrl,
  affiliateUrl,
  buttonText = 'Learn More',
  sponsored = true,
  className = '',
}: AffiliateBannerProps) {
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 ${className}`}>
      {sponsored && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Sponsored Content
        </div>
      )}
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain rounded-lg"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
          <Link
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Sidebar Affiliate Widget
export function SidebarAffiliateWidget({ className = '' }: { className?: string }) {
  const affiliateProducts = [
    {
      title: 'Best Tech Gadgets 2024',
      description: 'Discover the coolest tech gadgets handpicked by our experts.',
      imageUrl: '/design_assets/affiliate-tech-gadgets.png',
      affiliateUrl: 'https://example.com/tech-gadgets?ref=newtechs',
      buttonText: 'Shop Now',
    },
    {
      title: 'Crypto Trading Course',
      description: 'Learn crypto trading from industry professionals.',
      imageUrl: '/design_assets/affiliate-crypto-course.png',
      affiliateUrl: 'https://example.com/crypto-course?ref=newtechs',
      buttonText: 'Enroll Today',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Recommended Products
      </h3>
      {affiliateProducts.map((product, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Sponsored
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-contain rounded"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                {product.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                {product.description}
              </p>
              <Link
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {product.buttonText}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// In-Content Affiliate Banner
export function InContentAffiliateBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <AffiliateBanner
        title="Premium Tech Newsletter"
        description="Get exclusive tech insights and early access to the latest gadget reviews. Join 50,000+ tech enthusiasts."
        imageUrl="/design_assets/newsletter-premium.png"
        affiliateUrl="https://example.com/premium-newsletter?ref=newtechs"
        buttonText="Subscribe Premium"
        sponsored={true}
      />
    </div>
  );
}

// Footer Affiliate Section
export function FooterAffiliateSection({ className = '' }: { className?: string }) {
  const partners = [
    {
      name: 'TechStore',
      logo: '/design_assets/partner-techstore.png',
      url: 'https://example.com/techstore?ref=newtechs',
    },
    {
      name: 'CryptoExchange',
      logo: '/design_assets/partner-crypto.png',
      url: 'https://example.com/crypto?ref=newtechs',
    },
    {
      name: 'CloudHosting',
      logo: '/design_assets/partner-hosting.png',
      url: 'https://example.com/hosting?ref=newtechs',
    },
    {
      name: 'DevTools',
      logo: '/design_assets/partner-devtools.png',
      url: 'https://example.com/devtools?ref=newtechs',
    },
  ];

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 py-8 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Our Partners
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Trusted by the tech community
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <Link
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="relative w-24 h-12">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain filter grayscale hover:grayscale-0 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Some links may be affiliate links. We may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}

