'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TrendingPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  blog: {
    name: string;
    slug: string;
    color: string;
  };
  author: string;
  publishedAt: string;
  readTime: number;
  views: number;
  featuredImage?: string;
  trending_score: number;
}

interface TrendingPostsProps {
  limit?: number;
  timeframe?: 'day' | 'week' | 'month' | 'all';
  blogSlug?: string; // If specified, only show trending from this blog
  className?: string;
}

export function TrendingPosts({
  limit = 5,
  timeframe = 'week',
  blogSlug,
  className = '',
}: TrendingPostsProps) {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        timeframe,
      });

      if (blogSlug) {
        params.append('blog', blogSlug);
      }

      const response = await fetch(`/api/trending?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        throw new Error('Failed to fetch trending posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending posts');
      // Use mock data for demo
      setPosts(getMockTrendingPosts());
    } finally {
      setLoading(false);
    }
  }, [limit, timeframe, blogSlug]);

  useEffect(() => {
    fetchTrendingPosts();
  }, [fetchTrendingPosts]);

  const getMockTrendingPosts = (): TrendingPost[] => [
    {
      id: '1',
      title: 'The Future of AI: What to Expect in 2024',
      slug: 'future-of-ai-2024',
      excerpt: 'Exploring the latest developments in artificial intelligence and machine learning.',
      blog: { name: 'NewTechs', slug: 'newtechs', color: '#00D4FF' },
      author: 'Abdoulie Dibbasey',
      publishedAt: '2024-01-15',
      readTime: 8,
      views: 15420,
      trending_score: 95,
    },
    {
      id: '2',
      title: 'Bitcoin Reaches New All-Time High',
      slug: 'bitcoin-new-ath',
      excerpt: 'Cryptocurrency markets surge as Bitcoin breaks previous records.',
      blog: { name: 'Crypto Updates', slug: 'crypto', color: '#FFD700' },
      author: 'Abdoulie Dibbasey',
      publishedAt: '2024-01-14',
      readTime: 5,
      views: 12350,
      trending_score: 88,
    },
    {
      id: '3',
      title: 'Top 10 Tech Gadgets of 2024',
      slug: 'top-tech-gadgets-2024',
      excerpt: 'Must-have technology gadgets that are revolutionizing our daily lives.',
      blog: { name: 'TechSpot365', slug: 'techspot', color: '#00FF88' },
      author: 'Abdoulie Dibbasey',
      publishedAt: '2024-01-13',
      readTime: 12,
      views: 9870,
      trending_score: 82,
    },
    {
      id: '4',
      title: 'Startup Success Stories from The Gambia',
      slug: 'gambia-startup-success',
      excerpt: 'How local entrepreneurs are building successful tech companies.',
      blog: { name: 'The Gambia Network', slug: 'gambia', color: '#FF6B35' },
      author: 'Abdoulie Dibbasey',
      publishedAt: '2024-01-12',
      readTime: 10,
      views: 7650,
      trending_score: 75,
    },
    {
      id: '5',
      title: 'Machine Learning for Beginners',
      slug: 'ml-for-beginners',
      excerpt: 'A comprehensive guide to getting started with machine learning.',
      blog: { name: 'TheMasterMinds', slug: 'masterminds', color: '#8B5CF6' },
      author: 'Abdoulie Dibbasey',
      publishedAt: '2024-01-11',
      readTime: 15,
      views: 6420,
      trending_score: 70,
    },
  ];

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`trending-posts ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`trending-posts ${className}`}>
        <div className="text-center py-4 text-red-500 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`trending-posts ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🔥</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Trending {timeframe === 'day' ? 'Today' : timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'All Time'}
          </h3>
        </div>

        <div className="space-y-4">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/${post.blog.slug}/${post.slug}`}
              className="block group hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-3 -m-3 transition-colors"
            >
              <div className="flex gap-3">
                {/* Trending Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span
                      className="px-2 py-1 rounded text-white font-medium"
                      style={{ backgroundColor: post.blog.color }}
                    >
                      {post.blog.name}
                    </span>
                    <span>•</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      👁️ {formatViews(post.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {post.readTime} min read
                    </span>
                    <span className="flex items-center gap-1">
                      📈 {post.trending_score}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/trending"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View all trending posts →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Compact Trending Widget for Sidebar
export function CompactTrendingPosts({ limit = 3, className = '' }: { limit?: number; className?: string }) {
  return (
    <TrendingPosts
      limit={limit}
      timeframe="week"
      className={className}
    />
  );
}

// Trending Posts Page Component
export function TrendingPostsPage() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [selectedBlog, setSelectedBlog] = useState<string>('');

  const blogs = [
    { name: 'All Blogs', slug: '' },
    { name: 'NewTechs', slug: 'newtechs' },
    { name: 'Crypto Updates', slug: 'crypto' },
    { name: 'TechSpot365', slug: 'techspot' },
    { name: 'TheMasterMinds', slug: 'masterminds' },
    { name: 'The Gambia Network', slug: 'gambia' },
    { name: 'The Grand Bantaba', slug: 'bantaba' },
    { name: 'dibz inc', slug: 'dibz' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🔥 Trending Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover the most popular content across our tech blog network
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timeframe Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'day' | 'week' | 'month' | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Blog Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blog
            </label>
            <select
              value={selectedBlog}
              onChange={(e) => setSelectedBlog(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {blogs.map((blog) => (
                <option key={blog.slug} value={blog.slug}>
                  {blog.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trending Posts */}
      <TrendingPosts
        limit={20}
        timeframe={timeframe}
        blogSlug={selectedBlog || undefined}
      />
    </div>
  );
}

