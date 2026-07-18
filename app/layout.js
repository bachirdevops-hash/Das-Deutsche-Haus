import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Das Deutsche Haus | المعهد الألماني — جسر بين سوريا وألمانيا',
  description: 'كورسات اللغة الألمانية، امتحانات telc المعتمدة، التدريب المهني، واستشارات السفر إلى ألمانيا.',
  // Prevent mobile browsers (esp. iOS Safari) from auto-detecting phone numbers,
  // emails and addresses into tel:/mailto: links — fixes hydration mismatch.
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: 'https://customer-assets.emergentagent.com/job_telc-academy/artifacts/r4py5i7f_22266621-baa3-4a90-98dd-0438a1e69c1d%20%281%29.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-[#FAFAF8] text-[#1A1A1A]">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
