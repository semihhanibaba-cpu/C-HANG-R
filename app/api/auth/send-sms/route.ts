import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Telefon numarası zorunludur.' }, { status: 400 });
    }

    // Generate a 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the SMS verification state in the database or dynamic store.
    // For simplicity, let's store it or update an existing verification code.
    // We will simulate sending it and return it in the response so the user can see it in development easily.
    console.log(`[SMS SENDER] Phone: ${phone}, OTP: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: 'Doğrulama kodu başarıyla gönderildi (Simülasyon).',
      code: otpCode, // Send code back for easy simulation entry in UI
    });
  } catch (error: any) {
    console.error('Send SMS API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
