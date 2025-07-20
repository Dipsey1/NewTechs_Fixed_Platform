'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { blogUtils, Blog, Post } from '@/lib/api';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function FeaturedPostCard({ post }: { post: Post }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {post.featured_image && (
        <div className="relative h-48 w-full">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="text-xs px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: `${post.blog.primary_color}20`,
              color: post.blog.primary_color 
            }}
          >
            {post.blog.name}
          </span>
          {post.categories.map((category) => (
            <span
              key={category.id}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
            >
              {category.name}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-bold mb-3 line-clamp-2">
          <Link
            href={`/${post.blog.slug}/${post.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {post.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>By {post.author.name}</span>
          <time dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
        </div>
      </div>
    </article>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div 
        className="h-32 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${blog.primary_color}20 0%, ${blog.secondary_color}20 100%)`,
        }}
      >
        <Image
          src={blog.logo_url}
          alt={blog.title}
          width={80}
          height={80}
          className="rounded-lg shadow-md"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {blog.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {blog.tagline}
        </p>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {blog.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {blog.post_count} posts
          </span>
          
          <Link
            href={`/${blog.slug}`}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: blog.primary_color }}
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [blogsData, featuredData] = await Promise.all([
          blogUtils.getAllBlogs(),
          blogUtils.getFeaturedContent(6),
        ]);
        
        setBlogs(blogsData);
        setFeaturedPosts(featuredData);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/design_assets/newtechs_logo_main.png"
              alt="NewTechs Logo"
              width={150}
              height={150}
              className="drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            NewTechs
            <span className="block text-2xl md:text-3xl font-normal mt-2 text-cyan-200">
              The Coolest Techs on Ice ❄️
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Discover cutting-edge technology insights across our network of specialized tech blogs. 
            From crypto to AI, we&apos;ve got the coolest tech content on the web.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/newtechs"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Explore Main Blog
            </Link>
            <Link
              href="#blogs"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse All Blogs
            </Link>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-cyan-300/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-300/20 rounded-full animate-ping"></div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Articles
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover the latest and most popular content from across our tech blog network
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Blogs Section */}
      <section id="blogs" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Blog Network
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our specialized blogs covering different aspects of technology and innovation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Cool with Tech Updates
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Get the latest tech insights delivered straight to your inbox
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-sm text-blue-200 mt-4">
            Join 10,000+ tech enthusiasts. No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {blogs.length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Specialized Blogs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                {blogs.reduce((total, blog) => total + blog.post_count, 0)}+
              </div>
              <div className="text-gray-600 dark:text-gray-300">Articles Published</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-2">
                10K+
              </div>
              <div className="text-gray-600 dark:text-gray-300">Monthly Readers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-300">Fresh Content</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

