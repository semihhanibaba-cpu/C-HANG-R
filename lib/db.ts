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

// Seeding / Fallback Data Structures (All demo data removed, only single admin remains)
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

  globalForDb.fallbackDb = {
    users,
    categories: [],
    products: [],
    orders: [],
    order_items: [],
    sliders: [],
    notifications: [],
    configs: {
      site_name: 'Hani Baba Tedarik',
      site_logo_type: 'text',
      site_logo: '',
      site_address: 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No 103',
      site_phone: '+905010160527',
      site_email: 'bilgi@hanibabatedarik.com',
      active_payment_provider: 'paytr'
    },
    stories: [],
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

    if (table === 'categories') return db.categories;
    if (table === 'sliders') return db.sliders;
    if (table === 'stories') return sqlLower.includes('count(*)') ? [{ count: db.stories.length }] : db.stories;

    if (table === 'products') {
      if (sqlLower.includes('count(id) as totalproducts') || sqlLower.includes('count(id) as total_products')) {
        return [{ totalProducts: db.products.length, total_products: db.products.length }];
      }
      if (sqlLower.includes('where p.id = ?') || sqlLower.includes('where id = ?')) {
        const id = params[0];
        const prod = db.products.find((p: any) => p.id === Number(id));
        return prod ? [prod] : [];
      }
      return db.products;
    }

    if (table === 'users') {
      if (sqlLower.includes('email = ?')) {
        return db.users.filter((u: any) => u.email === params[0]);
      }
      if (sqlLower.includes('id = ?')) {
        return db.users.filter((u: any) => u.id === Number(params[0]));
      }
      return db.users;
    }

    return [];
  }

  if (sqlLower.startsWith('insert') || sqlLower.startsWith('update') || sqlLower.startsWith('delete')) {
    return { affectedRows: 1, insertId: 1 };
  }

  return [];
}

export function getPool(): mysql.Pool {
  if (!globalForDb.pool) {
    const rawHost = process.env.DB_HOST || 'srv861.hstgr.io';
    const cleanHost = rawHost.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim();
    const user = (process.env.DB_USER || 'u694828008_hbtedarik').trim();
    const password = process.env.DB_PASSWORD || 'l+mGB5Fg@';
    const database = (process.env.DB_NAME || 'u694828008_hb').trim();
    const port = Number(process.env.DB_PORT) || 3306;

    console.log(`Connecting to database ${database} at ${cleanHost}:${port}...`);

    globalForDb.pool = mysql.createPool({
      host: cleanHost,
      user: user,
      password: password,
      database: database,
      port: port,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 2,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return globalForDb.pool;
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  if (globalForDb.useFallback) {
    return queryFallback(sql, params);
  }

  try {
    const connectionPool = getPool();
    const [results] = await connectionPool.execute(sql, params);
    return results;
  } catch (error: any) {
    console.error('Database query error:', error);
    
    const errCode = error?.code || '';
    const errMsg = error?.message || '';
    const isConnError = 
      errCode === 'ECONNREFUSED' || 
      errCode === 'ETIMEDOUT' || 
      errCode === 'ENOTFOUND' || 
      errCode === 'ER_CON_COUNT_ERROR' ||
      errCode === 'PROTOCOL_CONNECTION_LOST' ||
      errMsg.includes('connect') ||
      errMsg.includes('timeout');

    if (isConnError) {
      console.warn('⚠️ MySQL connection failed. Switching to memory fallback...');
      globalForDb.useFallback = true;
      initializeFallbackDb();
      return queryFallback(sql, params);
    }
    
    throw error;
  }
}

// Hızlı varlık kontrolü sorgusu: Veritabanında kritik bir tablo var mı diye bakar
async function checkIfTablesExist(): Promise<boolean> {
  try {
    const res = await query(`
      SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    `);
    return res && res[0] && res[0].count > 0;
  } catch (e) {
    return false;
  }
}

// Initialize tables and seed initial data if needed
export async function initializeDatabase() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    return;
  }

  if (globalForDb.isInitialized) return;
  if (globalForDb.initPromise) return globalForDb.initPromise;

  globalForDb.initPromise = (async () => {
    try {
      if (globalForDb.useFallback) {
        initializeFallbackDb();
        globalForDb.isInitialized = true;
        return;
      }

      // Hızlı Sorgu Kontrolü: Eğer 'users' tablosu zaten varsa, yapıyı tekrar kurmakla uğraşma.
      const alreadyBuilt = await checkIfTablesExist();
      if (alreadyBuilt) {
        console.log('Database tables already exist. Skipping table creation logs.');
        globalForDb.isInitialized = true;
        return;
      }

      console.log('Tables not found. Initializing MySQL Database structure...');

      // 1. Users table
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(191) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL UNIQUE,
          role VARCHAR(50) DEFAULT 'customer',
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
          image_url VARCHAR(500) NULL,
          show_on_homepage BOOLEAN DEFAULT TRUE,
          meta_title VARCHAR(255) NULL,
          meta_description TEXT NULL,
          meta_keywords VARCHAR(500) NULL
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
          category_ids TEXT NULL,
          is_featured BOOLEAN DEFAULT FALSE,
          meta_title VARCHAR(255) NULL,
          meta_description TEXT NULL,
          meta_keywords VARCHAR(500) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 4. Orders table
      await query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
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
          user_id INT NULL,
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
          type VARCHAR(50) NOT NULL,
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

      // Seed core configurations
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
      await seedConfigIfMissing('site_email', 'bilgi@hanibabatedarik.com');
      await seedConfigIfMissing('active_payment_provider', 'paytr');

      // Seed exactly one admin user if table is empty
      const adminCheck = await query('SELECT * FROM users WHERE email = "admin@admin.com"');
      if (adminCheck.length === 0) {
        const hashedAdminPassword = hashPassword('1234');
        await query(
          'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
          ['Sistem Yöneticisi', 'admin@admin.com', hashedAdminPassword, '05555555555', 'admin']
        );
        console.log('Seeded single admin: admin@admin.com / 1234');
      }

      globalForDb.isInitialized = true;
      console.log('Database initialization completed successfully.');
    } catch (error) {
      console.error('Database initialization failed, switching to memory DB:', error);
      globalForDb.useFallback = true;
      initializeFallbackDb();
      globalForDb.isInitialized = true;
    }
  })();

  return globalForDb.initPromise;
}
