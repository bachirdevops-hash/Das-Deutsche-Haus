const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dasdeutschehaus.com'

async function fetchDynamic(path) {
  try {
    const res = await fetch(`${SITE_URL}/api/${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data
  } catch {
    return {}
  }
}

export default async function sitemap() {
  const now = new Date()

  const staticRoutes = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/activities`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/visa-types`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/german-visitors`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/impressum`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamic — blog posts & activities
  const [blog, activities] = await Promise.all([
    fetchDynamic('blog?limit=200'),
    fetchDynamic('activities?limit=200'),
  ])

  const blogRoutes = (blog?.items || blog?.posts || []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const activityRoutes = (activities?.items || activities?.activities || []).map((a) => ({
    url: `${SITE_URL}/activities/${a.slug}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes, ...activityRoutes]
}
