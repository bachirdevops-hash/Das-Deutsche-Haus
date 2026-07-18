# 🔐 Environment Variables

File: `/app/.env` — **never commit**. All variables read at runtime.

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGO_URL` | ✅ | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `DB_NAME` | ✅ | Database name | `das_deutsche_haus` |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Public host (for emails, links) | `https://telc-academy.preview.emergentagent.com` |
| `CORS_ORIGINS` | ✅ | `*` for permissive | `*` |
| `JWT_SECRET` | ✅ | Token signing | `ddh_super_secret_2026_...` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Upload target | `dmkjybehz` |
| `CLOUDINARY_API_KEY` | ✅ | — | `4144...` |
| `CLOUDINARY_API_SECRET` | ✅ | — | `WpjU...` |
| `RESEND_API_KEY` | optional | Empty → emails are skipped (logged) | `re_xxx` |
| `RESEND_FROM_EMAIL` | optional | Sender (default `onboarding@resend.dev`) | `Das Deutsche Haus <noreply@dom.com>` |
| `ADMIN_EMAIL` | optional | Lead notification recipient | `bachir.devops@gmail.com` |
| `SENDGRID_*` | deprecated | Kept for backward compat only |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | optional | Floating WhatsApp button | `963111234567` |
| `NEXT_PUBLIC_PHONE` | optional | Footer | — |
| `NEXT_PUBLIC_EMAIL` | optional | Footer | — |

## Rotation Procedure
1. Generate new secret in provider dashboard
2. Update `/app/.env`
3. `sudo supervisorctl restart nextjs`
4. Verify in logs

## ⚠️ Currently exposed (must rotate)
- `RESEND_API_KEY=re_Gz5Kquka_...` appeared in chat history — should be revoked + regenerated.
