import { MetadataRoute } from 'next'

const BASE = 'https://untilfire.com'
const TODAY = '2026-04-27'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: TODAY,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/coast-fire-calculator`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/barista-fire-calculator`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/calculator`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
