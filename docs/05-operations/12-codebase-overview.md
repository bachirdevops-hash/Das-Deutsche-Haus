# 📂 Codebase Overview

## Tech Stack
- **Next.js 14.2.3** (App Router)
- **React 18**
- **MongoDB Atlas** (cloud, single DB)
- **Tailwind CSS + shadcn/ui + lucide-react**
- **Resend** (email), **Cloudinary** (uploads)
- **bcryptjs**, **jsonwebtoken**, **uuid**
- **sonner** (toasts)

## Source of Truth
- Package versions → `/app/package.json`
- Routing → file-system based (Next.js)
- DB connection → `/app/lib/db.js` (🔍 inferred location)

## Gotchas
1. **One monolithic API file** — `route.js` (1750 LoC). Grep before editing.
2. **One monolithic frontend** — `page.js` (1900 LoC). Has 11+ components inside.
3. **No TypeScript** — plain JS throughout. Be careful with types.
4. **MongoDB Atlas is LIVE production data** — do not run destructive ops.
5. **All public images use `images.unoptimized: true`** — trade-off for hosting.
6. **`global.__ddhSeeded` flag** prevents re-seeding on every request.

## Lint & Style
- ESLint configured
- 2-space indent
- Single quotes
- No semicolons preferred (mostly absent)
- Arabic in JSX is normal; double-check for RTL classes (`ms-*`/`me-*`)
