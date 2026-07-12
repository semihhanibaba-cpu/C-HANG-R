import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initializeDatabase();
    const categories = await query('SELECT * FROM categories ORDER BY name ASC');
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Get Categories API Error:', error);
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

    const { name, slug, description, image_url, show_on_homepage, meta_title, meta_description, meta_keywords } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Kategori adı ve kısa adı (slug) zorunludur.' }, { status: 400 });
    }

    const showHome = show_on_homepage === undefined ? 1 : (show_on_homepage ? 1 : 0);

    // Insert category
    await query(
      'INSERT INTO categories (name, slug, description, image_url, show_on_homepage, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description || '', image_url || 'https://picsum.photos/seed/defaultcat/400/300', showHome, meta_title || '', meta_description || '', meta_keywords || '']
    );

    return NextResponse.json({ success: true, message: 'Kategori başarıyla eklendi.' });
  } catch (error: any) {
    console.error('Create Category API Error:', error);
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

    const { id, name, slug, description, image_url, show_on_homepage, meta_title, meta_description, meta_keywords } = await req.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ success: false, error: 'Kategori ID, adı ve kısa adı (slug) zorunludur.' }, { status: 400 });
    }

    const showHome = show_on_homepage ? 1 : 0;

    await query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, show_on_homepage = ?, meta_title = ?, meta_description = ?, meta_keywords = ? WHERE id = ?',
      [name, slug, description || '', image_url || '', showHome, meta_title || '', meta_description || '', meta_keywords || '', id]
    );

    return NextResponse.json({ success: true, message: 'Kategori başarıyla güncellendi.' });
  } catch (error: any) {
    console.error('Update Category API Error:', error);
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
      return NextResponse.json({ success: false, error: 'Kategori ID zorunludur.' }, { status: 400 });
    }

    // Set product category_id to NULL or remove reference before deleting
    await query('UPDATE products SET category_id = NULL WHERE category_id = ?', [id]);

    // Delete the category
    await query('DELETE FROM categories WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Kategori başarıyla silindi.' });
  } catch (error: any) {
    console.error('Delete Category API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
