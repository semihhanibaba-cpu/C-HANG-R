import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const tokenCookie = req.cookies.get('token')?.value;
    if (!tokenCookie) {
      return NextResponse.json({ success: false, error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 401 });
    }

    const decoded = verifyToken(tokenCookie);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Sipariş ID gereklidir.' }, { status: 400 });
    }

    // Retrieve order and verify ownership
    const orders = await query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, decoded.userId]
    );

    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: 'Sipariş bulunamadı veya bu siparişe erişim yetkiniz yok.' }, { status: 404 });
    }

    const order = orders[0];
    if (order.status !== 'pending_payment' || order.payment_method !== 'paytr') {
      return NextResponse.json({ success: false, error: 'Bu sipariş ödeme bekleyen bir PayTR siparişi değil.' }, { status: 400 });
    }

    // Retrieve order items to build the basket
    const items = await query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: 'Siparişe ait ürün bulunamadı.' }, { status: 400 });
    }

    // Retrieve PayTR configs from configs table
    const configsList = await query(
      'SELECT `key`, `value` FROM configs WHERE `key` IN ("paytr_merchant_id", "paytr_merchant_key", "paytr_merchant_salt", "paytr_sandbox")'
    );

    const configMap: Record<string, string> = {};
    configsList.forEach((item: any) => {
      configMap[item.key] = item.value || '';
    });

    const merchantId = configMap.paytr_merchant_id || '215844';
    const merchantKey = configMap.paytr_merchant_key || 'xxPayTRKey123xx';
    const merchantSalt = configMap.paytr_merchant_salt || 'xxPayTRSalt123xx';
    const isSandbox = configMap.paytr_sandbox === '0' ? '0' : '1';

    // Construct basket array as required by PayTR: [ [name, price, quantity], ... ]
    const basketArray = items.map((item: any) => [
      item.product_name || `Ürün #${item.product_id}`,
      Number(item.price).toFixed(2),
      Number(item.quantity)
    ]);

    const userBasket = Buffer.from(JSON.stringify(basketArray)).toString('base64');

    // Get client IP address
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Format payment amount (must be integer cents/kuruş, e.g. 1500.50 becomes 150050)
    const paymentAmount = Math.round(Number(order.total_amount) * 100).toString();

    const merchantOid = orderId.toString();
    const email = order.email || decoded.email || 'bilgi@hanibabatedarik.com';
    const userName = decoded.name || 'Hani Baba Müşterisi';
    const userPhone = order.phone || '05555555555';
    const userAddress = order.shipping_address || 'Türkiye';

    // Determine host origin dynamically
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const merchantOkUrl = `${origin}/api/payments/paytr/success?orderId=${merchantOid}`;
    const merchantFailUrl = `${origin}/api/payments/paytr/fail?orderId=${merchantOid}`;

    const noInstallment = '0'; // 0 = allow installments, 1 = single payment only
    const maxInstallment = '12';
    const currency = 'TL';
    const testMode = isSandbox;
    const debugOn = 1;

    // Concat string for token: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const hashSTR = `${merchantId}${clientIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
    const paytrTokenConcat = hashSTR + merchantSalt;
    
    // Hash using HMAC-SHA256 with merchant_key
    const paytrToken = crypto
      .createHmac('sha256', merchantKey)
      .update(paytrTokenConcat)
      .digest('base64');

    // Prepare urlencoded form payload
    const formPayload = new URLSearchParams();
    formPayload.append('merchant_id', merchantId);
    formPayload.append('user_ip', clientIp);
    formPayload.append('merchant_oid', merchantOid);
    formPayload.append('email', email);
    formPayload.append('payment_amount', paymentAmount);
    formPayload.append('paytr_token', paytrToken);
    formPayload.append('user_basket', userBasket);
    formPayload.append('no_installment', noInstallment);
    formPayload.append('max_installment', maxInstallment);
    formPayload.append('user_name', userName);
    formPayload.append('user_address', userAddress);
    formPayload.append('user_phone', userPhone);
    formPayload.append('merchant_ok_url', merchantOkUrl);
    formPayload.append('merchant_fail_url', merchantFailUrl);
    formPayload.append('currency', currency);
    formPayload.append('test_mode', testMode);
    formPayload.append('debug_on', debugOn.toString());

    // Send POST request to PayTR to retrieve iframe token
    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formPayload.toString()
    });

    const paytrData = await paytrRes.json();

    if (paytrData.status === 'success') {
      return NextResponse.json({
        success: true,
        token: paytrData.token
      });
    } else {
      console.error('PayTR Token Error:', paytrData);
      return NextResponse.json({
        success: false,
        error: paytrData.reason || 'PayTR token oluşturma başarısız oldu.'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('PayTR Request Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
