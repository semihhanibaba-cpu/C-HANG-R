import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    
    // Fetch only safe, public configurations
    const rows = await query(
      'SELECT `key`, `value` FROM configs WHERE `key` IN ("site_name", "site_logo", "site_logo_type", "site_address", "site_phone", "site_email", "site_instagram", "site_facebook", "site_twitter", "active_payment_provider", "allow_individual_auth")'
    );
    
    const configs: Record<string, string> = {
      site_name: 'Hani Baba Tedarik',
      site_logo_type: 'text',
      site_logo: '',
      site_address: 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No 103',
      site_phone: '+905010160527',
      site_email: 'bilgi@hanibabatedarik.com',
      site_instagram: '#',
      site_facebook: '#',
      site_twitter: '#',
      active_payment_provider: 'paytr',
      allow_individual_auth: 'true'
    };

    rows.forEach((row: any) => {
      configs[row.key] = row.value || '';
    });

    return NextResponse.json({ success: true, configs });
  } catch (error: any) {
    console.error('Get Public Configs API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
