'use client'
import { useEffect, useState } from 'react'

// 🎛️ useFeatureFlags — small hook that fetches feature flags once, caches globally.
// Returns { flags, isEnabled(key), ready }
let cache = null
let inflight = null
const listeners = new Set()

async function fetchFlags() {
  if (cache) return cache
  if (inflight) return inflight
  inflight = fetch('/api/site-features')
    .then(r => r.ok ? r.json() : { flags: {} })
    .then(d => { cache = d.flags || {}; return cache })
    .catch(() => { cache = {}; return cache })
    .finally(() => { inflight = null })
  return inflight
}

// External helper — invalidate cache after admin toggles a flag
export function invalidateFeatureFlags() {
  cache = null
  listeners.forEach(cb => cb())
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState(cache || {})
  const [ready, setReady] = useState(!!cache)

  useEffect(() => {
    let mounted = true
    fetchFlags().then(f => { if (mounted) { setFlags(f); setReady(true) } })
    const onInvalidate = () => {
      fetchFlags().then(f => { if (mounted) setFlags(f) })
    }
    listeners.add(onInvalidate)
    return () => { mounted = false; listeners.delete(onInvalidate) }
  }, [])

  const isEnabled = (key) => {
    // Optimistic: if we haven't fetched yet, assume enabled (avoid flash of "coming soon")
    if (!ready) return true
    return flags[key] !== false
  }

  return { flags, isEnabled, ready }
}
