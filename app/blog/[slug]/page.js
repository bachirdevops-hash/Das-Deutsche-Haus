'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Eye, Clock, Share2, Copy, MessageCircle, Facebook, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { getCategoryLabel, getCategoryColor, calcReadTime } from '@/lib/blog_categories'

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    api.get(`/api/blog/${slug}`, { silent: true }).then(r => {
      if (r.ok) {
        setPost(r.data.post); setRelated(r.data.related || [])
        if (typeof document !== 'undefined') {
          const postLang = r.data.post?.language || 'ar'
          document.title = `${r.data.post.title} — Das Deutsche Haus`
          document.documentElement.dir = postLang === 'ar' ? 'rtl' : 'ltr'
          document.documentElement.lang = postLang
        }
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-neutral-200 border-t-[#CC0000] rounded-full animate-spin" /></div>
  if (!post) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-2xl font-black mb-2">المقال غير موجود</p><a href="/blog" className="text-[#CC0000] font-bold">→ العودة للمدونة</a></div></div>

  const postLang = post.language || 'ar'
  const isAr = postLang === 'ar'
  const T = isAr
    ? { dir: 'rtl', minRead: 'دقيقة قراءة', views: 'مشاهدة', author: 'الكاتب', share: 'شارك', related: 'مقالات ذات صلة', notFound: 'المقال غير موجود', back: '← العودة للمدونة', backShort: 'المدوّنة' }
    : { dir: 'ltr', minRead: 'Min Lesezeit', views: 'Aufrufe', author: 'Autor', share: 'Teilen', related: 'Ähnliche Artikel', notFound: 'Artikel nicht gefunden', back: '← Zurück zum Blog', backShort: 'Blog' }
  const readTime = calcReadTime(post.content)
  const initials = (post.author?.name || '').split(' ').map(s => s[0]).slice(0, 2).join('')
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const wa = `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${url}`)}`
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const copyLink = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); toast.success('تم نسخ الرابط'); setTimeout(() => setCopied(false), 2000) } catch {} }

  return (
    <ErrorBoundary>
      <div dir={T.dir} className="min-h-screen bg-white" style={{ fontFamily: isAr ? "'IBM Plex Sans Arabic',system-ui,sans-serif" : "'Inter',system-ui,sans-serif" }}>
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="h-1 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/blog" className="font-bold text-sm hover:text-[#CC0000] transition inline-flex items-center gap-1.5"><ArrowRight className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`} />{T.backShort}</a>
            <a href="/" className="font-black text-base text-[#1A1A1A]">Das Deutsche Haus</a>
          </div>
        </header>

        {/* Cover */}
        {post.coverImage && (
          <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden bg-neutral-100">
            <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Content */}
        <article className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(post.category)}`}>{getCategoryLabel(post.category, postLang)}</span>
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">{isAr ? '🇸🇾 العربية' : '🇩🇪 Deutsch'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-base md:text-lg text-neutral-600 leading-relaxed mb-6">{post.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-4 pb-6 border-b">
            <div className="flex items-center gap-2.5">
              {post.author?.photo ? <img src={post.author.photo} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-xs font-black">{initials}</div>}
              <div><div className="text-sm font-bold">{post.author?.name}</div><div className="text-[10px] text-neutral-500">{T.author}</div></div>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.publishDate).toLocaleDateString(isAr ? 'ar-SY' : 'de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime} {T.minRead}</span>
              <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views || 0} {T.views}</span>
            </div>
          </div>

          <div className="ddh-article-content my-8 text-base leading-loose text-neutral-800" dangerouslySetInnerHTML={{ __html: post.content || '' }} style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }} />
          <style jsx global>{`
            .ddh-article-content h2 { font-size: 1.5rem; font-weight: 800; margin: 1.4em 0 0.6em; color: #1A1A1A; }
            .ddh-article-content h3 { font-size: 1.25rem; font-weight: 700; margin: 1.1em 0 0.4em; color: #333; }
            .ddh-article-content p { margin: 0.9em 0; }
            .ddh-article-content ul, .ddh-article-content ol { padding-inline-start: 1.5em; margin: 0.8em 0; }
            .ddh-article-content ul { list-style: disc; }
            .ddh-article-content ol { list-style: decimal; }
            .ddh-article-content li { margin: 0.3em 0; }
            .ddh-article-content blockquote { border-inline-start: 4px solid #FFCE00; background: linear-gradient(90deg, #FFF8E0, transparent); padding: 1em 1.2em; margin: 1.2em 0; border-radius: 0 12px 12px 0; font-style: italic; color: #555; }
            .ddh-article-content a { color: #CC0000; text-decoration: underline; }
            .ddh-article-content img { max-width: 100%; border-radius: 16px; margin: 1.2em 0; }
            .ddh-article-content strong { color: #1A1A1A; font-weight: 800; }
          `}</style>

          {/* Share buttons */}
          <div className="sticky bottom-4 flex justify-center mt-12">
            <div className="inline-flex items-center gap-2 bg-white rounded-full shadow-2xl border p-2">
              <span className="px-3 text-xs font-bold text-neutral-500 inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />{T.share}</span>
              <a href={wa} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition" title="WhatsApp"><MessageCircle className="w-4 h-4" /></a>
              <a href={fb} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition" title="Facebook"><Facebook className="w-4 h-4" /></a>
              <button onClick={copyLink} className="w-9 h-9 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition" title="نسخ">{copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}</button>
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-neutral-50 py-12">
            <div className="container mx-auto px-4">
              <h3 className="text-2xl font-black mb-6 text-center">مقالات ذات صلة</h3>
              <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {related.map(r => (
                  <a key={r.id} href={`/blog/${r.slug}`} className="group bg-white rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition">
                    {r.coverImage && <img src={r.coverImage} alt="" className="aspect-[16/10] w-full object-cover group-hover:scale-110 transition duration-700" />}
                    <div className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${getCategoryColor(r.category)}`}>{getCategoryLabel(r.category)}</span>
                      <h4 className="font-black text-sm line-clamp-2 group-hover:text-[#CC0000]">{r.title}</h4>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{r.excerpt}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <footer className="bg-[#1A1A1A] text-white py-8 text-center">
          <div className="h-1 flex mb-6"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <a href="/blog" className="hover:text-[#FFCE00]">→ رجوع إلى المدونة</a>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
