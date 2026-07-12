import type { MetadataRoute } from 'next';
import { query, getPool } from '@/lib/db';
import { getBaseUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Base routes with explicit Next.js Sitemap type to allow multiple changeFrequency values
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    // 1. Fetch categories dynamically
    const categories = await query('SELECT slug FROM categories');
    if (categories && categories.length > 0) {
      categories.forEach((category: any) => {
        routes.push({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      });
    }

    // 2. Fetch products dynamically from high-performance database
    const products = await query('SELECT slug, created_at FROM products');
    if (products && products.length > 0) {
      products.forEach((product: any) => {
        routes.push({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.created_at ? new Date(product.created_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    // 3. Fetch custom pages dynamically
    const customPages = await query('SELECT slug FROM pages');
    if (customPages && customPages.length > 0) {
      customPages.forEach((page: any) => {
        routes.push({
          url: `${baseUrl}/${page.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('Sitemap dynamic generation error:', error);
  } finally {
    // End database pool connections during build phase so static generation doesn't hang the process
    try {
      const pool = getPool();
      if (pool) {
        await pool.end();
      }
    } catch (err) {
      console.warn('Could not end db pool in sitemap:', err);
    }
  }

  return routes;
}
