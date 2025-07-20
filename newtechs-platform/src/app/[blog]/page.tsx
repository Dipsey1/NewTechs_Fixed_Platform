import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, blogUtils, seoUtils, Blog, Post } from '@/lib/api';

interface BlogPageProps {
  params: Promise<{
    blog: string;
  }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await blogUtils.getBlogBySlug(resolvedParams.blog);
  
  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog could not be found.',
    };
  }

  const meta = seoUtils.generateBlogMeta(blog);
  
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: {
      canonical: meta.canonical,
    },
  };
}

// Generate static params for known blogs
export async function generateStaticParams() {
  try {
    const blogs = await blogUtils.getAllBlogs();
    return blogs.map((blog) => ({
      blog: blog.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

async function getBlogData(slug: string, page: number = 1, category?: string) {
  try {
    const [blogResponse, postsResponse, categoriesResponse] = await Promise.all([
      apiClient.getBlog(slug),
      apiClient.getBlogPosts(slug, { page, per_page: 12, category }),
      apiClient.getBlogCategories(slug),
    ]);

    if (!blogResponse.success) {
      return null;
    }

    return {
      blog: blogResponse.blog,
      posts: postsResponse.success ? postsResponse.posts : [],
      pagination: postsResponse.success ? postsResponse.pagination : null,
      categories: categoriesResponse.success ? categoriesResponse.categories : [],
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function PostCard({ post, blog }: { post: Post; blog: Blog }) {
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
          {post.categories.map((category) => (
            <Link
              key={category.id}
              href={`/${blog.slug}?category=${category.slug}`}
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${blog.primary_color}20`,
                color: blog.primary_color 
              }}
            >
              {category.name}
            </Link>
          ))}
        </div>
        
        <h2 className="text-xl font-bold mb-3 line-clamp-2">
          <Link
            href={`/${blog.slug}/${post.slug}`}
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
          </div>
          <time dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
        </div>
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

function Pagination({ pagination, blog, category }: { 
  pagination: PaginationData; 
  blog: Blog; 
  category?: string; 
}) {
  if (!pagination || pagination.pages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page.toString());
    if (category) params.append('category', category);
    const query = params.toString();
    return `/${blog.slug}${query ? `?${query}` : ''}`;
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

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const category = resolvedSearchParams.category;
  
  const data = await getBlogData(resolvedParams.blog, page, category);
  
  if (!data) {
    notFound();
  }

  const { blog, posts, pagination, categories } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Blog Header */}
      <div 
        className="relative py-20 px-4"
        style={{
          background: `linear-gradient(135deg, ${blog.primary_color}20 0%, ${blog.secondary_color}20 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Image
              src={blog.logo_url}
              alt={blog.title}
              width={120}
              height={120}
              className="rounded-lg shadow-lg"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {blog.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            {blog.tagline}
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {blog.description}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${blog.slug}`}
                className={`px-4 py-2 rounded-full transition-colors ${
                  !category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Posts
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${blog.slug}?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    category === cat.slug
                      ? 'text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  style={
                    category === cat.slug
                      ? { backgroundColor: blog.primary_color }
                      : {}
                  }
                >
                  {cat.name} ({cat.post_count})
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} blog={blog} />
              ))}
            </div>
            
            {pagination && <Pagination pagination={pagination} blog={blog} category={category} />}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {category 
                ? `No posts found in the "${category}" category.`
                : 'This blog doesn\'t have any posts yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: blog.title,
            description: blog.description,
            url: `https://your-domain.com/${blog.slug}`,
            publisher: {
              '@type': 'Organization',
              name: blog.title,
              logo: {
                '@type': 'ImageObject',
                url: blog.logo_url,
              },
            },
            blogPost: posts.map(post => ({
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              url: `https://your-domain.com/${blog.slug}/${post.slug}`,
              datePublished: post.published_at,
              dateModified: post.updated_at,
              author: {
                '@type': 'Person',
                name: post.author.name,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

