# 🎯 Master Action Plan

> All findings consolidated, ranked by **Priority (High/Medium/Low) × Effort × Impact**

## Legend
- **Priority**: 🔴 High / 🟡 Medium / 🟢 Low
- **Effort**: XS (hours) → S (1-2 days) → M (3-5 days) → L (1-2 weeks) → XL (1+ month)
- **Impact**: ⭐ (low) → ⭐⭐ (med) → ⭐⭐⭐ (high) → ⭐⭐⭐⭐ (critical)

## 🔴 High Priority (Pre-launch blockers)

| # | Item | Effort | Impact | Notes |
|---|------|--------|--------|-------|
| 1 | Rotate `RESEND_API_KEY` (was exposed) | XS | ⭐⭐⭐⭐ | Critical security |
| 2 | Generate `/sitemap.xml` + `/robots.txt` | XS | ⭐⭐⭐ | SEO blocker |
| 3 | Add Open Graph + JSON-LD meta | S | ⭐⭐⭐ | SEO + social shares |
| 4 | Buy domain + verify in Resend | S | ⭐⭐⭐⭐ | Real email delivery |
| 5 | reCAPTCHA v3 on 4 public forms | S | ⭐⭐⭐ | Anti-spam |
| 6 | Rate-limit public lead endpoints | S | ⭐⭐⭐ | Anti-abuse |
| 7 | Add MongoDB indexes | XS | ⭐⭐⭐ | Performance |
| 8 | First-login forced password change UI | S | ⭐⭐ | UX/security |
| 9 | Cloudinary auto-format + sizing | S | ⭐⭐⭐ | Performance + cost |
| 10 | Google Analytics 4 setup | XS | ⭐⭐ | Measurement |

## 🟡 Medium Priority (Months 1-3)

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 11 | Refactor monolithic `route.js` → modules | L | ⭐⭐⭐ |
| 12 | Refactor monolithic `page.js` → routes | L | ⭐⭐⭐ |
| 13 | TypeScript migration | L | ⭐⭐⭐ |
| 14 | Zod request validation | M | ⭐⭐⭐ |
| 15 | Stripe payments integration | L | ⭐⭐⭐⭐ |
| 16 | Unit + E2E tests (Vitest + Playwright) | L | ⭐⭐⭐ |
| 17 | Sentry + analytics observability | S | ⭐⭐⭐ |
| 18 | SWR/React Query client caching | M | ⭐⭐ |
| 19 | AI lead chatbot (RAG) | M | ⭐⭐⭐ |
| 20 | Auto-translate blog AR↔DE | S | ⭐⭐ |
| 21 | A11y fixes (contrast, aria-labels, focus) | S | ⭐⭐ |
| 22 | Twilio SMS OTP | M | ⭐⭐ |
| 23 | Google OAuth | M | ⭐⭐ |
| 24 | i18next migration | M | ⭐⭐ |
| 25 | Pre-commit hooks (husky + lint-staged) | XS | ⭐ |

## 🟢 Low Priority (Future)

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 26 | Student LMS (lessons/videos) | XL | ⭐⭐⭐⭐ |
| 27 | Mobile app (React Native) | XL | ⭐⭐⭐ |
| 28 | telc essay AI grader | M | ⭐⭐⭐ |
| 29 | Multi-tenant SaaS mode | XL | ⭐⭐ |
| 30 | 2FA for admins | S | ⭐⭐ |
| 31 | Pronunciation feedback (Whisper) | L | ⭐⭐ |
| 32 | Affiliate/referral system | M | ⭐⭐ |
| 33 | Live class scheduler + Zoom | L | ⭐⭐ |
| 34 | Certificate verification (QR + blockchain) | M | ⭐ |
| 35 | Storybook component lib | M | ⭐ |

## Suggested 90-day Sprint Plan

### Sprint 1 (Weeks 1-2) — Launch Readiness
- Items 1–7 + 9–10 (SEO, security, perf basics)
- Goal: **Production launch-ready**

### Sprint 2 (Weeks 3-4) — Observability + Payments
- Items 8, 15, 17, 18
- Goal: **Track real users + accept money**

### Sprint 3 (Weeks 5-8) — Code Health
- Items 11–14, 16, 21, 25
- Goal: **Reduce tech debt, lock down quality**

### Sprint 4 (Weeks 9-12) — Growth Features
- Items 19–20, 22–24
- Goal: **Smart features that differentiate**

---

## How to Use This Plan
1. Open this file in your project tracker (Linear/Jira/Notion)
2. Convert each row to a ticket
3. Assign effort estimates in story points
4. Schedule per sprint
5. Re-audit every quarter

**Total work tracked: 35 items** spanning weeks of effort, but the **top 10** are sufficient for a production-grade public launch.
