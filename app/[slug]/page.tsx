import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { query, initializeDatabase } from '@/lib/db';
import { getBaseUrl, normalizeSlug, generateBreadcrumbSchema } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  try {
    await initializeDatabase();
    const decodedSlug = decodeURIComponent(slug);
    
    // Check if it's a valid custom page
    const pages = await query('SELECT * FROM pages WHERE slug = ?', [decodedSlug]) || [];
    const page = pages[0];

    if (page) {
      const pageTitle = page.meta_title || `${page.title} | Hanibaba Tedarik`;
      const pageDesc = page.meta_description || `${page.title} hakkında detaylı bilgi, en uygun kurumsal ofis tedarik çözümleri Hanibaba Tedarik'te!`;
      const pageKeywords = page.meta_keywords || `${page.title}, kurumsal tedarik, ofis kırtasiye, toptan gıda`;
      const pageUrl = `${baseUrl}/${page.slug}`;
      const imageUrl = page.image_url || `${baseUrl}/logo.png`;

      return {
        title: pageTitle,
        description: pageDesc,
        keywords: pageKeywords,
        alternates: {
          canonical: pageUrl,
          languages: {
            'tr-TR': pageUrl,
          },
        },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          url: pageUrl,
          siteName: 'Hanibaba Tedarik',
          locale: 'tr_TR',
          type: 'article',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: page.title,
            }
          ]
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description: pageDesc,
          images: [imageUrl],
        }
      };
    }
  } catch (error) {
    console.error('generateMetadata error for custom page:', error);
  }

  return {
    title: 'Sayfa | Hanibaba Tedarik',
    description: 'Hanibaba Tedarik kurumsal ofis tedarik marketiniz.',
  };
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  
  let page: any = null;

  try {
    await initializeDatabase();
    const decodedSlug = decodeURIComponent(slug);
    const pages = await query('SELECT * FROM pages WHERE slug = ?', [decodedSlug]) || [];
    page = pages[0];
  } catch (error) {
    console.error('Fetch custom page error:', error);
  }

  if (!page) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Anasayfa', url: baseUrl },
    { name: page.title, url: `${baseUrl}/${page.slug}` }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Dynamic JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" id="header-logo-link">
            <div className="relative">
              <img id="header-logo-img" src="/logo.png" alt="Hanibaba Tedarik" className="h-11 w-auto object-contain" />
              <div className="absolute -top-1.5 -right-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg border border-white shadow-md leading-none tracking-wider scale-95 select-none" id="hb-logo-badge">
                HB
              </div>
            </div>
            <span className="hidden lg:inline-block text-slate-400 text-[10px] uppercase font-bold tracking-widest border-l border-slate-200 pl-3 leading-tight" id="header-logo-tagline">
              KURUMSAL<br />TEDARİK
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors" id="header-back-link">
            <ArrowLeft className="w-4 h-4" /> Mağazaya Git
          </Link>
        </div>
      </header>

      {/* Semantic Breadcrumbs (SEO Booster) */}
      <nav className="bg-slate-100 border-b border-slate-200/50 py-3" aria-label="Breadcrumb" id="breadcrumb-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Anasayfa</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-bold truncate" aria-current="page">
            {page.title}
          </span>
        </div>
      </nav>

      {/* Custom Page content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full" id="custom-page-main">
        <article className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 md:p-10">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-display tracking-tight leading-tight">
              {page.title}
            </h1>
            <div className="w-20 h-1 bg-blue-600 rounded-full mt-4"></div>
          </header>

          {/* Hero Image if provided */}
          {page.image_url && (
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200/50 mb-8 relative">
              <img
                src={page.image_url}
                alt={page.title}
                className="w-full h-full object-cover"
                id="custom-page-hero-image"
              />
            </div>
          )}

          {/* Page Content Rendered with standard clean typography styles */}
          <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line" id="custom-page-content">
            {page.content || 'Bu sayfa için henüz bir içerik girilmemiştir.'}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-[10px] py-10 text-center animate-in fade-in duration-350" id="custom-page-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="font-bold text-slate-300 text-xs">Hanibaba Tedarik Kurumsal Ofis Marketiniz</p>
          <p className="max-w-md mx-auto text-slate-400 leading-relaxed text-xs">
            Ofis kırtasiye, gıda, temizlik ve ambalaj malzemelerinde toptan fiyatlar ve kapıya teslim avantajı.
          </p>
          <div className="flex justify-center gap-6 text-slate-400 font-semibold border-t border-slate-800/80 pt-4 mt-4 text-xs">
            <Link href="/" className="hover:text-white transition-colors">Mağaza</Link>
            <span>•</span>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Site Haritası</Link>
          </div>
          <p className="mt-4 pt-4 border-t border-slate-800/50 text-[10px] text-slate-500">Tüm Hakları Saklıdır. © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
