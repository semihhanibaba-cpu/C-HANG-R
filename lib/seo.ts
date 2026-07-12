import { query } from './db';

// Resolves the current base URL for the applet dynamically, with robust fallbacks.
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Fallback to the user's live domain hbtedarik.com
  return 'https://hbtedarik.com';
}

// Global SEO-Friendly Turkish Slug Generator
export function normalizeSlug(str: string): string {
  if (!str) return '';
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
    'â': 'a', 'Â': 'a',
    'î': 'i', 'Î': 'i',
    'û': 'u', 'Û': 'u'
  };
  return str
    .split('')
    .map(char => turkishChars[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Generate Google-compliant Organization Schema (JSON-LD)
export function generateOrganizationSchema(siteConfigs: any) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    'name': siteConfigs?.site_name || 'Hanibaba Tedarik',
    'url': baseUrl,
    'logo': siteConfigs?.site_logo || `${baseUrl}/logo.png`,
    'sameAs': [
      siteConfigs?.site_facebook || '#',
      siteConfigs?.site_instagram || '#',
      siteConfigs?.site_twitter || '#'
    ].filter(link => link && link !== '#'),
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': siteConfigs?.site_phone || '+905010160527',
      'contactType': 'customer service',
      'email': siteConfigs?.site_email || 'bilgi@hanibabatedarik.com',
      'areaServed': 'TR',
      'availableLanguage': ['Turkish']
    }
  };
}

// Generate Google Website / Sitelinks Searchbox Schema (JSON-LD)
export function generateWebsiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    'name': 'Hanibaba Tedarik',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${baseUrl}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

// Generate Google LocalBusiness Schema (JSON-LD) for Local Turkish SEO
export function generateLocalBusinessSchema(siteConfigs: any) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#localbusiness`,
    'name': siteConfigs?.site_name || 'Hanibaba Tedarik',
    'image': siteConfigs?.site_logo || `${baseUrl}/logo.png`,
    'url': baseUrl,
    'telephone': siteConfigs?.site_phone || '+905010160527',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': siteConfigs?.site_address || 'Kocaeli Dilovası Mimar Sinan Mahallesi İstiklal Caddesi No 103',
      'addressLocality': 'Dilovası',
      'addressRegion': 'Kocaeli',
      'postalCode': '41455',
      'addressCountry': 'TR'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 40.7833,
      'longitude': 29.5333
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      'opens': '08:30',
      'closes': '19:00'
    }
  };
}

// Generate Google Merchant & Google Shopping Fully-Compliant Product Schema (JSON-LD)
export function generateProductSchema(product: any, categoryName: string) {
  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const imageUrl = product.image_url || 'https://picsum.photos/seed/placeholder/600/600';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}/#product`,
    'name': product.name,
    'image': [imageUrl],
    'description': product.description || product.name,
    'sku': product.sku || `SKU-HBT-${product.id}`,
    'mpn': product.sku || `MPN-HBT-${product.id}`,
    'brand': {
      '@type': 'Brand',
      'name': product.brand || 'Hanibaba Tedarik'
    },
    'category': categoryName,
    'offers': {
      '@type': 'Offer',
      'url': productUrl,
      'priceCurrency': 'TRY',
      'price': Number(product.price).toFixed(2),
      'priceValidUntil': '2028-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Hanibaba Tedarik',
        'url': baseUrl
      },
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': '0.00',
          'currency': 'TRY'
        },
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'TR'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 0,
            'maxValue': 1,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 1,
            'maxValue': 3,
            'unitCode': 'DAY'
          }
        }
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'applicableCountry': 'TR',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnPeriod',
        'merchantReturnDays': 14,
        'returnMethod': 'https://schema.org/ReturnByMail',
        'returnFees': 'https://schema.org/FreeReturn'
      }
    }
  };
}

// Generate BreadcrumbList Schema (JSON-LD)
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}
