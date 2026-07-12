import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initializeDatabase();
    const sliders = await query('SELECT * FROM sliders ORDER BY order_index ASC');
    return NextResponse.json({ success: true, sliders });
  } catch (error: any) {
    console.error('Get Sliders API Error:', error);
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

    const { title, subtitle, image_url, link, order_index } = await req.json();

    if (!image_url) {
      return NextResponse.json({ success: false, error: 'Görsel URL alanı zorunludur.' }, { status: 400 });
    }

    await query(
      'INSERT INTO sliders (title, subtitle, image_url, link, order_index) VALUES (?, ?, ?, ?, ?)',
      [title || 'Slayt', subtitle || '', image_url, link || '', order_index || 0]
    );

    return NextResponse.json({ success: true, message: 'Slider başarıyla eklendi.' });
  } catch (error: any) {
    console.error('Create Slider API Error:', error);
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

    const { id, title, subtitle, image_url, link, order_index } = await req.json();

    if (!id || !image_url) {
      return NextResponse.json({ success: false, error: 'ID ve görsel URL alanları zorunludur.' }, { status: 400 });
    }

    await query(
      'UPDATE sliders SET title = ?, subtitle = ?, image_url = ?, link = ?, order_index = ? WHERE id = ?',
      [title || 'Slayt', subtitle || '', image_url, link || '', order_index || 0, id]
    );

    return NextResponse.json({ success: true, message: 'Slider başarıyla güncellendi.' });
  } catch (error: any) {
    console.error('Update Slider API Error:', error);
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
      return NextResponse.json({ success: false, error: 'Slider ID zorunludur.' }, { status: 400 });
    }

    await query('DELETE FROM sliders WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Slider başarıyla silindi.' });
  } catch (error: any) {
    console.error('Delete Slider API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
