# 🚀 Deployment Guide

## Production Environment
The application is deployed via **Emergent Kubernetes** with NGINX Ingress.

## Pre-deploy Checklist
- [ ] All `.env` vars set (see `11-env-variables.md`)
- [ ] MongoDB Atlas IP allowlist includes K8s NAT
- [ ] Resend domain verified (or using `onboarding@resend.dev`)
- [ ] `next.config.js` has `output: 'standalone'` ✅
- [ ] `next build` succeeds locally

## Build & Run (supervisor managed)
```bash
# package.json scripts:
"dev": "next build && NODE_ENV=production next start --hostname 0.0.0.0 --port 3000"
```
Supervisor invokes `yarn dev` → builds then starts.

## Health Checks
- HTTP: `GET /api/health`
- DB: First request triggers seed; check logs for connection errors.

## Rollback
Via Emergent UI "Time Travel" — select last good snapshot.
No manual rollback path inside container.

## Domains & DNS
Production URL: `https://telc-academy.preview.emergentagent.com`
Production custom domain: TBD by client (Resend will need DNS records for SPF/DKIM/DMARC).
