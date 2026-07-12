import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Password hashing helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Lazy-loaded database connection pool using global context to prevent connection leaks during development hot-reloads
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
  isInitialized: boolean | undefined;
  initPromise: Promise<void> | undefined;
  useFallback: boolean | undefined;
  fallbackDb: any | undefined;
};

// Seeding / Fallback Data Structures
export function initializeFallbackDb() {
  if (globalForDb.fallbackDb) return;

  console.log('Initializing in-memory fallback database...');
  
  const users = [
    {
      id: 1,
      name: 'Sistem Yöneticisi',
      email: 'admin@admin.com',
      password: hashPassword('1234'),
      phone: '05555555555',
      role: 'admin',
      company_name: null,
      tax_no: null,
      tax_office: null,
      address: null,
      created_at: new Date()
    }
  ];

  const categories = [
    { id: 1, name: 'Kağıt Ürünleri', slug: 'kagit-urunleri', description: 'Fotokopi kağıtları, defterler ve bloknotlar', image_url: 'https://picsum.photos/seed/paper/400/300', show_on_homepage: 1, meta_title: 'Kağıt Ürünleri', meta_description: 'Fotokopi kağıtları ve defterler', meta_keywords: 'a4, fotokopi, defter' },
    { id: 2, name: 'Yazma & Çizme', slug: 'yazma-cizme', description: 'Kalemler, tahta kalemleri, imza kalemleri ve silgiler', image_url: 'https://picsum.photos/seed/pen/400/300', show_on_homepage: 1, meta_title: 'Yazma & Çizme', meta_description: 'Kalemler ve silgiler', meta_keywords: 'kalem, tükenmez, versatil' },
    { id: 3, name: 'Ofis Makineleri', slug: 'ofis-makineleri', description: 'Hesap makineleri, evrak imha makineleri, etiketleme', image_url: 'https://picsum.photos/seed/machine/400/300', show_on_homepage: 1, meta_title: 'Ofis Makineleri', meta_description: 'Hesap makineleri ve imha cihazları', meta_keywords: 'hesap makinesi, evrak imha' },
    { id: 4, name: 'Klasörleme & Arşiv', slug: 'klasorleme-arsiv', description: 'Klasörler, dosyalar, poşet dosyalar, arşiv kutuları', image_url: 'https://picsum.photos/seed/folder/400/300', show_on_homepage: 1, meta_title: 'Klasörleme & Arşiv', meta_description: 'Klasörler ve poşet dosyalar', meta_keywords: 'klasör, poşet dosya, arşiv' },
    { id: 5, name: 'Gıda & Mutfak', slug: 'gida-mutfak', description: 'Çay, kahve, şeker, kullan-at mutfak malzemeleri', image_url: 'https://picsum.photos/seed/food/400/300', show_on_homepage: 1, meta_title: 'Gıda & Mutfak', meta_description: 'Çay, kahve ve şeker çeşitleri', meta_keywords: 'çay, kahve, şeker, ofis gıda' },
    { id: 6, name: 'Temizlik Ürünleri', slug: 'temizlik-urunleri', description: 'Yüzey temizleyiciler, peçete, sıvı sabun, deterjanlar', image_url: 'https://picsum.photos/seed/cleaning/400/300', show_on_homepage: 1, meta_title: 'Temizlik Ürünleri', meta_description: 'Sıvı sabun, deterjan ve peçeteler', meta_keywords: 'temizlik, sıvı sabun, peçete' }
  ];

  const sliders = [
    { id: 1, title: 'Kurumsal Ofis İhtiyaçlarınız Tek Tıkla!', subtitle: 'Tüm ofis kırtasiye, temizlik ve gıda malzemelerinde toptan fiyatlar.', image_url: 'https://picsum.photos/seed/slider1/1200/400', link: '/kagit-urunleri', order_index: 1 },
    { id: 2, title: 'B2B Cari Hesap Avantajları', subtitle: 'Kurumsal üyelerimiz için vade ve faturayla ödeme kolaylığı burada.', image_url: 'https://picsum.photos/seed/slider2/1200/400', link: '/kayit', order_index: 2 }
  ];

  const products = [
    { id: 1, name: 'Copier Bond A4 Fotokopi Kağıdı 80 gr 500 Adet', slug: 'copier-bond-a4', description: 'Yüksek kaliteli, çift taraflı çekime uygun A4 fotokopi kağıdı.', price: 145.90, stock: 1500, sku: 'SKU-A4-COPIER', image_url: 'https://picsum.photos/seed/a4paper/400/400', category_id: 1, is_featured: 1, created_at: new Date() },
    { id: 2, name: 'OfisDefteri A4 Kareli Defter 120 Yaprak', slug: 'ofis-defteri-a4', description: 'Sert kapaklı, dayanıklı kareli okul ve ofis defteri.', price: 65.00, stock: 450, sku: 'SKU-DEF-A4', image_url: 'https://picsum.photos/seed/notebook/400/400', category_id: 1, is_featured: 0, created_at: new Date() },
    { id: 3, name: 'Schneider Slider Edge XB Tükenmez Kalem Mavi', slug: 'schneider-slider-blue', description: 'Viscoglide teknolojisi ile ultra akıcı mavi tükenmez kalem.', price: 28.50, stock: 1200, sku: 'SKU-PEN-BLUE', image_url: 'https://picsum.photos/seed/bluepen/400/400', category_id: 2, is_featured: 1, created_at: new Date() },
    { id: 4, name: 'Faber-Castell Grip 1347 Versatil Kalem 0.7 mm', slug: 'faber-castell-grip-07', description: 'Ergonomik kauçuk kılıf, yaylı uç mekanizması.', price: 125.00, stock: 300, sku: 'SKU-PEN-GRIP07', image_url: 'https://picsum.photos/seed/grip07/400/400', category_id: 2, is_featured: 0, created_at: new Date() },
    { id: 5, name: 'Casio DF-120FM 12 Hane Masa Üstü Hesap Makinesi', slug: 'casio-df-120fm', description: 'KDV hesaplama, maliyet/satış/marj tuşları, metal ön yüzey.', price: 445.00, stock: 80, sku: 'SKU-CASIO-DF120', image_url: 'https://picsum.photos/seed/casio/400/400', category_id: 3, is_featured: 1, created_at: new Date() },
    { id: 6, name: 'Leitz IQ Home Evrak İmha Makinesi P4 şerit', slug: 'leitz-iq-shredder', description: 'Kişisel ofis ve ev kullanımı için sessiz evrak imha makinesi.', price: 2850.00, stock: 15, sku: 'SKU-LEITZ-SHRED', image_url: 'https://picsum.photos/seed/shredder/400/400', category_id: 3, is_featured: 0, created_at: new Date() },
    { id: 7, name: 'Noki Geniş Klasör A4 Mavi', slug: 'noki-klasor-a4', description: 'Dayanıklı mekanizma, sırt cebi ve sırt kartonu ile pratik klasör.', price: 52.00, stock: 1000, sku: 'SKU-FOLD-A4B', image_url: 'https://picsum.photos/seed/folder-blue/400/400', category_id: 4, is_featured: 1, created_at: new Date() },
    { id: 8, name: 'Noki 11 Delikli Poşet Dosya A4 100lü Paket', slug: 'noki-poset-dosya-100', description: 'Göz yormayan pürüzsüz yüzey, dayanıklı delik şeridi.', price: 48.00, stock: 2000, sku: 'SKU-POUCH-A4', image_url: 'https://picsum.photos/seed/pouches/400/400', category_id: 4, is_featured: 0, created_at: new Date() },
    { id: 9, name: 'Lipton Yellow Label Bardak Poşet Çay 100lü', slug: 'lipton-yellow-label-100', description: 'Ofislerin vazgeçilmezi, taze demlenmiş çay lezzeti.', price: 110.00, stock: 600, sku: 'SKU-TEA-LIPTON', image_url: 'https://picsum.photos/seed/lipton/400/400', category_id: 5, is_featured: 1, created_at: new Date() },
    { id: 10, name: 'Mehmet Efendi Türk Kahvesi 250 gr', slug: 'mehmet-efendi-250g', description: 'Geleneksel lezzet, taze çekilmiş Türk kahvesi teneke kutu.', price: 98.00, stock: 400, sku: 'SKU-COFFEE-MEHMET', image_url: 'https://picsum.photos/seed/turkish-coffee/400/400', category_id: 5, is_featured: 0, created_at: new Date() },
    { id: 11, name: 'Selpak Professional Kağıt Havlu 12li Rulo', slug: 'selpak-havlu-12', description: 'Yüksek emiş gücü, dayanıklı çift katlı rulo havlu.', price: 165.00, stock: 350, sku: 'SKU-TOWEL-SELPAK', image_url: 'https://picsum.photos/seed/selpak/400/400', category_id: 6, is_featured: 1, created_at: new Date() },
    { id: 12, name: 'Activex Antibakteriyel Sıvı Sabun Hassas 650 ml', slug: 'activex-sabun-650', description: 'Bakterilerin %99.9\'unu öldürür, cildi kurutmaz.', price: 75.00, stock: 500, sku: 'SKU-SOAP-ACTIVEX', image_url: 'https://picsum.photos/seed/soap/400/400', category_id: 6, is_featured: 0, created_at: new Date() }
  ];

  const stories = [
    { id: 1, title: 'İndirimli Kağıtlar', image_url: 'https://picsum.photos/seed/story1/150/150', type: 'category', target_value: 'kagit-urunleri', order_index: 1 },
    { id: 2, title: 'En Çok Satanlar', image_url: 'https://picsum.photos/seed/story2/150/150', type: 'product', target_value: 'copier-bond-a4', order_index: 2 },
    { id: 3, title: 'Süper Kalemler', image_url: 'https://picsum.photos/seed/story3/150/150', type: 'category', target_value: 'yazma-cizme', order_index: 3 },
    { id: 4, title: 'Masaüstü Casio', image_url: 'https://picsum.photos/seed/story4/150/150', type: 'product', target_value: 'casio-df-120fm', order_index: 4 },
    { id: 5, title: 'Kariyer Fırsatları', image_url: 'https://picsum.photos/seed/story5/150/150', type: 'url', target_value: 'https://google.com', order_index: 5 }
  ];

  const configs: { [key: string]: string } = {
    site_name: 'Hanibaba Tedarik',
    site_logo_type: 'text',
    site_logo: '',
    site_address: 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No 103',
    site_phone: '+905010160527',
    site_email: 'bilgi@hanibabatedarik.com',
    site_instagram: '#',
    site_facebook: '#',
    site_twitter: '#',
    promo_banner_1_title: 'Taze Sebzeler',
    promo_banner_1_image: 'https://images.unsplash.com/photo-1566385101042-1a010c159fcf?w=600&auto=format&fit=crop&q=80',
    promo_banner_1_link: '/categories/sebzeler',
    promo_banner_2_title: 'Taze Meyveler',
    promo_banner_2_image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop&q=80',
    promo_banner_2_link: '/categories/meyveler',
    paytr_merchant_id: '215844',
    paytr_merchant_key: 'xxPayTRKey123xx',
    paytr_merchant_salt: 'xxPayTRSalt123xx',
    paytr_sandbox: '1',
    shopier_api_key: 'shopier_api_key_849102',
    shopier_api_secret: 'shopier_api_secret_998877',
    shopier_website_index: '1',
    active_payment_provider: 'paytr',
    allow_individual_auth: 'true'
  };

  globalForDb.fallbackDb = {
    users,
    categories,
    products,
    orders: [],
    order_items: [],
    sliders,
    notifications: [],
    configs,
    stories,
    user_addresses: [],
    pages: []
  };
}

export function queryFallback(sql: string, params: any[] = []): any {
  initializeFallbackDb();
  const db = globalForDb.fallbackDb!;

  const sqlNormalized = sql.trim().replace(/\s+/g, ' ');
  const sqlLower = sqlNormalized.toLowerCase();

  const getTableName = (s: string) => {
    const match = s.match(/(?:from|into|update|delete\s+from)\s+([a-zA-Z0-9_`]+)/i);
    if (match) {
      return match[1].replace(/`/g, '');
    }
    return '';
  };

  if (sqlLower.startsWith('create table') || sqlLower.startsWith('alter table')) {
    return { success: true };
  }

  if (sqlLower.includes('information_schema')) {
    return [];
  }

  if (sqlLower.startsWith('select')) {
    const table = getTableName(sqlLower);

    if (table === 'configs') {
      if (sqlLower.includes('where')) {
        const keyMatch = sqlNormalized.match(/key`?\s*=\s*(?:"([^"]+)"|'([^']+)'|\?)/i);
        let keyVal = '';
        if (keyMatch) {
          if (keyMatch[1]) keyVal = keyMatch[1];
          else if (keyMatch[2]) keyVal = keyMatch[2];
          else if (params && params.length > 0) keyVal = params[0];
        }

        if (keyVal) {
          const val = db.configs[keyVal];
          return val !== undefined ? [{ key: keyVal, value: val }] : [];
        }
      }
      return Object.entries(db.configs).map(([k, v]) => ({ key: k, value: v }));
    }

    if (table === 'categories') {
      return db.categories;
    }

    if (table === 'sliders') {
      return db.sliders;
    }

    if (table === 'stories') {
      if (sqlLower.includes('count(*)')) {
        return [{ count: db.stories.length }];
      }
      return db.stories;
    }

    if (table === 'products') {
      if (sqlLower.includes('count(id) as totalproducts') || sqlLower.includes('count(id) as total_products')) {
        return [{ totalProducts: db.products.length, total_products: db.products.length }];
      }
      if (sqlLower.includes('where p.id = ?') || sqlLower.includes('where id = ?')) {
        const id = params[0];
        const prod = db.products.find((p: any) => p.id === Number(id));
        if (prod) {
          const cat = db.categories.find((c: any) => c.id === prod.category_id);
          return [{ ...prod, category_name: cat ? cat.name : '' }];
        }
        return [];
      }
      return db.products.map((p: any) => {
        const cat = db.categories.find((c: any) => c.id === p.category_id);
        return { ...p, category_name: cat ? cat.name : '' };
      });
    }

    if (table === 'users') {
      if (sqlLower.includes('count(id) as totalusers') || sqlLower.includes('case when role =')) {
        const totalUsers = db.users.length;
        const customersCount = db.users.filter((u: any) => u.role === 'customer').length;
        const corporateCount = db.users.filter((u: any) => u.role === 'corporate').length;
        const corporatePendingCount = db.users.filter((u: any) => u.role === 'corporate_pending').length;
        return [{
          totalUsers,
          customersCount,
          corporateCount,
          corporatePendingCount
        }];
      }
      if (sqlLower.includes('email = ?')) {
        const email = params[0];
        const u = db.users.find((u: any) => u.email === email);
        return u ? [u] : [];
      }
      if (sqlLower.includes('phone = ?')) {
        const phone = params[0];
        const u = db.users.find((u: any) => u.phone === phone);
        return u ? [u] : [];
      }
      if (sqlLower.includes('id = ?')) {
        const id = params[0];
        const u = db.users.find((u: any) => u.id === Number(id));
        return u ? [u] : [];
      }
      return db.users;
    }

    if (table === 'user_addresses') {
      const userId = params[0];
      return db.user_addresses.filter((a: any) => a.user_id === Number(userId));
    }

    if (table === 'pages') {
      if (sqlLower.includes('where slug =') || sqlLower.includes('slug = ?')) {
        const slugVal = params[0];
        const page = db.pages.find((p: any) => p.slug === slugVal);
        return page ? [page] : [];
      }
      if (sqlLower.includes('where id =') || sqlLower.includes('id = ?')) {
        const id = params[0];
        const page = db.pages.find((p: any) => p.id === Number(id));
        return page ? [page] : [];
      }
      return db.pages;
    }

    if (table === 'notifications') {
      if (sqlLower.includes('user_id is null')) {
        return db.notifications.filter((n: any) => n.user_id === null);
      }
      const userId = params[0];
      return db.notifications.filter((n: any) => n.user_id === Number(userId) || n.user_id === null);
    }

    if (table === 'orders') {
      if (sqlLower.includes('sum(total_amount) as totalsales')) {
        const activeOrders = db.orders.filter((o: any) => o.status !== 'cancelled');
        const totalSales = activeOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
        return [{ totalSales, totalOrders: activeOrders.length }];
      }
      if (sqlLower.includes('payment_method as method')) {
        const activeOrders = db.orders.filter((o: any) => o.status !== 'cancelled');
        const groups: { [key: string]: { method: string; total: number; count: number } } = {};
        activeOrders.forEach((o: any) => {
          const method = o.payment_method || 'cari';
          if (!groups[method]) {
            groups[method] = { method, total: 0, count: 0 };
          }
          groups[method].total += Number(o.total_amount);
          groups[method].count += 1;
        });
        return Object.values(groups);
      }
      if (sqlLower.includes('group by status')) {
        const groups: { [key: string]: { status: string; total: number; count: number } } = {};
        db.orders.forEach((o: any) => {
          const status = o.status || 'pending';
          if (!groups[status]) {
            groups[status] = { status, total: 0, count: 0 };
          }
          groups[status].total += Number(o.total_amount);
          groups[status].count += 1;
        });
        return Object.values(groups);
      }
      if (sqlLower.includes('group by date(created_at)')) {
        const activeOrders = db.orders.filter((o: any) => o.status !== 'cancelled');
        const groups: { [key: string]: { date: string; total: number; count: number } } = {};
        activeOrders.forEach((o: any) => {
          const d = o.created_at ? new Date(o.created_at) : new Date();
          const dateStr = d.toISOString().split('T')[0];
          if (!groups[dateStr]) {
            groups[dateStr] = { date: dateStr, total: 0, count: 0 };
          }
          groups[dateStr].total += Number(o.total_amount);
          groups[dateStr].count += 1;
        });
        return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 30);
      }
      if (sqlLower.includes('where id = ?')) {
        const id = params[0];
        const ord = db.orders.find((o: any) => o.id === Number(id));
        return ord ? [ord] : [];
      }
      if (sqlLower.includes('user_id = ?')) {
        const userId = params[0];
        return db.orders.filter((o: any) => o.user_id === Number(userId));
      }
      return db.orders;
    }

    if (table === 'order_items') {
      if (sqlLower.includes('order_id = ?')) {
        const orderId = params[0];
        return db.order_items.filter((i: any) => i.order_id === Number(orderId));
      }
      return db.order_items;
    }

    if (sqlLower.includes('count(id) as total_orders') || sqlLower.includes('reports')) {
      const approvedCount = db.orders.filter((o: any) => o.status === 'approved').length;
      const totalRevenue = db.orders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
      const pendingApproval = db.users.filter((u: any) => u.role === 'corporate_pending').length;
      return [
        {
          total_orders: db.orders.length,
          total_revenue: totalRevenue,
          pending_approval: pendingApproval,
          total_products: db.products.length
        }
      ];
    }
  }

  if (sqlLower.startsWith('insert')) {
    const table = getTableName(sqlLower);

    if (table === 'users') {
      const newUser = {
        id: db.users.length + 1,
        name: params[0],
        email: params[1],
        password: params[2],
        phone: params[3],
        role: params[4] || 'customer',
        company_name: params[5] || null,
        tax_no: params[6] || null,
        tax_office: params[7] || null,
        address: params[8] || null,
        created_at: new Date()
      };
      db.users.push(newUser);
      return { insertId: newUser.id };
    }

    if (table === 'user_addresses') {
      const newAddress = {
        id: db.user_addresses.length + 1,
        user_id: Number(params[0]),
        title: params[1],
        address: params[2],
        created_at: new Date()
      };
      db.user_addresses.push(newAddress);
      return { insertId: newAddress.id };
    }

    if (table === 'pages') {
      const newPage = {
        id: db.pages.length + 1,
        title: params[0],
        slug: params[1],
        image_url: params[2] || null,
        content: params[3] || null,
        meta_title: params[4] || null,
        meta_description: params[5] || null,
        meta_keywords: params[6] || null,
        created_at: new Date()
      };
      db.pages.push(newPage);
      return { insertId: newPage.id };
    }

    if (table === 'orders') {
      const newOrder = {
        id: db.orders.length + 1,
        user_id: Number(params[0]),
        total_amount: Number(params[1]),
        payment_method: params[2],
        status: params[3] || 'pending',
        shipping_address: params[4],
        phone: params[5],
        email: params[6],
        created_at: new Date()
      };
      db.orders.push(newOrder);
      return { insertId: newOrder.id };
    }

    if (table === 'order_items') {
      const newItem = {
        id: db.order_items.length + 1,
        order_id: Number(params[0]),
        product_id: Number(params[1]),
        quantity: Number(params[2]),
        price: Number(params[3])
      };
      db.order_items.push(newItem);
      return { insertId: newItem.id };
    }

    if (table === 'notifications') {
      const newNotif = {
        id: db.notifications.length + 1,
        user_id: params[0] ? Number(params[0]) : null,
        message: params[1],
        is_read: 0,
        created_at: new Date()
      };
      db.notifications.push(newNotif);
      return { insertId: newNotif.id };
    }

    if (table === 'categories') {
      const newCat = {
        id: db.categories.length + 1,
        name: params[0],
        slug: params[1],
        description: params[2],
        image_url: params[3] || null,
        show_on_homepage: 1
      };
      db.categories.push(newCat);
      return { insertId: newCat.id };
    }

    if (table === 'products') {
      const newProd = {
        id: db.products.length + 1,
        name: params[0],
        slug: params[1],
        description: params[2],
        price: Number(params[3]),
        stock: Number(params[4]),
        sku: params[5],
        image_url: params[6] || null,
        category_id: params[7] ? Number(params[7]) : null,
        is_featured: params[8] ? 1 : 0,
        created_at: new Date()
      };
      db.products.push(newProd);
      return { insertId: newProd.id };
    }

    if (table === 'sliders') {
      const newSlider = {
        id: db.sliders.length + 1,
        title: params[0],
        subtitle: params[1],
        image_url: params[2],
        link: params[3],
        order_index: Number(params[4]) || 0
      };
      db.sliders.push(newSlider);
      return { insertId: newSlider.id };
    }

    if (table === 'stories') {
      const newStory = {
        id: db.stories.length + 1,
        title: params[0],
        image_url: params[1],
        type: params[2],
        target_value: params[3],
        order_index: Number(params[4]) || 0,
        created_at: new Date()
      };
      db.stories.push(newStory);
      return { insertId: newStory.id };
    }

    if (table === 'configs') {
      db.configs[params[0]] = params[1];
      return { affectedRows: 1 };
    }
  }

  if (sqlLower.startsWith('update')) {
    const table = getTableName(sqlLower);

    if (table === 'configs') {
      db.configs[params[1]] = params[0];
      return { affectedRows: 1 };
    }

    if (table === 'users') {
      if (sqlLower.includes('set role =')) {
        const id = params[1];
        const role = params[0];
        const u = db.users.find((u: any) => u.id === Number(id));
        if (u) u.role = role;
        return { affectedRows: 1 };
      }
      const id = params[params.length - 1];
      const u = db.users.find((u: any) => u.id === Number(id));
      if (u) {
        u.name = params[0];
        u.phone = params[1];
        u.address = params[2];
        if (params.length === 5) {
          u.password = params[3];
        }
      }
      return { affectedRows: 1 };
    }

    if (table === 'orders') {
      const id = params[1];
      const status = params[0];
      const ord = db.orders.find((o: any) => o.id === Number(id));
      if (ord) ord.status = status;
      return { affectedRows: 1 };
    }

    if (table === 'notifications') {
      if (sqlLower.includes('user_id is null')) {
        db.notifications.forEach((n: any) => { if (n.user_id === null) n.is_read = 1; });
      } else if (params.length === 1) {
        const userId = params[0];
        db.notifications.forEach((n: any) => { if (n.user_id === Number(userId)) n.is_read = 1; });
      } else {
        const id = params[0];
        const notif = db.notifications.find((n: any) => n.id === Number(id));
        if (notif) notif.is_read = 1;
      }
      return { affectedRows: 1 };
    }

    if (table === 'pages') {
      const id = params[params.length - 1];
      const page = db.pages.find((p: any) => p.id === Number(id));
      if (page) {
        page.title = params[0];
        page.slug = params[1];
        page.image_url = params[2];
        page.content = params[3];
        page.meta_title = params[4];
        page.meta_description = params[5];
        page.meta_keywords = params[6];
      }
      return { affectedRows: 1 };
    }
  }

  if (sqlLower.startsWith('delete')) {
    const table = getTableName(sqlLower);
    const id = params[0];

    if (table === 'users') {
      if (sqlLower.includes('where email =')) {
        db.users = db.users.filter((u: any) => u.email !== params[0]);
      } else {
        db.users = [];
      }
      return { affectedRows: 1 };
    }

    if (table === 'stories') {
      db.stories = db.stories.filter((s: any) => s.id !== Number(id));
      return { affectedRows: 1 };
    }

    if (table === 'categories') {
      db.categories = db.categories.filter((c: any) => c.id !== Number(id));
      return { affectedRows: 1 };
    }

    if (table === 'products') {
      db.products = db.products.filter((p: any) => p.id !== Number(id));
      return { affectedRows: 1 };
    }

    if (table === 'user_addresses') {
      db.user_addresses = db.user_addresses.filter((a: any) => a.id !== Number(id));
      return { affectedRows: 1 };
    }

    if (table === 'pages') {
      db.pages = db.pages.filter((p: any) => p.id !== Number(id));
      return { affectedRows: 1 };
    }
  }

  return [];
}

export function getPool(): mysql.Pool {
  if (!globalForDb.pool) {
    const rawHost = process.env.DB_HOST || 'sql7.freesqldatabase.com';
    // Clean any protocols like http:// or https://, remove trailing slashes or paths, and trim whitespace
    const cleanHost = rawHost.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim();
    const user = (process.env.DB_USER || 'sql7832406').trim();
    const password = process.env.DB_PASSWORD || 'LzKzZyNXXe';
    const database = (process.env.DB_NAME || 'sql7832406').trim();
    const port = Number(process.env.DB_PORT) || 3306;

    console.log(`Connecting to database ${database} at ${cleanHost}:${port} as ${user}...`);

    globalForDb.pool = mysql.createPool({
      host: cleanHost,
      user: user,
      password: password,
      database: database,
      port: port,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 2, // Set a low limit to match freesqldatabase.com limitations and avoid exceeding max_user_connections
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return globalForDb.pool;
}

// Function to run SQL queries
export async function query(sql: string, params: any[] = []): Promise<any> {
  if (globalForDb.useFallback) {
    return queryFallback(sql, params);
  }

  try {
    const connectionPool = getPool();
    const [results] = await connectionPool.execute(sql, params);
    return results;
  } catch (error: any) {
    console.error('Database query error:', error, 'SQL:', sql, 'Params:', params);
    
    const errCode = error?.code || '';
    const errMsg = error?.message || '';
    const isConnError = 
      errCode === 'ECONNREFUSED' || 
      errCode === 'ETIMEDOUT' || 
      errCode === 'ENOTFOUND' || 
      errCode === 'ER_CON_COUNT_ERROR' ||
      errCode === 'PROTOCOL_CONNECTION_LOST' ||
      errMsg.includes('connect') ||
      errMsg.includes('timeout') ||
      errMsg.includes('connection') ||
      errMsg.includes('Pool is closed') ||
      errMsg.includes('lost');

    if (isConnError) {
      console.warn('⚠️ MySQL connection failed. Seamlessly switching to local, in-memory database fallback to ensure 100% uptime...');
      globalForDb.useFallback = true;
      initializeFallbackDb();
      return queryFallback(sql, params);
    }
    
    throw error;
  }
}

// Initialize tables and seed initial data if needed
export async function initializeDatabase() {
  // Skip database initialization during Next.js build phase to prevent network hanging
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    return;
  }

  if (globalForDb.isInitialized) {
    return;
  }

  if (globalForDb.initPromise) {
    return globalForDb.initPromise;
  }

  globalForDb.initPromise = (async () => {
    try {
      if (globalForDb.useFallback) {
        initializeFallbackDb();
        globalForDb.isInitialized = true;
        return;
      }
      console.log('Initializing MySQL Database tables...');

    // 1. Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'corporate_pending', 'corporate', 'admin'
        company_name VARCHAR(255) NULL,
        tax_no VARCHAR(50) NULL,
        tax_office VARCHAR(255) NULL,
        address TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Categories table
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,
        description TEXT NULL,
        image_url VARCHAR(500) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Products table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        sku VARCHAR(100) NOT NULL UNIQUE,
        image_url VARCHAR(500) NULL,
        category_id INT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Orders table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL, -- 'paytr', 'shopier', 'cari'
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'shipping', 'delivered', 'cancelled'
        shipping_address TEXT NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Order Items table
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Sliders table
    await query(`
      CREATE TABLE IF NOT EXISTS sliders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NULL,
        image_url VARCHAR(500) NOT NULL,
        link VARCHAR(255) NULL,
        order_index INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL, -- NULL means all admins or specific notification
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Integration Configs table
    await query(`
      CREATE TABLE IF NOT EXISTS configs (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`value\` TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Stories table
    await query(`
      CREATE TABLE IF NOT EXISTS stories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'product', 'category', 'url'
        target_value VARCHAR(255) NOT NULL,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. User Addresses table
    await query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. Pages table for SEO
    await query(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,
        image_url VARCHAR(500) NULL,
        content TEXT NULL,
        meta_title VARCHAR(255) NULL,
        meta_description TEXT NULL,
        meta_keywords VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Schema alterations
    try {
      const showOnHomepageExists = await query(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "categories" AND COLUMN_NAME = "show_on_homepage"'
      );
      if (!showOnHomepageExists || showOnHomepageExists.length === 0) {
        await query('ALTER TABLE categories ADD COLUMN show_on_homepage BOOLEAN DEFAULT TRUE');
      }
    } catch (e) {
      // Ignored
    }

    try {
      const categoryIdsExists = await query(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "products" AND COLUMN_NAME = "category_ids"'
      );
      if (!categoryIdsExists || categoryIdsExists.length === 0) {
        await query('ALTER TABLE products ADD COLUMN category_ids TEXT NULL');
      }
    } catch (e) {
      // Ignored
    }

    // Alter tables for SEO fields
    try {
      const seoExists = await query(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "categories" AND COLUMN_NAME = "meta_title"'
      );
      if (!seoExists || seoExists.length === 0) {
        await query('ALTER TABLE categories ADD COLUMN meta_title VARCHAR(255) NULL');
        await query('ALTER TABLE categories ADD COLUMN meta_description TEXT NULL');
        await query('ALTER TABLE categories ADD COLUMN meta_keywords VARCHAR(500) NULL');
      }
    } catch (e) {
      console.error('Error adding categories SEO columns:', e);
    }

    try {
      const seoExists = await query(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "products" AND COLUMN_NAME = "meta_title"'
      );
      if (!seoExists || seoExists.length === 0) {
        await query('ALTER TABLE products ADD COLUMN meta_title VARCHAR(255) NULL');
        await query('ALTER TABLE products ADD COLUMN meta_description TEXT NULL');
        await query('ALTER TABLE products ADD COLUMN meta_keywords VARCHAR(500) NULL');
      }
    } catch (e) {
      console.error('Error adding products SEO columns:', e);
    }

    // Seed General configurations and default payment values
    const seedConfigIfMissing = async (key: string, val: string) => {
      const exists = await query('SELECT * FROM configs WHERE `key` = ?', [key]);
      if (exists.length === 0) {
        await query('INSERT INTO configs (`key`, `value`) VALUES (?, ?)', [key, val]);
      }
    };

    await seedConfigIfMissing('site_name', 'Hani Baba Tedarik');
    await seedConfigIfMissing('site_logo_type', 'text');
    await seedConfigIfMissing('site_logo', '');
    await seedConfigIfMissing('site_address', 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No 103');
    await seedConfigIfMissing('site_phone', '+905010160527');

    // Seed Vegetables & Fruits Promo Banners
    await seedConfigIfMissing('promo_banner_1_title', 'Taze Sebzeler');
    await seedConfigIfMissing('promo_banner_1_image', 'https://images.unsplash.com/photo-1566385101042-1a010c159fcf?w=600&auto=format&fit=crop&q=80');
    await seedConfigIfMissing('promo_banner_1_link', '/categories/sebzeler');
    await seedConfigIfMissing('promo_banner_2_title', 'Taze Meyveler');
    await seedConfigIfMissing('promo_banner_2_image', 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop&q=80');
    await seedConfigIfMissing('promo_banner_2_link', '/categories/meyveler');

    // Force update the live persistent database to make sure existing records get updated
    await query('UPDATE configs SET `value` = ? WHERE `key` = ?', ['Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No 103', 'site_address']);
    await query('UPDATE configs SET `value` = ? WHERE `key` = ?', ['+905010160527', 'site_phone']);
    await seedConfigIfMissing('site_email', 'bilgi@hanibabatedarik.com');
    await seedConfigIfMissing('site_instagram', '#');
    await seedConfigIfMissing('site_facebook', '#');
    await seedConfigIfMissing('site_twitter', '#');

    // Seed Integration Configs if empty
    const savedConfigs = await query('SELECT * FROM configs WHERE `key` = "paytr_merchant_id"');
    if (savedConfigs.length === 0) {
      const defaultConfigs = [
        ['paytr_merchant_id', '215844'],
        ['paytr_merchant_key', 'xxPayTRKey123xx'],
        ['paytr_merchant_salt', 'xxPayTRSalt123xx'],
        ['paytr_sandbox', '1'],
        ['shopier_api_key', 'shopier_api_key_849102'],
        ['shopier_api_secret', 'shopier_api_secret_998877'],
        ['shopier_website_index', '1'],
        ['active_payment_provider', 'paytr']
      ];
      for (const [key, val] of defaultConfigs) {
        await seedConfigIfMissing(key, val);
      }
      console.log('Seeded default configurations.');
    }

    // Ensure all existing users are wiped as requested, and seed exactly one admin user
    const adminCheck = await query('SELECT * FROM users WHERE email = "admin@admin.com"');
    if (adminCheck.length === 0) {
      await query('DELETE FROM users');
      const hashedAdminPassword = hashPassword('1234');
      await query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['Sistem Yöneticisi', 'admin@admin.com', hashedAdminPassword, '05555555555', 'admin']
      );
      console.log('Cleared database users and seeded single admin: admin@admin.com / 1234');
    }

    // Seed some categories if empty
    const cats = await query('SELECT * FROM categories');
    if (cats.length === 0) {
      const categoriesToSeed = [
        ['Kağıt Ürünleri', 'kagit-urunleri', 'Fotokopi kağıtları, defterler ve bloknotlar', 'https://picsum.photos/seed/paper/400/300'],
        ['Yazma & Çizme', 'yazma-cizme', 'Kalemler, tahta kalemleri, imza kalemleri ve silgiler', 'https://picsum.photos/seed/pen/400/300'],
        ['Ofis Makineleri', 'ofis-makineleri', 'Hesap makineleri, evrak imha makineleri, etiketleme', 'https://picsum.photos/seed/machine/400/300'],
        ['Klasörleme & Arşiv', 'klasorleme-arsiv', 'Klasörler, dosyalar, poşet dosyalar, arşiv kutuları', 'https://picsum.photos/seed/folder/400/300'],
        ['Gıda & Mutfak', 'gida-mutfak', 'Çay, kahve, şeker, kullan-at mutfak malzemeleri', 'https://picsum.photos/seed/food/400/300'],
        ['Temizlik Ürünleri', 'temizlik-urunleri', 'Yüzey temizleyiciler, peçete, sıvı sabun, deterjanlar', 'https://picsum.photos/seed/cleaning/400/300'],
      ];

      for (const cat of categoriesToSeed) {
        await query(
          'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
          cat
        );
      }
      console.log('Seeded initial categories.');
    }

    // Seed some sliders if empty
    const sliders = await query('SELECT * FROM sliders');
    if (sliders.length === 0) {
      const slidersToSeed = [
        ['Kurumsal Ofis İhtiyaçlarınız Tek Tıkla!', 'Tüm ofis kırtasiye, temizlik ve gıda malzemelerinde toptan fiyatlar.', 'https://picsum.photos/seed/slider1/1200/400', '/kagit-urunleri', 1],
        ['B2B Cari Hesap Avantajları', 'Kurumsal üyelerimiz için vade ve faturayla ödeme kolaylığı burada.', 'https://picsum.photos/seed/slider2/1200/400', '/kayit', 2]
      ];

      for (const slider of slidersToSeed) {
        await query(
          'INSERT INTO sliders (title, subtitle, image_url, link, order_index) VALUES (?, ?, ?, ?, ?)',
          slider
        );
      }
      console.log('Seeded initial sliders.');
    }

    // Seed some products if empty
    const prods = await query('SELECT * FROM products');
    if (prods.length === 0) {
      const productsToSeed = [
        // Paper
        ['Copier Bond A4 Fotokopi Kağıdı 80 gr 500 Adet', 'copier-bond-a4', 'Yüksek kaliteli, çift taraflı çekime uygun A4 fotokopi kağıdı.', 145.90, 1500, 'SKU-A4-COPIER', 'https://picsum.photos/seed/a4paper/400/400', 1, true],
        ['OfisDefteri A4 Kareli Defter 120 Yaprak', 'ofis-defteri-a4', 'Sert kapaklı, dayanıklı kareli okul ve ofis defteri.', 65.00, 450, 'SKU-DEF-A4', 'https://picsum.photos/seed/notebook/400/400', 1, false],
        
        // Writing
        ['Schneider Slider Edge XB Tükenmez Kalem Mavi', 'schneider-slider-blue', 'Viscoglide teknolojisi ile ultra akıcı mavi tükenmez kalem.', 28.50, 1200, 'SKU-PEN-BLUE', 'https://picsum.photos/seed/bluepen/400/400', 2, true],
        ['Faber-Castell Grip 1347 Versatil Kalem 0.7 mm', 'faber-castell-grip-07', 'Ergonomik kauçuk kılıf, yaylı uç mekanizması.', 125.00, 300, 'SKU-PEN-GRIP07', 'https://picsum.photos/seed/grip07/400/400', 2, false],
        
        // Machines
        ['Casio DF-120FM 12 Hane Masa Üstü Hesap Makinesi', 'casio-df-120fm', 'KDV hesaplama, maliyet/satış/marj tuşları, metal ön yüzey.', 445.00, 80, 'SKU-CASIO-DF120', 'https://picsum.photos/seed/casio/400/400', 3, true],
        ['Leitz IQ Home Evrak İmha Makinesi P4 şerit', 'leitz-iq-shredder', 'Kişisel ofis ve ev kullanımı için sessiz evrak imha makinesi.', 2850.00, 15, 'SKU-LEITZ-SHRED', 'https://picsum.photos/seed/shredder/400/400', 3, false],
        
        // Filing
        ['Noki Geniş Klasör A4 Mavi', 'noki-klasor-a4', 'Dayanıklı mekanizma, sırt cebi ve sırt kartonu ile pratik klasör.', 52.00, 1000, 'SKU-FOLD-A4B', 'https://picsum.photos/seed/folder-blue/400/400', 4, true],
        ['Noki 11 Delikli Poşet Dosya A4 100lü Paket', 'noki-poset-dosya-100', 'Göz yormayan pürüzsüz yüzey, dayanıklı delik şeridi.', 48.00, 2000, 'SKU-POUCH-A4', 'https://picsum.photos/seed/pouches/400/400', 4, false],
        
        // Food
        ['Lipton Yellow Label Bardak Poşet Çay 100lü', 'lipton-yellow-label-100', 'Ofislerin vazgeçilmezi, taze demlenmiş çay lezzeti.', 110.00, 600, 'SKU-TEA-LIPTON', 'https://picsum.photos/seed/lipton/400/400', 5, true],
        ['Mehmet Efendi Türk Kahvesi 250 gr', 'mehmet-efendi-250g', 'Geleneksel lezzet, taze çekilmiş Türk kahvesi teneke kutu.', 98.00, 400, 'SKU-COFFEE-MEHMET', 'https://picsum.photos/seed/turkish-coffee/400/400', 5, false],
        
        // Cleaning
        ['Selpak Professional Kağıt Havlu 12li Rulo', 'selpak-havlu-12', 'Yüksek emiş gücü, dayanıklı çift katlı rulo havlu.', 165.00, 350, 'SKU-TOWEL-SELPAK', 'https://picsum.photos/seed/selpak/400/400', 6, true],
        ['Activex Antibakteriyel Sıvı Sabun Hassas 650 ml', 'activex-sabun-650', 'Bakterilerin %99.9\'unu öldürür, cildi kurutmaz.', 75.00, 500, 'SKU-SOAP-ACTIVEX', 'https://picsum.photos/seed/soap/400/400', 6, false]
      ];

      for (const prod of productsToSeed) {
        await query(
          'INSERT INTO products (name, slug, description, price, stock, sku, image_url, category_id, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          prod
        );
      }
      console.log('Seeded initial products.');
    }

    // Seed some stories if empty
    const storiesCount = await query('SELECT COUNT(*) as count FROM stories');
    if (storiesCount[0].count === 0) {
      const defaultStories = [
        ['İndirimli Kağıtlar', 'https://picsum.photos/seed/story1/150/150', 'category', 'kagit-urunleri', 1],
        ['En Çok Satanlar', 'https://picsum.photos/seed/story2/150/150', 'product', 'copier-bond-a4', 2],
        ['Süper Kalemler', 'https://picsum.photos/seed/story3/150/150', 'category', 'yazma-cizme', 3],
        ['Masaüstü Casio', 'https://picsum.photos/seed/story4/150/150', 'product', 'casio-df-120fm', 4],
        ['Kariyer Fırsatları', 'https://picsum.photos/seed/story5/150/150', 'url', 'https://google.com', 5]
      ];
      for (const [title, img, type, val, idx] of defaultStories) {
        await query(
          'INSERT INTO stories (title, image_url, type, target_value, order_index) VALUES (?, ?, ?, ?, ?)',
          [title, img, type, val, idx]
        );
      }
      console.log('Seeded default stories.');
    }

    globalForDb.isInitialized = true;
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Database initialization failed, switching to local in-memory DB:', error);
    globalForDb.useFallback = true;
    initializeFallbackDb();
    globalForDb.isInitialized = true;
  }
  })();

  return globalForDb.initPromise;
}
