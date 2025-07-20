'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';

const footerLinks = {
  blogs: [
    { name: 'NewTechs', href: '/' },
    { name: 'Crypto Updates', href: '/crypto' },
    { name: 'TechSpot365', href: '/techspot' },
    { name: 'TheMasterMinds', href: '/masterminds' },
    { name: 'The Gambia Network', href: '/gambia' },
    { name: 'The Grand Bantaba', href: '/bantaba' },
    { name: 'dibz inc', href: '/dibz' },
  ],
  categories: [
    { name: 'AI & Machine Learning', href: '/ai' },
    { name: 'Gadgets & Hardware', href: '/gadgets' },
    { name: 'Reviews & Comparisons', href: '/reviews' },
    { name: 'Startups & Innovation', href: '/startups' },
    { name: 'Coding & Development', href: '/coding' },
    { name: 'Tech News', href: '/news' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Advertise', href: '/advertise' },
  ],
  social: [
    { name: 'Twitter', href: 'https://twitter.com/newtechs', icon: '𝕏' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/newtechs', icon: '💼' },
    { name: 'GitHub', href: 'https://github.com/newtechs', icon: '🐙' },
    { name: 'YouTube', href: 'https://youtube.com/@newtechs', icon: '📺' },
    { name: 'RSS', href: '/rss.xml', icon: '📡' },
  ],
};

export function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image
                src={theme === 'dark' ? '/design_assets/newtechs_logo_dark.png' : '/design_assets/newtechs_logo_light.png'}
                alt="NewTechs Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              The coolest techs on ice. Stay ahead of the tech curve with cutting-edge insights, 
              reviews, and analysis across multiple specialized blogs.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Blogs */}
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Our Blogs</h3>
            <ul className="space-y-2">
              {footerLinks.blogs.map((blog) => (
                <li key={blog.name}>
                  <Link
                    href={blog.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm"
                  >
                    {blog.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-[var(--text-primary)] font-semibold mb-2">Stay Updated</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Get the latest tech insights delivered to your inbox weekly.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input flex-1 text-sm"
                required
              />
              <button
                type="submit"
                className="btn btn-primary px-6 text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-center">
          <div className="text-[var(--text-secondary)] text-sm">
            © {currentYear} NewTechs. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-[var(--text-secondary)] text-sm">Made with ❄️ by NewTechs</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[var(--text-secondary)]">Powered by</span>
              <Link
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Next.js
              </Link>
              <span className="text-xs text-[var(--text-secondary)]">•</span>
              <Link
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Vercel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

