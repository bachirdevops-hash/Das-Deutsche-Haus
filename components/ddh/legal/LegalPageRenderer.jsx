'use client'
import { useEffect, useState } from 'react'
import { ArrowRight, Globe } from 'lucide-react'
import { api } from '@/lib/api'

/**
 * Lightweight legal page renderer — no heavy components.
 * Loads content via API, supports AR/DE toggle, sets meta tags.
 */
export default function LegalPageRenderer({ slug, defaultLang = 'ar' }) {
  const [page, setPage] = useState(null)
  const [lang, setLang] = useState(defaultLang)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/api/legal/${slug}`, { silent: true }).then(r => {
      if (r.ok) setPage(r.data.page)
      else setError(r.error || 'Page not found')
      setLoading(false)
    })
  }, [slug])

  // Set <html lang> and document.title + meta description
  useEffect(() => {
    if (!page) return
    const isAr = lang === 'ar'
    document.documentElement.lang = isAr ? 'ar' : 'de'
    document.documentElement.dir = isAr ? 'rtl' : 'ltr'
    document.title = `${isAr ? page.title_ar : page.title_de} — Das Deutsche Haus`
    // meta description
    const desc = isAr ? page.metaDescription_ar : page.metaDescription_de
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = desc || ''
  }, [page, lang])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-500">Loading...</div>
  if (error || !page) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-2xl font-black mb-2">الصفحة غير متاحة</p>
        <a href="/" className="text-[#CC0000] font-bold">→ العودة للرئيسية</a>
      </div>
    </div>
  )

  const isAr = lang === 'ar'
  const title = isAr ? page.title_ar : page.title_de
  const content = isAr ? page.content_ar : page.content_de
  const updated = page.updatedAt ? new Date(page.updatedAt).toLocaleDateString(isAr ? 'ar-SY' : 'de-DE') : ''

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-white" style={{ fontFamily: isAr ? "'IBM Plex Sans Arabic', system-ui, sans-serif" : "'Inter', system-ui, sans-serif" }}>
      {/* Minimal Header */}
      <header className="border-b bg-white">
        <div className="h-1 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-4xl">
          <a href="/" className="font-black text-sm text-[#1A1A1A] hover:text-[#CC0000]">Das Deutsche Haus</a>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(isAr ? 'de' : 'ar')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-300 hover:border-[#CC0000] text-xs font-bold transition">
              <Globe className="w-3.5 h-3.5" />{isAr ? 'DE' : 'AR'}
            </button>
            <a href="/" className="text-xs font-bold text-neutral-700 hover:text-[#CC0000] inline-flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              {isAr ? 'الرئيسية' : 'Startseite'}
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-black mb-3 text-[#1A1A1A]">{title}</h1>
        {updated && <p className="text-xs text-neutral-500 mb-8">{isAr ? 'آخر تحديث:' : 'Zuletzt aktualisiert:'} {updated}</p>}

        <article
          className="legal-prose"
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t bg-neutral-50 py-6 mt-10">
        <div className="container mx-auto px-4 max-w-3xl text-center text-xs text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/privacy" className="hover:text-[#CC0000]">{isAr ? 'الخصوصية' : 'Datenschutz'}</a>
            <span>·</span>
            <a href="/terms" className="hover:text-[#CC0000]">{isAr ? 'الشروط' : 'AGB'}</a>
            <span>·</span>
            <a href="/impressum" className="hover:text-[#CC0000]">Impressum</a>
          </div>
          <div>© 2026 Das Deutsche Haus</div>
        </div>
      </footer>

      {/* Lightweight inline CSS — no @apply, scoped to this component */}
      <style jsx global>{`
        .legal-prose { color: #1f2937; line-height: 1.8; font-size: 15.5px; }
        .legal-prose h2 { font-size: 1.4rem; font-weight: 800; margin-top: 2rem; margin-bottom: 0.75rem; color: #1A1A1A; padding-bottom: 0.4rem; border-bottom: 2px solid #FFCE00; display: inline-block; }
        .legal-prose h3 { font-size: 1.1rem; font-weight: 700; margin-top: 1.4rem; margin-bottom: 0.5rem; color: #1A1A1A; }
        .legal-prose p { margin-bottom: 0.9rem; }
        .legal-prose ul, .legal-prose ol { margin: 0.5rem 0 1rem; padding-${isAr ? 'right' : 'left'}: 1.5rem; }
        .legal-prose ul { list-style: disc; }
        .legal-prose ol { list-style: decimal; }
        .legal-prose li { margin-bottom: 0.4rem; }
        .legal-prose a { color: #CC0000; text-decoration: underline; text-underline-offset: 2px; }
        .legal-prose a:hover { color: #A30000; }
        .legal-prose strong { color: #1A1A1A; font-weight: 700; }
      `}</style>
    </div>
  )
}
