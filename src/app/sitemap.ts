import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://modelmarketim.com/tr',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          tr: 'https://modelmarketim.com/tr',
          en: 'https://modelmarketim.com/en',
        },
      },
    },
    {
      url: 'https://modelmarketim.com/tr/products',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          tr: 'https://modelmarketim.com/tr/products',
          en: 'https://modelmarketim.com/en/products',
        },
      },
    },
    {
      url: 'https://modelmarketim.com/tr/track',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  const productPages: MetadataRoute.Sitemap = (products ?? []).map(product => ({
    url: `https://modelmarketim.com/tr/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: {
        tr: `https://modelmarketim.com/tr/products/${product.slug}`,
        en: `https://modelmarketim.com/en/products/${product.slug}`,
      },
    },
  }))

  return [...staticPages, ...productPages]
}
