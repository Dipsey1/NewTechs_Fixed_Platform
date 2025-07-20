import { MetadataRoute } from 'next';
import { blogUtils, apiClient } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://your-domain.com';
  
  try {
    // Get all blogs
    const blogs = await blogUtils.getAllBlogs();
    
    // Base routes
    const routes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];

    // Add blog routes
    for (const blog of blogs) {
      routes.push({
        url: `${baseUrl}/${blog.slug}`,
        lastModified: new Date(blog.updated_at),
        changeFrequency: 'daily',
        priority: 0.8,
      });

      // Get posts for each blog
      try {
        const postsResponse = await apiClient.getBlogPosts(blog.slug, { per_page: 1000 });
        
        if (postsResponse.success) {
          for (const post of postsResponse.posts) {
            routes.push({
              url: `${baseUrl}/${blog.slug}/${post.slug}`,
              lastModified: new Date(post.updated_at),
              changeFrequency: 'weekly',
              priority: 0.6,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching posts for blog ${blog.slug}:`, error);
      }

      // Get categories for each blog
      try {
        const categoriesResponse = await apiClient.getBlogCategories(blog.slug);
        
        if (categoriesResponse.success) {
          for (const category of categoriesResponse.categories) {
            routes.push({
              url: `${baseUrl}/${blog.slug}?category=${category.slug}`,
              lastModified: new Date(category.created_at),
              changeFrequency: 'weekly',
              priority: 0.4,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching categories for blog ${blog.slug}:`, error);
      }
    }

    return routes;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return minimal sitemap if there's an error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}

