const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.das-deutsche-haus.com').replace(/\/+$/, '')

export const metadata = {
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية وحماية البيانات في Das Deutsche Haus.',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

export default function PrivacyLayout({ children }) {
  return children
}
