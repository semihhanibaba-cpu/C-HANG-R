import { NextRequest } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import { Shopier } from 'shopier-api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();

    // Parse URL-encoded post body from Shopier
    let body: Record<string, string> = {};
    try {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } catch {
      const text = await req.text();
      const searchParams = new URLSearchParams(text);
      searchParams.forEach((value, key) => {
        body[key] = value;
      });
    }

    console.log('Shopier Callback Request Body:', body);

    // Retrieve Shopier configs
    const configsList = await query(
      'SELECT `key`, `value` FROM configs WHERE `key` IN ("shopier_api_key", "shopier_api_secret")'
    );

    const configMap: Record<string, string> = {};
    configsList.forEach((item: any) => {
      configMap[item.key] = item.value || '';
    });

    const apiKey = configMap.shopier_api_key || 'shopier_api_key_849102';
    const apiSecret = configMap.shopier_api_secret || 'shopier_api_secret_998877';

    const shopier = new Shopier(apiKey, apiSecret);
    const cbResult = shopier.callback(body);

    if (!cbResult) {
      console.error('Shopier Signature Verification Failed for Body:', body);
      return new Response('BAD SIGNATURE', { status: 400 });
    }

    const { order_id, payment_id } = cbResult;
    console.log(`Shopier Payment Success for order #${order_id}, payment ID: ${payment_id}`);

    // Update order status in the database
    const orders = await query('SELECT * FROM orders WHERE id = ?', [order_id]);
    
    if (orders.length > 0) {
      const order = orders[0];
      
      if (order.status === 'pending_payment') {
        // Update status to approved
        await query(
          'UPDATE orders SET status = "approved" WHERE id = ?',
          [order_id]
        );

        // Notify user
        await query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [
            order.user_id,
            `Ödemeniz başarıyla alındı! Shopier siparişiniz #${order_id} (${Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL) onaylandı.`
          ]
        );

        // Notify admins
        await query(
          'INSERT INTO notifications (message) VALUES (?)',
          [
            `Shopier Ödemesi Alındı: #${order_id} numaralı sipariş için ${Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ödeme başarıyla onaylandı. Ödeme ID: ${payment_id}`
          ]
        );
      }
    }

    // Return HTML success redirect in case Shopier posts inside the browser, 
    // or just plain response if background server callback.
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ödeme Başarılı</title>
        <meta charset="utf-8" />
      </head>
      <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f8fafc; color: #1e293b;">
        <h3 style="margin-bottom: 10px; color: #16a34a;">Ödemeniz Alındı!</h3>
        <p style="font-size: 14px; color: #64748b;">Sipariş sayfasına yönlendiriliyorsunuz, lütfen bekleyin...</p>
        <script>
          setTimeout(function() {
            window.top.location.href = '/?tab=profile&payment=success&orderId=${order_id}';
          }, 500);
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error: any) {
    console.error('Shopier Callback Server Error:', error);
    return new Response('SERVER ERROR', { status: 500 });
  }
}
