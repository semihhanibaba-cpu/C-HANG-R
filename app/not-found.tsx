'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
      <h1 className="text-6xl font-extrabold text-[#f27a1a] mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Sayfa Bulunamadı</h2>
      <p className="text-slate-600 mb-8 max-w-md">
        Aradığınız sayfa silinmiş, taşınmış veya geçici olarak kullanım dışı kalmış olabilir.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#f27a1a] hover:bg-orange-600 text-white font-extrabold rounded-lg text-xs tracking-wider uppercase transition-colors shadow-sm"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
