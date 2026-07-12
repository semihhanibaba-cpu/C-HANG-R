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
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    // Admin can see all orders, customer can only see their own
    if (decoded.role === 'admin') {
      if (orderId) {
        // Get single order with items
        const orders = await query(
          `SELECT o.*, u.name as user_name, u.role as user_role, u.company_name 
           FROM orders o 
           LEFT JOIN users u ON o.user_id = u.id 
           WHERE o.id = ?`,
          [orderId]
        );
        if (orders.length === 0) {
          return NextResponse.json({ success: false, error: 'Sipariş bulunamadı.' }, { status: 444 });
        }
        const items = await query(
          `SELECT oi.*, p.name as product_name, p.sku, p.image_url 
           FROM order_items oi 
           LEFT JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = ?`,
          [orderId]
        );
        return NextResponse.json({ success: true, order: orders[0], items });
      } else {
        // Get all orders
        const orders = await query(
          `SELECT o.*, u.name as user_name, u.role as user_role, u.company_name 
           FROM orders o 
           LEFT JOIN users u ON o.user_id = u.id 
           ORDER BY o.created_at DESC`
        );
        return NextResponse.json({ success: true, orders });
      }
    } else {
      // Customer
      if (orderId) {
        // Get single order with items for this customer
        const orders = await query(
          `SELECT o.*, u.name as user_name, u.company_name 
           FROM orders o 
           LEFT JOIN users u ON o.user_id = u.id 
           WHERE o.id = ? AND o.user_id = ?`,
          [orderId, decoded.userId]
        );
        if (orders.length === 0) {
          return NextResponse.json({ success: false, error: 'Sipariş bulunamadı veya yetkiniz yok.' }, { status: 403 });
        }
        const items = await query(
          `SELECT oi.*, p.name as product_name, p.sku, p.image_url 
           FROM order_items oi 
           LEFT JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = ?`,
          [orderId]
        );
        return NextResponse.json({ success: true, order: orders[0], items });
      } else {
        // Get customer's orders
        const orders = await query(
          `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
          [decoded.userId]
        );
        return NextResponse.json({ success: true, orders });
      }
    }
  } catch (error: any) {
    console.error('Get Orders API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Sipariş vermek için lütfen giriş yapın.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    // Fetch user info to verify role and details
    const users = await query('SELECT role, name, email, phone, company_name FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }
    const user = users[0];

    const body = await req.json();
    const { items, paymentMethod, shippingAddress, phone, email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Sepetiniz boş.' }, { status: 400 });
    }

    if (!shippingAddress || !phone || !email) {
      return NextResponse.json({ success: false, error: 'Lütfen teslimat adresi, telefon ve e-posta bilgilerini doldurun.' }, { status: 400 });
    }

    // Verify stock and fetch correct prices
    let totalAmount = 0;
    const itemsWithDetails = [];

    for (const item of items) {
      const products = await query('SELECT price, stock, name FROM products WHERE id = ?', [item.id]);
      if (products.length === 0) {
        return NextResponse.json({ success: false, error: `Ürün bulunamadı: ID ${item.id}` }, { status: 400 });
      }
      const product = products[0];

      if (product.stock < item.quantity) {
        return NextResponse.json({ success: false, error: `Üzgünüz, "${product.name}" ürünü için yetersiz stok. Mevcut stok: ${product.stock}` }, { status: 400 });
      }

      const itemTotal = Number(product.price) * Number(item.quantity);
      totalAmount += itemTotal;

      itemsWithDetails.push({
        productId: item.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const minLimit = user.role === 'customer' ? 200 : 1500;
    if (totalAmount < minLimit) {
      return NextResponse.json(
        { success: false, error: `Sipariş verebilmek için sepet toplamı minimum ${minLimit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL olmalıdır.` },
        { status: 400 }
      );
    }

    // Determine payment method and status based on user role
    let method = 'cari';
    let orderStatus = 'pending';
    let successMessage = 'Kurumsal siparişiniz cari hesabınıza kaydedildi ve onay için yöneticiye iletildi.';

    const hasShippingFee = user.role === 'customer';
    const shippingFee = hasShippingFee ? 80 : 0;
    const finalAmount = totalAmount + shippingFee;

    let notificationMsg = `Kurumsal Sipariş Alındı (Cari Hesap): ${user.company_name || user.name} tarafından ${finalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL tutarında sipariş oluşturuldu. Onay bekliyor.`;

    if (user.role === 'customer') {
      // Fetch active payment provider from configs
      const providerRows = await query('SELECT `value` FROM configs WHERE `key` = "active_payment_provider"');
      const activeProvider = providerRows.length > 0 ? providerRows[0].value : 'paytr';

      method = activeProvider === 'shopier' ? 'shopier' : 'paytr';
      orderStatus = 'pending_payment';
      successMessage = 'Siparişiniz oluşturuldu, ödeme sayfasına yönlendiriliyorsunuz...';
      notificationMsg = `Yeni Bireysel Sipariş Oluşturuldu (Ödeme Bekliyor): ${user.name} tarafından ${finalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL tutarında sipariş ödeme aşamasında.`;
    } else if (user.role === 'corporate') {
      method = 'cari';
      orderStatus = 'pending';
    } else {
      return NextResponse.json({ success: false, error: 'Sipariş vermek için kurumsal onayınız bulunmuyor veya yetkiniz yok.' }, { status: 403 });
    }

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (user_id, total_amount, payment_method, status, shipping_address, phone, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [decoded.userId, finalAmount, method, orderStatus, shippingAddress, phone, email]
    );

    const orderId = orderResult.insertId;

    // Add items and update stocks
    for (const item of itemsWithDetails) {
      // Insert item
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );

      // Decrement stock
      await query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.productId]
      );
    }

    // Create notifications
    await query(
      `INSERT INTO notifications (message) VALUES (?)`,
      [notificationMsg]
    );

    return NextResponse.json({
      success: true,
      message: successMessage,
      orderId,
      paymentMethod: method
    });
  } catch (error: any) {
    console.error('Create Order API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Sipariş ID ve yeni durum zorunludur.' }, { status: 400 });
    }

    // Update order status
    await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // Create a notification for the user
    const orders = await query('SELECT user_id, total_amount FROM orders WHERE id = ?', [id]);
    if (orders.length > 0) {
      const order = orders[0];
      let statusText = 'güncellendi';
      if (status === 'approved') statusText = 'onaylandı';
      if (status === 'shipping') statusText = 'kargoya verildi';
      if (status === 'delivered') statusText = 'teslim edildi';
      if (status === 'cancelled') statusText = 'iptal edildi';

      await query(
        'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
        [order.user_id, `Siparişiniz #${id} (${order.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL) durumu "${statusText}" olarak güncellendi.`]
      );
    }

    return NextResponse.json({ success: true, message: 'Sipariş durumu başarıyla güncellendi.' });
  } catch (error: any) {
    console.error('Update Order Status API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
