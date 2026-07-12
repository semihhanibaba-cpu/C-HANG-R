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

    // List pending corporate users
    const pendingUsers = await query(
      `SELECT id, name, email, phone, company_name, tax_no, tax_office, address, created_at 
       FROM users 
       WHERE role = 'corporate_pending' 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, pendingUsers });
  } catch (error: any) {
    console.error('Get Corporate Applications API Error:', error);
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

    const { userId, action } = await req.json(); // action: 'approve' or 'reject'

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: 'Kullanıcı ID ve işlem (approve/reject) zorunludur.' }, { status: 400 });
    }

    if (action === 'approve') {
      // Approve application -> set role to 'corporate'
      await query("UPDATE users SET role = 'corporate' WHERE id = ?", [userId]);

      // Add user-specific notification
      await query(
        "INSERT INTO notifications (user_id, message) VALUES (?, 'Kurumsal hesap başvurunuz onaylandı! Artık cari hesap ve faturayla ödeme kolaylığıyla alışveriş yapabilirsiniz.')",
        [userId]
      );

      return NextResponse.json({ success: true, message: 'Kurumsal başvuru başarıyla onaylandı.' });
    } else {
      // Reject application -> set role to 'customer'
      await query("UPDATE users SET role = 'customer' WHERE id = ?", [userId]);

      // Add user-specific notification
      await query(
        "INSERT INTO notifications (user_id, message) VALUES (?, 'Kurumsal hesap başvurunuz reddedilmiştir. Standart müşteri olarak alışveriş yapmaya devam edebilirsiniz.')",
        [userId]
      );

      return NextResponse.json({ success: true, message: 'Kurumsal başvuru reddedildi (kullanıcı standart müşteriye dönüştürüldü).' });
    }
  } catch (error: any) {
    console.error('Update Corporate Application API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
