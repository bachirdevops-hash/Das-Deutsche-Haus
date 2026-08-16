const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.das-deutsche-haus.com').replace(/\/+$/, '')

export const metadata = {
  title: 'الشروط والأحكام',
  description: 'شروط وأحكام استخدام خدمات Das Deutsche Haus.',
  alternates: { canonical: `${SITE_URL}/terms` },
}

export default function TermsLayout({ children }) {
  return children
}
