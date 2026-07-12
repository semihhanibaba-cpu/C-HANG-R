import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, Percent, ShoppingBag, ChevronRight, Home } from 'lucide-react';
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

      // Benzer ürünleri getir
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
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xs border border-slate-200/60">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ürün Bulunamadı</h2>
          <p className="text-slate-500 text-xs mb-6">Aradığınız ürün yayından kaldırılmış veya taşınmış olabilir.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs">
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative">
              <img src="/logo.png" alt="Hanibaba Tedarik" className="h-11 w-auto object-contain" />
              <div className="absolute -top-1.5 -right-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg border border-white shadow-md leading-none tracking-wider scale-95 select-none">
                HB
              </div>
            </div>
            <span className="hidden lg:inline-block text-slate-400 text-[10px] uppercase font-bold tracking-widest border-l border-slate-200 pl-3 leading-tight">
              KURUMSAL<br />TEDARİK
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mağazaya Git
          </Link>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="bg-slate-100 border-b border-slate-200/50 py-3" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Anasayfa</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href={`/categories/${categorySlug}`} className="hover:text-blue-600 transition-colors">
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-bold truncate max-w-[240px] md:max-w-none" aria-current="page">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* DUZELTILEN GORSEL ALANI */}
            <div className="bg-white rounded-2xl border border-slate-200/50 p-6 flex items-center justify-center min-h-[300px] md:min-h-[400px] relative">
              <Image
                src={product.image_url || 'https://picsum.photos/seed/placeholder/600/600'}
                alt={product.name || 'Hanibaba Tedarik Ürün Görseli'}
                width={450}
                height={450}
                priority={true} // Sayfa hızını artırmak ve ilk yüklemede resmi göstermek için priority eklendi
                unoptimized={true} // Dışarıdan gelen resimlerin engellenmesini önlemek için eklendi
                className="max-h-[350px] w-auto object-contain drop-shadow-sm rounded-lg"
              />
            </div>

            {/* Bilgiler */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      {categoryName}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-3 font-display tracking-tight leading-tight">
                      {product.name}
                    </h1>
                  </div>
                  <ProductShareButton slug={product.slug} />
                </div>

                <div className="flex flex-wrap gap-4 items-center text-xs text-slate-500 mt-4 border-b border-slate-100 pb-4">
                  <span className="font-mono">Stok Kodu (SKU): <strong className="text-slate-700">{product.sku}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span className={product.stock > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    Stok Durumu: {product.stock > 0 ? `${product.stock} Adet` : 'Tükendi'}
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ürün Açıklaması</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {product.description || 'Bu ürün için detaylı bir açıklama girilmemiştir.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight font-display">
                    {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-bold text-slate-500">TL</span>
                  <span className="text-slate-400 text-[10px] font-bold ml-2">(KDV Dahil)</span>
                </div>

                <Link
                  href={`/?selectProduct=${product.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-100 uppercase tracking-wider text-center"
                >
                  <ShoppingBag className="w-4 h-4" /> Mağazada Aç ve Satın Al
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bilgilendirme Bannerı */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white border border-slate-200/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Hızlı & Güvenli Sevk</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">İstanbul içi 24 saatte teslimat</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Kurumsal Cari Sistem</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">B2B Cari ve vadelendirme desteği</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Percent className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Toptan Fiyat Avantajı</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Adetli siparişlerde ek iskontolar</p>
            </div>
          </div>
        </div>

        {/* Benzer Ürünler */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-extrabold text-slate-900 font-display tracking-tight mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              İlginizi Çekebilecek Diğer Ürünler
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="aspect-square bg-white rounded-xl flex items-center justify-center p-3 mb-3 relative overflow-hidden border border-slate-100">
                      <Image
                        src={p.image_url || 'https://picsum.photos/seed/placeholder/300/300'}
                        alt={p.name}
                        width={200}
                        height={200}
                        unoptimized={true}
                        className="object-contain max-h-[140px]"
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">
                      {p.category_name || 'Genel'}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800 mt-2 line-clamp-2 h-8 hover:text-blue-600 transition-colors">
                      <Link href={`/products/${p.slug}`}>
                        {p.name}
                      </Link>
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="font-extrabold text-sm text-slate-900 font-display">
                      {Number(p.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <Link
                      href={`/products/${p.slug}`}
                      className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
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
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-[10px] py-10 text-center">
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
                
