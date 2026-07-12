import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/token';
import { Shopier } from 'shopier-api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return new Response('Sipariş ID gereklidir.', { status: 400 });
    }

    // Retrieve order
    const orders = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return new Response('Sipariş bulunamadı.', { status: 404 });
    }

    const order = orders[0];
    if (order.status !== 'pending_payment' || order.payment_method !== 'shopier') {
      return new Response('Bu sipariş ödeme bekleyen bir Shopier siparişi değil.', { status: 400 });
    }

    // Retrieve Shopier configs
    const configsList = await query(
      'SELECT `key`, `value` FROM configs WHERE `key` IN ("shopier_api_key", "shopier_api_secret", "shopier_website_index")'
    );

    const configMap: Record<string, string> = {};
    configsList.forEach((item: any) => {
      configMap[item.key] = item.value || '';
    });

    const apiKey = configMap.shopier_api_key || 'shopier_api_key_849102';
    const apiSecret = configMap.shopier_api_secret || 'shopier_api_secret_998877';

    // Retrieve order items
    const items = await query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const productName = items.length > 0 
      ? (items[0].product_name || 'Hani Baba Ürünü') 
      : 'Hani Baba Siparişi';

    const shopier = new Shopier(apiKey, apiSecret);

    // Split user's full name for Shopier
    const fullName = order.email ? order.email.split('@')[0] : 'Müşteri';
    const nameParts = fullName.trim().split(' ');
    const buyer_name = nameParts[0] || 'Hani';
    const buyer_surname = nameParts.slice(1).join(' ') || 'Baba';

    shopier.setBuyer({
      buyer_id_nr: order.user_id.toString(),
      buyer_name: buyer_name,
      buyer_surname: buyer_surname,
      buyer_email: order.email || 'bilgi@hanibabatedarik.com',
      buyer_phone: order.phone || '05010160527',
      product_name: productName,
      platform_order_id: orderId.toString()
    });

    // Clean up address info
    const fullAddress = order.shipping_address || 'Dilovası, Kocaeli';
    const addressCity = fullAddress.toLowerCase().includes('istanbul') ? 'Istanbul' : 'Kocaeli';

    shopier.setOrderBilling({
      billing_address: fullAddress,
      billing_city: addressCity,
      billing_country: 'Türkiye',
      billing_postcode: '41455'
    });

    shopier.setOrderShipping({
      shipping_address: fullAddress,
      shipping_city: addressCity,
      shipping_country: 'Türkiye',
      shipping_postcode: '41455'
    });

    // Generate HTML auto-submitting form
    const paymentHtml = shopier.generatePaymentHTML(Number(order.total_amount));

    return new Response(paymentHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error: any) {
    console.error('Shopier Payment Request Error:', error);
    return new Response(`Sistem hatası: ${error.message}`, { status: 500 });
  }
}
