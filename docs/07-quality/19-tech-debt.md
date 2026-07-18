# 🔨 Technical Debt Report

## Hot Spots (by file size + churn)
| File | LoC | Issue |
|------|-----|-------|
| `app/api/[[...path]]/route.js` | ~1750 | Monolithic god file. Hard to navigate. |
| `app/page.js` | ~1900 | Massive client SPA with 11+ components inline. |
| `components/ddh/admin/site/SiteContentAdminPanel.jsx` | ~700 | Mixed concerns: tabs + forms + CRUD logic |
| `lib/translations.js` | medium | Hardcoded; should be JSON files |

## Smells Detected
- 💩 Duplicate URL definitions across components (e.g. WhatsApp number in 3 places)
- 💩 Mix of `t.*` translations + inline Arabic strings in same component
- 💩 Magic strings for status (`'new'`, `'converted'`, `'pending_payment'`) — should be enum constants
- 💩 Auth helpers (`getCurrentUser`, `unauth`, `forbidden`) defined in `route.js` instead of `lib/auth.js`
- 💩 No reusable `apiClient` — each component writes its own fetch calls
- 💩 SendGrid library still imported but unused (post-Resend migration)
- 💩 Inline SVG in some buttons instead of lucide icons

## Quantified Risk
| Debt | Cost-per-feature | Trend |
|------|------------------|-------|
| Monolithic API | +30% time per feature | 🔴 |
| No type safety | bugs caught in QA, not compile | 🟡 |
| No tests | risk of regressions | 🔴 |
| Hardcoded strings | i18n updates touch 5+ files | 🟡 |
