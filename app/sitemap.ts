import type { MetadataRoute } from 'next';
import { query, getPool } from '@/lib/db';
import { getBaseUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Ana sayfa rotası
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    // 1. Kategorileri dinamik olarak çek
    const categories = await query('SELECT slug FROM categories');
    if (categories && categories.length > 0) {
      categories.forEach((category: any) => {
        routes.push({
          url: `${baseUrl}/categories/${category.slug}`, // Eğer link yapın direkt domain.com/slug ise '/categories' kısmını silebilirsin
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      });
    }

    // 2. Ürünleri dinamik olarak çek
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

    // 3. Özel sayfaları (SEO sayfalarını) çek
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
    // Sadece Next.js build (derleme) aşamasındaysak havuzu kapat ki süreç askıda kalmasın.
    // Canlıda sayfa yenilenirken (runtime) havuz asla kapatılmamalı!
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
      try {
        const pool = getPool();
        if (pool) {
          await pool.end();
          console.log('Database pool ended safely during build phase.');
        }
      } catch (err) {
        console.warn('Could not end db pool in sitemap:', err);
      }
    }
  }

  return routes;
}
