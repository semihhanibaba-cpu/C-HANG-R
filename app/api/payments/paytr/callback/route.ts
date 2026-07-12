import { NextRequest } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();

    // Parse the form urlencoded payload sent by PayTR
    let body: Record<string, string> = {};
    try {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } catch {
      // Fallback for custom formatted or raw urlencoded bodies
      const text = await req.text();
      const searchParams = new URLSearchParams(text);
      searchParams.forEach((value, key) => {
        body[key] = value;
      });
    }

    const { merchant_oid, status, total_amount, hash } = body;

    if (!merchant_oid || !status || !total_amount || !hash) {
      console.error('PayTR Callback Error: Missing parameters', body);
      return new Response('MISSING PARAMETERS', { status: 400 });
    }

    // Retrieve PayTR configurations from configs table
    const configsList = await query(
      'SELECT `key`, `value` FROM configs WHERE `key` IN ("paytr_merchant_key", "paytr_merchant_salt")'
    );

    const configMap: Record<string, string> = {};
    configsList.forEach((item: any) => {
      configMap[item.key] = item.value || '';
    });

    const merchantKey = configMap.paytr_merchant_key || 'xxPayTRKey123xx';
    const merchantSalt = configMap.paytr_merchant_salt || 'xxPayTRSalt123xx';

    // PayTR callback hash validation string: merchant_oid + merchant_salt + status + total_amount
    const verificationConcat = merchant_oid + merchantSalt + status + total_amount;
    const calculatedHash = crypto
      .createHmac('sha256', merchantKey)
      .update(verificationConcat)
      .digest('base64');

    if (calculatedHash !== hash) {
      console.error('PayTR Callback Error: Signature verification failed.', {
        received: hash,
        calculated: calculatedHash
      });
      return new Response('BAD HASH', { status: 400 });
    }

    if (status === 'success') {
      // Find order to verify existence and get details
      const orders = await query('SELECT * FROM orders WHERE id = ?', [merchant_oid]);
      
      if (orders.length > 0) {
        const order = orders[0];
        
        // Update order status from pending_payment to approved
        await query(
          'UPDATE orders SET status = "approved" WHERE id = ?',
          [merchant_oid]
        );

        // Notify user about order approval and successful payment
        await query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [
            order.user_id,
            `Ödemeniz başarıyla alındı! Siparişiniz #${merchant_oid} (${Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL) onaylandı ve kargolanmak üzere hazırlanıyor.`
          ]
        );

        // Notify all admins about the secure payment
        await query(
          'INSERT INTO notifications (message) VALUES (?)',
          [
            `PayTR Ödemesi Alındı: #${merchant_oid} numaralı sipariş için ${Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ödeme başarıyla onaylandı.`
          ]
        );
      }
    } else {
      // Payment failed
      const orders = await query('SELECT * FROM orders WHERE id = ?', [merchant_oid]);
      
      if (orders.length > 0) {
        const order = orders[0];

        // Update order status to cancelled
        await query(
          'UPDATE orders SET status = "cancelled" WHERE id = ?',
          [merchant_oid]
        );

        // Return stock of items
        const orderItems = await query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [merchant_oid]);
        for (const item of orderItems) {
          await query(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }

        // Notify user
        await query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [
            order.user_id,
            `Siparişiniz #${merchant_oid} için ödeme işlemi tamamlanamadı ve sepet stokları geri yüklendi.`
          ]
        );
      }
    }

    // Must return "OK" to acknowledge the receipt of notification
    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('PayTR Callback Server Error:', error);
    return new Response('SERVER ERROR', { status: 500 });
  }
}
