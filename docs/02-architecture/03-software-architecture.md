# 🏗️ Software Architecture

## 1. Macro Architecture

```
  ┌──────────────────────────────────────────────────────────────┐
  │                       INTERNET / USERS                       │
  └──────────────────────────────┬───────────────────────────────┘
                                 │ HTTPS
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │                  Kubernetes Ingress (NGINX)                  │
  │  - Routes /api/* → port 3000                                 │
  │  - Routes everything else → port 3000 (Next.js)              │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │               Next.js 14 (App Router) — port 3000            │
  │  ┌────────────────────────────┬─────────────────────────────┐ │
  │  │   Server Components (SSR)  │   Client Components ('use')  │ │
  │  │   • route.js (API)         │   • page.js, layout.js      │ │
  │  │   • Dynamic catch-all      │   • Forms / Admin / UI       │ │
  │  └────────────────────────────┴─────────────────────────────┘ │
  └────┬─────────────────────┬─────────────────────────┬────────┘
       │                     │                         │
       ▼                     ▼                         ▼
  ┌──────────┐         ┌──────────────┐         ┌───────────────┐
  │ MongoDB  │         │  Cloudinary  │         │    Resend     │
  │  Atlas   │         │  (uploads)   │         │  (email API)  │
  │ (cloud)  │         │              │         │               │
  └──────────┘         └──────────────┘         └───────────────┘
```

## 2. Layered View

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION  /app/app/page.js, /app/components/**     │
│  • React 18 client components ('use client')            │
│  • Tailwind CSS + shadcn/ui                             │
│  • i18n via /app/lib/translations.js                    │
├─────────────────────────────────────────────────────────┤
│  APPLICATION  /app/app/api/[[...path]]/route.js         │
│  • Single monolithic catch-all route                    │
│  • Path-based routing internally (segs[])               │
│  • JWT cookie auth                                      │
├─────────────────────────────────────────────────────────┤
│  DOMAIN/LOGIC  inline within route.js + /app/lib/**     │
│  • Business logic (seeds, conversions, notifications)   │
│  • Email templates (lib/email.js)                       │
│  • Content seed defaults                                │
├─────────────────────────────────────────────────────────┤
│  DATA  MongoDB driver (Node.js native)                  │
│  • 28+ collections                                      │
│  • UUIDs (no ObjectIDs)                                 │
└─────────────────────────────────────────────────────────┘
```

## 3. Request Flow (Sequence Diagram)

### 3.1 Public Lead Submission
```
Visitor          Next.js (SSR)     API route.js     MongoDB        Resend
   │                  │                 │              │             │
   │  GET /           │                 │              │             │
   ├─────────────────►│                 │              │             │
   │  HTML + JS       │                 │              │             │
   │◄─────────────────┤                 │              │             │
   │                  │                 │              │             │
   │   (hydration)    │                 │              │             │
   │  fetch /api/courses                │              │             │
   ├──────────────────────────────────► │              │             │
   │                                    │ find(...)    │             │
   │                                    ├─────────────►│             │
   │                                    │              │             │
   │   Open modal & submit form         │              │             │
   │  POST /api/course-registrations    │              │             │
   ├──────────────────────────────────► │              │             │
   │                                    │ insert(...)  │             │
   │                                    ├─────────────►│             │
   │                                    │ notify       │             │
   │                                    ├──────────────┼────────────►│
   │                                    │              │             │
   │   200 OK { registration }          │              │             │
   │◄────────────────────────────────── │              │             │
   │                                    │              │             │
   │   (admin gets email moments later) │              │             │
```

### 3.2 Admin Convert-to-User
```
Admin       UI         API                       MongoDB        Resend
  │          │           │                          │             │
  │  click "Convert"    │                          │             │
  ├─────────►│           │                          │             │
  │          │ POST /api/admin/<resource>/<id>/convert-to-user    │
  │          ├──────────►│                          │             │
  │          │           │ check email exists       │             │
  │          │           ├─────────────────────────►│             │
  │          │           │ insert new user (random password)      │
  │          │           ├─────────────────────────►│             │
  │          │           │ link lead → user         │             │
  │          │           ├─────────────────────────►│             │
  │          │           │ welcome email            │             │
  │          │           ├──────────────────────────┼────────────►│
  │          │           │ in-app notification      │             │
  │          │           ├─────────────────────────►│             │
  │          │ { user, createdPassword }            │             │
  │          │◄──────────┤                          │             │
  │  show password modal │                          │             │
  │◄─────────┤           │                          │             │
```

## 4. Trust Boundaries

```
┌──────────────── PUBLIC (untrusted) ─────────────────┐
│ • GET /api/courses, /api/blog, /api/activities      │
│ • POST /api/course-registrations (anon lead)        │
│ • POST /api/telc-bookings (anon)                    │
│ • POST /api/vocational/applications (anon)          │
│ • POST /api/travel/consultations (anon)             │
│ • POST /api/auth/login                              │
└────────────────────┬────────────────────────────────┘
                     │ JWT cookie
                     ▼
┌──────────────── AUTHENTICATED (any role) ───────────┐
│ • GET /api/auth/me                                  │
│ • GET/PATCH /api/notifications                      │
│ • Student dashboard endpoints                       │
└────────────────────┬────────────────────────────────┘
                     │ role=teacher
                     ▼
┌──────────────── TEACHER ─────────────────────────────┐
│ • Teacher-specific dashboards (read-only on courses) │
└────────────────────┬────────────────────────────────┘
                     │ role IN (super_admin, manager)
                     ▼
┌──────────────── ADMIN ───────────────────────────────┐
│ • All /api/admin/* endpoints                         │
│ • Inbox, content CMS, user CRUD, email logs          │
└─────────────────────────────────────────────────────┘
```

## 5. Key Architectural Decisions (ADRs)

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Monolithic API** (single catch-all route) | Fastest dev velocity for MVP | Hard to maintain at scale |
| **MongoDB (NoSQL)** | Flexible schema for evolving content | No JOIN; manual referential integrity |
| **UUIDs over ObjectIDs** | JSON-serializable, no leaks | Slightly larger index size |
| **Public catch-all `[[...path]]`** | One file = entire API | God file > 1,700 LoC |
| **Production build for dev** | Performance (was crashing in dev mode) | Hot-reload lost |
| **Best-effort emails** | Never block API responses | Silent failures possible (mitigated by email_logs) |
| **JWT in HttpOnly cookie** | Secure, simple | CSRF requires care (not yet implemented) |
