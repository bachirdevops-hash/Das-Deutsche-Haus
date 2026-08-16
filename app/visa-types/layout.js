const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.das-deutsche-haus.com').replace(/\/+$/, '')

export const metadata = {
  title: 'أنواع التأشيرات والاستشارات',
  description: 'دليل تأشيرات ألمانيا: الدراسة، العمل، Ausbildung، ولمّ الشمل — مع إمكانية حجز استشارة شخصية.',
  alternates: { canonical: `${SITE_URL}/visa-types` },
  openGraph: {
    title: 'أنواع التأشيرات والاستشارات | Das Deutsche Haus',
    description: 'دليل تأشيرات ألمانيا مع إمكانية حجز استشارة شخصية.',
    url: `${SITE_URL}/visa-types`,
  },
}

export default function VisaTypesLayout({ children }) {
  return children
}
