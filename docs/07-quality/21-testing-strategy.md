# 🧪 Testing Strategy

## Current State
- 🔴 **No unit tests** in the codebase
- 🔴 **No integration tests** 
- ✅ **Backend testing agent** has validated 77+ API endpoints end-to-end (`test_result.md`)
- ✅ **Frontend testing agent** used manually for screenshot review

## Recommended Stack
| Type | Tool |
|------|------|
| Unit (logic) | **Vitest** |
| Component | **React Testing Library** |
| Integration (API) | **Supertest** or **Playwright API mode** |
| E2E | **Playwright** |
| Visual regression | **Playwright snapshots** |

## QA Checklist (Pre-release)
### Public Flows
- [ ] Homepage loads < 3s
- [ ] All 4 lead forms submit successfully (anon)
- [ ] Confirmation email arrives at submitter
- [ ] Admin email arrives at `ADMIN_EMAIL`
- [ ] /visa-types booking form works
- [ ] Blog post page renders correctly
- [ ] Activity detail page renders correctly
- [ ] /privacy, /terms, /impressum render
- [ ] AR/DE switcher works
- [ ] Mobile menu works on iPhone & Android

### Admin Flows
- [ ] Login with super_admin works
- [ ] Inbox shows leads
- [ ] Convert-to-user creates account + sends welcome email
- [ ] Content CMS edits reflect on public pages
- [ ] User CRUD works
- [ ] Blog post create/publish/unpublish works
- [ ] Activity create works
- [ ] Email logs panel shows entries

### Edge Cases
- [ ] Submit form twice with same email → idempotent
- [ ] Try public signup endpoint → returns 403
- [ ] Try admin endpoint as student → returns 403
- [ ] Upload large image → Cloudinary handles
- [ ] Run with `RESEND_API_KEY` empty → emails skipped, app works
