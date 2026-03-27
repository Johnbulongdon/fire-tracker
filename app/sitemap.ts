import { MetadataRoute } from 'next'
import { CITIES } from '@/lib/fire-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `https://untilfire.com/retire-in/${city.key}`,
    lastModified: new Date('2026-01-01'),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: 'https://untilfire.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://untilfire.com/calculator',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://untilfire.com/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...cityPages,
  ]
}
