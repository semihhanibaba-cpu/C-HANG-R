import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    const isFeatured = searchParams.get('featured');
    const search = searchParams.get('search');
    const productId = searchParams.get('id');

    // Get specific product by ID
    if (productId) {
      const products = await query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [productId]);
      if (products.length === 0) {
        return NextResponse.json({ success: false, error: 'Ürün bulunamadı.' }, { status: 444 });
      }
      return NextResponse.json({ success: true, product: products[0] });
    }

    let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params: any[] = [];

    if (categoryId) {
      // If a category ID is specified, check if it matches primary category_id OR is listed inside category_ids (e.g., "1,2,3")
      sql += ' AND (p.category_id = ? OR FIND_IN_SET(?, p.category_ids) > 0)';
      params.push(categoryId, categoryId);
    }

    if (isFeatured === 'true') {
      sql += ' AND p.is_featured = 1';
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.created_at DESC';

    const products = await query(sql, params);
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Get Products API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    const { name, slug, description, price, stock, sku, image_url, category_id, is_featured, category_ids, meta_title, meta_description, meta_keywords } = await req.json();

    if (!name || !slug || !price || !sku) {
      return NextResponse.json({ success: false, error: 'Adı, slug, fiyat ve SKU alanları zorunludur.' }, { status: 400 });
    }

    // If category_ids is provided as an array, join it into a string like "1,2,3"
    let catIdsStr = '';
    let primaryCatId = category_id ? Number(category_id) : null;
    if (primaryCatId !== null && isNaN(primaryCatId)) {
      primaryCatId = null;
    }

    if (Array.isArray(category_ids) && category_ids.length > 0) {
      catIdsStr = category_ids.map(id => String(id)).join(',');
      const parsed = Number(category_ids[0]);
      if (!isNaN(parsed)) {
        primaryCatId = parsed;
      }
    } else if (typeof category_ids === 'string' && category_ids.trim() !== '') {
      catIdsStr = category_ids;
      const parsed = Number(category_ids.split(',')[0]);
      if (!isNaN(parsed)) {
        primaryCatId = parsed;
      }
    }

    await query(
      `INSERT INTO products (name, slug, description, price, stock, sku, image_url, category_id, category_ids, is_featured, meta_title, meta_description, meta_keywords) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || '', price, stock || 0, sku, image_url || 'https://picsum.photos/seed/product/400/400', primaryCatId, catIdsStr || null, is_featured ? 1 : 0, meta_title || '', meta_description || '', meta_keywords || '']
    );

    return NextResponse.json({ success: true, message: 'Ürün başarıyla eklendi.' });
  } catch (error: any) {
    console.error('Create Product API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    const { id, name, slug, description, price, stock, sku, image_url, category_id, is_featured, category_ids, meta_title, meta_description, meta_keywords } = await req.json();

    if (!id || !name || !slug || !price || !sku) {
      return NextResponse.json({ success: false, error: 'ID, ad, slug, fiyat ve SKU alanları zorunludur.' }, { status: 400 });
    }

    // If category_ids is provided as an array, join it into a string like "1,2,3"
    let catIdsStr = '';
    let primaryCatId = category_id ? Number(category_id) : null;
    if (primaryCatId !== null && isNaN(primaryCatId)) {
      primaryCatId = null;
    }

    if (Array.isArray(category_ids) && category_ids.length > 0) {
      catIdsStr = category_ids.map(id => String(id)).join(',');
      const parsed = Number(category_ids[0]);
      if (!isNaN(parsed)) {
        primaryCatId = parsed;
      }
    } else if (typeof category_ids === 'string' && category_ids.trim() !== '') {
      catIdsStr = category_ids;
      const parsed = Number(category_ids.split(',')[0]);
      if (!isNaN(parsed)) {
        primaryCatId = parsed;
      }
    }

    await query(
      `UPDATE products 
       SET name = ?, slug = ?, description = ?, price = ?, stock = ?, sku = ?, image_url = ?, category_id = ?, category_ids = ?, is_featured = ?, meta_title = ?, meta_description = ?, meta_keywords = ? 
       WHERE id = ?`,
      [name, slug, description || '', price, stock || 0, sku, image_url, primaryCatId, catIdsStr || null, is_featured ? 1 : 0, meta_title || '', meta_description || '', meta_keywords || '', id]
    );

    return NextResponse.json({ success: true, message: 'Ürün başarıyla güncellendi.' });
  } catch (error: any) {
    console.error('Update Product API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ürün ID zorunludur.' }, { status: 400 });
    }

    await query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Ürün başarıyla silindi.' });
  } catch (error: any) {
    console.error('Delete Product API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
