# 💰 Cost Optimization

## Current Cost Sources (estimated)
| Service | Tier | Monthly Cost (est.) |
|---------|------|----------------------|
| Emergent Hosting | preview/dev | included in plan |
| MongoDB Atlas | M0 (free) | $0 |
| Cloudinary | Free tier (25 GB bandwidth) | $0 — may upgrade |
| Resend | Free tier (3k/month) | $0 |
| Domain | unbought | $10-15/year |

## Optimization Tactics
1. **Cloudinary**: enable auto-format + auto-quality → -70% bandwidth
2. **Images on CDN**: serve `coverImage`s through Cloudflare (free)
3. **MongoDB**: stay on M0 until 10k users; precise indexes vs. larger tier
4. **Resend**: stick with free tier until > 100 leads/day
5. **Avoid Vercel Pro** — self-hosted Next.js is fine for this scale
6. **Compress static images in `public/`** with `sharp`
7. **Strip dev deps** before deploy
8. **Lazy-load admin panels** — they’re heavy and not needed for visitors

## When to Upgrade
| Trigger | Service | New Tier |
|---------|---------|----------|
| > 3000 emails/month | Resend | $20/month (50k) |
| > 100 GB Cloudinary bandwidth | Cloudinary | Plus ($99/month) |
| > 5k users / heavy DB ops | MongoDB | M10 ($60/month) |
| Custom domain + email | Domain reg | $10-15/year |
