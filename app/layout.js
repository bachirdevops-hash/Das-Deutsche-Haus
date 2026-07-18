import './globals.css'
import { Toaster } from 'sonner'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dasdeutschehaus.com'
const OG_IMAGE = 'https://customer-assets.emergentagent.com/job_telc-academy/artifacts/r4py5i7f_22266621-baa3-4a90-98dd-0438a1e69c1d%20%281%29.png'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Das Deutsche Haus | المعهد الألماني — جسر بين سوريا وألمانيا',
    template: '%s | Das Deutsche Haus',
  },
  description:
    'كورسات اللغة الألمانية من A1 إلى C2، امتحانات telc المعتمدة، التدريب المهني (Ausbildung)، واستشارات السفر إلى ألمانيا — بوابتك الرسمية إلى ألمانيا.',
  keywords: [
    'Das Deutsche Haus', 'المعهد الألماني', 'كورسات ألمانية', 'telc', 'Ausbildung',
    'التدريب المهني في ألمانيا', 'German courses Syria', 'Deutsch lernen', 'Visa Deutschland',
    'الهجرة إلى ألمانيا', 'شهادة telc', 'A1 A2 B1 B2 C1 C2 Deutsch',
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
    languages: {
      ar: '/',
      de: '/?lang=de',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SY',
    alternateLocale: ['de_DE'],
    url: SITE_URL,
    siteName: 'Das Deutsche Haus',
    title: 'Das Deutsche Haus | جسر بين سوريا وألمانيا',
    description:
      'كورسات اللغة الألمانية، امتحانات telc المعتمدة، التدريب المهني في ألمانيا واستشارات السفر — بوابتك إلى ألمانيا.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Das Deutsche Haus' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Das Deutsche Haus | جسر بين سوريا وألمانيا',
    description: 'كورسات اللغة الألمانية، telc، Ausbildung، واستشارات السفر إلى ألمانيا.',
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
    'مؤسسة تعليمية بلغتين تربط سوريا وألمانيا — كورسات لغة، telc، Ausbildung، وسفر.',
  sameAs: [],
  areaServed: ['SY', 'DE'],
  knowsLanguage: ['ar', 'de'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#FAFAF8] text-[#1A1A1A]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
