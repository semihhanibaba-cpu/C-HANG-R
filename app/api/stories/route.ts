import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

// GET all stories (public)
export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const stories = await query('SELECT * FROM stories ORDER BY order_index ASC, id DESC');
    return NextResponse.json({ success: true, stories });
  } catch (error: any) {
    console.error('Get Stories API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a story (admin only)
export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Yalnızca yöneticiler bu işlemi yapabilir.' }, { status: 403 });
    }

    const { title, image_url, type, target_value, order_index } = await req.json();

    if (!title || !image_url || !type || !target_value) {
      return NextResponse.json({ success: false, error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO stories (title, image_url, type, target_value, order_index) VALUES (?, ?, ?, ?, ?)',
      [title, image_url, type, target_value, Number(order_index) || 0]
    );

    return NextResponse.json({ success: true, storyId: result.insertId });
  } catch (error: any) {
    console.error('Create Story API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT edit a story (admin only)
export async function PUT(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Yalnızca yöneticiler bu işlemi yapabilir.' }, { status: 403 });
    }

    const { id, title, image_url, type, target_value, order_index } = await req.json();

    if (!id || !title || !image_url || !type || !target_value) {
      return NextResponse.json({ success: false, error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    await query(
      'UPDATE stories SET title = ?, image_url = ?, type = ?, target_value = ?, order_index = ? WHERE id = ?',
      [title, image_url, type, target_value, Number(order_index) || 0, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Story API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE delete a story (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Yalnızca yöneticiler bu işlemi yapabilir.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Story ID bulunamadı.' }, { status: 400 });
    }

    await query('DELETE FROM stories WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Story API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
