import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId') || '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ödeme Başarısız</title>
      <meta charset="utf-8" />
    </head>
    <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f8fafc; color: #1e293b;">
      <h3 style="margin-bottom: 10px; color: #dc2626;">Ödeme Başarısız!</h3>
      <p style="font-size: 14px; color: #64748b;">Ödeme işlemi tamamlanamadı veya iptal edildi. Sepete geri yönlendiriliyorsunuz...</p>
      <script>
        setTimeout(function() {
          window.top.location.href = '/?tab=checkout&payment=failed&orderId=${orderId}';
        }, 1500);
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
