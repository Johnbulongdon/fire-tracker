import { MetadataRoute } from 'next'

const LEARN_PAGES = [
  'fire-number',
  'fire-in-hong-kong',
  'fire-in-bali',
  'fire-in-lisbon',
  'fire-in-tokyo',
  'fire-in-singapore',
  'fire-in-san-francisco',
  'fire-in-new-york',
  'fire-in-london',
  'fire-in-chiang-mai',
  'fire-in-austin',
  'fire-in-barcelona',
  'what-is-coast-fire',
  'how-to-calculate-your-fire-number',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const learnPages: MetadataRoute.Sitemap = LEARN_PAGES.map((slug) => ({
    url: `https://untilfire.com/learn/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
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
      url: 'https://untilfire.com/coast-fire-calculator',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://untilfire.com/barista-fire-calculator',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://untilfire.com/calculator',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://untilfire.com/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...learnPages,
  ]
}
