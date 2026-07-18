const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dasdeutschehaus.com'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/manager', '/teacher', '/dashboard', '/_next/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
