import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId') || '';

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
          window.top.location.href = '/?tab=profile&payment=success&orderId=${orderId}';
        }, 500);
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
