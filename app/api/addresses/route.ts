import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    const addresses = await query(
      'SELECT id, title, address, created_at FROM user_addresses WHERE user_id = ? ORDER BY id DESC',
      [decoded.userId]
    );

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error('Get Addresses API Error:', error);
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
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, address } = body;

    if (!title || !address) {
      return NextResponse.json({ success: false, error: 'Başlık ve adres alanları zorunludur.' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO user_addresses (user_id, title, address) VALUES (?, ?, ?)',
      [decoded.userId, title, address]
    );

    return NextResponse.json({
      success: true,
      message: 'Adres başarıyla eklendi.',
      addressId: result.insertId
    });
  } catch (error: any) {
    console.error('Create Address API Error:', error);
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
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Adres ID belirtilmedi.' }, { status: 400 });
    }

    await query(
      'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Adres başarıyla silindi.'
    });
  } catch (error: any) {
    console.error('Delete Address API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
