import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Hanibaba Tedarik | Kurumsal Ofis Tedarik Marketiniz',
  description: 'Yüksek kalitede, kurumsal ve bireysel ofis ihtiyaçlarınız için tek adres. Cari hesap ve güvenli online ödeme imkanı.',
  verification: {
    google: 'MSJ9QgJbBEokC29Y1S6d0w5zOFJRsxPDRMONzJm6Wnc',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased text-slate-800 bg-slate-50 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
