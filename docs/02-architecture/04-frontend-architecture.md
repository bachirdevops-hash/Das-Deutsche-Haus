# 🎨 Frontend Architecture

## 1. Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 14.2.3 |
| UI Library | React | 18.x |
| Styling | Tailwind CSS | latest |
| Components | shadcn/ui (Radix primitives) | embedded |
| Icons | lucide-react | latest |
| Toasts | sonner | latest |
| State (per-page) | useState / useEffect | (no Redux) |
| Form handling | Raw React + custom validation | (no Formik) |
| i18n | Custom dict in `/app/lib/translations.js` | inline |
| HTTP | `fetch` | native |

## 2. Application Tree

```
App (page.js — client component, 1900+ LoC)
├── Header (RTL/LTR aware)
├── (page === 'home')   → <Home>
│   ├── HeroSlideshow (10-image cross-fade)
│   ├── 3 Highlights cards (data: /api/content/home_highlights)
│   ├── Featured Event (auto from upcoming activities)
│   ├── About snippet (data: /api/content/about_mission)
│   ├── Why Us cards
│   ├── Featured Programs (courses grid)
│   ├── Testimonials
│   ├── Premium CTA Banner
│   ├── Recent News (blog)
│   └── Events Grid (activities)
├── (page === 'courses') → <Courses>
│   └── PublicLeadDialog (modal — name/email/phone/notes)
├── (page === 'telc')    → <Telc>
├── (page === 'vocational') → <Vocational>
├── (page === 'travel')  → <Travel>
├── (page === 'about')   → <About>
├── (page === 'contact') → <Contact>
├── (page === 'admin')   → <AdminPanel>
│   └── Tabs (11): Inbox / Stats / Users / AssignTeachers / Blog /
│                  Activities / German / Legal / Logs / Content / Emails
└── Footer
```

### Standalone Next.js Routes (separate pages)
- `/visa-types` — Standalone with own Header/Footer (fetches visa content)
- `/blog/[slug]`
- `/activities/[slug]`
- `/privacy`, `/terms`, `/impressum`
- `/german-visitors`

## 3. State Management Strategy

```
┌─ App-level state (page.js)
│   ├─ lang ('ar' | 'de')
│   ├─ user (JWT-cached)
│   ├─ page (router-lite 'home', 'courses', ...)
│   └─ authMode ('login' | null)
│
├─ Page-level state (per component)
│   └─ data fetched via fetch() in useEffect
│
└─ No global store — each page fetches its data independently
```

**Rationale (🔍 Inferred):** Author opted for simplicity over Redux/Zustand. Works for MVP, but causes duplicate fetches & no cache.

## 4. Styling System

### Brand Tokens
```
Red (primary)   : #CC0000
Gold (accent)   : #FFCE00
Black (dark)    : #1A1A1A
Bg (off-white)  : #FAFAF8
Blue (info)     : #2C5F9E
```

### Utility Classes (custom in globals.css)
- `.btn-primary` — Red gradient button
- `.btn-gold` — Gold button
- `.card-hover` — Hover lift shadow
- `.flag-gradient-h` — Black/Red/Gold horizontal stripe
- `.hero-overlay` — Dark gradient over hero images
- `.fade-in` — Initial fade animation

## 5. Component Library Conventions

- **shadcn imports:** `import { Button } from '@/components/ui/button'`
- **Custom components:** `/app/components/ddh/**`
- **Admin panels:** `/app/components/ddh/admin/<feature>/<Component>.jsx`
- **Layout:** `/app/components/ddh/layout/{Header, Footer, WhatsAppFloat}.jsx`
- **Auth:** `/app/components/ddh/auth/AuthDialog.jsx`

## 6. RTL/LTR Handling

- `<html dir>` set on lang change
- `ms-*`/`me-*` (margin-start/end) preferred over `ml-*`/`mr-*`
- Icons rotate via `rotate-180` when arrow direction matters
- Force-LTR for emails, phone numbers, dates: `dir="ltr"`

## 7. Performance Tips Implemented
- `images: { unoptimized: true }` in next.config.js (deployment compatibility)
- Production build serving (vs `next dev`) for speed
- One-time seed cache (was 3s/req → 200ms/req)
- Empty sections (blog/events) hidden when no data

## 8. ⚠️ Known Frontend Issues
- `page.js` is **1900+ LoC** — should be split into route files
- No client-side caching (each navigation refetches all data)
- Some translations hardcoded inline instead of `t.*` keys
- `useEffect` chains fetch sequentially (could use `Promise.all`)
