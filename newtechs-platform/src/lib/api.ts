// API client for NewTechs multi-blog platform
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:5000/api';

export interface Blog {
  id: number;
  name: string;
  slug: string;
  title: string;
  description: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  post_count: number;
}

export interface Author {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  post_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  blog_id: number;
  created_at: string;
  post_count: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image?: string;
  status: string;
  blog_id: number;
  author_id: number;
  views: number;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  author: Author;
  blog: Blog;
  categories: Category[];
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PostsResponse {
  success: boolean;
  posts: Post[];
  pagination: PaginationInfo;
}

export interface BlogsResponse {
  success: boolean;
  blogs: Blog[];
}

export interface SearchResponse {
  success: boolean;
  posts: Post[];
  pagination: PaginationInfo;
  query: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Blog endpoints
  async getBlogs(): Promise<BlogsResponse> {
    return this.request<BlogsResponse>('/blogs');
  }

  async getBlog(slug: string): Promise<{ success: boolean; blog: Blog }> {
    return this.request<{ success: boolean; blog: Blog }>(`/blogs/${slug}`);
  }

  // Post endpoints
  async getBlogPosts(
    blogSlug: string,
    options: {
      page?: number;
      per_page?: number;
      status?: string;
      category?: string;
    } = {}
  ): Promise<PostsResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.per_page) params.append('per_page', options.per_page.toString());
    if (options.status) params.append('status', options.status);
    if (options.category) params.append('category', options.category);

    const query = params.toString();
    const endpoint = `/blogs/${blogSlug}/posts${query ? `?${query}` : ''}`;
    
    return this.request<PostsResponse>(endpoint);
  }

  async getPost(blogSlug: string, postSlug: string): Promise<{ success: boolean; post: Post }> {
    return this.request<{ success: boolean; post: Post }>(`/blogs/${blogSlug}/posts/${postSlug}`);
  }

  async getFeaturedPosts(limit: number = 6): Promise<{ success: boolean; posts: Post[] }> {
    return this.request<{ success: boolean; posts: Post[] }>(`/featured-posts?limit=${limit}`);
  }

  // Category endpoints
  async getBlogCategories(blogSlug: string): Promise<{ success: boolean; categories: Category[] }> {
    return this.request<{ success: boolean; categories: Category[] }>(`/blogs/${blogSlug}/categories`);
  }

  // Search endpoint
  async searchPosts(
    query: string,
    options: {
      blog?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options.blog) params.append('blog', options.blog);
    if (options.page) params.append('page', options.page.toString());
    if (options.per_page) params.append('per_page', options.per_page.toString());

    return this.request<SearchResponse>(`/search?${params.toString()}`);
  }

  // Content creation endpoints
  async createPost(postData: {
    title: string;
    content: string;
    excerpt?: string;
    blog_id: number;
    author_name?: string;
    author_email?: string;
    categories?: string[];
    featured_image?: string;
    status?: string;
    is_featured?: boolean;
    meta_title?: string;
    meta_description?: string;
  }): Promise<{ success: boolean; post: Post }> {
    return this.request<{ success: boolean; post: Post }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions for common operations
export const blogUtils = {
  getBlogBySlug: async (slug: string): Promise<Blog | null> => {
    try {
      const response = await apiClient.getBlog(slug);
      return response.success ? response.blog : null;
    } catch (error) {
      console.error('Error fetching blog:', error);
      return null;
    }
  },

  getLatestPosts: async (blogSlug: string, limit: number = 5): Promise<Post[]> => {
    try {
      const response = await apiClient.getBlogPosts(blogSlug, { per_page: limit });
      return response.success ? response.posts : [];
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      return [];
    }
  },

  getAllBlogs: async (): Promise<Blog[]> => {
    try {
      const response = await apiClient.getBlogs();
      return response.success ? response.blogs : [];
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }
  },

  getFeaturedContent: async (limit: number = 6): Promise<Post[]> => {
    try {
      const response = await apiClient.getFeaturedPosts(limit);
      return response.success ? response.posts : [];
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  },
};

// SEO and metadata utilities
export const seoUtils = {
  generatePostMeta: (post: Post, blog: Blog) => ({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    canonical: `https://your-domain.com/${blog.slug}/${post.slug}`,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      url: `https://your-domain.com/${blog.slug}/${post.slug}`,
      type: 'article',
      images: post.featured_image ? [
        {
          url: post.featured_image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      article: {
        publishedTime: post.published_at,
        modifiedTime: post.updated_at,
        authors: [post.author.name],
        tags: post.categories.map(cat => cat.name),
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    },
  }),

  generateBlogMeta: (blog: Blog) => ({
    title: blog.title,
    description: blog.description,
    canonical: `https://your-domain.com/${blog.slug}`,
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: `https://your-domain.com/${blog.slug}`,
      type: 'website',
      images: blog.logo_url ? [
        {
          url: blog.logo_url,
          width: 1200,
          height: 630,
          alt: blog.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary',
      title: blog.title,
      description: blog.description,
      images: blog.logo_url ? [blog.logo_url] : [],
    },
  }),

  generateStructuredData: (post: Post, blog: Blog) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.email ? `mailto:${post.author.email}` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: blog.title,
      logo: {
        '@type': 'ImageObject',
        url: blog.logo_url,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://your-domain.com/${blog.slug}/${post.slug}`,
    },
    articleSection: post.categories.map(cat => cat.name),
    keywords: post.categories.map(cat => cat.name).join(', '),
  }),
};

