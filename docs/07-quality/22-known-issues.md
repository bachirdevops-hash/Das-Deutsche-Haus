# ⚠️ Known Issues & Limitations

## Limitations
1. **No payment processing** — students contact admin manually
2. **No production email domain** — using `onboarding@resend.dev` (limits delivery)
3. **Hot reload disabled** in dev (cost of fast prod-style serving)
4. **No multi-language URL routing** — same path serves both AR and DE
5. **No offline support** / no PWA
6. **No notifications push** (in-app only)

## Known Bugs / Quirks
- Slideshow images occasionally take longer to load on first visit (Cloudinary cold cache)
- Featured Event description previously showed raw HTML — ✅ fixed (regex strip)
- Some admin tabs require login → then "لوحة الإدارة" click. Could deep-link.
- Activity registration counter sometimes drifts — needs audit
- Forgot-password flow tested but not battle-hardened

## Workarounds Active
- Seed is cached per-process (loses idempotency on multi-pod horizontal scale)
- Convert-to-user with existing email returns `isExisting:true` instead of error

## Migration Notes
When upgrading from current state:
- Index `users.email` if not done
- Ensure `blog_posts.slug` is unique-indexed
- Add unique index on `activities.slug`
