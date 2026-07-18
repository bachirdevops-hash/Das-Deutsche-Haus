# 👩‍💻 Developer Handover Guide

## 1. Day-1 Setup
```bash
cd /app
yarn install
yarn dev          # builds + starts production-style server (fastest)
# OR
yarn dev:hot      # next dev with hot reload (slower, ~3s/req)
```
Visit http://localhost:3000

## 2. Default Admin Credentials (seeded)
See `/app/memory/test_credentials.md` (must not be edited by AI agent).
Current: `bachir.devops@gmail.com` / `@26042026Admin`

## 3. Critical Files (read first)
1. `/app/app/api/[[...path]]/route.js` — entire backend
2. `/app/app/page.js` — entire frontend SPA
3. `/app/lib/email.js` — Resend integration
4. `/app/lib/site_content_seed.js` — default content
5. `/app/.env` — secrets (DO NOT COMMIT)

## 4. Service Commands
```bash
sudo supervisorctl restart nextjs   # full rebuild + restart
sudo supervisorctl status           # health check
tail -n 100 /var/log/supervisor/nextjs.out.log
```

## 5. Definition of Done (PR checklist)
- [ ] Lint passes (`yarn lint`)
- [ ] No `console.log` left in production code
- [ ] No hardcoded URLs (use `process.env.NEXT_PUBLIC_BASE_URL`)
- [ ] No `MongoDB ObjectId` exposed in API responses (use UUIDs)
- [ ] `test_result.md` updated if backend changed
- [ ] Manual smoke test of changed endpoint

## 6. ⚠️ Pitfalls to avoid
- Never `npm install` (project uses `yarn`)
- Never edit `/etc/supervisor/conf.d/*` (read-only)
- Never modify `.env` URLs or `MONGO_URL` (live cloud DB!)
- Hot-reload disabled by default — use `yarn dev:hot` for active dev
- All API responses must use `ok({...})` helper (returns JSON)
