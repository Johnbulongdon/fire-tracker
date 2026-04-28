import { MetadataRoute } from 'next'
import { LEARN_ARTICLES } from '@/lib/learn'

export default function sitemap(): MetadataRoute.Sitemap {
  const learnPages: MetadataRoute.Sitemap = LEARN_ARTICLES.map((article) => ({
    url: `https://untilfire.com/learn/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: 'https://untilfire.com',
      lastModified: new Date('2026-04-28'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://untilfire.com/calculator',
      lastModified: new Date('2026-04-28'),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://untilfire.com/coast-fire-calculator',
      lastModified: new Date('2026-04-28'),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://untilfire.com/barista-fire-calculator',
      lastModified: new Date('2026-04-28'),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://untilfire.com/learn',
      lastModified: new Date('2026-04-28'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...learnPages,
  ]
}
