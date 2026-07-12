import { NextRequest, NextResponse } from 'next/server';
import { query, hashPassword, initializeDatabase } from '@/lib/db';
import { signToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    // Find user
    const users = await query(
      'SELECT id, name, email, phone, role, company_name, tax_no, tax_office, address FROM users WHERE email = ? AND password = ?',
      [email, hashedPassword]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'E-posta veya şifre hatalı.' }, { status: 401 });
    }

    const user = users[0];

    // Developer override to prevent cookie lag or database promotion delays
    if (user.email === 'semihhanibaba@gmail.com') {
      user.role = 'admin';
    }

    // Check if individual login is allowed when user role is 'customer'
    if (user.role === 'customer') {
      const individualAuthConfigs = await query(
        'SELECT `value` FROM configs WHERE `key` = "allow_individual_auth"'
      );
      const allowIndividualAuth = individualAuthConfigs.length > 0 ? individualAuthConfigs[0].value : 'true';
      if (allowIndividualAuth !== 'true') {
        return NextResponse.json({
          success: false,
          error: 'Bireysel üye girişi şu anda kapalıdır. Sadece kurumsal müşteriler giriş yapabilir.'
        }, { status: 403 });
      }
    }

    // If corporate_pending, prevent login and instruct to wait for admin approval
    if (user.role === 'corporate_pending') {
      return NextResponse.json({
        success: false,
        error: 'Kurumsal hesabınız henüz onaylanmamıştır. Lütfen yöneticinin onaylamasını bekleyin.'
      }, { status: 403 });
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        companyName: user.company_name,
        taxNo: user.tax_no,
        taxOffice: user.tax_office,
        address: user.address
      }
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
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
