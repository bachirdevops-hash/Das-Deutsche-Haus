const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.das-deutsche-haus.com').replace(/\/+$/, '')

export const metadata = {
  title: 'Impressum — البيانات القانونية',
  description: 'البيانات القانونية لـ Das Deutsche Haus.',
  alternates: { canonical: `${SITE_URL}/impressum` },
  robots: { index: true, follow: true },
}

export default function ImpressumLayout({ children }) {
  return children
}
