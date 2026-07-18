# 🔄 Refactoring Opportunities

## Quick Wins (1-2 days each)
1. **Split `route.js` by domain**: `/api/auth/route.js`, `/api/admin/users/route.js`, etc.
2. **Extract auth helpers** → `/app/lib/auth.js`
3. **Define status enums** → `/app/lib/constants.js`
4. **Remove SendGrid dependency** (post-Resend migration)
5. **Create `apiClient` helper** (centralized fetch with retries)
6. **Move `Home`, `About`, `Courses` from page.js into route files** (`/app/app/(public)/courses/page.js`)

## Medium Refactors (3-7 days)
7. **Adopt TypeScript** — start with `.d.ts` for API contracts
8. **Add Zod validation** — schema-driven request validation
9. **Replace inline translations** with `i18next` or **next-intl**
10. **Split admin panels** — lazy-load via dynamic import
11. **Add SWR or React Query** for client caching

## Long-term (1-2 weeks)
12. **Server Components for content pages** (currently all `'use client'`)
13. **Domain-driven module structure**: `/app/modules/{auth,courses,emails,leads}/`
14. **Event-driven architecture** for cross-cutting (lead created → notify + email)
