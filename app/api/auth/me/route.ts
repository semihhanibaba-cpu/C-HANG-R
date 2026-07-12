import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ loggedIn: false });
    }

    // Fetch user details from database to ensure up-to-date data (e.g., if approved or updated info)
    const users = await query(
      'SELECT id, name, email, phone, role, company_name, tax_no, tax_office, address FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ loggedIn: false });
    }

    const user = users[0];

    // Developer override to prevent cookie lag or database promotion delays
    if (user.email === 'semihhanibaba@gmail.com') {
      user.role = 'admin';
    }

    // If corporate_pending, block session
    if (user.role === 'corporate_pending') {
      const response = NextResponse.json({ loggedIn: false, error: 'Hesabınız onay beklemektedir.' });
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 0,
        path: '/'
      });
      return response;
    }

    return NextResponse.json({
      loggedIn: true,
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
  } catch (error: any) {
    console.error('Me API Error:', error);
    return NextResponse.json({ loggedIn: false, error: error.message });
  }
}

// Support updating profile (address, phone, password)
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

    const body = await req.json();
    const { name, phone, address, password } = body;

    if (password) {
      // If updating password
      const { hashPassword } = await import('@/lib/db');
      const hashedPassword = hashPassword(password);
      await query(
        'UPDATE users SET name = ?, phone = ?, address = ?, password = ? WHERE id = ?',
        [name, phone, address, hashedPassword, decoded.userId]
      );
    } else {
      // Just updating general details
      await query(
        'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
        [name, phone, address, decoded.userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profiliniz başarıyla güncellendi.'
    });
  } catch (error: any) {
    console.error('Update Profile API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
