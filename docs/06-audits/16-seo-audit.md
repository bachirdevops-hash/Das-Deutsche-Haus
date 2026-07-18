# 🔍 SEO Audit

## ⚠️ Critical Gaps (Pre-launch Blockers)
| # | Gap | Severity | Effort |
|---|-----|----------|--------|
| 1 | No `/sitemap.xml` | 🔴 | XS |
| 2 | No `/robots.txt` | 🔴 | XS |
| 3 | No Open Graph (`og:title`, `og:image`) | 🔴 | S |
| 4 | No Twitter Card meta | 🔴 | XS |
| 5 | No JSON-LD structured data (EducationalOrganization, Course, Event, BlogPosting) | 🔴 | M |
| 6 | No `<meta name="description">` per page | 🔴 | S |
| 7 | No canonical tags | 🟡 | XS |
| 8 | No hreflang for AR/DE | 🟡 | S |
| 9 | Blog posts lack reading-time + author metadata | 🟢 | XS |
| 10 | No Google Search Console verification | 🟢 | XS |

## Strengths
- ✅ Semantic HTML (`<header>`, `<main>`, `<section>`)
- ✅ RTL `<html dir>` correctly set
- ✅ Mobile responsive
- ✅ Clean URLs (`/visa-types`, `/blog/<slug>`)

## Quick Wins (Implement in order)
```js
// /app/app/sitemap.js — Next.js auto-generates
export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  // fetch blog slugs, activity slugs, static pages
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    // ...
  ]
}

// /app/app/robots.js
export default function robots() {
  return { rules: { userAgent: '*', allow: '/', disallow: '/admin' }, sitemap: `${base}/sitemap.xml` }
}

// Add to layout.js metadata:
export const metadata = {
  title: { template: '%s | Das Deutsche Haus', default: 'Das Deutsche Haus' },
  description: 'معهد ألماني معتمد — كورسات، telc، Ausbildung، تأشيرات.',
  openGraph: { ... },
  twitter: { card: 'summary_large_image', ... },
}
```
