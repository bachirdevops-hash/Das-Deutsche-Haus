# 🔒 Security Audit

## Findings

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| S1 | RESEND_API_KEY exposed in chat history | 🔴 Critical | ⚠️ Must rotate |
| S2 | No CSRF tokens (relies on SameSite cookie) | 🟡 Medium | Open |
| S3 | No rate limiting on public lead endpoints | 🟡 Medium | Open |
| S4 | No captcha on public forms | 🟡 Medium | Open |
| S5 | JWT secret in plaintext `.env` | 🟡 Medium | Open |
| S6 | No request validation library | 🟡 Medium | Open |
| S7 | `CORS_ORIGINS=*` permissive | 🟢 Low | Open |
| S8 | No HTTPS-only enforcement (relies on host) | 🟢 Low | Mitigated by host |
| S9 | Password complexity not enforced | 🟢 Low | Open |
| S10 | No 2FA / MFA for admins | 🟢 Low | Future |

## Good Practices Confirmed
- ✅ Passwords hashed with **bcrypt** (10 rounds)
- ✅ JWT in **HttpOnly cookie** (XSS-resistant)
- ✅ No raw SQL (NoSQL DB anyway)
- ✅ No `eval()` / dynamic code
- ✅ ObjectIds never leaked (UUIDs only)
- ✅ RBAC enforced server-side
- ✅ Public signup disabled (anti-spam DB)
- ✅ Activity log audit trail

## Recommendations
1. 🔴 Rotate Resend API key NOW
2. 🔴 Add reCAPTCHA v3 to all 4 public forms
3. 🔴 Add rate limiter (e.g. `next-rate-limit` or upstash)
4. 🟡 Replace inline validation with **Zod** schemas
5. 🟡 Move secrets to a vault (Doppler, Infisical) in production
6. 🟡 Add CSP headers in middleware
7. 🟢 Implement 2FA for super_admin role
