'use client';

import React from 'react';
import { Heart, ShoppingCart, Eye, AlertTriangle, CheckCircle, Info, Tag } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  sku: string;
  image_url: string;
  category_id: number;
  category_name: string;
  is_featured: boolean;
}

interface ProductGridProps {
  products: Product[];
  categories: any[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  searchTerm: string;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  favorites: Product[];
  user: any;
  onSelectProduct: (product: Product) => void;
}

export default function ProductGrid({
  products,
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchTerm,
  onAddToCart,
  onToggleFavorite,
  favorites,
  user,
  onSelectProduct
}: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  const isFavorite = (id: number) => favorites.some(f => f.id === id);

  // Filter products on frontend if search or category is active (though API does it, keeping client filter robust is great too)
  const filteredProducts = products.filter(p => {
    if (selectedCategoryId && p.category_id !== Number(selectedCategoryId)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    }
    return true;
  });

  const getCategoryName = (id: number) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Genel';
  };

  return (
    <div className="py-6">
      {/* Category header / search info */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            {selectedCategoryId 
              ? `${getCategoryName(Number(selectedCategoryId))} Kategorisi` 
              : searchTerm 
              ? `"${searchTerm}" Arama Sonuçları` 
              : 'Tüm Ofis Malzemeleri'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Toplam {filteredProducts.length} adet ürün listeleniyor.
          </p>
        </div>

        {/* Category Pill select for mobile/desktop fallback */}
        <div className="flex gap-2 items-center text-xs">
          <span className="text-slate-500 font-medium">Hızlı Filtre:</span>
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => onSelectCategory(e.target.value ? e.target.value : null)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Ürün Bulunamadı</h3>
          <p className="text-slate-500 text-sm mt-1.5">
            Aradığınız kriterlere uygun ürünümüz şu anda bulunmuyor. Farklı bir kategori seçebilir veya arama teriminizi değiştirebilirsiniz.
          </p>
          <button
            onClick={() => { onSelectCategory(null); }}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors inline-block"
          >
            Tüm Ürünleri Gör
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const hasStock = product.stock > 0;
            const fav = isFavorite(product.id);

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all flex flex-col group relative"
              >
                {/* Image & Badges Container */}
                <Link 
                  href={`/products/${product.slug}`} 
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectProduct(product);
                  }}
                  className="relative aspect-square w-full bg-white flex items-center justify-center p-3 cursor-pointer"
                >
                  
                  {/* Absolute Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.is_featured && (
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide shadow-2xs">
                        Popüler
                      </span>
                    )}
                    {!hasStock ? (
                      <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        Tükendi
                      </span>
                    ) : product.stock <= 10 ? (
                      <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase">
                        Son {product.stock}
                      </span>
                    ) : null}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(product);
                    }}
                    className={`absolute top-2 right-2 z-10 p-1.5 rounded-full border shadow-2xs transition-all ${
                      fav 
                        ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100' 
                        : 'bg-white/90 border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
                  </button>

                  <img
                    src={product.image_url || 'https://picsum.photos/seed/placeholder/400/400'}
                    alt={product.name}
                    className="object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Info Content - Clean and Dense */}
                <div className="p-3 flex flex-col flex-1 bg-white">
                  
                  {/* Brand and Name exactly like Trendyol */}
                  <Link 
                    href={`/products/${product.slug}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectProduct(product);
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="text-xs text-slate-800 leading-snug line-clamp-2 min-h-[32px]">
                      <span className="font-extrabold text-orange-600 mr-1.5 uppercase text-[11px] font-display" id="product-brand-tag">
                        HANİBABA
                      </span>
                      {product.name}
                    </p>
                    
                    {/* Tiny Category Label */}
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">
                      {product.category_name || getCategoryName(product.category_id)}
                    </span>
                  </Link>

                  {/* Promotion Badges (Trendyol Style) */}
                  <div className="mt-2 space-y-1">
                    <span className="inline-block bg-orange-50 text-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                      ⚡ Kargo Bedava
                    </span>
                  </div>

                  {/* Price & Buy Button Row */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold leading-none">Fiyat</span>
                      <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-[10px] font-bold">TL</span>
                      </span>
                    </div>

                    <button
                      disabled={!hasStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wide flex items-center gap-1 shrink-0 ${
                        hasStock 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-2xs' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Ekle
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details Modal is completely removed in favor of separate page */}
    </div>
  );
}
