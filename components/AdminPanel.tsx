'use client';

import React from 'react';
import { 
  TrendingUp, ShoppingBag, Folder, Users, CheckCircle, XCircle, 
  Trash2, Plus, Edit, RefreshCw, BarChart3, CreditCard, Layers, Tag, Image, Clock, Settings, Play
} from 'lucide-react';

const turkishSlugify = (str: string) => {
  if (!str) return '';
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };
  return str
    .split('')
    .map(char => turkishChars[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

interface AdminPanelProps {
  categories: any[];
  onRefreshCategories: () => void;
  products: any[];
  onRefreshProducts: () => void;
  sliders: any[];
  onRefreshSliders: () => void;
}

export default function AdminPanel({
  categories,
  onRefreshCategories,
  products,
  onRefreshProducts,
  sliders,
  onRefreshSliders
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = React.useState('dashboard');
  const [reports, setReports] = React.useState<any>(null);
  const [loadingReports, setLoadingReports] = React.useState(false);

  // Corporate Applications
  const [pendingUsers, setPendingUsers] = React.useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = React.useState(false);
  const [corporateError, setCorporateError] = React.useState('');

  // All Orders
  const [allOrders, setAllOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = React.useState<any>(null);

// Category Form State
  const [editingCategory, setEditingCategory] = React.useState<any>(null);
  const [catName, setCatName] = React.useState('');
  const [catSlug, setCatSlug] = React.useState('');
  const [catDesc, setCatDesc] = React.useState('');
  const [catImg, setCatImg] = React.useState('');
  const [catShowOnHomepage, setCatShowOnHomepage] = React.useState(true);
  const [catMetaTitle, setCatMetaTitle] = React.useState('');
  const [catMetaDescription, setCatMetaDescription] = React.useState('');
  const [catMetaKeywords, setCatMetaKeywords] = React.useState('');
  const [catMsg, setCatMsg] = React.useState('');

  // Slider Form State
  const [editingSlider, setEditingSlider] = React.useState<any>(null);
  const [slideTitle, setSlideTitle] = React.useState('');
  const [slideSub, setSlideSub] = React.useState('');
  const [slideImg, setSlideImg] = React.useState('');
  const [slideLink, setSlideLink] = React.useState('');
  const [slideIndex, setSlideIndex] = React.useState('0');
  const [slideMsg, setSlideMsg] = React.useState('');

  // Product Form State (for Add / Edit)
  const [editingProduct, setEditingProduct] = React.useState<any>(null);
  const [prodName, setProdName] = React.useState('');
  const [prodSlug, setProdSlug] = React.useState('');
  const [prodDesc, setProdDesc] = React.useState('');
  const [prodPrice, setProdPrice] = React.useState('');
  const [prodStock, setProdStock] = React.useState('');
  const [prodSku, setProdSku] = React.useState('');
  const [prodImg, setProdImg] = React.useState('');
  const [prodCatId, setProdCatId] = React.useState('');
  const [selectedProdCategories, setSelectedProdCategories] = React.useState<number[]>([]);
  const [prodFeatured, setProdFeatured] = React.useState(false);
  const [prodMetaTitle, setProdMetaTitle] = React.useState('');
  const [prodMetaDescription, setProdMetaDescription] = React.useState('');
  const [prodMetaKeywords, setProdMetaKeywords] = React.useState('');
  const [prodMsg, setProdMsg] = React.useState('');

  // Site Configs Form State
  const [configName, setConfigName] = React.useState('');
  const [configLogoType, setConfigLogoType] = React.useState('text');
  const [configLogo, setConfigLogo] = React.useState('');
  const [configPhone, setConfigPhone] = React.useState('');
  const [configEmail, setConfigEmail] = React.useState('');
  const [configAddress, setConfigAddress] = React.useState('');
  const [configInstagram, setConfigInstagram] = React.useState('');
  const [configFacebook, setConfigFacebook] = React.useState('');
  const [configTwitter, setConfigTwitter] = React.useState('');
  const [paytrMerchantId, setPaytrMerchantId] = React.useState('');
  const [paytrMerchantKey, setPaytrMerchantKey] = React.useState('');
  const [paytrMerchantSalt, setPaytrMerchantSalt] = React.useState('');
  const [paytrSandbox, setPaytrSandbox] = React.useState('1');
  const [activePaymentProvider, setActivePaymentProvider] = React.useState('paytr');
  const [shopierApiKey, setShopierApiKey] = React.useState('');
  const [shopierApiSecret, setShopierApiSecret] = React.useState('');
  const [shopierWebsiteIndex, setShopierWebsiteIndex] = React.useState('1');
  const [promo1Title, setPromo1Title] = React.useState('');
  const [promo1Image, setPromo1Image] = React.useState('');
  const [promo1Link, setPromo1Link] = React.useState('');
  const [promo2Title, setPromo2Title] = React.useState('');
  const [promo2Image, setPromo2Image] = React.useState('');
  const [promo2Link, setPromo2Link] = React.useState('');
  const [allowIndividualAuth, setAllowIndividualAuth] = React.useState('true');
  const [configMsg, setConfigMsg] = React.useState('');
  const [loadingConfigs, setLoadingConfigs] = React.useState(false);

  // Stories CRUD State
  const [stories, setStories] = React.useState<any[]>([]);
  const [loadingStories, setLoadingStories] = React.useState(false);
  const [editingStory, setEditingStory] = React.useState<any>(null);
  const [storyTitle, setStoryTitle] = React.useState('');
  const [storyImg, setStoryImg] = React.useState('');
  const [storyType, setStoryType] = React.useState('category');
  const [storyTarget, setStoryTarget] = React.useState('');
  const [storyOrder, setStoryOrder] = React.useState('0');
  const [storyMsg, setStoryMsg] = React.useState('');

  // Pages Admin State
  const [pages, setPages] = React.useState<any[]>([]);
  const [loadingPages, setLoadingPages] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<any>(null);
  const [pageTitle, setPageTitle] = React.useState('');
  const [pageSlug, setPageSlug] = React.useState('');
  const [pageImg, setPageImg] = React.useState('');
  const [pageContent, setPageContent] = React.useState('');
  const [pageMetaTitle, setPageMetaTitle] = React.useState('');
  const [pageMetaDesc, setPageMetaDesc] = React.useState('');
  const [pageMetaKeywords, setPageMetaKeywords] = React.useState('');
  const [pageMsg, setPageMsg] = React.useState('');

  // Users Admin State
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [userMsg, setUserMsg] = React.useState('');

  // Delete confirmation custom state
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    show: boolean;
    type: 'category' | 'product' | 'slider' | 'story' | null;
    id: number | null;
    title: string;
  }>({ show: false, type: null, id: null, title: '' });



  // Load Admin Data
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReports(false);
    }
  };



  const loadCorporateApplications = async () => {
    setLoadingApplications(true);
    setCorporateError('');
    try {
      const res = await fetch('/api/admin/corporate-applications');
      const data = await res.json();
      if (data.success) {
        setPendingUsers(data.pendingUsers || []);
      } else {
        setCorporateError(data.error || 'Başvurular yüklenirken bir hata oluştu.');
      }
    } catch (e: any) {
      console.error(e);
      setCorporateError(e.message || 'Sistem bağlantı hatası oluştu.');
    } finally {
      setLoadingApplications(false);
    }
  };

  const loadAllOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setAllOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadConfigs = async () => {
    setLoadingConfigs(true);
    try {
      const res = await fetch('/api/admin/configs');
      const data = await res.json();
      if (data.success) {
        const c = data.configs;
        setConfigName(c.site_name || 'Hani Baba Tedarik');
        setConfigLogoType(c.site_logo_type || 'text');
        setConfigLogo(c.site_logo || '');
        setConfigPhone(c.site_phone || '+905010160527');
        setConfigEmail(c.site_email || 'bilgi@hanibabatedarik.com');
        setConfigAddress(c.site_address || 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No 103');
        setConfigInstagram(c.site_instagram || '#');
        setConfigFacebook(c.site_facebook || '#');
        setConfigTwitter(c.site_twitter || '#');
        setPaytrMerchantId(c.paytr_merchant_id || '');
        setPaytrMerchantKey(c.paytr_merchant_key || '');
        setPaytrMerchantSalt(c.paytr_merchant_salt || '');
        setPaytrSandbox(c.paytr_sandbox || '1');
        setActivePaymentProvider(c.active_payment_provider || 'paytr');
        setAllowIndividualAuth(c.allow_individual_auth || 'true');
        setShopierApiKey(c.shopier_api_key || '');
        setShopierApiSecret(c.shopier_api_secret || '');
        setShopierWebsiteIndex(c.shopier_website_index || '1');
        setPromo1Title(c.promo_banner_1_title || 'Taze Sebze & Meyve Dünyası');
        setPromo1Image(c.promo_banner_1_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80');
        setPromo1Link(c.promo_banner_1_link || '/categories/sebze-meyve');
        setPromo2Title(c.promo_banner_2_title || 'Özel Tedarik & Hızlı Teslimat');
        setPromo2Image(c.promo_banner_2_image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80');
        setPromo2Link(c.promo_banner_2_link || '/products');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfigs(false);
    }
  };

  const handleConfigsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigMsg('');
    try {
      const res = await fetch('/api/admin/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configs: {
            site_name: configName,
            site_logo_type: configLogoType,
            site_logo: configLogo,
            site_phone: configPhone,
            site_email: configEmail,
            site_address: configAddress,
            site_instagram: configInstagram,
            site_facebook: configFacebook,
            site_twitter: configTwitter,
            paytr_merchant_id: paytrMerchantId,
            paytr_merchant_key: paytrMerchantKey,
            paytr_merchant_salt: paytrMerchantSalt,
            paytr_sandbox: paytrSandbox,
            active_payment_provider: activePaymentProvider,
            allow_individual_auth: allowIndividualAuth,
            shopier_api_key: shopierApiKey,
            shopier_api_secret: shopierApiSecret,
            shopier_website_index: shopierWebsiteIndex,
            promo_banner_1_title: promo1Title,
            promo_banner_1_image: promo1Image,
            promo_banner_1_link: promo1Link,
            promo_banner_2_title: promo2Title,
            promo_banner_2_image: promo2Image,
            promo_banner_2_link: promo2Link
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfigMsg('Site ve ödeme entegrasyon ayarları başarıyla güncellendi! Değişiklikler uygulanıyor...');
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        setConfigMsg(`Hata: ${data.error}`);
      }
    } catch (error: any) {
      setConfigMsg(`Hata: ${error.message}`);
    }
  };

  const loadStories = async () => {
    setLoadingStories(true);
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.success) {
        setStories(data.stories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStories(false);
    }
  };

  const loadPages = async () => {
    setLoadingPages(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.pages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPages(false);
    }
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageMsg('');
    try {
      const isEditing = editingPage !== null;
      const url = '/api/pages';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? editingPage.id : undefined,
          title: pageTitle,
          slug: pageSlug,
          image_url: pageImg,
          content: pageContent,
          meta_title: pageMetaTitle,
          meta_description: pageMetaDesc,
          meta_keywords: pageMetaKeywords
        })
      });
      const data = await res.json();
      if (data.success) {
        setPageMsg(isEditing ? 'Sayfa başarıyla güncellendi!' : 'Sayfa başarıyla eklendi!');
        setEditingPage(null);
        setPageTitle('');
        setPageSlug('');
        setPageImg('');
        setPageContent('');
        setPageMetaTitle('');
        setPageMetaDesc('');
        setPageMetaKeywords('');
        loadPages();
      } else {
        setPageMsg(`Hata: ${data.error}`);
      }
    } catch (error: any) {
      setPageMsg(`Hata: ${error.message}`);
    }
  };

  const handleEditPageClick = (p: any) => {
    setEditingPage(p);
    setPageTitle(p.title);
    setPageSlug(p.slug);
    setPageImg(p.image_url || '');
    setPageContent(p.content || '');
    setPageMetaTitle(p.meta_title || '');
    setPageMetaDesc(p.meta_description || '');
    setPageMetaKeywords(p.meta_keywords || '');
    setPageMsg('');
  };

  const handleDeletePage = async (id: number) => {
    try {
      const res = await fetch(`/api/pages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadPages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    setUserMsg('');
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.users || []);
      } else {
        setUserMsg(`Hata: ${data.error}`);
      }
    } catch (e: any) {
      console.error(e);
      setUserMsg(`Hata: ${e.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bu kullanıcı hesabını tamamen silmek istediğinize emin misiniz?')) {
      return;
    }
    setUserMsg('');
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUserMsg('Kullanıcı başarıyla silindi.');
        loadAllUsers();
      } else {
        setUserMsg(`Hata: ${data.error}`);
      }
    } catch (e: any) {
      console.error(e);
      setUserMsg(`Hata: ${e.message}`);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoryMsg('');
    try {
      const isEditing = editingStory !== null;
      const url = '/api/stories';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? editingStory.id : undefined,
          title: storyTitle,
          image_url: storyImg,
          type: storyType,
          target_value: storyTarget,
          order_index: Number(storyOrder)
        })
      });
      const data = await res.json();
      if (data.success) {
        setStoryMsg(isEditing ? 'Story başarıyla güncellendi!' : 'Story başarıyla eklendi!');
        setEditingStory(null);
        setStoryTitle('');
        setStoryImg('');
        setStoryType('category');
        setStoryTarget('');
        setStoryOrder('0');
        loadStories();
      } else {
        setStoryMsg(`Hata: ${data.error}`);
      }
    } catch (error: any) {
      setStoryMsg(`Hata: ${error.message}`);
    }
  };

  const handleEditStoryClick = (s: any) => {
    setEditingStory(s);
    setStoryTitle(s.title);
    setStoryImg(s.image_url);
    setStoryType(s.type);
    setStoryTarget(s.target_value);
    setStoryOrder(String(s.order_index || 0));
    setStoryMsg('');
  };

  const handleDeleteStory = async (id: number) => {
    try {
      const res = await fetch(`/api/stories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadStories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      if (activeSubTab === 'dashboard') loadReports();
      if (activeSubTab === 'corporate-apps') loadCorporateApplications();
      if (activeSubTab === 'orders') loadAllOrders();
      if (activeSubTab === 'users') loadAllUsers();
      if (activeSubTab === 'settings') loadConfigs();
      if (activeSubTab === 'stories') loadStories();
      if (activeSubTab === 'pages') loadPages();
    }, 0);
  }, [activeSubTab]);



  // Handle Application Approval/Rejection
  const handleApplication = async (userId: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/corporate-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadCorporateApplications();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Category Submit (Add or Edit)
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatMsg('');
    try {
      const isEditing = editingCategory !== null;
      const url = '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? editingCategory.id : undefined,
          name: catName,
          slug: catSlug,
          description: catDesc,
          image_url: catImg,
          show_on_homepage: catShowOnHomepage ? 1 : 0,
          meta_title: catMetaTitle,
          meta_description: catMetaDescription,
          meta_keywords: catMetaKeywords
        })
      });
      const data = await res.json();
      if (data.success) {
        setCatMsg(isEditing ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!');
        setEditingCategory(null);
        setCatName('');
        setCatSlug('');
        setCatDesc('');
        setCatImg('');
        setCatShowOnHomepage(true);
        setCatMetaTitle('');
        setCatMetaDescription('');
        setCatMetaKeywords('');
        onRefreshCategories();
      } else {
        setCatMsg(`Hata: ${data.error}`);
      }
    } catch (error: any) {
      setCatMsg(`Hata: ${error.message}`);
    }
  };

  const handleEditCategoryClick = (c: any) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description || '');
    setCatImg(c.image_url || '');
    setCatShowOnHomepage(c.show_on_homepage === 1 || c.show_on_homepage === true || c.show_on_homepage === undefined || c.show_on_homepage === null);
    setCatMetaTitle(c.meta_title || '');
    setCatMetaDescription(c.meta_description || '');
    setCatMetaKeywords(c.meta_keywords || '');
    setCatMsg('');
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Slider Submit (Add or Edit)
  const handleSliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlideMsg('');
    try {
      const isEditing = editingSlider !== null;
      const url = '/api/sliders';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: isEditing ? editingSlider.id : undefined,
          title: slideTitle, 
          subtitle: slideSub, 
          image_url: slideImg, 
          link: slideLink, 
          order_index: Number(slideIndex) 
        })
      });
      const data = await res.json();
      if (data.success) {
        setSlideMsg(isEditing ? 'Slider başarıyla güncellendi!' : 'Slider başarıyla eklendi!');
        setEditingSlider(null);
        setSlideTitle('');
        setSlideSub('');
        setSlideImg('');
        setSlideLink('');
        setSlideIndex('0');
        onRefreshSliders();
      } else {
        setSlideMsg(`Hata: ${data.error}`);
      }
    } catch (error: any) {
      setSlideMsg(`Hata: ${error.message}`);
    }
  };

  const handleEditSliderClick = (s: any) => {
    setEditingSlider(s);
    setSlideTitle(s.title);
    setSlideSub(s.subtitle || '');
    setSlideImg(s.image_url);
    setSlideLink(s.link || '');
    setSlideIndex(String(s.order_index || 0));
    setSlideMsg('');
  };

  const handleDeleteSlider = async (id: number) => {
    try {
      const res = await fetch(`/api/sliders?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshSliders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Product Submit (Add or Edit with multiple categories support)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdMsg('');
    try {
      const isEditing = editingProduct !== null;
      const url = '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? editingProduct.id : undefined,
          name: prodName,
          slug: prodSlug,
          description: prodDesc,
          price: Number(prodPrice),
          stock: Number(prodStock),
          sku: prodSku,
          image_url: prodImg,
          category_id: selectedProdCategories.length > 0 ? selectedProdCategories[0] : (prodCatId ? Number(prodCatId) : null),
          category_ids: selectedProdCategories.length > 0 ? selectedProdCategories : (prodCatId ? [Number(prodCatId)] : []),
          is_featured: prodFeatured,
          meta_title: prodMetaTitle,
          meta_description: prodMetaDescription,
          meta_keywords: prodMetaKeywords
        })
      });

      const data = await res.json();
      if (data.success) {
        setProdMsg(isEditing ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!');
        setEditingProduct(null);
        setProdName('');
        setProdSlug('');
        setProdDesc('');
        setProdPrice('');
        setProdStock('');
        setProdSku('');
        setProdImg('');
        setProdCatId('');
        setSelectedProdCategories([]);
        setProdFeatured(false);
        setProdMetaTitle('');
        setProdMetaDescription('');
        setProdMetaKeywords('');
        onRefreshProducts();
      } else {
        setProdMsg(`Hata: ${data.error}`);
      }
    } catch (error: any) {
      setProdMsg(`Hata: ${error.message}`);
    }
  };

  const handleEditProductClick = (p: any) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdSlug(p.slug);
    setProdDesc(p.description || '');
    setProdPrice(p.price.toString());
    setProdStock(p.stock.toString());
    setProdSku(p.sku);
    setProdImg(p.image_url || '');
    setProdCatId(p.category_id ? p.category_id.toString() : '');
    
    // Parse categories array for multi select
    const categoriesArray = p.category_ids 
      ? p.category_ids.split(',').map((id: string) => Number(id))
      : p.category_id ? [Number(p.category_id)] : [];
    setSelectedProdCategories(categoriesArray);
    
    setProdFeatured(p.is_featured === 1 || p.is_featured === true);
    setProdMetaTitle(p.meta_title || '');
    setProdMetaDescription(p.meta_description || '');
    setProdMetaKeywords(p.meta_keywords || '');
    setProdMsg('');
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Order Details Modal
  const fetchOrderDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedOrderDetails(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        alert('Sipariş durumu güncellendi.');
        loadAllOrders();
        if (selectedOrderDetails) fetchOrderDetails(orderId);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
            Yönetim Paneli
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mağaza durumunu inceleyin, siparişleri, ürünleri ve üyelikleri yönetin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'dashboard', label: 'Raporlar', icon: BarChart3 },
            { id: 'orders', label: 'Siparişler', icon: ShoppingBag },
            { id: 'corporate-apps', label: 'Kurumsal Onay', icon: CheckCircle },
            { id: 'users', label: 'Kullanıcılar', icon: Users },
            { id: 'products', label: 'Ürün Yönetimi', icon: Tag },
            { id: 'categories', label: 'Kategoriler', icon: Layers },
            { id: 'sliders', label: 'Slayt Yönetimi', icon: Image },
            { id: 'stories', label: 'Hikayeler (Story)', icon: Play },
            { id: 'pages', label: 'Sayfalar', icon: Folder },
            { id: 'settings', label: 'Site Ayarları', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Raporlar / Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div>
          {loadingReports ? (
            <div className="text-center py-12 text-sm text-slate-500">Raporlar yükleniyor...</div>
          ) : reports ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Toplam Ciro</span>
                    <h3 className="text-xl sm:text-2xl font-black text-blue-900 font-display mt-1">
                      {reports.totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </h3>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Toplam Sipariş</span>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-display mt-1">
                      {reports.totalOrders} Adet
                    </h3>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Toplam Ürün</span>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-display mt-1">
                      {reports.totalProducts} Model
                    </h3>
                  </div>
                  <Tag className="w-8 h-8 text-amber-400" />
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Toplam Kayıt</span>
                    <h3 className="text-xl sm:text-2xl font-black text-indigo-950 font-display mt-1">
                      {reports.totalUsers} Üye
                    </h3>
                  </div>
                  <Users className="w-8 h-8 text-indigo-400" />
                </div>
              </div>

              {/* Advanced counts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User divisions */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">Üye Segmentasyonu</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                      <span className="text-slate-500">Normal Müşteriler</span>
                      <span className="font-bold text-slate-800">{reports.customersCount}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                      <span className="text-emerald-600 font-semibold">Aktif B2B Kurumsal</span>
                      <span className="font-bold text-emerald-700">{reports.corporateCount}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/40">
                      <span className="text-amber-600 font-semibold">Onay Bekleyen Kurumsal</span>
                      <span className="font-bold text-amber-700">{reports.corporatePendingCount}</span>
                    </div>
                  </div>
                </div>

                {/* Sales by payment method */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">Ödeme Altyapısı Tercihleri</h4>
                  <div className="space-y-3 text-xs">
                    {reports.salesByPayment.map((p: any) => (
                      <div key={p.method} className="flex justify-between py-1.5 border-b border-slate-200/40">
                        <span className="text-slate-600 font-medium uppercase">{p.method} Ödeme</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{p.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                          <span className="text-[10px] text-slate-400 block">{p.count} adet sipariş</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sales trends log list */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                <h4 className="font-bold text-slate-800 text-sm mb-3">Geçmişe Dönük Raporlama (Günlük Satış Trendi)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-2.5">Tarih</th>
                        <th className="py-2.5">Sipariş Sayısı</th>
                        <th className="py-2.5">Toplam Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.salesTrends.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-slate-400">Yeterli satış geçmişi kaydı bulunmuyor.</td>
                        </tr>
                      ) : (
                        reports.salesTrends.map((trend: any) => (
                          <tr key={trend.date} className="hover:bg-slate-100/40">
                            <td className="py-2.5 font-medium">{new Date(trend.date).toLocaleDateString('tr-TR')}</td>
                            <td className="py-2.5 font-semibold text-slate-800">{trend.count} Sipariş</td>
                            <td className="py-2.5 font-bold text-emerald-600">{Number(trend.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-slate-500">Rapor alınamadı.</div>
          )}
        </div>
      )}

      {/* Bütün Siparişler */}
      {activeSubTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div className="text-center py-12 text-sm text-slate-500">Siparişler listeleniyor...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Sipariş ID</th>
                      <th className="py-3 px-4">Müşteri / Şirket</th>
                      <th className="py-3 px-4">Ödeme Türü</th>
                      <th className="py-3 px-4">Tutar</th>
                      <th className="py-3 px-4">Durum</th>
                      <th className="py-3 px-4">Tarih</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {allOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">Henüz hiç sipariş bulunmuyor.</td>
                      </tr>
                    ) : (
                      allOrders.map((order) => {
                        const statusColors: any = {
                          pending: 'bg-amber-100 text-amber-800 border-amber-200',
                          approved: 'bg-blue-100 text-blue-800 border-blue-200',
                          shipping: 'bg-purple-100 text-purple-800 border-purple-200',
                          delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          cancelled: 'bg-red-100 text-red-800 border-red-200'
                        };

                        const statusTexts: any = {
                          pending: 'Onay Bekliyor',
                          approved: 'Onaylandı',
                          shipping: 'Kargoda',
                          delivered: 'Teslim Edildi',
                          cancelled: 'İptal Edildi'
                        };

                        return (
                          <tr key={order.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">#{order.id}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-800">{order.user_name}</p>
                              {order.company_name && (
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{order.company_name}</p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-700 uppercase">{order.payment_method}</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${statusColors[order.status] || 'bg-slate-100'}`}>
                                {statusTexts[order.status] || order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(order.created_at).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="py-3 px-4 text-right flex justify-end gap-1">
                              <button
                                onClick={() => fetchOrderDetails(order.id)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-semibold text-[10px]"
                              >
                                İncele / Güncelle
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Details Modal popup */}
              {selectedOrderDetails && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 relative">
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                    <h3 className="text-base font-bold text-slate-900 mb-4 font-display">
                      Sipariş Detayı #{selectedOrderDetails.order.id}
                    </h3>

                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-slate-400 font-bold">Müşteri Name</p>
                          <p className="font-semibold text-slate-800">{selectedOrderDetails.order.user_name}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold">Ödeme Yöntemi</p>
                          <p className="font-semibold text-slate-800 uppercase">{selectedOrderDetails.order.payment_method}</p>
                        </div>
                      </div>

                      {selectedOrderDetails.order.company_name && (
                        <div>
                          <p className="text-slate-400 font-bold">Kurumsal Şirket</p>
                          <p className="font-semibold text-emerald-700">{selectedOrderDetails.order.company_name}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-slate-400 font-bold">Kargo / Teslimat Adresi</p>
                        <p className="font-medium">{selectedOrderDetails.order.shipping_address}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-slate-400 font-bold mb-1.5">Sipariş Edilen Ürünler</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedOrderDetails.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                              <div>
                                <p className="font-semibold text-slate-800 leading-snug">{item.product_name}</p>
                                <p className="text-[10px] text-slate-400">SKU: {item.sku} | {item.quantity} Adet</p>
                              </div>
                              <span className="font-bold text-slate-700 text-right shrink-0">
                                {Number(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">Genel Toplam:</span>
                        <span className="font-black text-slate-900 text-base">
                          {Number(selectedOrderDetails.order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <label className="block text-slate-500 font-bold mb-1">Sipariş Durumunu Güncelle</label>
                        <div className="flex gap-2">
                          <select
                            value={selectedOrderDetails.order.status}
                            onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.order.id, e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-hidden w-full"
                          >
                            <option value="pending">Onay Bekliyor</option>
                            <option value="approved">Onaylandı</option>
                            <option value="shipping">Kargoya Verildi (Kargo Takip Aktif)</option>
                            <option value="delivered">Teslim Edildi</option>
                            <option value="cancelled">İptal Edildi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Kurumsal Onay */}
      {activeSubTab === 'corporate-apps' && (
        <div>
          {corporateError && (
            <div className="p-4 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-semibold text-xs">
              Hata: {corporateError}
            </div>
          )}
          {loadingApplications ? (
            <div className="text-center py-12 text-sm text-slate-500">Başvurular listeleniyor...</div>
          ) : (
            <div className="space-y-4 text-xs text-slate-600">
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 border rounded-xl p-4">
                  Onay bekleyen kurumsal başvuru bulunmamaktadır.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          <div>
                            <span className="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider text-[9px]">ONAY BEKLİYOR</span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{u.company_name}</h4>
                          </div>
                          <span className="text-slate-400 text-[10px]">{new Date(u.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <p><strong className="text-slate-500">Yetkili Adı:</strong> {u.name}</p>
                          <p><strong className="text-slate-500">E-Posta:</strong> {u.email}</p>
                          <p><strong className="text-slate-500">Telefon:</strong> {u.phone}</p>
                          <p><strong className="text-slate-500">Vergi No:</strong> {u.tax_no} | {u.tax_office}</p>
                          <p><strong className="text-slate-500">Adres:</strong> {u.address}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 justify-end">
                        <button
                          onClick={() => handleApplication(u.id, 'reject')}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reddet
                        </button>
                        <button
                          onClick={() => handleApplication(u.id, 'approve')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCircle className="w-4 h-4" /> Onayla (Cari Hesap Yetkilendir)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ürün Yönetimi */}
      {activeSubTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add / Edit Form */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 self-start">
            <h4 className="font-bold text-slate-800 text-sm mb-4">
              {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </h4>
            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs text-slate-700">
              {prodMsg && (
                <div className="p-2.5 bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-semibold">
                  {prodMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ürün Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Ör: A4 Fotokopi Kağıdı 500lü"
                  value={prodName}
                  onChange={(e) => {
                    setProdName(e.target.value);
                    setProdSlug(turkishSlugify(e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Slug (Link Kısa Adı)</label>
                <input
                  type="text"
                  required
                  placeholder="a4-fotokopi-kagidi-500lu"
                  value={prodSlug}
                  onChange={(e) => setProdSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Açıklama</label>
                <textarea
                  placeholder="Ürün özelliklerini detaylıca yazın..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Fiyat (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="145.90"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Stok (Adet)</label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Stok Kodu (SKU)</label>
                  <input
                    type="text"
                    required
                    placeholder="SKU-A4-COP"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={prodCatId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProdCatId(val);
                      setSelectedProdCategories(val ? [Number(val)] : []);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Görsel URL</label>
                <input
                  type="text"
                  placeholder="https://picsum.photos/..."
                  value={prodImg}
                  onChange={(e) => setProdImg(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                  💡 <strong>Öneri:</strong> 500x500 px kare görsel, beyaz veya şeffaf arka planlı olmalıdır.
                </p>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="prodFeatured"
                  checked={prodFeatured}
                  onChange={(e) => setProdFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                />
                <label htmlFor="prodFeatured" className="font-semibold text-slate-700">Anasayfada Öne Çıkar</label>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-2.5">
                <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider text-blue-700">🔍 Arama Motoru Optimizasyonu (SEO)</p>
                
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Meta Başlık (Meta Title)</label>
                  <input
                    type="text"
                    placeholder="Örn: Hanibaba A4 Fotokopi Kağıdı 80g | En Uygun Fiyat"
                    value={prodMetaTitle}
                    onChange={(e) => setProdMetaTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Meta Açıklama (Meta Description)</label>
                  <textarea
                    placeholder="Ürün arama sonuçlarında çıkacak açıklama..."
                    value={prodMetaDescription}
                    onChange={(e) => setProdMetaDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg h-12 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Meta Anahtar Kelimeler (Meta Keywords)</label>
                  <input
                    type="text"
                    placeholder="a4 fotokopi kağıdı, ucuz a4 kağıdı, toptan kırtasiye"
                    value={prodMetaKeywords}
                    onChange={(e) => setProdMetaKeywords(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProdName('');
                      setProdSlug('');
                      setProdDesc('');
                      setProdPrice('');
                      setProdStock('');
                      setProdSku('');
                      setProdImg('');
                      setProdCatId('');
                      setSelectedProdCategories([]);
                      setProdFeatured(false);
                      setProdMetaTitle('');
                      setProdMetaDescription('');
                      setProdMetaKeywords('');
                      setProdMsg('');
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg"
                  >
                    İptal
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
                >
                  {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>

          {/* Product list */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-slate-800 text-sm mb-3">Kayıtlı Ürün Listesi ({products.length} Adet)</h4>
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 text-xs">
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-4 shadow-2xs hover:border-blue-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image_url || 'https://picsum.photos/seed/placeholder/100/100'}
                      alt={p.name}
                      className="w-10 h-10 object-contain bg-slate-50 border rounded-md"
                    />
                    <div>
                      <h5 className="font-bold text-slate-800 line-clamp-1">{p.name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku} | Stok: <span className={p.stock > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{p.stock} adet</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-slate-900 text-xs">
                      {Number(p.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <button
                      onClick={() => handleEditProductClick(p)}
                      className="p-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-md text-slate-500"
                      title="Düzenle"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({
                        show: true,
                        type: 'product',
                        id: p.id,
                        title: p.name
                      })}
                      className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-md text-slate-500"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kategoriler */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
            <h4 className="font-bold text-slate-800 text-sm mb-4">
              {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
            </h4>
            <form onSubmit={handleCategorySubmit} className="space-y-3.5 text-xs text-slate-700">
              {catMsg && (
                <div className="p-2.5 bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-semibold">
                  {catMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kategori Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Ör: Ofis Mobilyaları"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    setCatSlug(turkishSlugify(e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Slug (Link Kısa Adı)</label>
                <input
                  type="text"
                  required
                  placeholder="ofis-mobilyalari"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Açıklama</label>
                <textarea
                  placeholder="Kategori kapsamını açıklayın..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg h-16"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Görsel URL</label>
                <input
                  type="text"
                  placeholder="https://picsum.photos/..."
                  value={catImg}
                  onChange={(e) => setCatImg(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                  💡 <strong>Öneri:</strong> 250x250 px dikey/yatay şeffaf arka planlı nesne görseli önerilir.
                </p>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="catShowOnHomepage"
                  checked={catShowOnHomepage}
                  onChange={(e) => setCatShowOnHomepage(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="catShowOnHomepage" className="font-bold text-slate-700 cursor-pointer select-none">
                  Ana Sayfada Kart Olarak Göster
                </label>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-2.5">
                <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider text-blue-700">🔍 Arama Motoru Optimizasyonu (SEO)</p>
                
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Meta Başlık (Meta Title)</label>
                  <input
                    type="text"
                    placeholder="Örn: En Ucuz Ofis Malzemeleri ve Kağıtlar | Hani Baba"
                    value={catMetaTitle}
                    onChange={(e) => setCatMetaTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Meta Açıklama (Meta Description)</label>
                  <textarea
                    placeholder="Kategori arama sonuçlarında çıkacak açıklama..."
                    value={catMetaDescription}
                    onChange={(e) => setCatMetaDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg h-12 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Meta Anahtar Kelimeler (Meta Keywords)</label>
                  <input
                    type="text"
                    placeholder="ofis kağıdı, toptan temizlik malzemeleri, hanibaba"
                    value={catMetaKeywords}
                    onChange={(e) => setCatMetaKeywords(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
                >
                  {editingCategory ? 'Güncelle' : 'Kategori Ekle'}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCatName('');
                      setCatSlug('');
                      setCatDesc('');
                      setCatImg('');
                      setCatShowOnHomepage(true);
                      setCatMetaTitle('');
                      setCatMetaDescription('');
                      setCatMetaKeywords('');
                    }}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-3">Mevcut Kategoriler</h4>
            <div className="space-y-2 text-xs max-h-[450px] overflow-y-auto pr-1">
              {categories.map((c) => (
                <div key={c.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.image_url || 'https://picsum.photos/seed/placeholder/100/100'}
                      alt={c.name}
                      className="w-10 h-10 object-cover bg-slate-100 border rounded-md"
                    />
                    <div>
                      <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                        {c.name}
                        {c.show_on_homepage === 1 || c.show_on_homepage === true ? (
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                            Ana Sayfada
                          </span>
                        ) : null}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-medium">Link: /{c.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditCategoryClick(c)}
                      className="p-1.5 hover:bg-slate-50 text-blue-600 rounded-md transition-all"
                      title="Düzenle"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({
                        show: true,
                        type: 'category',
                        id: c.id,
                        title: c.name
                      })}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-all"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slider Yönetimi */}
      {activeSubTab === 'sliders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
            <h4 className="font-bold text-slate-800 text-sm mb-4">
              {editingSlider ? 'Sliderı Düzenle' : 'Yeni Slider Ekle'}
            </h4>
            <form onSubmit={handleSliderSubmit} className="space-y-3.5 text-xs text-slate-700">
              {slideMsg && (
                <div className="p-2.5 bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-semibold">
                  {slideMsg}
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg space-y-1">
                <p className="font-bold text-amber-950">📐 Önerilen Görsel Boyutları:</p>
                <p className="text-[11px] leading-relaxed">
                  Slayt görselinizin web sitemizde en mükemmel ve kesintisiz şekilde görünmesi için, görselin üzerinde herhangi bir yazı veya arka plan bindirmesi olmadan doğrudan <strong>1200x450 px</strong> (en-boy oranı 8:3) veya <strong>1600x600 px</strong> boyutlarında olmasını tavsiye ederiz.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Görsel URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://gorsel-linki.com/gorsel.jpg"
                  value={slideImg}
                  onChange={(e) => setSlideImg(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Yönlendirme Linki</label>
                  <input
                    type="text"
                    placeholder="/kategori-slug"
                    value={slideLink}
                    onChange={(e) => setSlideLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Sıra No</label>
                  <input
                    type="number"
                    value={slideIndex}
                    onChange={(e) => setSlideIndex(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
                >
                  {editingSlider ? 'Sliderı Güncelle' : 'Slider Ekle'}
                </button>
                {editingSlider && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlider(null);
                      setSlideTitle('');
                      setSlideSub('');
                      setSlideImg('');
                      setSlideLink('');
                      setSlideIndex('0');
                    }}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-3">Mevcut Sliderlar</h4>
            <div className="space-y-3.5 text-xs max-h-[350px] overflow-y-auto pr-1">
              {sliders.map((s) => (
                <div key={s.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-2xs relative">
                  <div className="flex gap-3">
                    <img
                      src={s.image_url}
                      alt={s.title}
                      className="w-16 h-10 object-cover bg-slate-100 border rounded-md"
                    />
                    <div>
                      <h5 className="font-bold text-slate-800">Slayt #{s.order_index || 0}</h5>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">Yönlendirme: {s.link || 'Yok'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 z-10">
                    <button
                      onClick={() => handleEditSliderClick(s)}
                      className="p-1.5 hover:bg-slate-50 text-blue-600 rounded-md transition-all"
                      title="Düzenle"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({
                        show: true,
                        type: 'slider',
                        id: s.id,
                        title: s.title
                      })}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-all"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hikaye (Story) Yönetimi */}
      {activeSubTab === 'stories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
            <h4 className="font-bold text-slate-800 text-sm mb-4">
              {editingStory ? 'Story Düzenle' : 'Yeni Story (Hikaye) Ekle'}
            </h4>
            <form onSubmit={handleStorySubmit} className="space-y-3.5">
              {storyMsg && (
                <div className="p-2.5 bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-semibold">
                  {storyMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Story Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Ör: Haftanın Ürünleri"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Görsel URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://picsum.photos/..."
                  value={storyImg}
                  onChange={(e) => setStoryImg(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  💡 <strong>Öneri:</strong> 100x100 px kare biçiminde yuvarlak görünecek bir görsel yükleyin.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Yönlendirme Türü</label>
                <select
                  value={storyType}
                  onChange={(e) => setStoryType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                >
                  <option value="category">Kategoriye Yönlendir</option>
                  <option value="product">Ürüne Yönlendir</option>
                  <option value="url">Özel URL/Linki</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Yönlendirme Değeri (ID veya URL)</label>
                <input
                  type="text"
                  required
                  placeholder={
                    storyType === 'category'
                      ? 'Kategori Slug (örn: ofis-kagitlari)'
                      : storyType === 'product'
                      ? 'Ürün ID\'si (örn: 14)'
                      : 'Bağlantı Linki (örn: https://...)'
                  }
                  value={storyTarget}
                  onChange={(e) => setStoryTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Sıralama Endeksi</label>
                <input
                  type="number"
                  value={storyOrder}
                  onChange={(e) => setStoryOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
                >
                  {editingStory ? 'Story Güncelle' : 'Story Ekle'}
                </button>
                {editingStory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStory(null);
                      setStoryTitle('');
                      setStoryImg('');
                      setStoryType('category');
                      setStoryTarget('');
                      setStoryOrder('0');
                    }}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-3">Mevcut Hikayeler (Story)</h4>
            {loadingStories ? (
              <div className="text-center py-6 text-slate-400">Yükleniyor...</div>
            ) : stories.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium">Kayıtlı story bulunmuyor.</div>
            ) : (
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {stories.map((s) => (
                  <div key={s.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="p-[2px] bg-gradient-to-tr from-orange-500 to-pink-500 rounded-full">
                        <img
                          src={s.image_url}
                          alt={s.title}
                          className="w-10 h-10 object-cover bg-white rounded-full border border-white"
                        />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">{s.title}</h5>
                        <p className="text-[10px] text-slate-400 font-medium capitalize">
                          Tür: <strong className="text-slate-500">{s.type}</strong> | Hedef: <strong className="text-slate-500">{s.target_value}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 z-10">
                      <button
                        onClick={() => handleEditStoryClick(s)}
                        className="p-1.5 hover:bg-slate-50 text-blue-600 rounded-md transition-all"
                        title="Düzenle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({
                          show: true,
                          type: 'story',
                          id: s.id,
                          title: s.title
                        })}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sayfa Yönetimi */}
      {activeSubTab === 'pages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 animate-in fade-in duration-200">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
            <h4 className="font-bold text-slate-800 text-sm mb-4">
              {editingPage ? 'Sayfayı Düzenle' : 'Yeni SEO Sayfası Ekle'}
            </h4>
            <form onSubmit={handlePageSubmit} className="space-y-3.5">
              {pageMsg && (
                <div className={`p-2.5 rounded-lg font-semibold border ${
                  pageMsg.startsWith('Hata') 
                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {pageMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Sayfa Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Ör: İstanbul Kırtasiye Toptancıları"
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value);
                    if (!editingPage) {
                      setPageSlug(turkishSlugify(e.target.value));
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">URL Kısa İsim (Slug)</label>
                <input
                  type="text"
                  required
                  placeholder="istanbul-kirtasiye-toptancilari"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(turkishSlugify(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-blue-600 font-bold animate-pulse"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Bu sayfa sitenizde <strong>hbtedarik.com/{pageSlug || 'link'}</strong> şeklinde görüntülenecektir.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Görsel URL (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={pageImg}
                  onChange={(e) => setPageImg(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Sayfa İçeriği / Yazısı (Paragraf)</label>
                <textarea
                  rows={6}
                  placeholder="SEO odaklı makale, açıklama, paragraf veya özel metinleri buraya girin..."
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                />
              </div>

              {/* SEO Meta Fields */}
              <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200/50 space-y-3">
                <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block">Gelişmiş SEO Ayarları</span>
                
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Meta Başlık (Title)</label>
                  <input
                    type="text"
                    placeholder="Boş bırakılırsa sayfa başlığı kullanılır"
                    value={pageMetaTitle}
                    onChange={(e) => setPageMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Meta Açıklama (Description)</label>
                  <textarea
                    rows={2}
                    placeholder="Aramalarda görünecek kısa açıklama metni"
                    value={pageMetaDesc}
                    onChange={(e) => setPageMetaDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Meta Anahtar Kelimeler (Keywords)</label>
                  <input
                    type="text"
                    placeholder="virgülle ayırın: kırtasiye, istanbul, toptan"
                    value={pageMetaKeywords}
                    onChange={(e) => setPageMetaKeywords(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg cursor-pointer"
                >
                  {editingPage ? 'Sayfayı Güncelle' : 'Sayfayı Kaydet'}
                </button>
                {editingPage && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPage(null);
                      setPageTitle('');
                      setPageSlug('');
                      setPageImg('');
                      setPageContent('');
                      setPageMetaTitle('');
                      setPageMetaDesc('');
                      setPageMetaKeywords('');
                    }}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg cursor-pointer"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-3">Mevcut SEO Sayfaları</h4>
            {loadingPages ? (
              <div className="text-center py-6 text-slate-400">Yükleniyor...</div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium">Henüz kayıtlı SEO sayfası bulunmuyor.</div>
            ) : (
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {pages.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs gap-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h5 className="font-black text-slate-900 text-xs sm:text-sm">{p.title}</h5>
                        <p className="font-mono text-[10px] text-blue-600 font-semibold truncate max-w-[250px]">
                          /{p.slug}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <a
                          href={`/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 px-2 hover:bg-emerald-50 text-emerald-600 rounded-md transition-all font-bold text-[10px] border border-emerald-100"
                          title="Görüntüle"
                        >
                          Sayfayı Aç
                        </a>
                        <button
                          onClick={() => handleEditPageClick(p)}
                          className="p-1 hover:bg-slate-50 text-blue-600 rounded-md transition-all"
                          title="Düzenle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${p.title}" sayfasını silmek istediğinize emin misiniz?`)) {
                              handleDeletePage(p.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 text-red-600 rounded-md transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kullanıcı Yönetimi */}
      {activeSubTab === 'users' && (
        <div className="text-xs text-slate-700 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Tüm Kayıtlı Üyeler</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Sistemde kayıtlı tüm bireysel ve kurumsal kullanıcıların listesi.</p>
            </div>
            <div className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-[10px]">
              Toplam: {allUsers.length} Üye
            </div>
          </div>

          {userMsg && (
            <div className={`p-3 rounded-lg border mb-4 font-semibold ${
              userMsg.startsWith('Hata') 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {userMsg}
            </div>
          )}

          {loadingUsers ? (
            <div className="text-center py-10 text-slate-400 font-medium animate-pulse">Kullanıcılar yükleniyor...</div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold bg-slate-50 border border-slate-100 rounded-xl">
              Sistemde henüz kayıtlı üye bulunmamaktadır.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      <th className="px-4 py-3">Üye Bilgileri</th>
                      <th className="px-4 py-3">İletişim</th>
                      <th className="px-4 py-3">Üyelik Tipi</th>
                      <th className="px-4 py-3">Kurumsal Bilgiler</th>
                      <th className="px-4 py-3">Kayıt Tarihi</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => {
                      const isCorporate = u.role === 'corporate' || u.role === 'corporate_pending' || !!u.company_name;
                      const roleLabels: { [key: string]: { text: string; bg: string; textCol: string } } = {
                        'admin': { text: 'Yönetici', bg: 'bg-purple-100', textCol: 'text-purple-700' },
                        'corporate': { text: 'Kurumsal', bg: 'bg-blue-100', textCol: 'text-blue-700' },
                        'corporate_pending': { text: 'Kurumsal (Onay Bekliyor)', bg: 'bg-amber-100', textCol: 'text-amber-700' },
                        'customer': { text: 'Bireysel', bg: 'bg-slate-100', textCol: 'text-slate-700' }
                      };
                      const roleConfig = roleLabels[u.role] || { text: 'Bireysel', bg: 'bg-slate-100', textCol: 'text-slate-700' };

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-black text-slate-900 block text-xs sm:text-sm">{u.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold font-mono">ID: #{u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <span className="font-semibold text-slate-800 block">{u.email}</span>
                              <span className="text-[11px] text-slate-500 font-medium font-mono">{u.phone || 'Telefon Yok'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleConfig.bg} ${roleConfig.textCol}`}>
                              {roleConfig.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 max-w-xs">
                            {isCorporate ? (
                              <div className="space-y-0.5 text-[11px]">
                                <span className="font-black text-slate-900 block truncate">{u.company_name || 'Firma Adı Belirtilmemiş'}</span>
                                <span className="text-slate-500 block">
                                  VD: {u.tax_office || '-'} / No: {u.tax_no || '-'}
                                </span>
                                {u.address && (
                                  <span className="text-slate-400 text-[10px] block truncate" title={u.address}>
                                    Adres: {u.address}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Bireysel Müşteri</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-500 font-medium font-mono whitespace-nowrap">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.role === 'admin'}
                              className={`p-1.5 rounded-lg transition-colors border ${
                                u.role === 'admin' 
                                  ? 'text-slate-300 border-slate-100 cursor-not-allowed' 
                                  : 'text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200 cursor-pointer'
                              }`}
                              title={u.role === 'admin' ? 'Yönetici hesabı silinemez' : 'Hesabı Sil'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Site Ayarları Yönetimi */}
      {activeSubTab === 'settings' && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6 text-xs text-slate-700">
          <h4 className="font-bold text-slate-800 text-sm mb-2">Genel Mağaza & Kurumsal Ayarlar</h4>
          <p className="text-slate-500 text-[11px] mb-5 font-medium">
            Sitenizdeki tüm isim, logo, iletişim, adres ve sosyal medya bilgilerini dinamik olarak buradan güncelleyebilirsiniz.
          </p>

          <form onSubmit={handleConfigsSubmit} className="space-y-4">
            {configMsg && (
              <div className="p-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-bold">
                {configMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Firma / Mağaza Adı</label>
                <input
                  type="text"
                  required
                  placeholder="örn: Hani Baba Tedarik"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Logo Gösterim Tipi</label>
                <select
                  value={configLogoType}
                  onChange={(e) => setConfigLogoType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                >
                  <option value="text">Sadece Metin (Firma İsmi)</option>
                  <option value="image">Görsel / Resim Dosyası</option>
                </select>
              </div>
            </div>

            {configLogoType === 'image' && (
              <div className="bg-white border border-slate-200 p-3.5 rounded-lg space-y-2">
                <label className="block font-bold text-slate-600">Görsel Logo URL</label>
                <input
                  type="text"
                  placeholder="https://siteniz.com/logo.png"
                  value={configLogo}
                  onChange={(e) => setConfigLogo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                  💡 <strong>Tasarım Tavsiyesi:</strong> Şeffaf arka planlı (transparent PNG) ve 
                  <strong className="text-blue-600">300x80 piksel</strong> boyutlarında bir logo görseli eklemenizi öneririz.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Müşteri Destek Telefonu</label>
                <input
                  type="text"
                  placeholder="örn: 0850 555 0 555"
                  value={configPhone}
                  onChange={(e) => setConfigPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Kurumsal E-posta</label>
                <input
                  type="email"
                  placeholder="örn: bilgi@hanibabatedarik.com"
                  value={configEmail}
                  onChange={(e) => setConfigEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Resmi Adres Bilgisi</label>
              <textarea
                placeholder="İstanbul, Türkiye"
                value={configAddress}
                onChange={(e) => setConfigAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg h-16 font-semibold"
              />
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3">
              <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-1 text-xs">Sosyal Medya Linkleri</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-0.5">Instagram URL</label>
                  <input
                    type="text"
                    value={configInstagram}
                    onChange={(e) => setConfigInstagram(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-0.5">Facebook URL</label>
                  <input
                    type="text"
                    value={configFacebook}
                    onChange={(e) => setConfigFacebook(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-0.5">Twitter URL</label>
                  <input
                    type="text"
                    value={configTwitter}
                    onChange={(e) => setConfigTwitter(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4">
              <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-1.5 text-xs flex items-center gap-1.5 text-orange-600">
                🍊 Anasayfa Tanıtım Banner Alanları (Sebze & Meyve vb.)
              </h5>
              
              <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150 space-y-3">
                <p className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wide">1. Banner Ayarları</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Banner Başlığı</label>
                    <input
                      type="text"
                      value={promo1Title}
                      onChange={(e) => setPromo1Title(e.target.value)}
                      placeholder="Örn: Taze Sebze & Meyve Dünyası"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Banner Görsel URL</label>
                    <input
                      type="text"
                      value={promo1Image}
                      onChange={(e) => setPromo1Image(e.target.value)}
                      placeholder="Görsel bağlantısı"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Yönlendirme Linki (URL)</label>
                    <input
                      type="text"
                      value={promo1Link}
                      onChange={(e) => setPromo1Link(e.target.value)}
                      placeholder="Örn: /categories/sebze-meyve"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150 space-y-3">
                <p className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wide">2. Banner Ayarları</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Banner Başlığı</label>
                    <input
                      type="text"
                      value={promo2Title}
                      onChange={(e) => setPromo2Title(e.target.value)}
                      placeholder="Örn: Özel Tedarik & Hızlı Teslimat"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Banner Görsel URL</label>
                    <input
                      type="text"
                      value={promo2Image}
                      onChange={(e) => setPromo2Image(e.target.value)}
                      placeholder="Görsel bağlantısı"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Yönlendirme Linki (URL)</label>
                    <input
                      type="text"
                      value={promo2Link}
                      onChange={(e) => setPromo2Link(e.target.value)}
                      placeholder="Örn: /products"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 bg-blue-50/20 border-blue-200">
              <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-1 text-xs flex items-center gap-1.5 text-blue-700">
                <Settings className="w-4 h-4 text-blue-600" /> Bireysel Müşteri Yetkilendirme
              </h5>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Bireysel Müşteri Giriş & Kayıt İzni</label>
                <select
                  value={allowIndividualAuth}
                  onChange={(e) => setAllowIndividualAuth(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                >
                  <option value="true">Giriş ve Kayıt İşlemlerine İzin Ver (Açık)</option>
                  <option value="false">Sadece Kurumsal Müşterilere İzin Ver (Bireysel Giriş/Kayıt Kapalı)</option>
                </select>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  💡 Bu ayarı <strong>&quot;Sadece Kurumsal Müşterilere İzin Ver&quot;</strong> yaparsanız, bireysel müşteriler üye olamaz veya giriş yapamazlar. Sadece onaylanmış kurumsal üyeleriniz portalı kullanabilir.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 bg-amber-50/20">
              <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-1 text-xs flex items-center gap-1.5 text-amber-700">
                <Settings className="w-4 h-4 text-amber-600" /> Aktif Ödeme Sağlayıcı Seçimi
              </h5>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Müşterilerin Kullanacağı Ödeme Altyapısı</label>
                <select
                  value={activePaymentProvider}
                  onChange={(e) => setActivePaymentProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                >
                  <option value="paytr">PayTR (Sanal POS - Kartlı Ödeme)</option>
                  <option value="shopier">Shopier (Gerçek Entegrasyon - Link ile Ödeme)</option>
                </select>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                  💡 Seçtiğiniz ödeme altyapısı normal (bireysel) kullanıcılar sepetlerini onaylayacakları zaman ödeme aşamasında aktif olacaktır. Diğer sağlayıcı devre dışı bırakılacaktır.
                </p>
              </div>
            </div>

            <div className={`bg-white border border-slate-200 p-4 rounded-xl space-y-3 ${activePaymentProvider === 'paytr' ? 'border-blue-300 bg-blue-50/10' : 'opacity-60'}`}>
              <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-1 text-xs flex items-center gap-1.5 text-blue-700">
                <CreditCard className="w-4 h-4 text-blue-600" /> PayTR Sanal POS Entegrasyon Ayarları {activePaymentProvider === 'paytr' && <span className="bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full ml-auto">AKTİF</span>}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mağaza Numarası (Merchant ID)</label>
                  <input
                    type="text"
                    placeholder="örn: 215844"
                    value={paytrMerchantId}
                    onChange={(e) => setPaytrMerchantId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Test Modu (Sandbox)</label>
                  <select
                    value={paytrSandbox}
                    onChange={(e) => setPaytrSandbox(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
                  >
                    <option value="1">Aktif (Test / Sandbox Modu)</option>
                    <option value="0">Pasif (Gerçek / Canlı Mod)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mağaza Parolası (Merchant Key)</label>
                  <input
                    type="password"
                    placeholder="PayTR Merchant Key"
                    value={paytrMerchantKey}
                    onChange={(e) => setPaytrMerchantKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mağaza Gizli Anahtarı (Merchant Salt)</label>
                  <input
                    type="password"
                    placeholder="PayTR Merchant Salt"
                    value={paytrMerchantSalt}
                    onChange={(e) => setPaytrMerchantSalt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                ℹ️ <strong>PayTR Bilgileri:</strong> Bu bilgileri PayTR Mağaza Paneli &gt; Bilgi sayfasından alabilirsiniz.
              </p>
            </div>

            <div className={`bg-white border border-slate-200 p-4 rounded-xl space-y-3 ${activePaymentProvider === 'shopier' ? 'border-violet-300 bg-violet-50/10' : 'opacity-60'}`}>
              <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-1 text-xs flex items-center gap-1.5 text-violet-700">
                <CreditCard className="w-4 h-4 text-violet-600" /> Shopier API Ödeme Entegrasyon Ayarları {activePaymentProvider === 'shopier' && <span className="bg-violet-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full ml-auto">AKTİF</span>}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Shopier API Key (Kullanıcı Anahtarı)</label>
                  <input
                    type="text"
                    placeholder="Shopier API Key"
                    value={shopierApiKey}
                    onChange={(e) => setShopierApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Shopier Website Index</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={shopierWebsiteIndex}
                    onChange={(e) => setShopierWebsiteIndex(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Shopier API Secret (Kullanıcı Şifresi / Secret)</label>
                <input
                  type="password"
                  placeholder="Shopier API Secret"
                  value={shopierApiSecret}
                  onChange={(e) => setShopierApiSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                />
              </div>

              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                ℹ️ <strong>Shopier Bilgileri:</strong> Shopier API Key ve API Secret bilgilerinizi Shopier üye panelinizden alabilirsiniz. 
                Seçiminizle birlikte, müşterileriniz Shopier&apos;in güvenli ödeme arayüzüne yönlendirilecektir.
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingConfigs}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-sm"
            >
              {loadingConfigs ? 'Kaydediliyor...' : 'Site Ayarlarını Kaydet & Değişiklikleri Uygula'}
            </button>
          </form>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Silme Onayı</h3>
            </div>
            
            <p className="text-slate-600 text-xs mb-6 leading-relaxed font-semibold">
              <strong className="text-slate-900">&quot;{deleteConfirm.title}&quot;</strong> öğesini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              {deleteConfirm.type === 'category' && (
                <span className="block mt-2 text-[11px] text-amber-600 font-bold">
                  ⚠️ Dikkat: Bu kategori altındaki tüm ürünler kategorisiz kalacaktır.
                </span>
              )}
            </p>
            
            <div className="flex gap-3 justify-end text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, type: null, id: null, title: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { type, id } = deleteConfirm;
                  if (!id || !type) return;
                  
                  try {
                    if (type === 'category') {
                      await handleDeleteCategory(id);
                    } else if (type === 'product') {
                      await handleDeleteProduct(id);
                    } else if (type === 'slider') {
                      await handleDeleteSlider(id);
                    } else if (type === 'story') {
                      await handleDeleteStory(id);
                    }
                  } catch (err) {
                    console.error('Delete error:', err);
                  } finally {
                    setDeleteConfirm({ show: false, type: null, id: null, title: '' });
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
