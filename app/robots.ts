import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/transactions',
        '/expenses',
        '/debug',
        '/auth/',
      ],
    },
    sitemap: 'https://untilfire.com/sitemap.xml',
  }
}
