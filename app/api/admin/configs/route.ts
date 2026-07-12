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

    const configs = await query('SELECT `key`, `value` FROM configs');
    
    // Convert array of [{key, value}] to a neat object
    const configMap: Record<string, string> = {};
    configs.forEach((item: any) => {
      configMap[item.key] = item.value || '';
    });

    return NextResponse.json({
      success: true,
      configs: configMap
    });
  } catch (error: any) {
    console.error('Get Admin Configs API Error:', error);
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

    const body = await req.json();
    const { configs } = body; // Expects record format: { paytr_merchant_id: "...", ... }

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json({ success: false, error: 'Geçersiz parametre.' }, { status: 400 });
    }

    // Update each key in a transaction or individual updates
    for (const key of Object.keys(configs)) {
      const val = configs[key]?.toString() || '';
      // INSERT INTO ... ON DUPLICATE KEY UPDATE
      await query(
        'INSERT INTO configs (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, val, val]
      );
    }

    // Add a notification about configuration update
    await query('INSERT INTO notifications (message) VALUES (?)', [
      `Sistem entegrasyon ve genel ayarları güncellendi.`
    ]);

    return NextResponse.json({
      success: true,
      message: 'Ayarlar başarıyla güncellendi.'
    });
  } catch (error: any) {
    console.error('Update Admin Configs API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
