const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.das-deutsche-haus.com').replace(/\/+$/, '')

export const metadata = {
  title: 'الفعاليات والأنشطة',
  description: 'فعاليات وأنشطة Das Deutsche Haus — ورشات، محاضرات، ولقاءات ثقافية تربط سوريا وألمانيا.',
  alternates: { canonical: `${SITE_URL}/activities` },
  openGraph: {
    title: 'الفعاليات والأنشطة | Das Deutsche Haus',
    description: 'ورشات، محاضرات، ولقاءات ثقافية تربط سوريا وألمانيا.',
    url: `${SITE_URL}/activities`,
  },
}

export default function ActivitiesLayout({ children }) {
  return children
}
