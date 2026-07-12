'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import AdminPanel from '@/components/AdminPanel';
import Checkout from '@/components/Checkout';
import AuthModal from '@/components/AuthModal';
import ProfileTab from '@/components/ProfileTab';

import { 
  Building2, ArrowRight, ShieldCheck, Truck, Percent, 
  ChevronLeft, ChevronRight, ShoppingCart, Heart, Info,
  Home as HomeIcon, User as UserIcon, Grid as GridIcon,
  Share2
} from 'lucide-react';

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

interface HomeClientProps {
  initialCategories: any[];
  initialProducts: Product[];
  initialSliders: any[];
  initialStories: any[];
  initialConfigs: any;
  initialTab?: string;
  initialSelectedCategoryId?: any;
}

export default function HomeClient({
  initialCategories,
  initialProducts,
  initialSliders,
  initialStories,
  initialConfigs,
  initialTab,
  initialSelectedCategoryId,
}: HomeClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);
  const [categories, setCategories] = React.useState<any[]>(initialCategories);
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [sliders, setSliders] = React.useState<any[]>(initialSliders);
  const [stories, setStories] = React.useState<any[]>(initialStories);
  const [siteConfigs, setSiteConfigs] = React.useState<any>(initialConfigs);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  
  // Interactive UI Navigation Tab State
  const [currentTab, setCurrentTab] = React.useState<string>(initialTab || 'home');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<any>(initialSelectedCategoryId || null);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [selectedProductDetail, setSelectedProductDetail] = React.useState<Product | null>(null);
  
  // Client-Side Cart & Favorites
  const [cart, setCart] = React.useState<any[]>([]);
  const [favorites, setFavorites] = React.useState<Product[]>([]);

  // Custom Toast Notification State
  const [toast, setToast] = React.useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  React.useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 1500); // Auto-hide after 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Scroll to top of window when active view or product detail changes (SPA scroll restoration)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentTab, selectedProductDetail]);

  // Dynamic Browser Tab Title and Meta Description for SEO
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let title = `${siteConfigs?.site_name || 'Hanibaba Tedarik'} | Kurumsal Ofis Tedarik Marketiniz`;
    let desc = 'Avansas kalitesinde, kurumsal ve bireysel ofis ihtiyaçlarınız için tek adres. Cari hesap ve güvenli online ödeme imkanı.';

    if (currentTab === 'product-detail' && selectedProductDetail) {
      title = `${selectedProductDetail.name} | ${siteConfigs?.site_name || 'Hanibaba Tedarik'}`;
      desc = selectedProductDetail.description || `${selectedProductDetail.name} en uygun fiyatlarla ${siteConfigs?.site_name || 'Hanibaba Tedarik'}'de! Hemen tıkla, satın al.`;
    } else if (currentTab === 'products') {
      const cat = categories.find(c => c.id === selectedCategoryId);
      if (cat) {
        title = `${cat.name} Tedariği & Ürünleri | ${siteConfigs?.site_name || 'Hanibaba Tedarik'}`;
        desc = `${cat.name} kategorisindeki en kaliteli ürünleri rekabetçi fiyatlar ve cari ödeme imkanıyla keşfedin.`;
      } else {
        title = `Tüm Ürünler | ${siteConfigs?.site_name || 'Hanibaba Tedarik'}`;
      }
    } else if (currentTab === 'corporate-apply') {
      title = `B2B Kurumsal Başvuru | ${siteConfigs?.site_name || 'Hanibaba Tedarik'}`;
      desc = `Kurumsal cari hesap, indirimli fiyatlar ve size özel müşteri temsilcisi imkanlarından yararlanmak için B2B başvuru yapın.`;
    } else if (currentTab === 'cart') {
      title = `Alışveriş Sepeti | ${siteConfigs?.site_name || 'Hanibaba Tedarik'}`;
    } else if (currentTab === 'profile') {
      title = `Profilim | ${siteConfigs?.site_name || 'Hanibaba Tedarik'}`;
    }

    document.title = title;

    // Update dynamic description meta tag if exists, otherwise create it
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);
  }, [currentTab, selectedProductDetail, siteConfigs, selectedCategoryId, categories]);

  // Home Page Slider Index
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Auto-play Slider effect
  React.useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === sliders.length - 1 ? 0 : prev + 1));
    }, 5000); // Advance slide every 5 seconds
    return () => clearInterval(interval);
  }, [sliders]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide(prev => (prev === sliders.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setCurrentSlide(prev => (prev === 0 ? sliders.length - 1 : prev - 1));
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.loggedIn) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSliders = async () => {
    try {
      const slidersRes = await fetch('/api/sliders').then(r => r.json());
      const storiesRes = await fetch('/api/stories').then(r => r.json());
      const configsRes = await fetch('/api/configs').then(r => r.json());

      if (slidersRes.success) {
        setSliders(slidersRes.sliders || []);
      }
      if (storiesRes.success) {
        setStories(storiesRes.stories || []);
      }
      if (configsRes.success) {
        setSiteConfigs(configsRes.configs || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    const initApp = async () => {
      await fetchMe();
      await fetchNotifications();
    };
    initApp();

    const savedCart = localStorage.getItem('ofisdepom_cart');
    const savedFavs = localStorage.getItem('ofisdepom_favs');

    setTimeout(() => {
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
      }
      if (savedFavs) {
        try { setFavorites(JSON.parse(savedFavs)); } catch (e) { console.error(e); }
      }
    }, 0);
  }, []);

  // Handle Dynamic URL parameter selectProduct for Server-to-Client seamless redirection
  React.useEffect(() => {
    if (typeof window === 'undefined' || !products || products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('selectProduct');
    if (productId) {
      const prod = products.find(p => p.id === Number(productId));
      if (prod) {
        setTimeout(() => {
          setSelectedProductDetail(prod);
          setCurrentTab('product-detail');
        }, 0);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [products]);

  // Handle PayTR redirect parameters and tab selections
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const paymentParam = params.get('payment');
    const orderIdParam = params.get('orderId');

    let shouldClean = false;

    // Avoid calling setState during render or effect synchronously if not needed
    if (tabParam) {
      setTimeout(() => {
        setCurrentTab(tabParam);
      }, 0);
      shouldClean = true;
    }

    if (paymentParam === 'success') {
      setTimeout(() => {
        showToast(`Ödemeniz başarıyla alındı! Sipariş #${orderIdParam || ''} onaylandı.`, 'success');
        fetchNotifications();
      }, 300);
      shouldClean = true;
    } else if (paymentParam === 'failed') {
      setTimeout(() => {
        showToast('Ödeme işlemi tamamlanamadı veya iptal edildi.', 'error');
      }, 300);
      shouldClean = true;
    }

    if (shouldClean) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  React.useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  React.useEffect(() => {
    if (currentTab === 'admin') {
      let active = true;
      const getProducts = async () => {
        try {
          const res = await fetch('/api/products');
          const data = await res.json();
          if (active && data.success) {
            setProducts(data.products || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      getProducts();
      return () => {
        active = false;
      };
    }
  }, [currentTab]);

  const updateCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('ofisdepom_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        showToast('Stok miktarından fazla ürün ekleyemezsiniz.', 'error');
        return;
      }
      updateCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      updateCart([...cart, { ...product, quantity: 1 }]);
    }
    showToast('Ürün sepetinize eklendi!', 'success');
  };

  const handleRemoveFromCart = (id: number) => {
    updateCart(cart.filter(item => item.id !== id));
    showToast('Ürün sepetten kaldırıldı.', 'info');
  };

  const handleUpdateCartQuantity = (id: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    const p = products.find(prod => prod.id === id);
    if (p && qty > p.stock) {
      showToast(`Bu üründen en fazla ${p.stock} adet sipariş verebilirsiniz.`, 'error');
      return;
    }
    updateCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const handleToggleFavorite = (product: Product) => {
    let newFavs;
    if (favorites.some(f => f.id === product.id)) {
      newFavs = favorites.filter(f => f.id !== product.id);
      showToast('Ürün favorilerinizden çıkarıldı.', 'info');
    } else {
      newFavs = [...favorites, product];
      showToast('Ürün favorilerinize eklendi!', 'success');
    }
    setFavorites(newFavs);
    localStorage.setItem('ofisdepom_favs', JSON.stringify(newFavs));
  };

  const handleShareProduct = (product: Product) => {
    if (typeof window !== 'undefined') {
      const productUrl = `${window.location.origin}/products/${product.slug}`;
      navigator.clipboard.writeText(productUrl)
        .then(() => {
          showToast('Kopyalandı: URL', 'success');
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          showToast('Paylaşım linki kopyalanamadı', 'error');
        });
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        setCurrentTab('home');
        showToast('Oturum kapatıldı.', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id === -1 ? { all: true } : { id })
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    fetchNotifications();
  };

  const featuredProducts = products.filter(p => !!p.is_featured);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header
        user={user}
        onLogout={handleLogout}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.length}
        onSearch={(term) => { setSearchTerm(term); setSelectedCategoryId(null); }}
        onNavigate={setCurrentTab}
        currentTab={currentTab}
        categories={categories}
        onSelectCategory={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        siteConfigs={siteConfigs}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
        {currentTab === 'home' && (
          <div className="space-y-12">
            
            {/* Stories */}
            {stories.length > 0 && (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto py-5 px-4 scrollbar-none justify-start sm:justify-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                {stories.map((story) => {
                  return (
                    <button
                      key={story.id}
                      onClick={() => {
                        if (story.type === 'product') {
                          const matched = products.find(p => p.slug === story.target_value || String(p.id) === String(story.target_value));
                          if (matched) {
                            setSelectedProductDetail(matched);
                            setCurrentTab('product-detail');
                          } else {
                            setCurrentTab('products');
                          }
                        } else if (story.type === 'category') {
                          const matched = categories.find(c => c.slug === story.target_value || String(c.id) === String(story.target_value));
                          if (matched) {
                            setSelectedCategoryId(matched.id);
                          }
                          setCurrentTab('products');
                        } else if (story.type === 'url') {
                          if (story.target_value.startsWith('http')) {
                            window.open(story.target_value, '_blank');
                          } else {
                            if (story.target_value === 'sepet') {
                              setCurrentTab('cart');
                            } else if (story.target_value === 'profil') {
                              setCurrentTab('profile');
                            } else {
                              setCurrentTab('home');
                            }
                          }
                        }
                      }}
                      className="flex flex-col items-center gap-2 text-center shrink-0 group focus:outline-hidden cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 p-0.5 shadow-sm group-hover:scale-105 group-hover:border-blue-600 transition-all bg-white relative">
                        <img
                          src={story.image_url || 'https://picsum.photos/seed/story/150/150'}
                          alt={story.title}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-black text-slate-700 group-hover:text-blue-700 transition-colors w-20 leading-tight truncate">
                        {story.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hero Slider */}
            {sliders.length > 0 && (
              <div 
                className="relative rounded-2xl overflow-hidden shadow-sm bg-white aspect-[8/3] group cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('.slider-control')) return;

                  if (sliders[currentSlide].link) {
                    const matchedCat = categories.find(c => `/${c.slug}` === sliders[currentSlide].link);
                    if (matchedCat) setSelectedCategoryId(matchedCat.id);
                  }
                  setCurrentTab('products');
                }}
              >
                <div className="w-full h-full relative">
                  <img 
                    src={sliders[currentSlide].image_url} 
                    alt="Kampanya Slaytı" 
                    className="w-full h-full object-cover transition-all duration-700 select-none pointer-events-none"
                  />
                </div>

                {sliders.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentSlide(prev => (prev === 0 ? sliders.length - 1 : prev - 1))}
                      className="slider-control absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 sm:p-2.5 rounded-full text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer z-20 flex items-center justify-center"
                      title="Önceki Slayt"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentSlide(prev => (prev === sliders.length - 1 ? 0 : prev + 1))}
                      className="slider-control absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 sm:p-2.5 rounded-full text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer z-20 flex items-center justify-center"
                      title="Sonraki Slayt"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}

                {sliders.length > 1 && (
                  <div className="slider-control absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {sliders.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          currentSlide === idx 
                            ? 'bg-white scale-125' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        title={`${idx + 1}. Slayta Git`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Promo Banners (Fruits & Vegetables squares) */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
              <Link 
                href={siteConfigs?.promo_banner_1_link || '/categories/sebzeler'}
                className="relative aspect-square sm:aspect-[4/3] md:aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-sm group border border-slate-200/80 bg-white"
              >
                <img 
                  src={siteConfigs?.promo_banner_1_image || 'https://images.unsplash.com/photo-1566385101042-1a010c159fcf?w=600&auto=format&fit=crop&q=80'} 
                  alt={siteConfigs?.promo_banner_1_title || 'Taze Sebzeler'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6">
                  <span className="bg-emerald-600 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xs sm:rounded-sm uppercase w-max mb-1 sm:mb-1.5 shadow-2xs">
                    %100 Doğal & Taze
                  </span>
                  <h3 className="text-white text-sm sm:text-xl md:text-2xl font-black font-display tracking-tight drop-shadow-sm uppercase">
                    {siteConfigs?.promo_banner_1_title || 'Taze Sebzeler'}
                  </h3>
                  <p className="text-slate-200 text-[10px] sm:text-xs mt-1 font-semibold opacity-90 group-hover:text-yellow-400 transition-colors hidden sm:block">
                    Hemen Tedarik Et ve Keşfet →
                  </p>
                </div>
              </Link>

              <Link 
                href={siteConfigs?.promo_banner_2_link || '/categories/meyveler'}
                className="relative aspect-square sm:aspect-[4/3] md:aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-sm group border border-slate-200/80 bg-white"
              >
                <img 
                  src={siteConfigs?.promo_banner_2_image || 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop&q=80'} 
                  alt={siteConfigs?.promo_banner_2_title || 'Taze Meyveler'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6">
                  <span className="bg-orange-500 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xs sm:rounded-sm uppercase w-max mb-1 sm:mb-1.5 shadow-2xs">
                    Günlük Taze Seçim
                  </span>
                  <h3 className="text-white text-sm sm:text-xl md:text-2xl font-black font-display tracking-tight drop-shadow-sm uppercase">
                    {siteConfigs?.promo_banner_2_title || 'Taze Meyveler'}
                  </h3>
                  <p className="text-slate-200 text-[10px] sm:text-xs mt-1 font-semibold opacity-90 group-hover:text-yellow-400 transition-colors hidden sm:block">
                    Hemen Tedarik Et ve Keşfet →
                  </p>
                </div>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Hızlı Kurye Teslimatı', desc: '1 iş gününde kapınızda', icon: Truck, color: 'text-blue-600 bg-blue-50' },
                { title: 'Siparişlerim Paneli', desc: 'Sipariş durumunu hemen öğrenin', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' },
                { title: 'B2B Kurumsal Üyelik', desc: 'Sektöre özel iskontolar', icon: Building2, color: 'text-emerald-600 bg-emerald-50' },
                { title: 'Cari Ödeme Desteği', desc: 'Faturalı, vadeli alım avantajı', icon: Percent, color: 'text-amber-600 bg-amber-50' }
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
                    <div className={`p-3 rounded-xl shrink-0 ${badge.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{badge.title}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-snug">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category selection list */}
            <div className="space-y-6">
              <div className="border-l-4 border-[#00509a] pl-3.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
                  Kategorilerimizi Keşfedin
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Ofisinizin tüm kırtasiye, gıda, temizlik ve teknoloji ihtiyaçları tek çatı altında!</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.filter(cat => cat.show_on_homepage === 1 || cat.show_on_homepage === true || cat.show_on_homepage === undefined || cat.show_on_homepage === null).map((cat, index) => {
                  const backdrops = [
                    'bg-sky-100/80',
                    'bg-orange-100/80',
                    'bg-emerald-100/80',
                    'bg-purple-100/80',
                    'bg-amber-100/80',
                    'bg-pink-100/80',
                  ];
                  const backdropColor = backdrops[index % backdrops.length];

                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-44 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer relative overflow-hidden group block"
                    >
                      <div className="z-20 flex flex-col justify-between h-full max-w-[55%]">
                        <h4 className="font-black text-slate-900 text-base sm:text-lg tracking-tight leading-tight uppercase group-hover:text-blue-800 transition-colors whitespace-pre-line">
                          {cat.name.replace(' ve ', ' ve\n')}
                        </h4>
                        
                        <div className="inline-flex items-center gap-1 font-black text-slate-800 text-xs uppercase tracking-wide underline underline-offset-4 decoration-2 group-hover:text-blue-700 transition-colors mt-auto">
                          Alışverişe Başla
                        </div>
                      </div>

                      <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${backdropColor} rounded-full group-hover:scale-110 transition-transform duration-500 overflow-hidden`} />
                      
                      <div className="absolute right-3.5 bottom-3.5 w-24 h-24 z-10 flex items-center justify-center group-hover:translate-y-[-4px] transition-transform duration-500">
                        <img 
                          src={cat.image_url || `https://picsum.photos/seed/${cat.slug}/200/200`} 
                          alt={cat.name}
                          className="max-h-full max-w-full object-contain drop-shadow-md" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/office/200/200';
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Opportunity Shelf */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-l-4 border-[#f27a1a] pl-3.5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-display uppercase">
                    Kaçırılmayacak Fiyatlar & Fırsat Ürünleri
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">En cazip fiyatlar ve yüksek stok güvencesiyle bütçe dostu seçimler</p>
                </div>
                <button 
                  onClick={() => { setSelectedCategoryId(null); setCurrentTab('products'); }} 
                  className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-wide"
                >
                  Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)).map((prod) => {
                  const isFav = favorites.some(f => f.id === prod.id);
                  const reviewCount = ((prod.id * 37) % 240) + 12;

                  return (
                    <Link 
                      key={prod.id}
                      href={`/products/${prod.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedProductDetail(prod);
                        setCurrentTab('product-detail');
                      }}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all h-full relative group cursor-pointer"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFavorite(prod);
                        }}
                        className="absolute top-2.5 right-2.5 z-20 p-1.5 bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 rounded-full shadow-xs transition-colors cursor-pointer border border-slate-100"
                        title="Favorilere Ekle"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
                        {prod.stock < 5 ? (
                          <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Son {prod.stock} Ürün
                          </span>
                        ) : (
                          <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Fırsat Ürünü
                          </span>
                        )}
                      </div>

                      <div className="aspect-square w-full mb-3 rounded-lg overflow-hidden bg-slate-50/50 flex items-center justify-center p-4 border border-slate-100 relative">
                        <img 
                          src={prod.image_url || 'https://picsum.photos/seed/product/400/400'} 
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono font-bold">Ürün Kodu: {prod.sku}</span>

                      <h4 className="font-medium text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug mt-1 mb-2">
                        <span className="text-[#f27a1a] font-extrabold mr-1">HANİBABA</span>
                        {prod.name}
                      </h4>

                      <div className="flex items-center gap-1 mb-2.5">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-xs">★</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">({reviewCount} Değerlendirme)</span>
                      </div>

                      <div className="flex items-baseline gap-1 mt-auto">
                        <span className="text-sm sm:text-base font-black text-[#f27a1a]">
                          {Number(prod.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase">KDV Dahil</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(prod);
                        }}
                        className="w-full bg-[#f27a1a] hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold py-2.5 text-xs text-center rounded-lg shadow-sm transition-colors mt-3.5 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Sepete Ekle
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Most Searched */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-l-4 border-blue-600 pl-3.5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-display uppercase">
                    Çok Aranan Ürünler & Ofis Klasikleri
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">En sık sipariş verilen, kalitesiyle kanıtlanmış popüler ürünler</p>
                </div>
                <button 
                  onClick={() => { setSelectedCategoryId(null); setCurrentTab('products'); }} 
                  className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-wide"
                >
                  Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.slice(Math.min(4, products.length - 1), Math.min(8, products.length)).map((prod) => {
                  const isFav = favorites.some(f => f.id === prod.id);
                  const reviewCount = ((prod.id * 59) % 180) + 24;

                  return (
                    <Link 
                      key={prod.id}
                      href={`/products/${prod.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedProductDetail(prod);
                        setCurrentTab('product-detail');
                      }}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all h-full relative group cursor-pointer"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFavorite(prod);
                        }}
                        className="absolute top-2.5 right-2.5 z-20 p-1.5 bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 rounded-full shadow-xs transition-colors cursor-pointer border border-slate-100"
                        title="Favorilere Ekle"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
                        <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                          Çok Satan
                        </span>
                      </div>

                      <div className="aspect-square w-full mb-3 rounded-lg overflow-hidden bg-slate-50/50 flex items-center justify-center p-4 border border-slate-100 relative">
                        <img 
                          src={prod.image_url || 'https://picsum.photos/seed/product/400/400'} 
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono font-bold">Ürün Kodu: {prod.sku}</span>

                      <h4 className="font-medium text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug mt-1 mb-2">
                        <span className="text-[#f27a1a] font-extrabold mr-1">HANİBABA</span>
                        {prod.name}
                      </h4>

                      <div className="flex items-center gap-1 mb-2.5">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-xs">★</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">({reviewCount} Değerlendirme)</span>
                      </div>

                      <div className="flex items-baseline gap-1 mt-auto">
                        <span className="text-sm sm:text-base font-black text-[#f27a1a]">
                          {Number(prod.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase">KDV Dahil</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(prod);
                        }}
                        className="w-full bg-[#f27a1a] hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold py-2.5 text-xs text-center rounded-lg shadow-sm transition-colors mt-3.5 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Sepete Ekle
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Marketing Banners */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div className="bg-[#003c73] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xs border border-blue-900/40 min-h-[220px]">
                <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-10 pointer-events-none">
                  <Truck className="w-full h-full object-contain translate-x-4 translate-y-4" />
                </div>

                <div className="space-y-4 z-10 max-w-md">
                  <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                    %100 MAĞAZA GÜVENCESİ
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight uppercase font-display">
                    Memnuniyetiniz Garantimiz Altında!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                    Memnuniyetinizi garanti altına almak ve işyerinize değer katmak için belirlediğimiz bu 4 temel prensip doğrultusunda kendimize yüksek standartlar koyarak çalışırız ve sürekli kendimizi geliştiririz.
                  </p>
                </div>

                <div className="flex gap-2 mt-6 z-10">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" title="Hızlı Teslimat" />
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full hover:bg-white/60 cursor-pointer" title="Yüksek Stok Gücü" />
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full hover:bg-white/60 cursor-pointer" title="Cari Ödeme Vadeleri" />
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full hover:bg-white/60 cursor-pointer" title="Kolay İade Garantisi" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs min-h-[220px]">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#00509a] text-white px-2.5 py-1 rounded-md font-extrabold text-[10px] tracking-wider uppercase">
                      {siteConfigs?.site_name ? siteConfigs.site_name.replace(' ', '') : 'HANİBABATEDARİK'}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                      {siteConfigs?.site_name || 'Hanibaba Tedarik'}&apos;li Olun!
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {siteConfigs?.site_name || 'Hanibaba Tedarik'}, sektörün dinamiklerini ve değişkenlerini düzenli olarak araştırır ve ihtiyaçlarınız için en doğru ve en kaliteli ürünleri seçip portföyünü her gün genişleterek bu ürünleri rekabetçi fiyatlarla sunar.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    {['AKAR', 'KA.', 'NAZİK', 'HAN'].map((partner, idx) => (
                      <span 
                        key={idx} 
                        className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[8px] font-black text-slate-500 shadow-2xs shrink-0 tracking-tighter"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentTab('auth-register')}
                    className="bg-[#f27a1a] hover:bg-orange-600 text-white font-extrabold px-6 py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-xs transition-colors cursor-pointer"
                  >
                    HEMEN ÜYE OL
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {currentTab === 'products' && (
          <ProductGrid
            products={products}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            searchTerm={searchTerm}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            user={user}
            onSelectProduct={(prod) => { setSelectedProductDetail(prod); setCurrentTab('product-detail'); }}
          />
        )}

        {currentTab === 'cart' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">Sepetim</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto p-8 shadow-xs">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Sepetiniz Boş</h3>
                <p className="text-slate-500 text-sm mt-1">Sitemizdeki zengin ürün çeşitlerini inceleyerek sepetinizi doldurabilirsiniz.</p>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg"
                >
                  Ürünleri İncele
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-3.5">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img 
                          src={item.image_url || 'https://picsum.photos/seed/prod/100/100'} 
                          alt={item.name} 
                          className="w-14 h-14 object-contain bg-slate-50 border rounded-lg shrink-0" 
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                          <span className="text-[10px] text-slate-400 block font-mono">SKU: {item.sku}</span>
                          <span className="text-emerald-600 font-bold text-[11px] block mt-1">Stokta Var</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button 
                            onClick={() => handleUpdateCartQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-slate-500 font-bold hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-bold text-xs text-slate-800">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateCartQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-slate-500 font-bold hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-semibold">Tutar</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {Number(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                          </span>
                        </div>

                        <button 
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                          title="Sil"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>Sepet Toplamı</span>
                    <span className="text-xs text-slate-400 font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)} Adet</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Ara Toplam:</span>
                      <span className="font-semibold text-slate-800">
                        {cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kargo Bedeli:</span>
                      <span className="text-emerald-600 font-bold">Ücretsiz Kargo</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900 text-sm">
                      <span>Toplam Tutar:</span>
                      <span className="text-base font-black">
                        {cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        showToast('Ödeme aşamasına geçebilmek için lütfen giriş yapın.', 'info');
                        setCurrentTab('auth-login');
                      } else {
                        setCurrentTab('checkout');
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm uppercase tracking-wide transition-all cursor-pointer"
                  >
                    Ödeme Sayfasına Git
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'favorites' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">Favori Ürünlerim</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto p-8 shadow-xs">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Favorileriniz Boş</h3>
                <p className="text-slate-500 text-sm mt-1">Beğendiğiniz ürünleri daha sonra kolayca bulabilmek için favorilerinize ekleyebilirsiniz.</p>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg"
                >
                  Ürünleri İncele
                </button>
              </div>
            ) : (
              <ProductGrid
                products={favorites}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                searchTerm={searchTerm}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                favorites={favorites}
                user={user}
                onSelectProduct={(prod) => { setSelectedProductDetail(prod); setCurrentTab('product-detail'); }}
              />
            )}
          </div>
        )}

        {currentTab === 'checkout' && (
          <Checkout
            cart={cart}
            user={user}
            onClearCart={() => updateCart([])}
            onNavigate={setCurrentTab}
            onAddNotification={() => {}}
            siteConfigs={siteConfigs}
          />
        )}

        {(currentTab === 'auth-login' || currentTab === 'auth-register' || currentTab === 'corporate-apply') && (
          <AuthModal
            initialTab={currentTab === 'auth-login' ? 'login' : currentTab === 'corporate-apply' ? 'corporate-apply' : 'register'}
            onAuthSuccess={handleAuthSuccess}
            onNavigate={setCurrentTab}
            allowIndividualAuth={siteConfigs?.allow_individual_auth}
          />
        )}

        {currentTab === 'profile' && user && (
          <ProfileTab
            user={user}
            onRefreshUser={fetchMe}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'admin' && user?.role === 'admin' && (
          <AdminPanel
            categories={categories}
            onRefreshCategories={fetchCategories}
            products={products}
            onRefreshProducts={fetchProducts}
            sliders={sliders}
            onRefreshSliders={fetchSliders}
          />
        )}

        {currentTab === 'product-detail' && selectedProductDetail && (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentTab('products')}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors bg-slate-100 px-3.5 py-2 rounded-lg cursor-pointer"
            >
              ← Alışverişe Devam Et (Ürünler)
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 bg-slate-50/50 p-8 sm:p-12 flex items-center justify-center border-r border-slate-200 min-h-[350px]">
                <img
                  src={selectedProductDetail.image_url || 'https://picsum.photos/seed/placeholder/600/600'}
                  alt={selectedProductDetail.name}
                  className="object-contain max-h-96 max-w-full hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="bg-orange-50 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider">
                        {selectedProductDetail.category_name || categories.find(c => c.id === selectedProductDetail.category_id)?.name || 'Genel'}
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-display leading-tight">
                        <span className="text-orange-600 font-black mr-2 uppercase text-lg">HANİBABA</span>
                        {selectedProductDetail.name}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleShareProduct(selectedProductDetail)}
                        className="p-2.5 rounded-full border shadow-2xs transition-all bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                        title="Ürünü Paylaş"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(selectedProductDetail)}
                        className={`p-2.5 rounded-full border shadow-2xs transition-all ${
                          favorites.some(f => f.id === selectedProductDetail.id)
                            ? 'bg-rose-50 border-rose-100 text-rose-500'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
                        }`}
                        title="Favorilerime Ekle"
                      >
                        <Heart className={`w-5 h-5 ${favorites.some(f => f.id === selectedProductDetail.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center mt-3 text-xs text-slate-400">
                    <span className="font-mono">Stok Kodu (SKU): <strong>{selectedProductDetail.sku}</strong></span>
                    <span>|</span>
                    <span className="text-emerald-600 font-bold">Stok Durumu: {selectedProductDetail.stock > 0 ? `${selectedProductDetail.stock} Adet` : 'Tükendi'}</span>
                  </div>

                  <div className="mt-5 p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/50 space-y-1.5 text-[11px] text-emerald-800">
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Ertesi Gün Teslimat Assuransı
                    </p>
                    <p className="text-emerald-700 leading-normal">
                      Bu sipariş, kurumsal cari hesabınız kapsamında onaylandığında ertesi gün özel servis araçlarımızla adresinize teslim edilir.
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ürün Detayları ve Açıklaması</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl max-h-52 overflow-y-auto">
                      {selectedProductDetail.description || 'Bu ürün için detaylı bir açıklama girilmemiştir.'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-6 mb-6">
                    <div>
                      <span className="text-xs text-slate-400 block leading-none mb-1">Kurumsal B2B Fiyatı</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                        {Number(selectedProductDetail.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-sm font-semibold">TL</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">+ KDV Dahil</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block leading-none">Teslimat</span>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-sm mt-1.5 inline-block">
                        ⚡ Ücretsiz Kargo
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={selectedProductDetail.stock <= 0}
                    onClick={() => {
                      handleAddToCart(selectedProductDetail);
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedProductDetail.stock > 0
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    SEPETE EKLE (CARİ)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 sm:hidden">
        <div className="max-w-md mx-auto px-4 py-2.5 flex justify-between items-center text-center">
          
          <button
            type="button"
            onClick={() => { 
              if (pathname !== '/') {
                router.push('/');
              } else {
                setSelectedCategoryId(null); 
                setSearchTerm(''); 
                setCurrentTab('home'); 
              }
            }}
            className={`flex flex-col items-center flex-1 justify-center py-1 transition-colors ${
              currentTab === 'home' ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1 font-display">Anasayfa</span>
          </button>

          <button
            type="button"
            onClick={() => { 
              if (pathname !== '/') {
                router.push('/?tab=products');
              } else {
                setSelectedCategoryId(null); 
                setSearchTerm(''); 
                setCurrentTab('products'); 
              }
            }}
            className={`flex flex-col items-center flex-1 justify-center py-1 transition-colors ${
              currentTab === 'products' ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'
            }`}
          >
            <GridIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1 font-display">Ürünler</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('favorites')}
            className={`flex flex-col items-center flex-1 justify-center py-1 transition-colors relative ${
              currentTab === 'favorites' ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'
            }`}
          >
            <div className="relative">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 font-display">Favorilerim</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('cart')}
            className={`flex flex-col items-center flex-1 justify-center py-1 transition-colors relative ${
              currentTab === 'cart' ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 font-display">Sepetim</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (user) {
                if (user.role === 'admin') setCurrentTab('admin');
                else setCurrentTab('profile');
              } else {
                setCurrentTab('auth-login');
              }
            }}
            className={`flex flex-col items-center flex-1 justify-center py-1 transition-colors ${
              ['profile', 'auth-login', 'admin', 'auth-register', 'corporate-apply'].includes(currentTab) ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1 font-display">
              {user ? (user.role === 'admin' ? 'Yönetim' : 'Hesabım') : 'Giriş Yap'}
            </span>
          </button>

        </div>
      </div>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2" id="footer-logo-container">
              <div className="relative">
                <img id="footer-logo-img" src="/logo.png" alt={siteConfigs?.site_name || 'Hanibaba Tedarik'} className="h-11 w-auto object-contain bg-white p-1 rounded-md" />
                <div className="absolute -top-1.5 -right-2 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[8px] font-black px-1 py-0.5 rounded-md border border-white shadow-xs leading-none select-none">
                  HB
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {siteConfigs?.site_name || 'Hanibaba Tedarik'}, sektörün dinamiklerini ve değişkenlerini düzenli olarak araştırır ve ihtiyaçlarınız için en doğru ve en kaliteli ürünleri seçip portföyünü her gün genişleterek bu ürünleri rekabetçi fiyatlarla sunar.
            </p>
            <div className="pt-2 text-[11px] text-slate-300">
              <p className="font-bold">Müşteri Destek & Sipariş Hattı:</p>
              <p className="text-yellow-400 font-extrabold text-sm mt-0.5">+90 501 016 0527</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-4">Hızlı Erişim</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => { setSelectedCategoryId(null); setCurrentTab('products'); }} className="hover:text-white">Tüm Ürünler</button></li>
              <li><button onClick={() => { setCurrentTab('corporate-apply'); }} className="hover:text-white text-yellow-400 font-semibold">B2B Kurumsal Üyelik Başvurusu</button></li>
              <li><button onClick={() => { setCurrentTab('home'); }} className="hover:text-white">Anasayfa</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-4">Ofis Kategorileri</h4>
            <ul className="space-y-2 text-[11px] capitalize">
              {categories.slice(0, 4).map(c => (
                <li key={c.id}>
                  <button onClick={() => { setSelectedCategoryId(c.id); setCurrentTab('products'); }} className="hover:text-white text-left">
                    {c.name} Tedariği
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-2">Kurumsal Cari Sistem</h4>
              <p className="text-[11px] text-slate-300">B2B Cari Hesap ve Sipariş Onay takip güvencesiyle kurumsal ofis alışverişi.</p>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <p className="font-bold text-slate-300">{siteConfigs?.site_name || 'Hanibaba Tedarik'} Genel Merkez</p>
              <p className="text-[10px] text-slate-300 mt-1">{siteConfigs?.site_address || 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No:103'}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-[10px] text-slate-400">
          © {new Date().getFullYear()} {siteConfigs?.site_name || 'Hanibaba Tedarik'} Kurumsal Tedarik Portalı. Tüm Hakları Saklıdır. | Powered by High-Performance MySQL & Next.js Core
        </div>
      </footer>

      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-emerald-100/50' 
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200/80 shadow-rose-100/50'
              : 'bg-blue-50 text-blue-800 border-blue-200/80 shadow-blue-100/50'
          }`}>
            {toast.type === 'success' && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <span className="tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
