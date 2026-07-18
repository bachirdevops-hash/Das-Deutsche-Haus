'use client'
import * as Icons from 'lucide-react'

// Resolve a lucide icon by string name (fallback: Star)
export function getIcon(name) {
  if (!name) return Icons.Star
  return Icons[name] || Icons.Star
}

// React hook helper — fetch a content section from API
export async function fetchContent(key) {
  const r = await fetch(`/api/content/${key}`, { cache: 'no-store' })
  const d = await r.json()
  return d.data || {}
}

export async function fetchAllContent() {
  const r = await fetch('/api/content', { cache: 'no-store' })
  const d = await r.json()
  return d.content || {}
}

export async function fetchList(resource) {
  const r = await fetch(`/api/${resource}`, { cache: 'no-store' })
  const d = await r.json()
  return d.items || []
}
