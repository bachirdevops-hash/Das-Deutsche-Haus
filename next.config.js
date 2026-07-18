/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Hide "X-Powered-By: Next.js"
  compress: true,
  output: 'standalone', // Works for both Docker & Vercel (Vercel ignores)

  images: {
    unoptimized: true, // Cloudinary handles optimization; needed for static export compat
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },

  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules'],
      }
    }
    return config
  },

  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },

  async headers() {
    const securityHeaders = [
      // HTTPS enforcement (only meaningful behind HTTPS)
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      // Prevent MIME sniffing
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Prevent clickjacking — allow same-origin embedding only
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Referrer policy
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // XSS protection (legacy but still useful)
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      // Restrict permissions
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      // Content Security Policy — permissive for a bilingual public site with external images/fonts
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' data: https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          "media-src 'self' https:",
          "connect-src 'self' https: wss:",
          "frame-src 'self' https://www.youtube.com https://www.google.com https://maps.google.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          isProd ? 'upgrade-insecure-requests' : '',
        ].filter(Boolean).join('; '),
      },
    ]

    const corsHeaders = [
      { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGINS || '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      { key: 'Access-Control-Allow-Credentials', value: 'true' },
    ]

    return [
      // Security headers on ALL routes
      { source: '/(.*)', headers: securityHeaders },
      // CORS only on API routes
      { source: '/api/(.*)', headers: corsHeaders },
      // Long-term caching for static assets
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

module.exports = nextConfig
