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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    // List all users except sensitive fields
    const users = await query(
      `SELECT id, name, email, phone, role, company_name, tax_no, tax_office, address, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Get Users API Error:', error);
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
      return NextResponse.json({ success: false, error: 'Kullanıcı ID zorunludur.' }, { status: 400 });
    }

    // Prevent deleting the currently logged-in admin if they delete themselves
    if (Number(id) === decoded.userId) {
      return NextResponse.json({ success: false, error: 'Kendi yöneticisi hesabınızı silemezsiniz.' }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
  } catch (error: any) {
    console.error('Delete User API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
