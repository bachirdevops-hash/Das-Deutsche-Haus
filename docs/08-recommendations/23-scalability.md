# 📈 Scalability Recommendations

## Current Capacity (estimated)
- 1 Node.js pod × 1024MB → ~50 RPS
- MongoDB Atlas (M0 free tier?) → 100 concurrent connections

## Bottlenecks at Scale
1. **Single-pod seed cache** (`global.__ddhSeeded`) won’t coordinate across replicas
2. **No connection pooling tuning** — fresh DB connection per import
3. **Cloudinary unoptimized images** → high bandwidth
4. **Public lead endpoints** are unauthenticated + unthrottled

## Roadmap
| Step | When | Impact |
|------|------|--------|
| Add MongoDB indexes | Now | -80% query time |
| Implement rate limiting (token bucket per IP) | Pre-launch | Anti-abuse |
| Move seed to dedicated init job | Before HPA | Multi-pod safe |
| Add Redis cache for `/api/content/*` | 1k+ visitors/day | -90% DB reads |
| Cloudinary auto transformations | Pre-launch | -70% bandwidth |
| Edge CDN (Cloudflare/Vercel) | Launch | global perf |
| MongoDB upgrade to M10+ | 10k+ users | reliability |
| Multi-region deployment | International growth | latency |
