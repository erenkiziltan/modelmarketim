import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
        '/yonetim-paneli/',
        '/api/',
        '/*/checkout',
        '/*/cart',
        '/*/favorites',
        '/checkout',
        '/cart',
        '/favorites',
      ],
      },
    ],
    sitemap: 'https://modelmarketim.com/sitemap.xml',
    host: 'https://modelmarketim.com',
  }
}
