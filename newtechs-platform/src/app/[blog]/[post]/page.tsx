import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, seoUtils, Blog, Post } from '@/lib/api';

interface PostPageProps {
  params: Promise<{
    blog: string;
    post: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const [blogResponse, postResponse] = await Promise.all([
      apiClient.getBlog(resolvedParams.blog),
      apiClient.getPost(resolvedParams.blog, resolvedParams.post),
    ]);

    if (!blogResponse.success || !postResponse.success) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }

    const meta = seoUtils.generatePostMeta(postResponse.post, blogResponse.blog);
    
    return {
      title: meta.title,
      description: meta.description,
      openGraph: meta.openGraph,
      twitter: meta.twitter,
      alternates: {
        canonical: meta.canonical,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the post.',
    };
  }
}

async function getPostData(blogSlug: string, postSlug: string) {
  try {
    const [postResponse, blogResponse] = await Promise.all([
      apiClient.getPost(blogSlug, postSlug),
      apiClient.getBlog(blogSlug),
    ]);

    if (!postResponse.success || !blogResponse.success) {
      return null;
    }

    // Get related posts from the same blog
    const relatedPostsResponse = await apiClient.getBlogPosts(blogSlug, { 
      per_page: 4 
    });

    const relatedPosts = relatedPostsResponse.success 
      ? relatedPostsResponse.posts.filter(p => p.id !== postResponse.post.id).slice(0, 3)
      : [];

    return {
      post: postResponse.post,
      blog: blogResponse.blog,
      relatedPosts,
    };
  } catch (error) {
    console.error('Error fetching post data:', error);
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

function ReadingTime({ content }: { content: string }) {
  const wordsPerMinute = 200;
  const textLength = content.replace(/<[^>]*>/g, '').split(' ').length;
  const readingTime = Math.ceil(textLength / wordsPerMinute);
  
  return (
    <span className="text-gray-500 dark:text-gray-400">
      {readingTime} min read
    </span>
  );
}

function ShareButtons({ post, blog }: { post: Post; blog: Blog }) {
  const url = `https://your-domain.com/${blog.slug}/${post.slug}`;
  const title = post.title;
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>
      <div className="flex gap-2">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          aria-label="Share on Twitter"
        >
          🐦
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          aria-label="Share on Facebook"
        >
          📘
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
          aria-label="Share on LinkedIn"
        >
          💼
        </a>
        <a
          href={shareLinks.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          aria-label="Share on Reddit"
        >
          🔗
        </a>
      </div>
    </div>
  );
}

function RelatedPosts({ posts, blog }: { posts: Post[]; blog: Blog }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Related Posts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {post.featured_image && (
              <div className="relative h-32 w-full">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-semibold mb-2 line-clamp-2">
                <Link
                  href={`/${blog.slug}/${post.slug}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.title}
                </Link>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {post.excerpt}
              </p>
              <time className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                {formatDate(post.published_at)}
              </time>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const data = await getPostData(resolvedParams.blog, resolvedParams.post);
  
  if (!data) {
    notFound();
  }

  const { post, blog, relatedPosts } = data;
  const structuredData = seoUtils.generateStructuredData(post, blog);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <span>/</span>
            <Link 
              href={`/${blog.slug}`} 
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {blog.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white truncate">
              {post.title}
            </span>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Header */}
        <header className="mb-8">
          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${blog.slug}?category=${category.slug}`}
                  className="text-sm px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${blog.primary_color}20`,
                    color: blog.primary_color 
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <span>By</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </span>
            </div>
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
            <ReadingTime content={post.content || ''} />
            <span>{post.views} views</span>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Article Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <ShareButtons post={post} blog={blog} />
          
          {/* Author Bio */}
          {post.author.bio && (
            <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                About {post.author.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {post.author.bio}
              </p>
            </div>
          )}
        </footer>

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} blog={blog} />
      </article>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </div>
  );
}

