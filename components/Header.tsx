'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Heart, LogOut, Building2, Bell, CheckCircle, Clock } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  cartCount: number;
  favoritesCount: number;
  onSearch: (term: string) => void;
  onNavigate: (tab: string) => void;
  currentTab: string;
  categories: any[];
  onSelectCategory: (id: string | null) => void;
  selectedCategoryId: string | null;
  notifications: any[];
  onMarkNotificationRead: (id: number) => void;
  siteConfigs?: any;
}

export default function Header({
  user,
  onLogout,
  cartCount,
  favoritesCount,
  onSearch,
  onNavigate,
  currentTab,
  categories,
  onSelectCategory,
  selectedCategoryId,
  notifications,
  onMarkNotificationRead,
  siteConfigs
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const notificationMobileRef = React.useRef<HTMLDivElement>(null);

  const siteName = siteConfigs?.site_name || 'Hani Baba Tedarik';
  const sitePhone = siteConfigs?.site_phone || '+905010160527';
  const logoType = siteConfigs?.site_logo_type || 'text';
  const logoUrl = siteConfigs?.site_logo || '';

  const logoWords = siteName.split(' ');
  const logoFirst = logoWords[0] || '';
  const logoRest = logoWords.slice(1).join(' ') || '';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
    onNavigate('products');
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  // Close notifications dropdown on clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutsideDesktop = !notificationRef.current || !notificationRef.current.contains(event.target as Node);
      const isOutsideMobile = !notificationMobileRef.current || !notificationMobileRef.current.contains(event.target as Node);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-100 text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 flex justify-end items-center gap-2">
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-slate-400 hidden sm:inline">Hoş geldiniz,</span>
              <span className="font-semibold text-yellow-400">{user.name}</span>
              {user.role === 'corporate' && (
                <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-xs text-[9px] font-bold tracking-wider">
                  KURUMSAL CARİ
                </span>
              )}
              {user.role === 'admin' && (
                <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded-xs text-[9px] font-bold tracking-wider">
                  YÖNETİCİ
                </span>
              )}
            </div>
          ) : (
            <div className="flex gap-2 sm:gap-3 font-semibold">
              <button onClick={() => onNavigate('auth-login')} className="hover:text-yellow-400 transition-colors">Giriş Yap</button>
              <span className="text-slate-700">|</span>
              <button onClick={() => onNavigate('auth-register')} className="hover:text-yellow-400 transition-colors">Üye Ol</button>
              <span className="text-slate-700">|</span>
              <button onClick={() => onNavigate('corporate-apply')} className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 text-[9px] sm:text-xs">
                <Building2 className="w-3 h-3" /> Kurumsal Başvuru
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <Link
            href="/"
            onClick={() => { onSelectCategory(null); onNavigate('home'); }}
            className="flex items-center gap-2.5 cursor-pointer"
            id="header-logo-container"
          >
            <div className="relative">
              <img id="header-logo-img" src="/logo.png" alt={siteName} className="h-11 w-auto object-contain animate-fade-in" />
              <div className="absolute -top-1.5 -right-2.5 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg border border-white shadow-md leading-none tracking-wider scale-95 select-none" id="hb-logo-badge">
                HB
              </div>
            </div>
            <span className="hidden lg:inline-block text-slate-400 text-[10px] uppercase font-bold tracking-widest border-l border-slate-200 pl-3 leading-tight" id="header-logo-tagline">
              KURUMSAL<br />TEDARİK
            </span>
          </Link>

          {/* Quick Header Buttons for Mobile */}
          <div className="flex items-center gap-2 sm:hidden relative">
            {/* Notification Bell */}
            <div className="relative" ref={notificationMobileRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 relative transition-colors"
                title="Bildirimler"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-76 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-slate-800">Sipariş Bildirimleri</span>
                      {unreadNotifications.length > 0 && (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadNotifications.length} yeni
                        </span>
                      )}
                    </div>
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={() => {
                          onMarkNotificationRead(-1);
                          setShowNotifications(false);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline text-left cursor-pointer"
                      >
                        Tümünü Okundu İşaretle
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Henüz bildirim bulunmuyor.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`p-3.5 transition-colors ${!notif.is_read ? 'bg-orange-50/40 hover:bg-orange-50/70' : 'hover:bg-slate-50'}`}>
                          <div className="flex gap-2.5">
                            <div className={`p-1.5 rounded-lg shrink-0 ${!notif.is_read ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-slate-700 leading-normal font-medium">{notif.message}</p>
                              {!notif.is_read && (
                                <button
                                  onClick={() => {
                                    onMarkNotificationRead(notif.id);
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                                >
                                  Okundu Olarak İşaretle
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Search Bar (Image 4 Style) */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-xl md:max-w-2xl flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Ofis malzemeleri, fotokopi kağıdı, kahve makinesi veya SKU ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-l-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#00509a] focus:border-[#00509a] transition-all text-xs sm:text-sm font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); onSearch(''); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Temizle
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#00509a] hover:bg-blue-800 text-white px-6 sm:px-8 py-2.5 rounded-r-lg transition-colors font-extrabold text-xs sm:text-sm tracking-wider uppercase shrink-0"
          >
            ARA
          </button>
        </form>

        {/* Right Side Actions for Tablet/Desktop */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Notification Bell Component */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-blue-600 relative transition-colors cursor-pointer"
              title="Sipariş Bildirimleri"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown List */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-150 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-slate-800">Sipariş & Cari Bildirimleri</span>
                    {unreadNotifications.length > 0 && (
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadNotifications.length} yeni
                      </span>
                    )}
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={() => {
                        onMarkNotificationRead(-1);
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline text-left cursor-pointer"
                    >
                      Tümünü Okundu İşaretle
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Henüz bildirim bulunmuyor.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 transition-colors ${!notif.is_read ? 'bg-orange-50/30 hover:bg-orange-50/60' : 'hover:bg-slate-50'}`}>
                        <div className="flex gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${!notif.is_read ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-slate-700 leading-normal font-medium">{notif.message}</p>
                            {!notif.is_read && (
                              <button
                                onClick={() => {
                                  onMarkNotificationRead(notif.id);
                                }}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                              >
                                Okundu Olarak İşaretle
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button
            onClick={() => onNavigate('cart')}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-[#00509a] relative transition-colors cursor-pointer"
            title="Sepetim"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#f27a1a] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Favorites Icon */}
          <button
            onClick={() => onNavigate('favorites')}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-rose-500 relative transition-colors cursor-pointer"
            title="Favorilerim"
          >
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* User Account Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (user.role === 'admin') onNavigate('admin');
                    else onNavigate('profile');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  {user.role === 'admin' ? 'Yönetici Paneli' : 'Hesabım'}
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth-login')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Horizontal Navigation Bar */}
      <div className="bg-slate-50 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex gap-4">
          <Link
            href="/"
            onClick={() => { onSelectCategory(null); onNavigate('products'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-block ${
              selectedCategoryId === null && currentTab === 'products'
                ? 'bg-[#00509a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Tüm Ürünler
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              onClick={() => { onSelectCategory(cat.id); onNavigate('products'); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-block ${
                selectedCategoryId === cat.id && currentTab === 'products'
                  ? 'bg-[#00509a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
