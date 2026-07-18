# ⚡ Performance Audit

## Current Metrics (post production-build switch)
| Metric | Before | After | Target |
|--------|--------|-------|--------|
| API response avg | ~3000ms | ~150-600ms | <300ms |
| LCP (Largest Contentful Paint) | 15s | ~1.5s | <2.5s |
| Time to Interactive | 5s+ | <2s | <3s |
| Server cold start | 15s | 200ms (warm) | <500ms |

## Wins Implemented
- ✅ Seed cached via `global.__ddhSeeded` (was running per-request)
- ✅ `next build` + `next start` instead of `next dev` in supervisor
- ✅ Node memory raised from 512MB → 1024MB
- ✅ Sections hidden when empty (no rendering waste)

## Outstanding Bottlenecks
- ⚠️ Each page navigation triggers full data refetch (no cache)
- ⚠️ `useEffect` chains: 4-12 sequential `fetchContent` calls → should use `Promise.all`
- ⚠️ No Next.js Image optimization (currently `unoptimized: true`)
- ⚠️ Cloudinary images served at full size (no width param)
- ⚠️ No CDN in front of Cloudinary URLs
- ⚠️ MongoDB lacks recommended indexes (see DB schema doc)

## Recommendations
1. **Promise.all** in homepage `useEffect` (12 calls → parallel)
2. **In-memory cache** for `/api/content` responses (5min TTL)
3. **Add MongoDB indexes** per schema doc
4. **Cloudinary transformations**: add `?w=800,c_fill,f_auto,q_auto` to URLs
5. **Switch images to Next.js `<Image>`** with optimization enabled
6. **Static generation** for /privacy, /terms, /impressum (`export const dynamic = 'force-static'`)
