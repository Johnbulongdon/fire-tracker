import { MetadataRoute } from 'next'
import { LEARN_ARTICLES } from '@/lib/learn'

export default function sitemap(): MetadataRoute.Sitemap {
  const learnPages: MetadataRoute.Sitemap = LEARN_ARTICLES.map((article) => ({
    url: `https://untilfire.com/learn/${article.slug}`,
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
    {
      url: 'https://untilfire.com/learn',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...learnPages,
  ]
}
