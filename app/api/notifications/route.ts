import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, notifications: [] });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, notifications: [] });
    }

    let notifications = [];

    if (decoded.role === 'admin') {
      // Admins see admin notifications (user_id is NULL)
      notifications = await query(
        'SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 50'
      );
    } else {
      // Users see their specific notifications
      notifications = await query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [decoded.userId]
      );
    }

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error('Get Notifications API Error:', error);
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
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    const { id, all } = await req.json();

    if (all) {
      if (decoded.role === 'admin') {
        await query('UPDATE notifications SET is_read = 1 WHERE user_id IS NULL');
      } else {
        await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [decoded.userId]);
      }
    } else {
      if (!id) {
        return NextResponse.json({ success: false, error: 'Bildirim ID zorunludur.' }, { status: 400 });
      }

      if (decoded.role === 'admin') {
        await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
      } else {
        await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, decoded.userId]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Notification API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
