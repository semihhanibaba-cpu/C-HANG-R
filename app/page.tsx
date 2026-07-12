import React from 'react';
import type { Metadata } from 'next';
import { query, initializeDatabase } from '@/lib/db';
import { 
  getBaseUrl, 
  generateOrganizationSchema, 
  generateWebsiteSchema, 
  generateLocalBusinessSchema 
} from '@/lib/seo';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  let siteName = 'Hanibaba Tedarik';
  let siteDescription = 'Avansas kalitesinde, kurumsal ve bireysel ofis ihtiyaçlarınız için tek adres. Cari hesap ve güvenli online ödeme imkanı ile Kocaeli Dilovası ve tüm Türkiye’de hizmetinizdeyiz.';
  
  try {
    await initializeDatabase();
    const configsRows = await query("SELECT `key`, `value` FROM configs WHERE `key` IN ('site_name', 'site_description', 'meta_description')") || [];
    configsRows.forEach((row: any) => {
      if (row.key === 'site_name' && row.value) siteName = row.value;
      if ((row.key === 'site_description' || row.key === 'meta_description') && row.value) siteDescription = row.value;
    });
  } catch (error) {
    console.error('generateMetadata error on homepage:', error);
  }

  return {
    title: `${siteName} | Kurumsal Ofis Tedarik Portalı`,
    description: siteDescription,
    alternates: {
      canonical: baseUrl,
      languages: {
        'tr-TR': baseUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${siteName} | Kurumsal Ofis Tedarik Portalı`,
      description: siteDescription,
      url: baseUrl,
      siteName: siteName,
      locale: 'tr_TR',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/logo.png`,
          width: 800,
          height: 600,
          alt: `${siteName} Logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} | Kurumsal Ofis Tedarik Portalı`,
      description: siteDescription,
      images: [`${baseUrl}/logo.png`],
    },
  };
}

export default async function HomePage() {
  let categories: any[] = [];
  let products: any[] = [];
  let sliders: any[] = [];
  let stories: any[] = [];
  let siteConfigs: any = null;

  try {
    await initializeDatabase();
    
    // Fetch data sequentially to respect the 2-connection pool limit of our MySQL database
    categories = await query('SELECT * FROM categories ORDER BY id ASC') || [];
    products = await query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC') || [];
    sliders = await query('SELECT * FROM sliders ORDER BY id ASC') || [];
    stories = await query('SELECT * FROM stories ORDER BY id ASC') || [];
    
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
    console.error('HomePage database query error:', error);
  }

  // Generate Google-compliant Schema.org Structured Data
  const schemaOrgLD = generateOrganizationSchema(siteConfigs);
  const schemaWebSiteLD = generateWebsiteSchema();
  const schemaLocalBusinessLD = generateLocalBusinessSchema(siteConfigs);

  const schemaProductsLD = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Öne Çıkan Ürünler',
    'numberOfItems': products.slice(0, 10).length,
    'itemListElement': products.slice(0, 10).map((p: any, index: number) => ({
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
  };

  return (
    <>
      {/* Dynamic JSON-LD Schema Markups for complete Google Shopping & Local Business Eligibility */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSiteLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLocalBusinessLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProductsLD) }}
      />

      <HomeClient
        initialCategories={categories}
        initialProducts={products}
        initialSliders={sliders}
        initialStories={stories}
        initialConfigs={siteConfigs}
      />
    </>
  );
}
