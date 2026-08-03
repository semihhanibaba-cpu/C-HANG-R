import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Percent, 
  ShoppingBag, 
  ChevronRight, 
  Home, 
  CheckCircle2, 
  Building2, 
  Box,
  FileText
} from 'lucide-react';
import ProductShareButton from '@/components/ProductShareButton';
import { query, initializeDatabase } from '@/lib/db';
import { 
  getBaseUrl, 
  normalizeSlug, 
  generateProductSchema, 
  generateBreadcrumbSchema 
} from '@/lib/seo';

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
    const products = await query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id') || [];
    const product = products.find((p: any) => 
      p.slug === slug ||
      p.slug === decodedSlug ||
      normalizeSlug(p.slug) === normalizeSlug(decodedSlug) ||
      normalizeSlug(p.name) === normalizeSlug(decodedSlug)
    );
    if (product) {
      const pageTitle = product.meta_title || `${product.name} | Hanibaba Tedarik`;
      const pageDesc = product.meta_description || product.description || `${product.name} en uygun fiyatlar, cari ödeme seçenekleri ve hızlı teslimat güvencesiyle Hanibaba Tedarik'te!`;
      const pageKeywords = product.meta_keywords || `${product.name}, ofis malzemeleri, toptan kırtasiye, ${product.category_name || ''}`;
      const productUrl = `${baseUrl}/products/${product.slug}`;
      const imageUrl = product.image_url || `${baseUrl}/logo.png`;

      return {
        title: pageTitle,
        description: pageDesc,
        keywords: pageKeywords,
        alternates: {
          canonical: productUrl,
          languages: {
            'tr-TR': productUrl,
          },
        },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          url: productUrl,
          siteName: 'Hanibaba Tedarik',
          locale: 'tr_TR',
          type: 'website',
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: product.name,
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
    console.error('generateMetadata error:', error);
  }

  return {
    title: 'Ürün Detayı | Hanibaba Tedarik',
    description: 'Hanibaba Tedarik güvencesiyle yüksek kaliteli kurumsal ofis tedarik ürünleri.',
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  
  let product: any = null;
  let categoryName = 'Genel';
  let categorySlug = 'genel';
  let similarProducts: any[] = [];

  try {
    await initializeDatabase();
    const decodedSlug = decodeURIComponent(slug);
    const products = await query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `) || [];
    
    product = products.find((p: any) => 
      p.slug === slug ||
      p.slug === decodedSlug ||
      normalizeSlug(p.slug) === normalizeSlug(decodedSlug) ||
      normalizeSlug(p.name) === normalizeSlug(decodedSlug)
    );

    if (product) {
      categoryName = product.category_name || 'Genel';
      categorySlug = product.category_slug || 'genel';

      similarProducts = await query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ? AND p.id != ?
        LIMIT 4
      `, [product.category_id, product.id]) || [];
      
      if (similarProducts.length === 0) {
        similarProducts = await query(`
          SELECT p.*, c.name as category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id != ?
          LIMIT 4
        `, [product.id]) || [];
      }
    }
  } catch (error) {
    console.error('Fetch product detail error:', error);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Box className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2">Ürün Bulunamadı</h2>
          <p className="text-slate-500 text-xs mb-6">Aradığınız ürün yayından kaldırılmış veya bağlantı adresi değişmiş olabilir.</p>
          <Link href="/" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-200">
            <ArrowLeft className="w-4 h-4" /> Anasayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const productSchema = generateProductSchema(product, categoryName);
  
  const breadcrumbItems = [
    { name: 'Anasayfa', url: baseUrl },
    { name: categoryName, url: `${baseUrl}/categories/${categorySlug}` },
    { name: product.name, url: `${baseUrl}/products/${product.slug}` }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center">
              <img src="/logo.png" alt="Hanibaba Tedarik" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="ml-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                B2B Portal
              </div>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3.5 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Kataloğa Dön</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-slate-100 py-3" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Anasayfa</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link href={`/categories/${categorySlug}`} className="hover:text-blue-600 transition-colors">
            {categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold truncate" aria-current="page">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Ürün Detay Kartı */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Görsel Alanı */}
            <div className="lg:col-span-5 p-6 md:p-10 bg-gradient-to-b from-slate-50/50 to-white border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between relative">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stokta Var
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/60 text-[11px] font-extrabold px-3 py-1 rounded-full">
                    Stok Tükendi
                  </span>
                )}
              </div>

              <div className="my-auto py-8 flex items-center justify-center relative group min-h-[320px]">
                <Image
                  src={product.image_url || 'https://picsum.photos/seed/placeholder/600/600'}
                  alt={product.name || 'Hanibaba Tedarik Ürün Görseli'}
                  width={400}
                  height={400}
                  priority={true}
                  unoptimized={true}
                  className="max-h-[340px] w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
                />
              </div>

              <div className="text-center text-[11px] text-slate-400 font-medium">
                Görsel temsilidir. Kurumsal ambalaj değişiklik gösterebilir.
              </div>
            </div>

            {/* Detaylar & Fiyat */}
            <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link 
                      href={`/categories/${categorySlug}`} 
                      className="inline-block text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                    >
                      {categoryName}
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-3 tracking-tight leading-snug">
                      {product.name}
                    </h1>
                  </div>
                  <div className="shrink-0 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <ProductShareButton slug={product.slug} />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-md font-mono text-slate-700 font-bold">
                    <span>SKU:</span>
                    <span>{product.sku || 'N/A'}</span>
                  </div>
                  {product.stock > 0 && (
                    <span className="text-slate-500 font-medium">
                      Mevcut Stok: <strong className="text-slate-800">{product.stock} Adet</strong>
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Ürün Açıklaması
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    {product.description || 'Bu ürün için henüz detaylı bir açıklama girilmemiştir.'}
                  </p>
                </div>
              </div>

              {/* Fiyatlandırma Kutusu */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kurumsal Toptan Fiyat</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
                        {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-lg font-bold text-slate-300">TL</span>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs font-semibold bg-slate-800 px-3 py-1 rounded-lg w-fit">
                    KDV Dahil
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Link
                    href={`/?selectProduct=${product.id}`}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4" /> Mağazada Aç ve Sipariş Et
                  </Link>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${baseUrl}/products/${product.slug} ürünü hakkında kurumsal teklif almak istiyorum.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.98]"
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" /> B2B Özel Teklif Al
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Avantaj Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/70 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Hızlı Lojistik & Sevk</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Bölgesel araçlarımızla zamanında teslimat</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:border-emerald-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Kurumsal Cari Sistem</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faturalı alım ve vadeli ödeme seçenekleri</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:border-amber-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Toptan Fiyat Avantajı</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Yüksek adetli siparişlerde özel iskonto</p>
            </div>
          </div>
        </div>

        {/* Benzer Ürünler */}
        {similarProducts.length > 0 && (
          <section className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Benzer Ürünler
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Aynı kategorideki popüler kurumsal seçenekler</p>
              </div>
              <Link href={`/categories/${categorySlug}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProducts.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="aspect-square bg-slate-50/80 rounded-xl flex items-center justify-center p-4 mb-3 relative overflow-hidden border border-slate-100 group-hover:bg-white transition-colors">
                      <Image
                        src={p.image_url || 'https://picsum.photos/seed/placeholder/300/300'}
                        alt={p.name}
                        width={200}
                        height={200}
                        unoptimized={true}
                        className="object-contain max-h-[130px] group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {p.category_name || 'Genel'}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800 mt-2 line-clamp-2 h-8 group-hover:text-blue-600 transition-colors">
                      <Link href={`/products/${p.slug}`}>
                        {p.name}
                      </Link>
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="font-black text-sm text-slate-900 font-mono">
                      {Number(p.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <Link
                      href={`/products/${p.slug}`}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      İncele
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="space-y-2">
            <p className="font-extrabold text-slate-200 text-sm tracking-wide uppercase">Hanibaba Tedarik Portal</p>
            <p className="max-w-md mx-auto text-slate-500 text-xs leading-relaxed">
              Ofis, gıda, temizlik ve ambalaj malzemelerinde kurumsal alım ve hızlı teslimat çözümleri.
            </p>
          </div>
          <div className="flex justify-center gap-6 text-slate-400 font-medium border-t border-slate-900 pt-6 max-w-xs mx-auto">
            <Link href="/" className="hover:text-white transition-colors">Mağaza</Link>
            <span>•</span>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Site Haritası</Link>
          </div>
          <p className="text-[10px] text-slate-600 pt-2">© {new Date().getFullYear()} Hanibaba Tedarik. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
