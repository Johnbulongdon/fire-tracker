import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/expenses'],
    },
    sitemap: 'https://untilfire.com/sitemap.xml',
  }
}
