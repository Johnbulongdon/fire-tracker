import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api', '/auth', '/dashboard', '/debug', '/expenses', '/transactions'],
    },
    sitemap: 'https://untilfire.com/sitemap.xml',
  }
}
