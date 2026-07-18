'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Eye, Clock, ChevronRight, ChevronLeft, Globe } from 'lucide-react'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { BLOG_CATEGORIES, getCategoryLabel, getCategoryColor, calcReadTime } from '@/lib/blog_categories'

const T = {
  ar: {
    dir: 'rtl', tagline: 'مدوّنة Das Deutsche Haus',
    heroTitle: 'دليلك إلى ألمانيا', heroSub: 'مقالات، نصائح، وقصص نجاح لتساعدك في رحلتك نحو ألمانيا',
    searchPh: 'ابحث عن مقال...', allCategories: 'كل المقالات',
    noPosts: 'لا توجد مقالات', noPostsHint: 'جرّب فئة أخرى أو بحث أبسط',
    backHome: '← العودة للصفحة الرئيسية', minRead: 'د قراءة', views: 'مشاهدة',
    arabic: 'العربية', german: 'Deutsch',
  },
  de: {
    dir: 'ltr', tagline: 'Das Deutsche Haus Blog',
    heroTitle: 'Dein Leitfaden nach Deutschland', heroSub: 'Artikel, Tipps und Erfolgsgeschichten für deine Reise nach Deutschland',
    searchPh: 'Artikel suchen...', allCategories: 'Alle Artikel',
    noPosts: 'Keine Artikel gefunden', noPostsHint: 'Versuche eine andere Kategorie',
    backHome: '← Zurück zur Startseite', minRead: 'Min Lesezeit', views: 'Aufrufe',
    arabic: 'العربية', german: 'Deutsch',
  },
}

export default function BlogPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('ar')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const t = T[lang]

  // Load lang from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ddh_blog_lang')
      if (saved === 'de' || saved === 'ar') setLang(saved)
    }
  }, [])
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('ddh_blog_lang', lang) }, [lang])

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('lang', lang)
    if (category !== 'all') params.set('category', category)
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('limit', '9')
    const r = await api.get(`/api/blog?${params}`, { silent: true })
    if (r.ok) setData(r.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [category, page, lang])
  useEffect(() => { const id = setTimeout(() => { setPage(1); load() }, 400); return () => clearTimeout(id) }, [search])
  useEffect(() => {
    document.title = lang === 'ar' ? 'المدوّنة — Das Deutsche Haus' : 'Blog — Das Deutsche Haus'
    document.documentElement.dir = t.dir
    document.documentElement.lang = lang
  }, [lang])

  return (
    <ErrorBoundary>
      <div dir={t.dir} className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white" style={{ fontFamily: lang === 'ar' ? "'IBM Plex Sans Arabic',system-ui,sans-serif" : "'Inter',system-ui,sans-serif" }}>
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="h-1 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <a href="/" className="font-black text-base md:text-lg text-[#1A1A1A] hover:text-[#CC0000] transition">Das Deutsche Haus</a>
            <h1 className="text-lg md:text-xl font-black hidden md:block">{lang === 'ar' ? 'المدوّنة' : 'Blog'}</h1>
            <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-1">
              <button onClick={() => setLang('ar')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${lang === 'ar' ? 'bg-[#1A1A1A] text-white shadow' : 'text-neutral-600 hover:text-neutral-900'}`}>🇸🇾 AR</button>
              <button onClick={() => setLang('de')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${lang === 'de' ? 'bg-[#1A1A1A] text-white shadow' : 'text-neutral-600 hover:text-neutral-900'}`}>🇩🇪 DE</button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-14 md:py-16 text-center bg-gradient-to-br from-white via-[#FFCE00]/5 to-[#CC0000]/5">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="inline-block px-4 py-1 bg-[#FFCE00]/20 text-[#1A1A1A] rounded-full text-xs font-bold uppercase tracking-widest mb-4">{t.tagline}</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">{t.heroTitle}</h2>
            <p className="text-neutral-600 mb-8">{t.heroSub}</p>
            <div className="max-w-xl mx-auto relative">
              <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400`} />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPh} className={`h-12 ${lang === 'ar' ? 'ps-12' : 'pl-12'} rounded-2xl bg-white shadow-sm border-neutral-200`} dir={t.dir} />
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <div className="sticky top-16 bg-white/95 backdrop-blur z-20 border-b">
          <div className="container mx-auto px-4 py-3 flex flex-wrap gap-2 overflow-x-auto">
            <button onClick={() => { setCategory('all'); setPage(1) }} className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${category === 'all' ? 'bg-[#1A1A1A] text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}>{t.allCategories}</button>
            {BLOG_CATEGORIES.map(c => (
              <button key={c.value} onClick={() => { setCategory(c.value); setPage(1) }} className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${category === c.value ? 'bg-[#1A1A1A] text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}>{c[lang]}</button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <section className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl border h-96 animate-pulse" />)}
            </div>
          ) : data.items.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold mb-1">{t.noPosts}</p>
              <p className="text-sm">{t.noPostsHint}</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map(p => <PostCard key={p.id} p={p} lang={lang} t={t} />)}
              </div>
              {data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-neutral-50">{lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>
                  {Array.from({ length: data.totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`min-w-[40px] h-10 rounded-lg font-bold text-sm ${page === i + 1 ? 'bg-[#1A1A1A] text-white' : 'border hover:bg-neutral-50'}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-neutral-50">{lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
                </div>
              )}
            </>
          )}
        </section>

        <footer className="bg-[#1A1A1A] text-white py-8 text-center">
          <div className="h-1 flex mb-6"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <div className="container mx-auto px-4">
            <a href="/" className="hover:text-[#FFCE00]">{t.backHome}</a>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

function PostCard({ p, lang, t }) {
  const initials = (p.author?.name || '').split(' ').map(s => s[0]).slice(0, 2).join('')
  const readTime = calcReadTime(p.excerpt + ' '.repeat(800))
  const postLang = p.language || 'ar'
  return (
    <a href={`/blog/${p.slug}`} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition flex flex-col">
      {p.coverImage && (
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
          <img src={p.coverImage} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" />
          <span className={`absolute top-3 ${postLang === 'ar' ? 'right-3' : 'left-3'} px-2.5 py-1 rounded-full text-[10px] font-bold border ${getCategoryColor(p.category)}`}>{getCategoryLabel(p.category, lang)}</span>
          <span className={`absolute top-3 ${postLang === 'ar' ? 'left-3' : 'right-3'} px-2 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur`}>{postLang === 'ar' ? '🇸🇾 AR' : '🇩🇪 DE'}</span>
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col" dir={postLang === 'ar' ? 'rtl' : 'ltr'}>
        <h3 className="text-lg font-black leading-tight mb-2 line-clamp-2 group-hover:text-[#CC0000] transition">{p.title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 flex-1 mb-4">{p.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t">
          <div className="flex items-center gap-2">
            {p.author?.photo ? <img src={p.author.photo} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-[9px] font-black">{initials}</div>}
            <span className="font-semibold truncate max-w-[120px]">{p.author?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} {t.minRead}</span>
            <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{p.views || 0}</span>
          </div>
        </div>
        <div className="text-[10px] text-neutral-400 mt-2"><Calendar className="inline w-3 h-3 ms-0.5" />{new Date(p.publishDate).toLocaleDateString(postLang === 'ar' ? 'ar-SY' : 'de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </a>
  )
}
