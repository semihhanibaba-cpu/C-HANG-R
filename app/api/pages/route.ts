import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';
import { normalizeSlug } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initializeDatabase();
    const pages = await query('SELECT * FROM pages ORDER BY id DESC');
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    console.error('Get Pages API Error:', error);
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

    const { title, slug, image_url, content, meta_title, meta_description, meta_keywords } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Başlık ve link (slug) alanları zorunludur.' }, { status: 400 });
    }

    const cleanSlug = normalizeSlug(slug);

    // Check if slug already exists
    const existing = await query('SELECT id FROM pages WHERE slug = ?', [cleanSlug]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Bu link (slug) zaten başka bir sayfa tarafından kullanılıyor.' }, { status: 400 });
    }

    await query(
      'INSERT INTO pages (title, slug, image_url, content, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, cleanSlug, image_url || '', content || '', meta_title || '', meta_description || '', meta_keywords || '']
    );

    return NextResponse.json({ success: true, message: 'Sayfa başarıyla eklendi.' });
  } catch (error: any) {
    console.error('Create Page API Error:', error);
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

    const { id, title, slug, image_url, content, meta_title, meta_description, meta_keywords } = await req.json();

    if (!id || !title || !slug) {
      return NextResponse.json({ success: false, error: 'ID, başlık ve link (slug) alanları zorunludur.' }, { status: 400 });
    }

    const cleanSlug = normalizeSlug(slug);

    // Check if slug is used by another page
    const existing = await query('SELECT id FROM pages WHERE slug = ? AND id != ?', [cleanSlug, id]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Bu link (slug) başka bir sayfa tarafından kullanılıyor.' }, { status: 400 });
    }

    await query(
      'UPDATE pages SET title = ?, slug = ?, image_url = ?, content = ?, meta_title = ?, meta_description = ?, meta_keywords = ? WHERE id = ?',
      [title, cleanSlug, image_url || '', content || '', meta_title || '', meta_description || '', meta_keywords || '', id]
    );

    return NextResponse.json({ success: true, message: 'Sayfa başarıyla güncellendi.' });
  } catch (error: any) {
    console.error('Update Page API Error:', error);
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
      return NextResponse.json({ success: false, error: 'Sayfa ID zorunludur.' }, { status: 400 });
    }

    await query('DELETE FROM pages WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Sayfa başarıyla silindi.' });
  } catch (error: any) {
    console.error('Delete Page API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
