import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://untilfire.com'
  const now = new Date()

  const learnPages = [
    // Core calculators
    '/learn/fire-calculator',
    '/learn/coast-fire-calculator',
    '/learn/fire-number',
    '/learn/savings-rate-calculator',
    '/learn/4-percent-rule',
    // Geo pages
    '/learn/fire-in-tokyo',
    '/learn/fire-in-hong-kong',
    '/learn/fire-in-bali',
    '/learn/fire-in-lisbon',
    '/learn/fire-in-medellin',
    // Income pages
    '/learn/fire-number/50000-income',
    '/learn/fire-number/75000-income',
    '/learn/fire-number/100000-income',
    '/learn/fire-number/125000-income',
    '/learn/fire-number/150000-income',
    '/learn/fire-number/175000-income',
    '/learn/fire-number/200000-income',
    '/learn/fire-number/250000-income',
    '/learn/fire-number/500000-income',
    '/learn/fire-number/1000000-income',
  ]

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...learnPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
