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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    // 1. General counts and aggregates
    const salesResult = await query("SELECT SUM(total_amount) as totalSales, COUNT(id) as totalOrders FROM orders WHERE status != 'cancelled'");
    const { totalSales = 0, totalOrders = 0 } = (salesResult && salesResult[0]) || {};

    const productsResult = await query("SELECT COUNT(id) as totalProducts FROM products");
    const { totalProducts = 0 } = (productsResult && productsResult[0]) || {};

    const usersResult = await query(`
      SELECT 
        COUNT(id) as totalUsers,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customersCount,
        SUM(CASE WHEN role = 'corporate' THEN 1 ELSE 0 END) as corporateCount,
        SUM(CASE WHEN role = 'corporate_pending' THEN 1 ELSE 0 END) as corporatePendingCount
      FROM users
    `);
    const { 
      totalUsers = 0, 
      customersCount = 0, 
      corporateCount = 0, 
      corporatePendingCount = 0 
    } = (usersResult && usersResult[0]) || {};

    // 2. Sales by payment method
    const salesByPayment = await query(`
      SELECT payment_method as method, SUM(total_amount) as total, COUNT(id) as count 
      FROM orders 
      WHERE status != 'cancelled' 
      GROUP BY payment_method
    `);

    // 3. Sales by status
    const salesByStatus = await query(`
      SELECT status, COUNT(id) as count, SUM(total_amount) as total 
      FROM orders 
      GROUP BY status
    `);

    // 4. Monthly/Daily order trends
    const salesTrends = await query(`
      SELECT DATE(created_at) as date, COUNT(id) as count, SUM(total_amount) as total 
      FROM orders 
      WHERE status != 'cancelled' 
      GROUP BY DATE(created_at) 
      ORDER BY date ASC 
      LIMIT 30
    `);

    return NextResponse.json({
      success: true,
      report: {
        totalSales: Number(totalSales || 0),
        totalOrders: Number(totalOrders || 0),
        totalProducts: Number(totalProducts || 0),
        totalUsers: Number(totalUsers || 0),
        customersCount: Number(customersCount || 0),
        corporateCount: Number(corporateCount || 0),
        corporatePendingCount: Number(corporatePendingCount || 0),
        salesByPayment,
        salesByStatus,
        salesTrends
      }
    });
  } catch (error: any) {
    console.error('Get Admin Reports API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
