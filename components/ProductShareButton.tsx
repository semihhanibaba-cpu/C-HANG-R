'use client';

import React from 'react';
import { Share2, Check } from 'lucide-react';

interface ProductShareButtonProps {
  slug: string;
  className?: string;
  buttonClassName?: string;
}

export default function ProductShareButton({ slug, className = '', buttonClassName = '' }: ProductShareButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const productUrl = `${window.location.origin}/products/${slug}`;
      navigator.clipboard.writeText(productUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  return (
    <div className={`relative ${className}`} id="product-share-button-container">
      <button
        onClick={handleShare}
        className={buttonClassName || "p-2.5 rounded-full border shadow-2xs transition-all bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer flex items-center justify-center"}
        title="Ürünü Paylaş"
        id="product-share-btn"
      >
        {copied ? (
          <Check className="w-5 h-5 text-emerald-600" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
      </button>

      {copied && (
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-black py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap animate-bounce z-50"
          id="product-share-copied-toast"
        >
          Kopyalandı: URL
        </div>
      )}
    </div>
  );
}
