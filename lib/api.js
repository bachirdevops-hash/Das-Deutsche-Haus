// Centralized API helper with try-catch, timeout, and graceful error handling
// Prevents unhandled promise rejections that can crash the UI tree.
import { toast } from 'sonner'

const DEFAULT_TIMEOUT = 20000 // 20s

async function safeFetch(url, options = {}, { timeout = DEFAULT_TIMEOUT, silent = false } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const r = await fetch(url, { ...options, signal: ctrl.signal })
    clearTimeout(timer)
    let data = null
    const ct = r.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try { data = await r.json() } catch { data = null }
    }
    if (!r.ok) {
      const msg = data?.error || `HTTP ${r.status}`
      if (!silent) toast.error(msg)
      return { ok: false, status: r.status, error: msg, data }
    }
    if (data?.error) {
      if (!silent) toast.error(data.error)
      return { ok: false, status: r.status, error: data.error, data }
    }
    return { ok: true, status: r.status, data }
  } catch (e) {
    clearTimeout(timer)
    if (e.name === 'AbortError') {
      if (!silent) toast.error('انتهت مهلة الاتصال — حاول مجدداً')
      return { ok: false, status: 0, error: 'timeout' }
    }
    if (!silent) toast.error('خطأ في الاتصال')
    return { ok: false, status: 0, error: e.message }
  }
}

export const api = {
  get: (url, opts) => safeFetch(url, { method: 'GET' }, opts),
  post: (url, body, opts) => safeFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }, opts),
  patch: (url, body, opts) => safeFetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }, opts),
  put: (url, body, opts) => safeFetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }, opts),
  delete: (url, opts) => safeFetch(url, { method: 'DELETE' }, opts),
}
