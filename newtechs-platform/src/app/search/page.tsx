'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Post, Blog } from '@/lib/api';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function SearchResultCard({ post }: { post: Post }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
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
      
      <h2 className="text-xl font-bold mb-3">
        <Link
          href={`/${post.blog.slug}/${post.slug}`}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {post.title}
        </Link>
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {post.excerpt}
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>By {post.author.name}</span>
          <span>in</span>
          <Link
            href={`/${post.blog.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {post.blog.name}
          </Link>
        </div>
        <time dateTime={post.published_at}>
          {formatDate(post.published_at)}
        </time>
      </div>
    </article>
  );
}

interface PaginationData {
  page: number;
  pages: number;
  total: number;
  per_page: number;
  has_prev: boolean;
  has_next: boolean;
}

function Pagination({ pagination, query, blog }: { 
  pagination: PaginationData; 
  query: string;
  blog?: string;
}) {
  if (!pagination || pagination.pages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (page > 1) params.append('page', page.toString());
    if (blog) params.append('blog', blog);
    return `/search?${params.toString()}`;
  };

  return (
    <nav className="flex justify-center items-center gap-2 mt-12">
      {pagination.has_prev && (
        <Link
          href={getPageUrl(pagination.page - 1)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Previous
        </Link>
      )}
      
      <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
        Page {pagination.page} of {pagination.pages}
      </span>
      
      {pagination.has_next && (
        <Link
          href={getPageUrl(pagination.page + 1)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const blog = searchParams.get('blog') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedBlog, setSelectedBlog] = useState(blog);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const blogsData = await apiClient.getBlogs();
        if (blogsData.success) {
          setBlogs(blogsData.blogs);
        }
      } catch (error) {
        console.error('Error loading blogs:', error);
      }
    }
    loadBlogs();
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query, blog, page);
    }
  }, [query, blog, page]);

  async function performSearch(searchQuery: string, blogFilter: string = '', pageNum: number = 1) {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await apiClient.searchPosts(searchQuery, {
        blog: blogFilter || undefined,
        page: pageNum,
        per_page: 10,
      });
      
      if (response.success) {
        setPosts(response.posts);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
      setPosts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams();
    params.append('q', searchQuery);
    if (selectedBlog) params.append('blog', selectedBlog);
    
    window.history.pushState({}, '', `/search?${params.toString()}`);
    performSearch(searchQuery, selectedBlog);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Search Articles
          </h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, topics, or keywords..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <select
                value={selectedBlog}
                onChange={(e) => setSelectedBlog(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Blogs</option>
                {blogs.map((blog) => (
                  <option key={blog.id} value={blog.slug}>
                    {blog.name}
                  </option>
                ))}
              </select>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Results */}
        {query && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search Results for &quot;{query}&quot;
              {blog && (
                <span className="text-gray-600 dark:text-gray-300">
                  {' '}in {blogs.find(b => b.slug === blog)?.name || blog}
                </span>
              )}
            </h2>
            {pagination && (
              <p className="text-gray-600 dark:text-gray-300">
                Found {pagination.total} result{pagination.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Searching...</span>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <SearchResultCard key={post.id} post={post} />
              ))}
            </div>
            
            {pagination && <Pagination pagination={pagination} query={query} blog={blog} />}
          </>
        ) : query ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn&apos;t find any articles matching &quot;{query}&quot;.
              {blog && " Try searching in all blogs or use different keywords."}
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Using different keywords</li>
                <li>Checking your spelling</li>
                <li>Using more general terms</li>
                <li>Searching in all blogs</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Search Our Content
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter a search term above to find articles across our blog network.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

