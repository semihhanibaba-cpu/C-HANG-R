import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LayoutGrid, ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { query, initializeDatabase } from '@/lib/db';
import { 
  getBaseUrl, 
  normalizeSlug, 
  generateBreadcrumbSchema 
} from '@/lib/seo';
import HomeClient from '../../home-client';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  try {
    const decodedSlug = decodeURIComponent(slug);
    const categories = await query('SELECT * FROM categories') || [];
    const category = categories.find((c: any) => 
      c.slug === slug ||
      c.slug === decodedSlug ||
      normalizeSlug(c.slug) === normalizeSlug(decodedSlug) ||
      normalizeSlug(c.name) === normalizeSlug(decodedSlug)
    );
    if (category) {
      const pageTitle = category.meta_title || `${category.name} Tedariği & Ürünleri | Hanibaba Tedarik`;
      const pageDesc = category.meta_description || `${category.name} kategorisindeki en kaliteli kurumsal ofis ve işyeri malzemelerini, avantajlı cari ödeme imkanlarıyla Hanibaba Tedarik'ten sipariş edin.`;
      const pageKeywords = category.meta_keywords || `${category.name}, ofis malzemeleri, toptan tedarik`;
      const categoryUrl = `${baseUrl}/categories/${category.slug}`;

      return {
        title: pageTitle,
        description: pageDesc,
        keywords: pageKeywords,
        alternates: {
          canonical: categoryUrl,
          languages: {
            'tr-TR': categoryUrl,
          },
        },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          url: categoryUrl,
          siteName: 'Hanibaba Tedarik',
          locale: 'tr_TR',
          type: 'website',
          images: [
            {
              url: category.image_url || `${baseUrl}/logo.png`,
              width: 800,
              height: 600,
              alt: category.name,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description: pageDesc,
          images: [category.image_url || `${baseUrl}/logo.png`],
        },
      };
    }
  } catch (error) {
    console.error('generateMetadata error:', error);
  }

  return {
    title: 'Kategori Ürünleri | Hanibaba Tedarik',
    description: 'En uygun fiyatlar ve zengin seçeneklerle kurumsal ofis malzemeleri.',
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  
  let currentCategory: any = null;
  let allCategories: any[] = [];
  let categoryProducts: any[] = [];
  let allProducts: any[] = [];
  let allSliders: any[] = [];
  let allStories: any[] = [];
  let siteConfigs: any = null;

  try {
    await initializeDatabase();

    // 1. Fetch categories
    allCategories = await query('SELECT * FROM categories') || [];
    const decodedSlug = decodeURIComponent(slug);
    currentCategory = allCategories.find((c: any) => 
      c.slug === slug ||
      c.slug === decodedSlug ||
      normalizeSlug(c.slug) === normalizeSlug(decodedSlug) ||
      normalizeSlug(c.name) === normalizeSlug(decodedSlug)
    );

    // 2. Fetch products
    let productsQuery = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    let productsParams: any[] = [];
    if (currentCategory) {
      productsQuery += ' WHERE p.category_id = ?';
      productsParams.push(currentCategory.id);
    }
    categoryProducts = await query(productsQuery, productsParams) || [];
    allProducts = await query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC') || [];

    // 3. Fetch auxiliary tables for HomeClient shell
    allSliders = await query('SELECT * FROM sliders') || [];
    allStories = await query('SELECT * FROM stories') || [];
    
    const configsRows = await query('SELECT `key`, `value` FROM configs') || [];
    siteConfigs = {
      site_name: 'Hanibaba Tedarik',
      site_logo_type: 'text',
      site_logo: '',
      site_address: 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No:103',
      site_phone: '05010160527',
      site_email: 'info@hbtedar.com'
    };
    configsRows.forEach((row: any) => {
      siteConfigs[row.key] = row.value || '';
    });

  } catch (error) {
    console.error('CategoryPage data fetching error:', error);
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <LayoutGrid className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-black text-slate-800 uppercase font-display">Kategori Bulunamadı</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-md">Aradığınız ürün kategorisi sistemimizde kayıtlı olmayabilir veya silinmiş olabilir.</p>
        <Link href="/" className="mt-6 bg-[#00509a] text-white px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-md hover:bg-blue-800 transition-all">
          Anasayfaya Dön
        </Link>
      </div>
    );
  }

  const categoryUrl = `${baseUrl}/categories/${slug}`;

  // Generate JSON-LD CollectionPage schema
  const schemaJsonLD = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': `${currentCategory.name} Tedariği & Ürünleri`,
    'description': currentCategory.description || `${currentCategory.name} kategorisindeki kurumsal ofis malzemeleri ve toptan tedarik imkanları.`,
    'url': categoryUrl,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': categoryProducts.map((p: any, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': p.name,
          'image': p.image_url || 'https://picsum.photos/seed/product/400/400',
          'description': p.description || p.name,
          'sku': p.sku || `SKU-${p.id}`,
          'mpn': p.sku || `MPN-${p.id}`,
          'brand': {
            '@type': 'Brand',
            'name': p.brand || 'Hanibaba Tedarik'
          },
          'offers': {
            '@type': 'Offer',
            'priceCurrency': 'TRY',
            'price': Number(p.price).toFixed(2),
            'priceValidUntil': '2028-12-31',
            'itemCondition': 'https://schema.org/NewCondition',
            'availability': p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            'seller': {
              '@type': 'Organization',
              'name': 'Hanibaba Tedarik'
            }
          }
        }
      }))
    }
  };

  // Generate dynamic Breadcrumbs schema
  const breadcrumbItems = [
    { name: 'Anasayfa', url: baseUrl },
    { name: currentCategory.name, url: categoryUrl }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      {/* JSON-LD Schema Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* 
        For rich crawlability and initial render SEO, render the static product list.
        Then mount HomeClient to provide the interactive, responsive store shell seamlessly!
      */}
      <div className="hidden">
        <h1>{currentCategory.name} Kategorisindeki Ürünlerimiz</h1>
        <p>{currentCategory.description || `${currentCategory.name} kategorisindeki kaliteli ürünler.`}</p>
        
        {/* Semantic breadcrumbs in static crawl space */}
        <nav aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Anasayfa</Link></li>
            <li><ChevronRight /></li>
            <li><Link href={`/categories/${slug}`}>{currentCategory.name}</Link></li>
          </ol>
        </nav>

        <ul>
          {categoryProducts.map((p: any) => (
            <li key={p.id}>
              <Link href={`/products/${p.slug}`}>
                {p.name} - {p.price} TL
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <HomeClient
        initialCategories={allCategories}
        initialProducts={allProducts}
        initialSliders={allSliders}
        initialStories={allStories}
        initialConfigs={siteConfigs}
        initialTab="products"
        initialSelectedCategoryId={currentCategory.id}
      />
    </>
  );
}
