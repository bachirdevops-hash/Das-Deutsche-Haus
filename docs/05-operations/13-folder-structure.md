# 📁 Folder Structure

```
/app/
├── app/                              # Next.js App Router
│   ├── api/[[...path]]/route.js      # ⭐ Monolithic API (1750 LoC)
│   ├── page.js                       # ⭐ Monolithic SPA (1900 LoC)
│   ├── layout.js                     # Root layout, fonts, meta
│   ├── globals.css                   # Tailwind base + custom utils
│   ├── activities/[slug]/page.js
│   ├── blog/[slug]/page.js
│   ├── visa-types/page.js
│   ├── privacy/page.js
│   ├── terms/page.js
│   ├── impressum/page.js
│   └── german-visitors/page.js
├── components/
│   ├── ui/                           # shadcn primitives (Button, Card, ...)
│   └── ddh/
│       ├── layout/                   # Header, Footer, WhatsAppFloat
│       ├── auth/AuthDialog.jsx
│       ├── admin/
│       │   ├── inbox/InboxAdminPanel.jsx
│       │   ├── email/EmailLogsAdminPanel.jsx
│       │   ├── site/SiteContentAdminPanel.jsx
│       │   ├── activities/ActivitiesAdminPanel.jsx
│       │   ├── legal/LegalPagesAdminPanel.jsx
│       │   └── german/GermanAdminPanel.jsx
│       ├── HeroSlideshow.jsx
│       ├── shared.jsx                # FileUpload, ConfirmDialog
│       └── ErrorBoundary.jsx
├── lib/
│   ├── email.js                      # ⭐ Resend wrapper
│   ├── site_content_seed.js          # 12 content keys defaults
│   ├── blog_seed.js
│   ├── activities_seed.js
│   ├── legal_seed.js
│   ├── content.js                    # client helpers (fetchContent)
│   ├── translations.js               # AR + DE strings
│   └── api.js                        # safe fetch wrappers
├── docs/                             # 📖 THIS PACKAGE
├── memory/test_credentials.md        # Test/admin creds
├── public/                           # Static assets
├── .env                              # Secrets (gitignored)
├── next.config.js
├── tailwind.config.js
├── package.json
└── test_result.md                    # Test agent log
```
