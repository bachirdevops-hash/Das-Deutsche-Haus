import './globals.css'
import { Toaster } from 'sonner'

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.das-deutsche-haus.com').replace(/\/+$/, '')
const OG_IMAGE = 'https://customer-assets.emergentagent.com/job_telc-academy/artifacts/r4py5i7f_22266621-baa3-4a90-98dd-0438a1e69c1d%20%281%29.png'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Das Deutsche Haus | المعهد الألماني — جسر بين سوريا وألمانيا',
    template: '%s | Das Deutsche Haus',
  },
  description:
    'كورسات اللغة الألمانية من A1 إلى C2، التدريب المهني (Ausbildung)، واستشارات السفر إلى ألمانيا — بوابتك الرسمية إلى ألمانيا.',
  keywords: [
    'Das Deutsche Haus', 'المعهد الألماني', 'كورسات ألمانية', 'Ausbildung',
    'التدريب المهني في ألمانيا', 'German courses Syria', 'Deutsch lernen', 'Visa Deutschland',
    'الهجرة إلى ألمانيا', 'A1 A2 B1 B2 C1 C2 Deutsch',
  ],
  authors: [{ name: 'Das Deutsche Haus' }],
  creator: 'Das Deutsche Haus',
  publisher: 'Das Deutsche Haus',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: OG_IMAGE,
    shortcut: OG_IMAGE,
    apple: OG_IMAGE,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SY',
    alternateLocale: ['de_DE'],
    url: SITE_URL,
    siteName: 'Das Deutsche Haus',
    title: 'Das Deutsche Haus | جسر بين سوريا وألمانيا',
    description:
      'كورسات اللغة الألمانية، التدريب المهني في ألمانيا واستشارات السفر — بوابتك إلى ألمانيا.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Das Deutsche Haus' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Das Deutsche Haus | جسر بين سوريا وألمانيا',
    description: 'كورسات اللغة الألمانية، Ausbildung، واستشارات السفر إلى ألمانيا.',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#CC0000',
}

// Structured Data (Schema.org) — helps Google understand the organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Das Deutsche Haus',
  alternateName: 'المعهد الألماني',
  url: SITE_URL,
  logo: OG_IMAGE,
  description:
    'مؤسسة تعليمية بلغتين تربط سوريا وألمانيا — كورسات لغة، Ausbildung، وسفر.',
  sameAs: [],
  areaServed: ['SY', 'DE'],
  knowsLanguage: ['ar', 'de'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1659342126732-98ab9efd9ce0?auto=format&fit=crop&w=1920&q=70" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#FAFAF8] text-[#1A1A1A]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:bg-[#1A1A1A] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">تخطّ إلى المحتوى الرئيسي</a>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
