import { NextRequest, NextResponse } from 'next/server';
import { query, hashPassword, initializeDatabase } from '@/lib/db';
import { signToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const data = await req.json();
    const { name, email, password, phone, role, companyName, taxNo, taxOffice, address } = data;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ success: false, error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return NextResponse.json({ success: false, error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 400 });
    }

    // Check if phone already exists
    const existingPhone = await query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingPhone.length > 0) {
      return NextResponse.json({ success: false, error: 'Bu telefon numarası zaten kayıtlı.' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    if (role === 'corporate') {
      // Corporate registration -> sets role as corporate_pending
      if (!companyName || !taxNo || !taxOffice) {
        return NextResponse.json({ success: false, error: 'Kurumsal üyelik için şirket bilgileri zorunludur.' }, { status: 400 });
      }

      await query(
        `INSERT INTO users (name, email, password, phone, role, company_name, tax_no, tax_office, address) 
         VALUES (?, ?, ?, ?, 'corporate_pending', ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone, companyName, taxNo, taxOffice, address || '']
      );

      // Notify admins about the new application
      await query(
        `INSERT INTO notifications (message) VALUES (?)`,
        [`Yeni Kurumsal Müşteri Başvurusu: ${companyName} (${name}) onayınızı bekliyor.`]
      );

      return NextResponse.json({
        success: true,
        message: 'Kurumsal hesap başvurunuz alındı. Yönetici onayından sonra giriş yapabilirsiniz.',
        pending: true
      });
    } else {
      // Normal Customer registration -> check if allowed
      const individualAuthConfigs = await query(
        'SELECT `value` FROM configs WHERE `key` = "allow_individual_auth"'
      );
      const allowIndividualAuth = individualAuthConfigs.length > 0 ? individualAuthConfigs[0].value : 'true';
      if (allowIndividualAuth !== 'true') {
        return NextResponse.json({
          success: false,
          error: 'Bireysel üye kaydı şu anda kapalıdır. Sadece kurumsal müşteriler kayıt başvurusu oluşturabilir.'
        }, { status: 403 });
      }

      // Normal Customer registration -> sets role as customer
      const result = await query(
        `INSERT INTO users (name, email, password, phone, role, address) 
         VALUES (?, ?, ?, ?, 'customer', ?)`,
        [name, email, hashedPassword, phone, address || '']
      );

      const userId = result.insertId;

      // Automatically sign in the customer
      const token = signToken({ userId, name, email, role: 'customer' });

      const response = NextResponse.json({
        success: true,
        message: 'Kaydınız başarıyla tamamlandı.',
        user: { id: userId, name, email, role: 'customer', phone }
      });

      // Set cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return response;
    }
  } catch (error: any) {
    console.error('Register API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
