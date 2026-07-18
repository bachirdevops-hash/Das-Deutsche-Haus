'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Globe, Menu, X, GraduationCap, Award, Briefcase, Plane, User, LogOut, BookOpen, Calendar, MapPin, Phone, Mail, MessageCircle, Star, Users, Trophy, CheckCircle2, Clock, Euro, ArrowRight, Building2, Send, Home as HomeIcon, LayoutDashboard, Info, ShieldCheck, Sparkles, Shield, Activity, DollarSign, UserPlus, Pencil, Trash2, Power, FileText, Video, Megaphone, ClipboardCheck, Plus, Save, Eye, EyeOff, Lock, UserCircle2, AlertTriangle, MessageSquare, Bell, Inbox, Copy, KeyRound, RefreshCw } from 'lucide-react'
import { FileUpload, fileTypeIcon, ConfirmDialog, AccessDenied } from '@/components/ddh/shared'
import { T } from '@/lib/translations'
import { LOGO_URL, HERO_IMG, HERO_NIGHT, CLASS_IMG, LEHRER_IMG, TVTOWER_IMG } from '@/lib/constants'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import HeroSlideshow from '@/components/ddh/HeroSlideshow'
import { Header } from '@/components/ddh/layout/Header'
import { Footer } from '@/components/ddh/layout/Footer'
import { WhatsAppFloat } from '@/components/ddh/layout/WhatsAppFloat'
import { AuthDialog } from '@/components/ddh/auth/AuthDialog'
import { ResetPasswordDialog } from '@/components/ddh/auth/ResetPasswordDialog'
import { GermanAdminPanel } from '@/components/ddh/admin/german/GermanAdminPanel'
import { BlogAdminPanel } from '@/components/ddh/admin/blog/BlogAdminPanel'
import { ActivitiesAdminPanel } from '@/components/ddh/admin/activities/ActivitiesAdminPanel'
import { LegalPagesAdminPanel } from '@/components/ddh/admin/legal/LegalPagesAdminPanel'
import { SiteContentAdminPanel } from '@/components/ddh/admin/site/SiteContentAdminPanel'
import { InboxAdminPanel } from '@/components/ddh/admin/inbox/InboxAdminPanel'
import { EmailLogsAdminPanel } from '@/components/ddh/admin/email/EmailLogsAdminPanel'
import CoursesAdminPanel from '@/components/ddh/admin/courses/CoursesAdminPanel'
import JobsAdminPanel from '@/components/ddh/admin/jobs/JobsAdminPanel'
import { getIcon, fetchContent, fetchList } from '@/lib/content'

// ==================== App ====================
function App() {
  const [lang, setLang] = useState('ar')
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const [resetToken, setResetToken] = useState(null)
  const t = T[lang]

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('ddh_lang')) || 'ar'
    setLang(saved)
    // Detect ?reset=... in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tok = params.get('reset')
      if (tok) setResetToken(tok)
    }
  }, [])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = T[lang].dir
      localStorage.setItem('ddh_lang', lang)
    }
  }, [lang])
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user || null)).catch(() => {})
  }, [])

  const goto = (p) => { setPage(p); setNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null); goto('home')
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج' : 'Abgemeldet')
  }
  const onLoginSuccess = (u) => {
    setUser(u)
    setAuthMode(null)
    // Auto-redirect by role
    if (u.role === 'super_admin') goto('admin')
    else if (u.role === 'manager') goto('manager')
    else if (u.role === 'teacher') goto('teacher')
    else goto('dashboard')
  }

  // Force admin/manager/teacher into RTL Arabic
  const adminLang = 'ar'

  return (
    <div dir={t.dir} className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      <Header t={t} lang={lang} setLang={setLang} page={page} goto={goto} user={user} navOpen={navOpen} setNavOpen={setNavOpen} setAuthMode={setAuthMode} logout={logout} />
      <main className="pt-20">
        <ErrorBoundary>
          {page === 'home' && <Home t={t} lang={lang} goto={goto} setAuthMode={setAuthMode} user={user} />}
          {page === 'courses' && <Courses t={t} lang={lang} user={user} setAuthMode={setAuthMode} />}
          {page === 'telc' && <Telc t={t} lang={lang} user={user} setAuthMode={setAuthMode} />}
          {page === 'vocational' && <Vocational t={t} lang={lang} user={user} />}
          {page === 'travel' && <Travel t={t} lang={lang} user={user} />}
          {page === 'about' && <About t={t} lang={lang} />}
          {page === 'contact' && <Contact t={t} lang={lang} />}
          {page === 'dashboard' && <Dashboard t={t} lang={lang} user={user} setAuthMode={setAuthMode} />}
          {page === 'admin' && (user?.role === 'super_admin' ? <AdminPanel user={user} /> : <AccessDenied />)}
          {page === 'manager' && (['super_admin','manager'].includes(user?.role) ? <ManagerPanel user={user} /> : <AccessDenied />)}
          {page === 'teacher' && (['super_admin','teacher'].includes(user?.role) ? <TeacherPanel user={user} /> : <AccessDenied />)}
        </ErrorBoundary>
      </main>
      <Footer t={t} lang={lang} goto={goto} />
      <AuthDialog mode={authMode} setMode={setAuthMode} lang={lang} t={t} onSuccess={onLoginSuccess} />
      {resetToken && <ResetPasswordDialog token={resetToken} onClose={() => { setResetToken(null); window.history.replaceState({}, '', window.location.pathname) }} />}
      <WhatsAppFloat lang={lang} />
    </div>
  )
}

// ==================== Home (MySchool-inspired redesign) ====================
function Home({ t, lang, goto, setAuthMode, user }) {
  const [hero, setHero] = useState({})
  const [highlights, setHighlights] = useState({ items: [] })
  const [featured, setFeatured] = useState({})
  const [stats, setStats] = useState({ items: [] })
  const [why, setWhy] = useState({ cards: [] })
  const [testi, setTesti] = useState({})
  const [news, setNews] = useState({})
  const [eventsHdr, setEventsHdr] = useState({})
  const [cta, setCta] = useState({})
  const [about, setAbout] = useState({})
  const [courses, setCourses] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    fetchContent('home_hero').then(setHero)
    fetchContent('home_highlights').then(setHighlights)
    fetchContent('home_featured').then(setFeatured)
    fetchContent('home_stats').then(setStats)
    fetchContent('home_why').then(setWhy)
    fetchContent('home_testimonials').then(setTesti)
    fetchContent('home_news').then(setNews)
    fetchContent('home_events').then(setEventsHdr)
    fetchContent('home_cta').then(setCta)
    fetchContent('about_mission').then(setAbout)
    fetch('/api/courses').then(r => r.json()).then(d => setCourses((d.courses || []).slice(0, 6)))
    fetch('/api/blog?lang=ar&limit=3').then(r => r.json()).then(d => setBlogPosts(d.items || d.posts || []))
    fetch('/api/activities?filter=upcoming').then(r => r.json()).then(d => {
      const list = d.items || d.activities || []
      const upcoming = list.filter(a => !a.date || new Date(a.date) >= new Date()).slice(0, 4)
      setActivities(upcoming.length ? upcoming : list.slice(0, 4))
    })
  }, [])

  const doAction = (action) => {
    if (!action) return
    if (action === 'signup') return setAuthMode('signup')
    if (action === 'login') return setAuthMode('login')
    if (action.startsWith('goto:')) return goto(action.slice(5))
    if (action.startsWith('href:')) { window.location.href = action.slice(5); return }
    if (action.startsWith('http')) { window.open(action, '_blank'); return }
    if (action.startsWith('/')) { window.location.href = action; return }
  }

  const statsItems = (stats.items || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  const whyCards = (why.cards || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  const highlightItems = (highlights.items || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  const featuredEvent = activities[0]

  return (
    <>
      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-[680px] flex items-center overflow-hidden bg-[#1A1A1A]">
        <HeroSlideshow />
        <div className="absolute inset-0 hero-overlay z-[2]" />
        <div className="absolute top-0 right-0 left-0 h-2 flag-gradient-h z-10" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl text-white fade-in">
            {hero?.badge && (
              <div className="inline-flex items-center gap-2 mb-5 bg-white/15 backdrop-blur-md border border-white/25 rounded-full ps-2 pe-4 py-1.5 text-sm">
                {hero?.badgePin && <span className="bg-[#CC0000] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{hero.badgePin}</span>}
                <span className="font-semibold">{hero.badge}</span>
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5 tracking-tight">{t.hero.title}</h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">{t.hero.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => doAction(hero?.cta1Action || 'goto:courses')} className="btn-primary px-6 py-3.5 rounded-xl font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5" />{hero?.cta1Label || t.hero.cta1}<ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></button>
              <button onClick={() => doAction(hero?.cta2Action || 'goto:telc')} className="btn-gold px-6 py-3.5 rounded-xl font-bold flex items-center gap-2"><Award className="w-5 h-5" />{hero?.cta2Label || t.hero.cta2}</button>
              {(hero?.cta3Label !== '' || hero?.cta3Label === undefined) && (
                <button onClick={() => doAction(hero?.cta3Action || 'href:/visa-types#booking')} className="px-6 py-3.5 rounded-xl bg-white/15 backdrop-blur-md border-2 border-white/40 text-white font-bold flex items-center gap-2 hover:bg-white/25 transition"><Plane className="w-5 h-5" />{hero?.cta3Label || 'احجز استشارة'}</button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 flag-gradient-h z-10" />
      </section>

      {/* ===== 2. 3 QUICK HIGHLIGHT CARDS (overlapping the hero) ===== */}
      {highlightItems.length > 0 && (
        <section className="bg-white relative -mt-16 z-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-5">
              {highlightItems.map((h) => {
                const Ic = getIcon(h.icon)
                const isEmoji = (h.icon || '').length <= 4 && /\p{Emoji}/u.test(h.icon || '')
                return (
                  <Card key={h.id} className="card-hover bg-white shadow-xl border-t-4" style={{ borderTopColor: h.color || '#CC0000' }}>
                    <CardContent className="p-7">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${h.color || '#CC0000'}15` }}>
                          {isEmoji ? <span className="text-3xl leading-none">{h.icon}</span> : <Ic className="w-7 h-7" style={{ color: h.color || '#CC0000' }} />}
                        </div>
                        <div>
                          <div className="text-2xl font-black tracking-tight" style={{ color: h.color || '#CC0000' }}>{h.value}</div>
                          <h3 className="text-base font-bold mt-0.5">{h.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{h.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== 3. FEATURED EVENT (auto-pulled from latest activity) ===== */}
      {featuredEvent && (
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <Card className="card-hover overflow-hidden border-2 border-[#FFCE00]/40 bg-gradient-to-br from-yellow-50/40 to-white">
              <CardContent className="p-0 grid md:grid-cols-12 items-stretch">
                {/* Date block */}
                <div className="md:col-span-2 bg-[#1A1A1A] text-white flex flex-col items-center justify-center py-8 px-4">
                  <div className="text-xs uppercase tracking-widest text-[#FFCE00] font-bold">{featuredEvent.date ? new Date(featuredEvent.date).toLocaleDateString('ar-EG-u-nu-latn', { month: 'short' }) : 'قريباً'}</div>
                  <div className="text-5xl font-black my-1">{featuredEvent.date ? new Date(featuredEvent.date).getDate() : '•'}</div>
                  <div className="text-xs text-white/60">{featuredEvent.date ? new Date(featuredEvent.date).getFullYear() : ''}</div>
                </div>
                {/* Image */}
                {featuredEvent.coverImage && (
                  <div className="md:col-span-4 h-48 md:h-auto overflow-hidden">
                    <img src={featuredEvent.coverImage} alt={featuredEvent.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Content */}
                <div className="md:col-span-6 p-7 flex flex-col justify-center">
                  <Badge className="bg-[#CC0000] text-white hover:bg-[#CC0000] w-fit mb-3 font-bold">فعالية مميّزة</Badge>
                  <h3 className="text-2xl md:text-3xl font-black mb-2 leading-tight">{featuredEvent.title}</h3>
                  <p className="text-neutral-600 text-sm mb-4 leading-relaxed line-clamp-3">{(featuredEvent.description || '').replace(/<[^>]+>/g, '').trim()}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-700 mb-5">
                    {featuredEvent.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#CC0000]" />{featuredEvent.location}</span>}
                    {featuredEvent.totalSeats > 0 && <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#CC0000]" />{featuredEvent.totalSeats - (featuredEvent.registeredCount || 0)} مقعد متبقي</span>}
                  </div>
                  <a href={`/activities/${featuredEvent.slug || featuredEvent.id}`} className="btn-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 w-fit"><Calendar className="w-4 h-4" />سجّل في الفعالية<ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* ===== 4. ABOUT (image + text + 3 inline stats + CTA) ===== */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="bg-[#FFCE00] text-[#1A1A1A] hover:bg-[#FFCE00] mb-3 px-3 py-1 font-bold"><Sparkles className="w-3.5 h-3.5 me-1" />عن المعهد</Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{about?.storyTitle || 'قصتنا — تمكين الشباب السوري'}</h2>
              <p className="text-neutral-700 leading-loose mb-6 line-clamp-6">{about?.story || 'تأسس Das Deutsche Haus عام 2018 على يد فريق من الأكاديميين الألمان والسوريين بهدف بناء جسر تعليمي وثقافي حقيقي بين سوريا وألمانيا.'}</p>
              {/* Inline stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {statsItems.slice(0, 3).map(s => (
                  <div key={s.id} className="border-r border-neutral-200 pe-3 last:border-r-0">
                    <div className="text-2xl md:text-3xl font-black" style={{ color: s.color || '#CC0000' }}>{s.value}</div>
                    <div className="text-[11px] text-neutral-600 font-semibold mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              {about?.mission && (
                <blockquote className="border-r-4 border-[#CC0000] ps-4 pe-4 py-3 bg-white rounded-md text-sm italic text-neutral-700 mb-6 line-clamp-3">&ldquo;{about.mission}&rdquo;</blockquote>
              )}
              <button onClick={() => goto('about')} className="inline-flex items-center gap-2 font-bold text-[#CC0000] hover:gap-3 transition-all">المزيد عن المعهد <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></button>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img src={CLASS_IMG} alt="حياة الدراسة" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A]/30 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 start-6 bg-[#CC0000] text-white rounded-2xl px-5 py-4 shadow-2xl">
                <div className="text-3xl font-black">{new Date().getFullYear() - 2018}+</div>
                <div className="text-xs font-semibold">سنوات من التميّز</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. WHY US (3 cards) ===== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-[#CC0000] text-white hover:bg-[#CC0000] mb-3 font-bold">لماذا نحن</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-3">{why?.title || 'لماذا Das Deutsche Haus؟'}</h2>
            <p className="text-neutral-600">{why?.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((f) => {
              const Ic = getIcon(f.icon)
              return (
                <Card key={f.id} className="card-hover border-2 border-transparent hover:border-[#FFCE00]/50 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-2" style={{ background: f.color || '#CC0000' }} />
                  <CardContent className="p-7">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ background: `${f.color || '#CC0000'}15` }}><Ic className="w-7 h-7" style={{ color: f.color || '#CC0000' }} /></div>
                    <h3 className="text-xl font-bold mb-2.5">{f.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== 6. FEATURED PROGRAMS (course cards with images) ===== */}
      {courses.length > 0 && (
        <section className="py-20 bg-[#FAFAF8]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="bg-[#FFCE00] text-[#1A1A1A] hover:bg-[#FFCE00] mb-3 font-bold">الكورسات</Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-3">{featured?.title || 'الكورسات المُميّزة'}</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">{featured?.subtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(c => (
                <Card key={c.id} className="card-hover overflow-hidden group bg-white">
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#CC0000]">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt={c.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-5xl font-black opacity-30">{c.level}</div>
                    )}
                    <div className="absolute top-3 start-3 flex gap-2">
                      <Badge className="bg-[#1A1A1A]/90 text-white hover:bg-[#1A1A1A] backdrop-blur-sm font-black text-sm">{c.level}</Badge>
                      {c.featured && <Badge className="bg-[#FFCE00] text-[#1A1A1A] hover:bg-[#FFCE00] font-black">مميّز</Badge>}
                    </div>
                    <div className="absolute top-3 end-3"><Badge className="bg-white/95 text-[#CC0000] font-bold border border-white">${c.price_usd}</Badge></div>
                  </div>
                  <CardContent className="p-5">
                    <div className="text-[11px] text-[#CC0000] font-bold uppercase tracking-wider mb-1">{lang === 'ar' ? c.duration_ar : c.duration_de} · {c.hours}h</div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{lang === 'ar' ? c.title_ar : c.title_de}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 mb-4">{lang === 'ar' ? c.desc_ar : c.desc_de}</p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-neutral-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{c.start_date}</div>
                      <button onClick={() => goto('courses')} className="text-sm font-bold text-[#CC0000] hover:gap-2 transition-all inline-flex items-center gap-1">سجّل الآن <ArrowRight className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} /></button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <button onClick={() => doAction(featured?.ctaAction || 'goto:courses')} className="btn-primary px-7 py-3 rounded-xl font-bold inline-flex items-center gap-2">{featured?.ctaLabel || 'كل الكورسات'}<ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></button>
            </div>
          </div>
        </section>
      )}

      {/* ===== 7. TESTIMONIALS ===== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-[#CC0000] text-white hover:bg-[#CC0000] mb-3 font-bold">قصص النجاح</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-3">{testi?.title || 'ماذا يقول طلابنا'}</h2>
            {testi?.subtitle && <p className="text-neutral-600">{testi.subtitle}</p>}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'سارة محمد · Sara M.', role: lang === 'ar' ? 'طالبة طب — برلين' : 'Medizinstudentin — Berlin', q_ar: 'بدأت من A1 ووصلت إلى C1 خلال 14 شهراً. الآن أدرس الطب في برلين.', q_de: 'Von A1 zu C1 in 14 Monaten. Jetzt studiere ich in Berlin.' },
              { name: 'أحمد · Ahmad K.', role: lang === 'ar' ? 'متدرب — Siemens' : 'Auszubildender — Siemens', q_ar: 'حصلت على عقد Ausbildung مع Siemens بفضل الإعداد الممتاز في المعهد.', q_de: 'Ich bekam einen Ausbildungsvertrag bei Siemens.' },
              { name: 'لينا · Lina H.', role: lang === 'ar' ? 'ممرضة — Charité' : 'Krankenpflegerin — Charité', q_ar: 'telc B2 Pflege غيّر حياتي — الآن أعمل في أكبر مستشفى ألماني.', q_de: 'telc B2 Pflege hat mein Leben verändert.' },
            ].map((tt, i) => (
              <Card key={i} className="card-hover bg-gradient-to-br from-white to-neutral-50 relative">
                <CardContent className="p-7">
                  <div className="absolute top-4 end-4 text-[#FFCE00] opacity-60 text-5xl font-serif leading-none">&ldquo;</div>
                  <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#FFCE00] text-[#FFCE00]" />)}</div>
                  <p className="text-neutral-700 leading-relaxed mb-5 italic">{lang === 'ar' ? tt.q_ar : tt.q_de}</p>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white font-bold">{tt.name.charAt(0)}</div>
                    <div><div className="font-bold text-sm">{tt.name}</div><div className="text-xs text-neutral-500">{tt.role}</div></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. PREMIUM CTA BANNER ===== */}
      <section className="py-20 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#CC0000] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${TVTOWER_IMG})`, backgroundSize: 'cover' }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="bg-[#FFCE00] text-[#1A1A1A] hover:bg-[#FFCE00] mb-5 font-bold px-3 py-1"><Sparkles className="w-3.5 h-3.5 me-1" />Premium Education</Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4 max-w-3xl mx-auto leading-tight">{cta?.title || 'جاهز لبدء رحلتك إلى ألمانيا؟'}</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{cta?.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {cta?.button1?.enabled !== false && cta?.button1?.label && (<button onClick={() => doAction(cta.button1.action)} className="btn-gold px-7 py-3.5 rounded-xl font-bold">{cta.button1.label}</button>)}
            {cta?.button2?.enabled !== false && cta?.button2?.label && (<button onClick={() => doAction(cta.button2.action)} className="px-7 py-3.5 rounded-xl bg-white text-[#1A1A1A] font-bold hover:bg-neutral-100 transition">{cta.button2.label}</button>)}
            {cta?.button3?.enabled !== false && cta?.button3?.label && (<button onClick={() => doAction(cta.button3.action)} className="px-7 py-3.5 rounded-xl border-2 border-white/40 text-white font-bold hover:bg-white/10 transition flex items-center gap-2"><Plane className="w-4 h-4" />{cta.button3.label}</button>)}
          </div>
        </div>
      </section>

      {/* ===== 9. RECENT NEWS / BLOG ===== */}
      {blogPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <Badge className="bg-[#CC0000] text-white hover:bg-[#CC0000] mb-3 font-bold">المركز الإعلامي</Badge>
                <h2 className="text-3xl md:text-4xl font-black">{news?.title || 'آخر الأخبار والمقالات'}</h2>
                {news?.subtitle && <p className="text-neutral-600 mt-2">{news.subtitle}</p>}
              </div>
              <button onClick={() => doAction(news?.ctaAction || 'href:/blog')} className="text-sm font-bold text-[#CC0000] hover:gap-2 transition-all inline-flex items-center gap-1.5">{news?.ctaLabel || 'كل المقالات'}<ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map(p => (
                <a key={p.id || p.slug} href={`/blog/${p.slug}`} className="block group">
                  <Card className="card-hover overflow-hidden h-full">
                    {p.coverImage && (
                      <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                        <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="text-xs text-neutral-500 mb-2 flex items-center gap-3">
                        {p.publishedAt && <span>{new Date(p.publishedAt).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        {p.authorName && <span>· {p.authorName}</span>}
                      </div>
                      <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-[#CC0000] transition-colors">{p.title}</h3>
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{p.excerpt}</p>
                      <span className="text-xs font-bold text-[#CC0000] inline-flex items-center gap-1">اقرأ المزيد <ArrowRight className={`w-3 h-3 ${lang === 'ar' ? 'rotate-180' : ''}`} /></span>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 10. EVENTS / ACTIVITIES ===== */}
      {activities.length > 0 && (
        <section className="py-20 bg-[#FAFAF8]">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <Badge className="bg-[#FFCE00] text-[#1A1A1A] hover:bg-[#FFCE00] mb-3 font-bold">الفعاليات</Badge>
                <h2 className="text-3xl md:text-4xl font-black">{eventsHdr?.title || 'الفعاليات القادمة'}</h2>
                {eventsHdr?.subtitle && <p className="text-neutral-600 mt-2">{eventsHdr.subtitle}</p>}
              </div>
              <button onClick={() => doAction(eventsHdr?.ctaAction || 'href:/activities')} className="text-sm font-bold text-[#CC0000] hover:gap-2 transition-all inline-flex items-center gap-1.5">{eventsHdr?.ctaLabel || 'كل الفعاليات'}<ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activities.map(a => (
                <a key={a.id} href={`/activities/${a.slug || a.id}`} className="block group">
                  <Card className="card-hover overflow-hidden h-full">
                    <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#CC0000] relative">
                      {a.coverImage ? (
                        <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40"><Calendar className="w-12 h-12" /></div>
                      )}
                      {a.date && (
                        <div className="absolute top-3 start-3 bg-white/95 backdrop-blur text-center rounded-xl px-3 py-1.5 shadow-lg">
                          <div className="text-[10px] uppercase font-bold text-[#CC0000]">{new Date(a.date).toLocaleDateString('ar-EG-u-nu-latn', { month: 'short' })}</div>
                          <div className="text-xl font-black text-[#1A1A1A] leading-none">{new Date(a.date).getDate()}</div>
                        </div>
                      )}
                      {a.type && <Badge className="absolute top-3 end-3 bg-[#1A1A1A]/90 text-white hover:bg-[#1A1A1A] backdrop-blur-sm">{a.type}</Badge>}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-[#CC0000] transition-colors leading-snug">{a.title}</h3>
                      {a.location && <div className="text-xs text-neutral-500 flex items-center gap-1.5 mb-2"><MapPin className="w-3 h-3" />{a.location}</div>}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-neutral-600">{a.isFree ? '🎁 مجاناً' : (a.price ? `$${a.price}` : '')}</span>
                        <span className="text-xs font-bold text-[#CC0000]">سجّل →</span>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

// ==================== Public pages (Courses, Telc, Vocational, Travel, About, Contact, Dashboard) ====================
function Courses({ t, lang, user, setAuthMode }) {
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [regCourse, setRegCourse] = useState(null)
  useEffect(() => { fetch('/api/courses').then(r => r.json()).then(d => { setCourses(d.courses || []); setLoading(false) }) }, [])
  const filtered = filter === 'all' ? courses : courses.filter(c => c.level.startsWith(filter))
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <PageHero img={CLASS_IMG} title={t.courses.title} sub={t.courses.sub} />
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[['all', t.courses.all], ['A', 'A1 / A2'], ['B', 'B1 / B2'], ['C', 'C1 / C2']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${filter === k ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-white border-2 border-neutral-200 hover:border-[#CC0000]'}`}>{l}</button>
          ))}
        </div>
        {loading ? <Loading t={t} /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <Card key={c.id} className="card-hover overflow-hidden border-2 border-transparent hover:border-[#FFCE00]">
                <div className="h-2 flag-gradient-h" />
                {c.coverImage && <div className="h-40 overflow-hidden"><img src={c.coverImage} alt={c.title_ar} className="w-full h-full object-cover" /></div>}
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-1"><Badge className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A] text-base px-3 py-1 font-black">{c.level}</Badge><Badge variant="outline" className="border-[#CC0000] text-[#CC0000] font-bold">${c.price_usd}</Badge></div>
                  <CardTitle className="text-lg">{lang === 'ar' ? c.title_ar : c.title_de}</CardTitle>
                  <CardDescription>{lang === 'ar' ? c.desc_ar : c.desc_de}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-sm">
                  <Row icon={Clock} label={t.courses.duration} val={`${lang === 'ar' ? c.duration_ar : c.duration_de} · ${c.hours}h`} />
                  <Row icon={Calendar} label={t.courses.schedule} val={lang === 'ar' ? c.schedule_ar : c.schedule_de} />
                  <Row icon={Sparkles} label={t.courses.start} val={c.start_date} />
                  <Row icon={Users} label={t.courses.seats} val={c.seats} />
                  <button onClick={() => setRegCourse(c)} className="w-full mt-3 btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />{t.courses.register}</button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {regCourse && <PublicLeadDialog
        kind="course"
        item={regCourse}
        title={lang === 'ar' ? `التسجيل في كورس ${regCourse.level}` : `Anmeldung Kurs ${regCourse.level}`}
        subtitle={lang === 'ar' ? regCourse.title_ar : regCourse.title_de}
        endpoint="/api/course-registrations"
        payload={{ courseId: regCourse.id }}
        user={user}
        lang={lang}
        onClose={() => setRegCourse(null)}
      />}
    </section>
  )
}

function Telc({ t, lang, user, setAuthMode }) {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookExam, setBookExam] = useState(null)
  useEffect(() => { fetch('/api/telc-exams').then(r => r.json()).then(d => { setExams(d.exams || []); setLoading(false) }) }, [])
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <PageHero img={LEHRER_IMG} title={t.telc.title} sub={t.telc.sub} />
        <Card className="mb-10 border-2 border-[#FFCE00]/40 bg-gradient-to-br from-yellow-50/50 to-white">
          <CardContent className="p-6 flex gap-4 items-start"><div className="w-12 h-12 rounded-xl bg-[#FFCE00] flex items-center justify-center shrink-0"><Award className="w-6 h-6 text-[#1A1A1A]" /></div><div><h3 className="font-black text-lg mb-1.5">{t.telc.what}</h3><p className="text-neutral-700 leading-relaxed text-sm">{t.telc.whatDesc}</p></div></CardContent>
        </Card>
        <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><Calendar className="w-6 h-6 text-[#CC0000]" />{t.telc.upcoming}</h3>
        {loading ? <Loading t={t} /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map(e => (
              <Card key={e.id} className="card-hover overflow-hidden">
                <div className="h-1.5 flag-gradient-h" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3"><Badge className="bg-[#CC0000] text-white hover:bg-[#CC0000] font-bold">{e.type}</Badge><span className="text-2xl font-black">${e.price_usd}</span></div>
                  <div className="space-y-2 text-sm text-neutral-700 mb-4">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#CC0000]" />{e.date} · {e.time}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#CC0000]" />{lang === 'ar' ? 'دمشق' : 'Damaskus'}</div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#CC0000]" />{e.seats} {t.courses.seats}</div>
                  </div>
                  <button onClick={() => setBookExam(e)} className="w-full btn-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />{t.telc.book}</button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {bookExam && <PublicLeadDialog
        kind="telc"
        item={bookExam}
        title={lang === 'ar' ? `حجز امتحان ${bookExam.type}` : `Prüfungsanmeldung ${bookExam.type}`}
        subtitle={`${bookExam.date} · ${bookExam.time}`}
        endpoint="/api/telc-bookings"
        payload={{ examId: bookExam.id }}
        user={user}
        lang={lang}
        onClose={() => setBookExam(null)}
      />}
    </section>
  )
}

// ===== Shared Public Lead Dialog (used by Course/Telc registration when not logged in) =====
function PublicLeadDialog({ kind, item, title, subtitle, endpoint, payload, user, lang, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, ...form }),
      })
      const d = await r.json()
      if (d.error) {
        toast.error(d.error)
        setSubmitting(false)
      } else {
        setSuccess(true)
        setSubmitting(false)
        toast.success(lang === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Anfrage erhalten!')
      }
    } catch {
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'Fehler')
      setSubmitting(false)
    }
  }
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-lg">{lang === 'ar' ? 'تم استلام طلبك!' : 'Ihre Anfrage wurde empfangen!'}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {lang === 'ar'
                ? 'سيتواصل معك أحد مستشارينا خلال 24 ساعة عمل لتأكيد التسجيل وإرسال تفاصيل الدفع وحساب الدخول.'
                : 'Ein Berater meldet sich innerhalb von 24 Stunden bei Ihnen.'}
            </p>
            <Button onClick={onClose} className="btn-primary mt-2">{lang === 'ar' ? 'إغلاق' : 'Schließen'}</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-xs text-neutral-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5 leading-relaxed">
              💡 {lang === 'ar'
                ? 'بعد استلام طلبك، سيتواصل معك المستشار لتأكيد التسجيل وإرسال بيانات الدخول لحسابك الطلابي.'
                : 'Nach Eingang erhalten Sie Ihre Login-Daten vom Berater.'}
            </p>
            <div>
              <Label className="text-xs">{lang === 'ar' ? 'الاسم الكامل' : 'Voller Name'} <span className="text-red-600">*</span></Label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={lang === 'ar' ? 'مثال: أحمد محمد' : 'z.B. Ahmad M.'} />
            </div>
            <div>
              <Label className="text-xs">{lang === 'ar' ? 'البريد الإلكتروني' : 'E-Mail'} <span className="text-red-600">*</span></Label>
              <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div>
              <Label className="text-xs">{lang === 'ar' ? 'رقم الهاتف / WhatsApp' : 'Telefon / WhatsApp'} <span className="text-red-600">*</span></Label>
              <Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+963 ..." dir="ltr" />
            </div>
            <div>
              <Label className="text-xs">{lang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Anmerkungen (optional)'}</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={lang === 'ar' ? 'مستواك الحالي، وقت الدوام المفضل...' : 'Aktueller Level, bevorzugte Zeiten...'} />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>{lang === 'ar' ? 'إلغاء' : 'Abbrechen'}</Button>
              <Button type="submit" className="btn-primary" disabled={submitting}>{submitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'Senden...') : (lang === 'ar' ? 'إرسال الطلب' : 'Anfrage senden')}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Vocational({ t, lang, user }) {
  const [jobs, setJobs] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  useEffect(() => { fetch('/api/vocational/jobs').then(r => r.json()).then(d => setJobs(d.jobs || [])) }, [])
  const submit = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/vocational/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: selected.id, jobTitle: lang === 'ar' ? selected.title_ar : selected.title_de, ...form }) })
    const d = await r.json()
    if (d.error) toast.error(d.error); else { toast.success(lang === 'ar' ? 'تم إرسال طلبك!' : 'Gesendet!'); setSelected(null); setForm({ name: '', email: '', phone: '', notes: '' }) }
  }
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <PageHero img={TVTOWER_IMG} title={t.voc.title} sub={t.voc.sub} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(j => (
            <Card key={j.id} className="card-hover">
              <div className="h-2 flag-gradient-h" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3"><Badge className="bg-[#2C5F9E] text-white hover:bg-[#2C5F9E]">{j.partner}</Badge><Briefcase className="w-5 h-5 text-[#CC0000]" /></div>
                <h3 className="text-lg font-black mb-3">{lang === 'ar' ? j.title_ar : j.title_de}</h3>
                <div className="space-y-2 text-sm mb-4">
                  <Row icon={Clock} label={t.courses.duration} val={lang === 'ar' ? j.duration_ar : j.duration_de} />
                  <Row icon={Euro} label={t.voc.salary} val={j.salary} />
                  <Row icon={CheckCircle2} label={t.voc.requirements} val={lang === 'ar' ? j.requirements_ar : j.requirements_de} />
                </div>
                <button onClick={() => { setSelected(j); setForm(f => ({ ...f, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })) }} className="w-full btn-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"><Send className="w-4 h-4" />{t.voc.apply}</button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent dir={t.dir}>
            <DialogHeader><DialogTitle>{t.voc.apply} — {selected && (lang === 'ar' ? selected.title_ar : selected.title_de)}</DialogTitle><DialogDescription>{selected?.partner}</DialogDescription></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div><Label>{t.auth.name}</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t.auth.email}</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>{t.auth.phone}</Label><Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>{lang === 'ar' ? 'ملاحظات' : 'Notizen'}</Label><Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <DialogFooter><Button type="submit" className="btn-primary">{t.contact.send}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}

function Travel({ t, lang, user }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', visaType: 'study', preferredDate: '', notes: '' })
  useEffect(() => { if (user) setForm(f => ({ ...f, name: user.name, email: user.email, phone: user.phone || '' })) }, [user])
  const submit = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/travel/consultations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (d.error) toast.error(d.error); else { toast.success(lang === 'ar' ? 'تم الحجز!' : 'Gebucht!'); setForm({ name: '', email: '', phone: '', visaType: 'study', preferredDate: '', notes: '' }) }
  }
  const visas = [{ k: 'study', t_ar: 'تأشيرة دراسة', t_de: 'Studentenvisum', d_ar: 'للقبول الجامعي والكورسات', d_de: 'Universität & Sprachkurse', icon: GraduationCap }, { k: 'work', t_ar: 'تأشيرة عمل', t_de: 'Arbeitsvisum', d_ar: 'للعقود المهنية (Blue Card)', d_de: 'Arbeitsverträge (Blue Card)', icon: Briefcase }, { k: 'ausbildung', t_ar: 'تأشيرة تدريب مهني', t_de: 'Ausbildungsvisum', d_ar: 'لعقود Ausbildung', d_de: 'Ausbildungsverträge', icon: Trophy }, { k: 'family', t_ar: 'لمّ شمل', t_de: 'Familienzusammenführung', d_ar: 'انضمام عائلي', d_de: 'Familienangehörige', icon: Users }]
  const faqs = [{ q_ar: 'كم يستغرق الحصول على تأشيرة الدراسة؟', q_de: 'Dauer Studentenvisum?', a_ar: '6-12 أسبوع.', a_de: '6-12 Wochen.' }, { q_ar: 'هل يجب فتح حساب مسدود؟', q_de: 'Sperrkonto nötig?', a_ar: 'نعم، €11,208 لعام 2026.', a_de: 'Ja, €11.208 (2026).' }, { q_ar: 'ما المستوى اللغوي للدراسة؟', q_de: 'Sprachniveau?', a_ar: 'B2 على الأقل.', a_de: 'Mindestens B2.' }, { q_ar: 'هل ترتّبون موعد السفارة؟', q_de: 'Botschaftstermin?', a_ar: 'نعم.', a_de: 'Ja.' }]
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <PageHero img={HERO_NIGHT} title={t.travel.title} sub={t.travel.sub} />
        <h3 className="text-2xl font-black mb-6">{t.travel.types}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {visas.map(v => (<Card key={v.k} className="card-hover"><CardContent className="p-6"><div className="w-12 h-12 rounded-xl bg-[#CC0000]/10 flex items-center justify-center mb-4"><v.icon className="w-6 h-6 text-[#CC0000]" /></div><h4 className="font-black mb-2">{lang === 'ar' ? v.t_ar : v.t_de}</h4><p className="text-sm text-neutral-600">{lang === 'ar' ? v.d_ar : v.d_de}</p></CardContent></Card>))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-2 border-[#FFCE00]/30">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#CC0000]" />{t.travel.book}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-3">
                <div><Label>{t.auth.name}</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid sm:grid-cols-2 gap-3"><div><Label>{t.auth.email}</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div><div><Label>{t.auth.phone}</Label><Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div></div>
                <div><Label>{lang === 'ar' ? 'نوع التأشيرة' : 'Visa-Art'}</Label><Select value={form.visaType} onValueChange={(v) => setForm({ ...form, visaType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{visas.map(v => <SelectItem key={v.k} value={v.k}>{lang === 'ar' ? v.t_ar : v.t_de}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>{lang === 'ar' ? 'التاريخ المفضل' : 'Wunschdatum'}</Label><Input type="date" value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} /></div>
                <div><Label>{lang === 'ar' ? 'ملاحظات' : 'Notizen'}</Label><Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full btn-primary py-2.5 font-bold">{t.travel.book}</Button>
              </form>
            </CardContent>
          </Card>
          <div>
            <h3 className="text-2xl font-black mb-4">{t.travel.faq}</h3>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((f, i) => (<AccordionItem key={i} value={`q${i}`} className="bg-white border rounded-xl px-4"><AccordionTrigger className="text-start font-bold">{lang === 'ar' ? f.q_ar : f.q_de}</AccordionTrigger><AccordionContent>{lang === 'ar' ? f.a_ar : f.a_de}</AccordionContent></AccordionItem>))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

function About({ t, lang }) {
  const [hero, setHero] = useState({})
  const [mission, setMission] = useState({})
  const [team, setTeam] = useState([])
  const [accred, setAccred] = useState([])
  useEffect(() => {
    fetchContent('about_hero').then(setHero)
    fetchContent('about_mission').then(setMission)
    fetchList('team-members').then(setTeam)
    fetchList('partnerships').then(setAccred)
  }, [])
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <PageHero img={HERO_IMG} title={hero.title || t.about.title} sub={hero.subtitle || (lang === 'ar' ? 'منذ 2018 — جسر بين سوريا وألمانيا' : 'Seit 2018')} />

        {mission.story && (
          <Card className="mb-6"><CardContent className="p-8"><h3 className="text-2xl font-black mb-4">{mission.storyTitle || t.about.story}</h3><p className="text-neutral-700 leading-loose whitespace-pre-line">{mission.story}</p></CardContent></Card>
        )}
        {(mission.mission || mission.vision) && (
          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {mission.mission && (<Card><CardContent className="p-7"><div className="w-12 h-12 rounded-xl bg-[#CC0000]/10 flex items-center justify-center mb-4"><Star className="w-6 h-6 text-[#CC0000]" /></div><h4 className="font-bold text-lg mb-2">{mission.missionTitle || 'رسالتنا'}</h4><p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">{mission.mission}</p></CardContent></Card>)}
            {mission.vision && (<Card><CardContent className="p-7"><div className="w-12 h-12 rounded-xl bg-[#FFCE00]/30 flex items-center justify-center mb-4"><Trophy className="w-6 h-6 text-[#1A1A1A]" /></div><h4 className="font-bold text-lg mb-2">{mission.visionTitle || 'رؤيتنا'}</h4><p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">{mission.vision}</p></CardContent></Card>)}
          </div>
        )}

        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-black mb-2">{mission.teamTitle || t.about.team}</h3>
          <div className="w-20 h-1 bg-[#CC0000] mx-auto rounded-full" />
        </div>
        {team.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 max-w-md mx-auto bg-neutral-50 rounded-2xl border border-dashed mb-12">سيتم نشر فريق العمل قريباً</div>
        ) : (
          <div className={`grid gap-5 mb-16 mx-auto ${team.length === 1 ? 'max-w-sm grid-cols-1' : team.length === 2 ? 'max-w-2xl grid-cols-1 sm:grid-cols-2' : team.length === 3 ? 'max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
            {team.map((m) => (
              <Card key={m.id} className="card-hover overflow-hidden group">
                <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 relative">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#CC0000] to-[#FFCE00] text-white font-black text-6xl">{m.name?.charAt(0)}</div>
                  )}
                </div>
                <CardContent className="p-5 text-center">
                  <div className="font-bold text-base mb-1">{m.name}</div>
                  <div className="text-sm text-[#CC0000] font-semibold mb-2">{m.role}</div>
                  {m.bio && <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">{m.bio}</p>}
                  {(m.linkedIn || m.email) && (
                    <div className="flex gap-3 mt-3 pt-3 border-t justify-center">
                      {m.linkedIn && <a href={m.linkedIn} target="_blank" rel="noreferrer" className="text-xs text-[#2C5F9E] font-semibold hover:underline">LinkedIn</a>}
                      {m.email && <a href={`mailto:${m.email}`} className="text-xs text-neutral-600 hover:text-[#CC0000]">{m.email}</a>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-black mb-2">{mission.accredTitle || t.about.accred}</h3>
          <div className="w-20 h-1 bg-[#FFCE00] mx-auto rounded-full" />
        </div>
        {accred.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 max-w-md mx-auto bg-neutral-50 rounded-2xl border border-dashed">سيتم نشر الاعتمادات قريباً</div>
        ) : (
          <div className={`grid gap-4 mx-auto ${accred.length <= 3 ? 'max-w-3xl grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
            {accred.map((a) => {
              const inner = (
                <Card className="card-hover h-full overflow-hidden">
                  <CardContent className="p-5 flex flex-col items-center justify-center gap-3 h-full min-h-[140px]">
                    {a.logo ? (
                      <div className="h-16 w-full flex items-center justify-center"><img src={a.logo} alt={a.name} className="max-h-16 max-w-full object-contain" /></div>
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#CC0000]/10 to-[#FFCE00]/20 flex items-center justify-center"><Award className="w-8 h-8 text-[#CC0000]" /></div>
                    )}
                    <div className="text-xs font-bold text-center text-neutral-700">{a.name}</div>
                  </CardContent>
                </Card>
              )
              return a.link ? <a key={a.id} href={a.link} target="_blank" rel="noreferrer" className="block">{inner}</a> : <div key={a.id}>{inner}</div>
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function Contact({ t, lang }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const submit = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (d.error) toast.error(d.error); else { toast.success(lang === 'ar' ? 'تم الإرسال!' : 'Gesendet!'); setForm({ name: '', email: '', message: '' }) }
  }
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <PageHero img={LEHRER_IMG} title={t.contact.title} sub={lang === 'ar' ? 'نحن هنا لإجابتك' : 'Wir sind für Sie da'} />
        <div className="grid lg:grid-cols-2 gap-8">
          <Card><CardHeader><CardTitle>{lang === 'ar' ? 'أرسل رسالة' : 'Nachricht'}</CardTitle></CardHeader><CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div><Label>{t.contact.name}</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t.contact.email}</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>{t.contact.message}</Label><Textarea rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
              <Button type="submit" className="w-full btn-primary py-2.5 font-bold flex items-center justify-center gap-2"><Send className="w-4 h-4" />{t.contact.send}</Button>
            </form>
          </CardContent></Card>
          <div className="space-y-4">
            <Card><CardContent className="p-6 flex gap-4 items-start"><div className="w-12 h-12 rounded-xl bg-[#CC0000]/10 flex items-center justify-center shrink-0"><MapPin className="w-6 h-6 text-[#CC0000]" /></div><div><div className="font-bold mb-1">{t.contact.address}</div><div className="text-sm text-neutral-600">{lang === 'ar' ? 'دمشق — المزة' : 'Damaskus — Mazzeh'}</div></div></CardContent></Card>
            <Card><CardContent className="p-6 flex gap-4 items-start"><div className="w-12 h-12 rounded-xl bg-[#FFCE00]/30 flex items-center justify-center shrink-0"><Clock className="w-6 h-6 text-[#1A1A1A]" /></div><div><div className="font-bold mb-1">{t.contact.hours}</div><div className="text-sm text-neutral-600">{lang === 'ar' ? 'السبت - الخميس: 9:00 ص - 9:00 م' : 'Sa-Do: 9-21'}</div></div></CardContent></Card>
            <Card><CardContent className="p-6 flex gap-4 items-start"><div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0"><MessageCircle className="w-6 h-6 text-green-600" /></div><div className="flex-1"><div className="font-bold mb-1">{t.contact.whatsapp}</div><div className="text-sm text-neutral-600 mb-2" dir="ltr">{process.env.NEXT_PUBLIC_PHONE || '+963 11 123 4567'}</div><a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '963111234567'}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600"><MessageCircle className="w-4 h-4" />{lang === 'ar' ? 'افتح المحادثة' : 'Chat'}</a></div></CardContent></Card>
            <Card><CardContent className="p-6 flex gap-4 items-start"><div className="w-12 h-12 rounded-xl bg-[#2C5F9E]/10 flex items-center justify-center shrink-0"><Mail className="w-6 h-6 text-[#2C5F9E]" /></div><div><div className="font-bold mb-1">Email</div><a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'info@dasdeutschehaus.sy'}`} className="text-sm text-neutral-600 hover:text-[#2C5F9E]" dir="ltr">{process.env.NEXT_PUBLIC_EMAIL || 'info@dasdeutschehaus.sy'}</a></div></CardContent></Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function Dashboard({ t, lang, user, setAuthMode }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!user) { setAuthMode('login'); return }
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [user, setAuthMode])
  if (!user) return <section className="py-20 text-center"><p>{lang === 'ar' ? 'يرجى تسجيل الدخول' : 'Bitte anmelden'}</p></section>
  if (loading || !data) return <Loading t={t} />
  const updatePhoto = async (photo) => {
    await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photo }) })
    setData({ ...data, user: { ...data.user, photo } })
    toast.success(lang === 'ar' ? 'تم تحديث الصورة' : 'Foto aktualisiert')
  }
  const removePhoto = async () => {
    if (data.user.photo?.public_id) {
      await fetch('/api/cloudinary/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: data.user.photo.public_id, resource_type: 'image' }) })
    }
    await updatePhoto(null)
  }
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <Card className="mb-8 overflow-hidden border-2 border-[#FFCE00]/40"><div className="h-2 flag-gradient-h" />
          <CardContent className="p-7 flex items-center gap-5 flex-wrap">
            <div className="relative group">
              {data.user.photo?.url ? (
                <img src={data.user.photo.url} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-[#FFCE00]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1A1A1A] via-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-3xl font-black shadow-xl">{user.name?.charAt(0)?.toUpperCase()}</div>
              )}
              <ProfilePhotoUploader user={data.user} onUploaded={(u) => updatePhoto({ url: u.url, public_id: u.public_id })} onRemove={data.user.photo?.url ? removePhoto : null} />
            </div>
            <div className="flex-1"><div className="text-sm text-neutral-500">{t.dash.welcome}</div><h2 className="text-2xl font-black">{user.name}</h2><div className="text-sm text-neutral-600">{user.email}</div></div>
            <Badge className="bg-[#CC0000] text-white hover:bg-[#CC0000]"><User className="w-3 h-3 me-1" />Student</Badge>
          </CardContent>
        </Card>
        <Tabs defaultValue="courses">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="courses"><BookOpen className="w-4 h-4 me-1.5" />{t.dash.myCourses} ({data.registrations?.length || 0})</TabsTrigger>
            <TabsTrigger value="exams"><Award className="w-4 h-4 me-1.5" />{t.dash.myExams} ({data.telc_bookings?.length || 0})</TabsTrigger>
            <TabsTrigger value="apps"><Briefcase className="w-4 h-4 me-1.5" />{t.dash.myApps} ({data.vocational_applications?.length || 0})</TabsTrigger>
            <TabsTrigger value="travel"><Plane className="w-4 h-4 me-1.5" />{t.dash.myConsult} ({data.travel_consultations?.length || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="courses">
            {data.registrations?.length ? <div className="grid md:grid-cols-2 gap-4">{data.registrations.map(r => (<StudentCourseCard key={r.id} reg={r} lang={lang} />))}</div> : <Empty t={t} />}
          </TabsContent>
          <TabsContent value="exams">{data.telc_bookings?.length ? <div className="grid md:grid-cols-2 gap-4">{data.telc_bookings.map(b => (<Card key={b.id}><CardContent className="p-5"><Badge className="bg-[#CC0000] text-white mb-2">{b.type}</Badge><div className="text-sm"><Calendar className="w-4 h-4 inline me-1" />{b.date}</div><div className="text-sm">${b.price_usd} · {b.status}</div></CardContent></Card>))}</div> : <Empty t={t} />}</TabsContent>
          <TabsContent value="apps">{data.vocational_applications?.length ? <div className="grid md:grid-cols-2 gap-4">{data.vocational_applications.map(a => (<Card key={a.id}><CardContent className="p-5"><h4 className="font-bold mb-1">{a.jobTitle}</h4><div className="text-sm">{a.status} · {new Date(a.createdAt).toLocaleDateString()}</div></CardContent></Card>))}</div> : <Empty t={t} />}</TabsContent>
          <TabsContent value="travel">{data.travel_consultations?.length ? <div className="grid md:grid-cols-2 gap-4">{data.travel_consultations.map(c => (<Card key={c.id}><CardContent className="p-5"><h4 className="font-bold mb-1">{c.visaType}</h4><div className="text-sm">{c.preferredDate || '-'} · {c.status}</div></CardContent></Card>))}</div> : <Empty t={t} />}</TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function StudentCourseCard({ reg, lang }) {
  const [open, setOpen] = useState(false)
  return (<>
    <Card className="card-hover cursor-pointer" onClick={() => setOpen(true)}><CardContent className="p-5">
      <div className="flex items-center justify-between mb-2"><Badge className="bg-[#1A1A1A] text-white font-black">{reg.level}</Badge><Badge variant="outline" className="border-amber-500 text-amber-700">{reg.status}</Badge></div>
      <h4 className="font-bold mb-1">{reg.course && (lang === 'ar' ? reg.course.title_ar : reg.course.title_de)}</h4>
      <div className="text-sm text-neutral-600">${reg.price_usd} · {reg.course?.start_date}</div>
      <Button className="mt-3 w-full" variant="outline" size="sm"><Eye className="w-4 h-4 me-1.5" />فتح الكورس</Button>
    </CardContent></Card>
    {open && <StudentCourseView reg={reg} lang={lang} onClose={() => setOpen(false)} />}
  </>)
}

function StudentCourseView({ reg, lang, onClose }) {
  const [data, setData] = useState(null)
  const [chat, setChat] = useState([])
  const [chatText, setChatText] = useState('')
  const courseId = reg.courseId
  const refresh = useCallback(() => {
    fetch(`/api/student/courses/${courseId}/overview`).then(r => r.json()).then(setData)
    fetch(`/api/student/courses/${courseId}/chat`).then(r => r.json()).then(d => setChat(d.messages || []))
  }, [courseId])
  useEffect(() => { refresh() }, [refresh])
  const sendMsg = async () => {
    if (!chatText.trim()) return
    await fetch(`/api/student/courses/${courseId}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: chatText }) })
    setChatText(''); refresh()
  }
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Badge className="bg-[#1A1A1A] text-white">{reg.level}</Badge> {reg.course?.title_ar}</DialogTitle></DialogHeader>
        {!data ? <Loading t={T.ar} /> : (
          <Tabs defaultValue="materials">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="materials"><FileText className="w-4 h-4 me-1" />المواد</TabsTrigger>
              <TabsTrigger value="sessions"><Video className="w-4 h-4 me-1" />الجلسات</TabsTrigger>
              <TabsTrigger value="grades"><Trophy className="w-4 h-4 me-1" />درجاتي</TabsTrigger>
              <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 me-1" />محادثة المعلم</TabsTrigger>
            </TabsList>
            <TabsContent value="materials" className="space-y-2">
              {data.announcements?.length > 0 && <Card className="border-2 border-[#FFCE00] bg-yellow-50"><CardContent className="p-4"><div className="font-bold flex items-center gap-2 mb-2"><Megaphone className="w-4 h-4 text-[#CC0000]" />الإعلانات</div>{data.announcements.map(a => <div key={a.id} className="text-sm py-1.5 border-t pt-2 mt-2"><div>{a.text}</div><div className="text-xs text-neutral-500 mt-1">{a.fromName} · {new Date(a.createdAt).toLocaleString('ar')}</div></div>)}</CardContent></Card>}
              {data.materials?.length ? data.materials.map(m => (<Card key={m.id}><CardContent className="p-3 flex items-center gap-3"><FileText className="w-5 h-5 text-[#CC0000]" /><div className="flex-1"><div className="font-bold text-sm">{m.title}</div><div className="text-xs text-neutral-500">{m.type} · {m.uploadedByName}</div></div><a href={m.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#CC0000] hover:underline">فتح</a></CardContent></Card>)) : <Empty t={T.ar} />}
            </TabsContent>
            <TabsContent value="sessions" className="space-y-2">
              {data.sessions?.length ? data.sessions.map(s => (<Card key={s.id}><CardContent className="p-3 flex items-center gap-3"><Calendar className="w-5 h-5 text-[#CC0000]" /><div className="flex-1"><div className="font-bold text-sm">{s.title}</div><div className="text-xs text-neutral-500">{s.date} · {s.time}</div></div>{s.zoomLink && <a href={s.zoomLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-[#2C5F9E] text-white text-xs font-bold flex items-center gap-1"><Video className="w-3 h-3" />Zoom</a>}</CardContent></Card>)) : <Empty t={T.ar} />}
            </TabsContent>
            <TabsContent value="grades" className="space-y-2">
              {data.grades?.length ? data.grades.map(g => (<Card key={g.id}><CardContent className="p-4 flex items-center justify-between"><div><div className="font-bold">الدرجة: {g.grade}</div><div className="text-sm text-neutral-600">{g.comment}</div></div><div className="text-xs text-neutral-500">{new Date(g.createdAt).toLocaleDateString('ar')}</div></CardContent></Card>)) : <Empty t={T.ar} />}
            </TabsContent>
            <TabsContent value="chat">
              <ScrollArea className="h-72 border rounded-lg p-3 bg-neutral-50 mb-3">
                {chat.length === 0 ? <div className="text-center text-neutral-500 py-8">ابدأ المحادثة</div> : chat.map(m => (<div key={m.id} className={`mb-2 flex ${m.fromRole === 'student' ? 'justify-end' : 'justify-start'}`}><div className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${m.fromRole === 'student' ? 'bg-[#CC0000] text-white' : 'bg-white border'}`}><div>{m.text}</div><div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString('ar')}</div></div></div>))}
              </ScrollArea>
              <div className="flex gap-2"><Input value={chatText} onChange={e => setChatText(e.target.value)} placeholder="رسالتك..." onKeyDown={e => e.key === 'Enter' && sendMsg()} /><Button onClick={sendMsg} className="btn-primary"><Send className="w-4 h-4" /></Button></div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ==================== ADMIN PANEL ====================
function AdminPanel({ user }) {
  return (
    <section className="py-8 bg-gradient-to-br from-neutral-50 to-white min-h-screen" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h1 className="text-3xl font-black flex items-center gap-2"><Shield className="w-8 h-8 text-[#CC0000]" />لوحة الإدارة العليا</h1><p className="text-neutral-600 text-sm mt-1">مرحباً {user.name} — صلاحيات كاملة</p></div>
          <Badge className="bg-[#CC0000] text-white text-base px-4 py-1.5"><Shield className="w-4 h-4 me-1.5" />Super Admin</Badge>
        </div>
        <Tabs defaultValue="inbox">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-13 gap-2 mb-6 h-auto bg-transparent p-0">
            <TabsTrigger
              value="inbox"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white text-red-700 font-bold text-xs hover:border-red-400 hover:bg-red-100/50 transition-all data-[state=active]:bg-[#CC0000] data-[state=active]:text-white data-[state=active]:border-[#CC0000] data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] relative"
            >
              <Inbox className="w-5 h-5" />
              <span>الواردات</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-emerald-300 hover:bg-emerald-50/50 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <DollarSign className="w-5 h-5" />
              <span>الإحصائيات</span>
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-[#FFCE00] hover:bg-yellow-50/50 transition-all data-[state=active]:bg-[#FFCE00] data-[state=active]:text-[#1A1A1A] data-[state=active]:border-[#FFCE00] data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <BookOpen className="w-5 h-5" />
              <span>كورسات اللغة</span>
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-amber-400 hover:bg-amber-50/50 transition-all data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:border-amber-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <Briefcase className="w-5 h-5" />
              <span>Ausbildung</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-blue-300 hover:bg-blue-50/50 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <Users className="w-5 h-5" />
              <span>المستخدمون</span>
            </TabsTrigger>
            <TabsTrigger
              value="assign"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-purple-300 hover:bg-purple-50/50 transition-all data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:border-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <GraduationCap className="w-5 h-5" />
              <span>تعيين معلمين</span>
            </TabsTrigger>
            <TabsTrigger
              value="blog"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-[#CC0000]/40 hover:bg-red-50/50 transition-all data-[state=active]:bg-[#CC0000] data-[state=active]:text-white data-[state=active]:border-[#CC0000] data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <span className="text-lg leading-none">📰</span>
              <span>المدوّنة</span>
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-neutral-700 hover:bg-neutral-100 transition-all data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:border-[#1A1A1A] data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <span className="text-lg leading-none">🗓️</span>
              <span>النشاطات</span>
            </TabsTrigger>
            <TabsTrigger
              value="german"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-[#FFCE00] hover:bg-yellow-50 transition-all data-[state=active]:bg-[#FFCE00] data-[state=active]:text-[#1A1A1A] data-[state=active]:border-[#FFCE00] data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <span className="text-lg leading-none">🇩🇪</span>
              <span>الزوار الألمان</span>
            </TabsTrigger>
            <TabsTrigger
              value="legal"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-neutral-500 hover:bg-neutral-100 transition-all data-[state=active]:bg-neutral-700 data-[state=active]:text-white data-[state=active]:border-neutral-700 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <span className="text-lg leading-none">⚖️</span>
              <span>القانونية</span>
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-orange-300 hover:bg-orange-50/50 transition-all data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <Activity className="w-5 h-5" />
              <span>سجل النشاط</span>
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-pink-300 hover:bg-pink-50/50 transition-all data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:border-pink-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <span className="text-lg leading-none">📝</span>
              <span>محتوى الصفحات</span>
            </TabsTrigger>
            <TabsTrigger
              value="emails"
              className="flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 border-neutral-200 bg-white text-neutral-700 font-bold text-xs hover:border-cyan-300 hover:bg-cyan-50/50 transition-all data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:border-cyan-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
            >
              <Mail className="w-5 h-5" />
              <span>سجل الإيميلات</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inbox"><InboxAdminPanel /></TabsContent>
          <TabsContent value="stats"><AdminStats /></TabsContent>
          <TabsContent value="courses"><CoursesAdminPanel /></TabsContent>
          <TabsContent value="jobs"><JobsAdminPanel /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="assign"><AdminAssignTeachers /></TabsContent>
          <TabsContent value="blog"><BlogAdminPanel /></TabsContent>
          <TabsContent value="activities"><ActivitiesAdminPanel /></TabsContent>
          <TabsContent value="german"><GermanAdminPanel /></TabsContent>
          <TabsContent value="legal"><LegalPagesAdminPanel /></TabsContent>
          <TabsContent value="logs"><AdminActivityLogs /></TabsContent>
          <TabsContent value="content"><SiteContentAdminPanel /></TabsContent>
          <TabsContent value="emails"><EmailLogsAdminPanel /></TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function AdminStats() {
  const [s, setS] = useState(null)
  useEffect(() => { fetch('/api/admin/stats').then(r => r.json()).then(setS) }, [])
  if (!s) return <Loading t={T.ar} />
  const cards = [
    { l: 'إجمالي المستخدمين', v: s.users, icon: Users, c: '#1A1A1A' },
    { l: 'تسجيلات الكورسات', v: s.courseRegistrations, icon: BookOpen, c: '#CC0000' },
    { l: 'حجوزات telc', v: s.telcBookings, icon: Award, c: '#FFCE00' },
    { l: 'طلبات Ausbildung', v: s.vocationalApps, icon: Briefcase, c: '#2C5F9E' },
    { l: 'استشارات السفر', v: s.consultations, icon: Plane, c: '#16a34a' },
    { l: 'رسائل التواصل', v: s.contactMessages, icon: Mail, c: '#9333ea' },
  ]
  return (<>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((c, i) => (<Card key={i} className="card-hover"><CardContent className="p-5 flex items-center justify-between"><div><div className="text-xs text-neutral-500 font-semibold">{c.l}</div><div className="text-3xl font-black mt-1">{c.v}</div></div><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${c.c}15` }}><c.icon className="w-6 h-6" style={{ color: c.c }} /></div></CardContent></Card>))}
    </div>
    <Card className="border-2 border-[#FFCE00]"><div className="h-2 flag-gradient-h" /><CardContent className="p-6"><h3 className="text-xl font-black mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#CC0000]" />التقرير المالي</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-50 rounded-xl"><div className="text-xs font-semibold text-neutral-500">إيرادات الكورسات</div><div className="text-2xl font-black text-[#1A1A1A] mt-1">${s.courseRevenue?.toLocaleString()}</div></div>
        <div className="p-4 bg-neutral-50 rounded-xl"><div className="text-xs font-semibold text-neutral-500">إيرادات الامتحانات</div><div className="text-2xl font-black text-[#CC0000] mt-1">${s.examRevenue?.toLocaleString()}</div></div>
        <div className="p-4 bg-gradient-to-br from-[#FFCE00] to-amber-300 rounded-xl"><div className="text-xs font-semibold">الإجمالي</div><div className="text-2xl font-black text-[#1A1A1A] mt-1">${s.totalRevenue?.toLocaleString()}</div></div>
      </div>
    </CardContent></Card>
    <Card className="mt-4"><CardContent className="p-6"><h3 className="font-black mb-3">المستخدمون حسب الدور</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{s.byRole?.map(r => (<div key={r._id} className="p-3 border rounded-lg text-center"><div className="text-2xl font-black">{r.count}</div><div className="text-xs text-neutral-500 mt-1">{r._id}</div></div>))}</div></CardContent></Card>
  </>)
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [credentials, setCredentials] = useState(null) // { name, email, password, emailStatus }
  const refresh = () => fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []))
  useEffect(() => { refresh() }, [])
  const toggle = async (u) => {
    await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disabled: !u.disabled }) })
    toast.success(u.disabled ? 'تم التفعيل' : 'تم التعطيل'); refresh()
  }
  const del = async (u) => {
    await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    toast.success('تم الحذف'); refresh(); setConfirm(null)
  }
  const roleLabel = { super_admin: 'مدير عام', manager: 'مدير', teacher: 'معلم', student: 'طالب' }
  const roleColor = { super_admin: 'bg-[#CC0000]', manager: 'bg-[#2C5F9E]', teacher: 'bg-[#FFCE00] text-[#1A1A1A]', student: 'bg-neutral-700' }
  return (<>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
      <h3 className="text-xl font-black">إدارة المستخدمين ({users.length})</h3>
      <Button onClick={() => setCreating(true)} className="btn-primary"><UserPlus className="w-4 h-4 me-1.5" />إنشاء مستخدم</Button>
    </div>
    <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[640px]">
      <thead className="bg-neutral-50 border-b"><tr><th className="text-start p-3 font-bold">الاسم</th><th className="text-start p-3 font-bold">البريد</th><th className="text-start p-3 font-bold">الدور</th><th className="text-start p-3 font-bold">الحالة</th><th className="text-start p-3 font-bold">إجراءات</th></tr></thead>
      <tbody>{users.map(u => (<tr key={u.id} className="border-b hover:bg-neutral-50">
        <td className="p-3 font-semibold">{u.name}</td>
        <td className="p-3 text-neutral-600">{u.email}</td>
        <td className="p-3"><Badge className={`${roleColor[u.role]} text-white`}>{roleLabel[u.role]}</Badge></td>
        <td className="p-3"><Switch checked={!u.disabled} onCheckedChange={() => toggle(u)} /></td>
        <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEditing(u)}><Pencil className="w-3.5 h-3.5" /></Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirm(u)}><Trash2 className="w-3.5 h-3.5" /></Button></div></td>
      </tr>))}</tbody>
    </table></div></CardContent></Card>
    {creating && <UserFormDialog onClose={() => setCreating(false)} onSaved={(r) => { refresh(); setCreating(false); if (r?.createdPassword) setCredentials({ name: r.user.name, email: r.user.email, phone: r.user.phone, password: r.createdPassword, emailStatus: r.emailStatus }) }} />}
    {editing && <UserFormDialog user={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    {confirm && <ConfirmDialog title="حذف المستخدم" desc={`هل أنت متأكد من حذف ${confirm.name}؟ لا يمكن التراجع.`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    {credentials && <CredentialsDialog data={credentials} onClose={() => setCredentials(null)} />}
  </>)
}

function CredentialsDialog({ data, onClose }) {
  const { name, email, phone, password, emailStatus } = data
  const [copied, setCopied] = useState(false)
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('تم النسخ ✓')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('فشل النسخ — يمكنك تحديده يدوياً')
    }
  }
  const message = `مرحباً ${name} 👋\n\nتم إنشاء حسابك في Das Deutsche Haus.\n\n🔐 بيانات الدخول:\n📧 البريد: ${email}\n🔑 كلمة المرور: ${password}\n\n⚠️ يُرجى تغيير كلمة المرور بعد أول دخول.\n\nرابط الدخول: ${typeof window !== 'undefined' ? window.location.origin : ''}`
  const waPhone = (phone || '').replace(/[^0-9]/g, '')
  const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`
  const emailOk = emailStatus?.ok
  const emailSkipped = emailStatus?.skipped || (emailStatus?.error && /testing emails|verify a domain/i.test(emailStatus.error))

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#CC0000]">
            <KeyRound className="w-5 h-5" />
            تم إنشاء الحساب — احفظ بيانات الدخول
          </DialogTitle>
          <DialogDescription className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 text-[12.5px] font-semibold">
            ⚠️ هذه المعلومات تظهر مرة واحدة فقط. الرجاء نسخها وإرسالها للمستخدم.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase text-neutral-500">الاسم</Label>
            <div className="p-2.5 bg-neutral-100 rounded-lg font-semibold">{name}</div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase text-neutral-500">البريد الإلكتروني</Label>
            <div className="flex gap-2">
              <div className="flex-1 p-2.5 bg-neutral-100 rounded-lg font-mono text-sm" dir="ltr">{email}</div>
              <Button type="button" size="sm" variant="outline" onClick={() => copy(email)}><Copy className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase text-neutral-500">كلمة المرور المؤقتة</Label>
            <div className="flex gap-2">
              <div className="flex-1 p-2.5 bg-gradient-to-r from-[#FFCE00]/20 to-[#CC0000]/10 border border-[#FFCE00] rounded-lg font-mono text-base font-bold tracking-wider" dir="ltr">{password}</div>
              <Button type="button" size="sm" variant="outline" onClick={() => copy(password)}><Copy className="w-4 h-4" /></Button>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">سيُطلب من المستخدم تغيير كلمة المرور بعد أول دخول.</p>
          </div>

          {emailStatus?.attempted && (
            <div className={`text-[12.5px] rounded-lg p-2.5 border ${emailOk ? 'bg-green-50 border-green-200 text-green-800' : emailSkipped ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {emailOk
                ? `✅ تم إرسال البيانات إلى ${email} عبر الإيميل.`
                : emailSkipped
                  ? `⚠️ لم يُرسَل الإيميل (الدومين غير مُتحقَّق منه في Resend). الرجاء إرسال البيانات يدوياً عبر WhatsApp.`
                  : `❌ فشل إرسال الإيميل: ${emailStatus.error || 'خطأ غير معروف'}`}
            </div>
          )}

          <div className="border-t pt-3 mt-2 space-y-2">
            <Label className="text-[11px] font-bold uppercase text-neutral-500">إرسال البيانات للمستخدم</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" onClick={() => copy(message)} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 me-1.5" />
                نسخ الرسالة كاملة
              </Button>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button type="button" className="w-full bg-[#25D366] hover:bg-[#1da851] text-white">
                  <MessageCircle className="w-4 h-4 me-1.5" />
                  إرسال عبر WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose} className="btn-primary">
            <CheckCircle2 className="w-4 h-4 me-1.5" />
            تم — لقد حفظت البيانات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UserFormDialog({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', password: '', role: user?.role || 'student' })
  const [autoGen, setAutoGen] = useState(true) // for new users, default to auto-generate
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users'
      const method = user ? 'PATCH' : 'POST'
      let body
      if (user) {
        body = { name: form.name, phone: form.phone, role: form.role, ...(form.password ? { password: form.password } : {}) }
      } else {
        // For new users: omit password if autoGen is on → backend will generate
        body = { name: form.name, email: form.email, phone: form.phone, role: form.role }
        if (!autoGen && form.password) body.password = form.password
      }
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (d.error) { toast.error(d.error); return }
      toast.success(user ? 'تم تحديث المستخدم' : 'تم إنشاء المستخدم ✓')
      onSaved(d)
    } catch (err) {
      toast.error('حدث خطأ — حاول مرة أخرى')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-[480px]">
        <DialogHeader><DialogTitle>{user ? 'تعديل المستخدم' : 'إنشاء مستخدم جديد'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>الاسم *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: أحمد محمد" /></div>
          {!user && <div><Label>البريد الإلكتروني *</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" dir="ltr" /></div>}
          <div><Label>رقم الهاتف (لإرسال البيانات عبر WhatsApp)</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+963 ..." dir="ltr" /></div>
          <div><Label>الدور *</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">طالب</SelectItem>
                <SelectItem value="teacher">معلم</SelectItem>
                <SelectItem value="manager">مدير</SelectItem>
                <SelectItem value="super_admin">مدير عام</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!user ? (
            <div className="bg-neutral-50 rounded-xl p-3 space-y-2.5 border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#CC0000]" />
                  <Label className="font-bold cursor-pointer" htmlFor="autoGen">توليد كلمة مرور تلقائياً</Label>
                </div>
                <Switch id="autoGen" checked={autoGen} onCheckedChange={setAutoGen} />
              </div>
              {autoGen ? (
                <p className="text-[12px] text-neutral-600 leading-relaxed">
                  ✨ سيتم إنشاء كلمة مرور قوية ومؤقتة تلقائياً، وعرضها لك في نافذة منبثقة لإرسالها للمستخدم عبر WhatsApp أو إيميل.
                </p>
              ) : (
                <div>
                  <Label className="text-[12px]">كلمة المرور (6 أحرف على الأقل)</Label>
                  <Input type="text" minLength={6} required={!autoGen} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" dir="ltr" />
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label>كلمة المرور (اتركها فارغة لعدم التغيير)</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" dir="ltr" />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>إلغاء</Button>
            <Button type="submit" className="btn-primary" disabled={busy}>
              {busy ? (
                <><RefreshCw className="w-4 h-4 me-1.5 animate-spin" />جاري الحفظ...</>
              ) : (
                <><Save className="w-4 h-4 me-1.5" />{user ? 'حفظ التعديلات' : 'إنشاء الحساب'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AdminAssignTeachers() {
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])
  const [sel, setSel] = useState(null)
  const [picked, setPicked] = useState([])
  const refresh = useCallback(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setTeachers((d.users || []).filter(u => u.role === 'teacher')))
    fetch('/api/courses').then(r => r.json()).then(d => setCourses(d.courses || []))
  }, [])
  useEffect(() => { refresh() }, [refresh])
  const open = (t) => { setSel(t); setPicked(t.assignedCourseIds || []) }
  const save = async () => {
    await fetch(`/api/admin/users/${sel.id}/assign-courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseIds: picked }) })
    toast.success('تم التعيين'); setSel(null); refresh()
  }
  return (<>
    <h3 className="text-xl font-black mb-4">تعيين المعلمين للكورسات</h3>
    {teachers.length === 0 ? <Empty t={T.ar} /> : (
      <div className="grid md:grid-cols-2 gap-4">{teachers.map(t => (
        <Card key={t.id}><CardContent className="p-5">
          <div className="flex items-center justify-between mb-3"><div><div className="font-bold">{t.name}</div><div className="text-sm text-neutral-500">{t.email}</div></div><GraduationCap className="w-6 h-6 text-[#FFCE00]" /></div>
          <div className="text-sm mb-3"><span className="font-semibold">الكورسات الحالية:</span> {(t.assignedCourseIds || []).length === 0 ? <span className="text-neutral-400">لا يوجد</span> : courses.filter(c => (t.assignedCourseIds || []).includes(c.id)).map(c => c.level).join(', ')}</div>
          <Button size="sm" onClick={() => open(t)} className="btn-primary"><Pencil className="w-3.5 h-3.5 me-1" />تعديل</Button>
        </CardContent></Card>
      ))}</div>
    )}
    {sel && (
      <Dialog open={true} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعيين كورسات لـ {sel.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-72 overflow-y-auto">{courses.map(c => (<label key={c.id} className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-neutral-50"><input type="checkbox" checked={picked.includes(c.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, c.id] : picked.filter(x => x !== c.id))} className="w-4 h-4" /><Badge className="bg-[#1A1A1A] text-white">{c.level}</Badge><span className="font-semibold flex-1">{c.title_ar}</span></label>))}</div>
          <DialogFooter><Button variant="outline" onClick={() => setSel(null)}>إلغاء</Button><Button onClick={save} className="btn-primary"><Save className="w-4 h-4 me-1.5" />حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </>)
}

function AdminActivityLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState({ user: '', action: '' })
  const [busy, setBusy] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmPurge, setConfirmPurge] = useState(false)
  const [purgeDays, setPurgeDays] = useState(30)

  const refresh = useCallback(() => {
    fetch('/api/admin/activity-logs')
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setTotal(d.total ?? (d.logs || []).length) })
  }, [])
  useEffect(() => { refresh() }, [refresh])

  const filtered = logs.filter(l =>
    (!filter.user || l.actorName?.toLowerCase().includes(filter.user.toLowerCase()) || l.actorRole?.toLowerCase().includes(filter.user.toLowerCase())) &&
    (!filter.action || l.action?.toLowerCase().includes(filter.action.toLowerCase()))
  )

  const deleteSingle = async (l) => {
    if (!l?.id) { toast.error('لا يمكن حذف هذا السجل (يفتقد المُعرِّف)'); return }
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/activity-logs/${l.id}`, { method: 'DELETE' })
      const d = await r.json()
      if (d.ok) { toast.success('تم الحذف'); refresh() } else toast.error(d.error || 'فشل الحذف')
    } finally { setBusy(false) }
  }

  const clearAll = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/admin/activity-logs/clear', { method: 'POST' })
      const d = await r.json()
      if (d.ok) { toast.success(`تم حذف ${d.deleted} سجل ✓`); refresh() } else toast.error('فشل الحذف')
    } catch { toast.error('حدث خطأ') } finally { setBusy(false); setConfirmClear(false) }
  }

  const purgeOld = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/admin/activity-logs/older-than', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: purgeDays }),
      })
      const d = await r.json()
      if (d.ok) { toast.success(`تم حذف ${d.deleted} سجل أقدم من ${d.olderThanDays} يوم ✓`); refresh() } else toast.error('فشل الحذف')
    } catch { toast.error('حدث خطأ') } finally { setBusy(false); setConfirmPurge(false) }
  }

  return (<>
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
      <div>
        <h3 className="text-xl font-black flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#CC0000]" />سجل النشاط ({filtered.length}{total > logs.length && ` / إجمالي ${total}`})
        </h3>
        <p className="text-[12.5px] text-neutral-500 mt-1">لتخفيف الحمل على قاعدة البيانات، احذف السجلات القديمة دورياً.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={refresh} disabled={busy}>
          <RefreshCw className={`w-3.5 h-3.5 me-1.5 ${busy ? 'animate-spin' : ''}`} />تحديث
        </Button>
        <Button variant="outline" size="sm" className="border-amber-400 text-amber-700 hover:bg-amber-50" onClick={() => setConfirmPurge(true)} disabled={busy || logs.length === 0}>
          <Clock className="w-3.5 h-3.5 me-1.5" />حذف السجلات القديمة
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setConfirmClear(true)} disabled={busy || logs.length === 0}>
          <Trash2 className="w-3.5 h-3.5 me-1.5" />حذف الكل
        </Button>
      </div>
    </div>

    <div className="flex gap-3 mb-4 flex-wrap">
      <Input placeholder="🔍 فلترة بالمستخدم..." value={filter.user} onChange={e => setFilter({ ...filter, user: e.target.value })} className="max-w-xs" />
      <Input placeholder="🔍 فلترة بالعملية..." value={filter.action} onChange={e => setFilter({ ...filter, action: e.target.value })} className="max-w-xs" />
    </div>

    {filtered.length === 0 ? (
      <Card><CardContent className="p-10 text-center text-neutral-500">
        <Activity className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="font-bold">{logs.length === 0 ? 'لا توجد سجلات نشاط' : 'لا نتائج مطابقة للفلتر'}</p>
      </CardContent></Card>
    ) : (
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]">
        <thead className="bg-neutral-50 border-b"><tr>
          <th className="text-start p-3 font-bold">التوقيت</th>
          <th className="text-start p-3 font-bold">المستخدم</th>
          <th className="text-start p-3 font-bold">الدور</th>
          <th className="text-start p-3 font-bold">العملية</th>
          <th className="text-start p-3 font-bold">العنصر</th>
          <th className="text-start p-3 font-bold">IP</th>
          <th className="text-start p-3 font-bold w-16">⚙️</th>
        </tr></thead>
        <tbody>{filtered.map(l => (
          <tr key={l.id || `${l.createdAt}-${l.action}`} className="border-b hover:bg-neutral-50">
            <td className="p-3 text-neutral-600 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString('ar')}</td>
            <td className="p-3 font-semibold">{l.actorName || '—'}</td>
            <td className="p-3"><Badge variant="outline" className="text-xs">{l.actorRole || '—'}</Badge></td>
            <td className="p-3"><Badge className="bg-[#2C5F9E] text-white text-xs">{l.action}</Badge></td>
            <td className="p-3 text-neutral-600 text-xs">{l.entity || '—'}</td>
            <td className="p-3 text-xs text-neutral-400">{l.ip || '—'}</td>
            <td className="p-3">
              <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => deleteSingle(l)} title="حذف هذا السجل" disabled={busy || !l.id}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </td>
          </tr>
        ))}</tbody>
      </table></div></CardContent></Card>
    )}

    {/* Confirm: Clear All */}
    {confirmClear && (
      <Dialog open={true} onOpenChange={(o) => !o && setConfirmClear(false)}>
        <DialogContent dir="rtl" className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />⚠️ تأكيد حذف جميع السجلات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>هل أنت متأكد من حذف <strong>جميع الـ {total} سجل</strong>؟</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[12.5px] text-red-800">
              ⛔ <strong>هذه العملية لا يمكن التراجع عنها.</strong><br />
              سيتم حذف كل سجل نشاط في قاعدة البيانات نهائياً.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClear(false)} disabled={busy}>إلغاء</Button>
            <Button variant="destructive" onClick={clearAll} disabled={busy}>
              {busy ? <><RefreshCw className="w-4 h-4 me-1.5 animate-spin" />جاري الحذف...</> : <><Trash2 className="w-4 h-4 me-1.5" />نعم، احذف الكل</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}

    {/* Confirm: Purge Old (older than X days) */}
    {confirmPurge && (
      <Dialog open={true} onOpenChange={(o) => !o && setConfirmPurge(false)}>
        <DialogContent dir="rtl" className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <Clock className="w-5 h-5" />🧹 تنظيف السجلات القديمة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[13.5px]">احذف السجلات الأقدم من عدد معيّن من الأيام لتخفيف حمل قاعدة البيانات.</p>
            <div>
              <Label className="mb-2 block">عدد الأيام (1 - 365)</Label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[7, 30, 60, 90].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPurgeDays(d)}
                    className={`p-2 rounded-lg border-2 text-sm font-bold transition ${purgeDays === d ? 'border-[#CC0000] bg-red-50 text-[#CC0000]' : 'border-neutral-200 hover:border-neutral-300'}`}
                  >
                    {d} يوم
                  </button>
                ))}
              </div>
              <Input type="number" min={1} max={365} value={purgeDays} onChange={e => setPurgeDays(Number(e.target.value) || 30)} />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[12.5px] text-amber-800">
              ℹ️ ستُحذف كل السجلات التي أُنشئت قبل <strong>{purgeDays} يوم</strong> من الآن. السجلات الأحدث ستبقى.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPurge(false)} disabled={busy}>إلغاء</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={purgeOld} disabled={busy}>
              {busy ? <><RefreshCw className="w-4 h-4 me-1.5 animate-spin" />جاري الحذف...</> : <><Clock className="w-4 h-4 me-1.5" />ابدأ التنظيف</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </>)
}

// ==================== MANAGER PANEL ====================
function ManagerPanel({ user }) {
  return (
    <section className="py-8 bg-gradient-to-br from-neutral-50 to-white min-h-screen" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h1 className="text-3xl font-black flex items-center gap-2"><ShieldCheck className="w-8 h-8 text-[#2C5F9E]" />لوحة المدير</h1><p className="text-neutral-600 text-sm mt-1">مرحباً {user.name}</p></div>
          <Badge className="bg-[#2C5F9E] text-white text-base px-4 py-1.5"><ShieldCheck className="w-4 h-4 me-1.5" />Manager</Badge>
        </div>
        <Tabs defaultValue="courses">
          <TabsList className="grid grid-cols-5 mb-6 h-auto">
            <TabsTrigger value="courses"><BookOpen className="w-4 h-4 me-1.5" />الكورسات</TabsTrigger>
            <TabsTrigger value="telc"><Award className="w-4 h-4 me-1.5" />telc</TabsTrigger>
            <TabsTrigger value="jobs"><Briefcase className="w-4 h-4 me-1.5" />المهن</TabsTrigger>
            <TabsTrigger value="messages"><MessageCircle className="w-4 h-4 me-1.5" />الرسائل</TabsTrigger>
            <TabsTrigger value="apps"><FileText className="w-4 h-4 me-1.5" />الطلبات</TabsTrigger>
          </TabsList>
          <TabsContent value="courses"><ManageCourses /></TabsContent>
          <TabsContent value="telc"><ManageTelc /></TabsContent>
          <TabsContent value="jobs"><ManageJobs /></TabsContent>
          <TabsContent value="messages"><ManageMessages /></TabsContent>
          <TabsContent value="apps"><ManageApps /></TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function ManageCourses() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const refresh = () => fetch('/api/manager/courses').then(r => r.json()).then(d => setItems(d.items || []))
  useEffect(() => { refresh() }, [])
  const fields = [{ k: 'level', l: 'المستوى' }, { k: 'title_ar', l: 'العنوان (عربي)' }, { k: 'title_de', l: 'العنوان (ألماني)' }, { k: 'desc_ar', l: 'الوصف (عربي)', textarea: true }, { k: 'desc_de', l: 'الوصف (ألماني)', textarea: true }, { k: 'duration_ar', l: 'المدة (عربي)' }, { k: 'duration_de', l: 'المدة (ألماني)' }, { k: 'hours', l: 'الساعات', num: true }, { k: 'price_usd', l: 'السعر USD', num: true }, { k: 'schedule_ar', l: 'الجدول (عربي)' }, { k: 'schedule_de', l: 'الجدول (ألماني)' }, { k: 'start_date', l: 'تاريخ البدء (YYYY-MM-DD)' }, { k: 'seats', l: 'المقاعد', num: true }]
  const del = async (it) => { await fetch(`/api/manager/courses/${it.id}`, { method: 'DELETE' }); toast.success('تم الحذف'); refresh(); setConfirm(null) }
  return (<>
    <div className="flex justify-between mb-4"><h3 className="text-xl font-black">الكورسات ({items.length})</h3><Button onClick={() => setEditing({})} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />إضافة كورس</Button></div>
    <div className="grid md:grid-cols-2 gap-4">{items.map(c => (<Card key={c.id}><CardContent className="p-5"><div className="flex items-start justify-between mb-2"><Badge className="bg-[#1A1A1A] text-white font-black">{c.level}</Badge><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEditing(c)}><Pencil className="w-3.5 h-3.5" /></Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirm(c)}><Trash2 className="w-3.5 h-3.5" /></Button></div></div><h4 className="font-bold mb-1">{c.title_ar}</h4><div className="text-xs text-neutral-500">{c.duration_ar} · ${c.price_usd} · بدء {c.start_date}</div></CardContent></Card>))}</div>
    {editing && <CrudFormDialog title={editing.id ? 'تعديل كورس' : 'إضافة كورس'} fields={fields} item={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} endpoint="courses" imageField={{ folder: 'ddh/courses' }} />}
    {confirm && <ConfirmDialog title="حذف الكورس" desc={`حذف ${confirm.title_ar}؟`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
  </>)
}

function ManageTelc() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const refresh = () => fetch('/api/manager/telc-exams').then(r => r.json()).then(d => setItems(d.items || []))
  useEffect(() => { refresh() }, [])
  const fields = [{ k: 'type', l: 'النوع (مثل: telc Deutsch B1)' }, { k: 'date', l: 'التاريخ YYYY-MM-DD' }, { k: 'time', l: 'الوقت' }, { k: 'price_usd', l: 'السعر USD', num: true }, { k: 'seats', l: 'المقاعد', num: true }]
  const del = async (it) => { await fetch(`/api/manager/telc-exams/${it.id}`, { method: 'DELETE' }); toast.success('تم الحذف'); refresh(); setConfirm(null) }
  return (<>
    <div className="flex justify-between mb-4"><h3 className="text-xl font-black">امتحانات telc ({items.length})</h3><Button onClick={() => setEditing({})} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />إضافة امتحان</Button></div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(e => (<Card key={e.id}><CardContent className="p-4"><div className="flex justify-between mb-2"><Badge className="bg-[#CC0000] text-white">{e.type}</Badge><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEditing(e)}><Pencil className="w-3.5 h-3.5" /></Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirm(e)}><Trash2 className="w-3.5 h-3.5" /></Button></div></div><div className="text-sm">{e.date} · {e.time}</div><div className="text-xs text-neutral-500">${e.price_usd} · {e.seats} مقاعد</div></CardContent></Card>))}</div>
    {editing && <CrudFormDialog title={editing.id ? 'تعديل امتحان' : 'إضافة امتحان'} fields={fields} item={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} endpoint="telc-exams" />}
    {confirm && <ConfirmDialog title="حذف الامتحان" desc={`حذف ${confirm.type}؟`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
  </>)
}

function ManageJobs() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const refresh = () => fetch('/api/manager/jobs').then(r => r.json()).then(d => setItems(d.items || []))
  useEffect(() => { refresh() }, [])
  const fields = [{ k: 'title_ar', l: 'الاسم (عربي)' }, { k: 'title_de', l: 'الاسم (ألماني)' }, { k: 'partner', l: 'الشريك' }, { k: 'duration_ar', l: 'المدة (عربي)' }, { k: 'duration_de', l: 'المدة (ألماني)' }, { k: 'salary', l: 'الراتب' }, { k: 'requirements_ar', l: 'المتطلبات (عربي)', textarea: true }, { k: 'requirements_de', l: 'المتطلبات (ألماني)', textarea: true }]
  const del = async (it) => { await fetch(`/api/manager/jobs/${it.id}`, { method: 'DELETE' }); toast.success('تم الحذف'); refresh(); setConfirm(null) }
  return (<>
    <div className="flex justify-between mb-4"><h3 className="text-xl font-black">المهن ({items.length})</h3><Button onClick={() => setEditing({})} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />إضافة مهنة</Button></div>
    <div className="grid md:grid-cols-2 gap-4">{items.map(j => (<Card key={j.id}><CardContent className="p-5"><div className="flex justify-between mb-2"><Badge className="bg-[#2C5F9E] text-white">{j.partner}</Badge><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEditing(j)}><Pencil className="w-3.5 h-3.5" /></Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirm(j)}><Trash2 className="w-3.5 h-3.5" /></Button></div></div><h4 className="font-bold">{j.title_ar}</h4><div className="text-sm text-neutral-500">{j.duration_ar} · {j.salary}</div></CardContent></Card>))}</div>
    {editing && <CrudFormDialog title={editing.id ? 'تعديل' : 'إضافة'} fields={fields} item={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} endpoint="jobs" />}
    {confirm && <ConfirmDialog title="حذف" desc={`حذف ${confirm.title_ar}؟`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
  </>)
}

function CrudFormDialog({ title, fields, item, onClose, onSaved, endpoint, imageField }) {
  const [form, setForm] = useState(item || {})
  const submit = async (e) => {
    e.preventDefault()
    const url = item.id ? `/api/manager/${endpoint}/${item.id}` : `/api/manager/${endpoint}`
    const method = item.id ? 'PATCH' : 'POST'
    const body = { ...form }
    fields.forEach(f => { if (f.num && body[f.k]) body[f.k] = Number(body[f.k]) })
    delete body.id; delete body.createdAt; delete body._id
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    if (d.error) toast.error(d.error); else { toast.success('تم الحفظ'); onSaved() }
  }
  const removeCover = async () => {
    if (form.cover_public_id) {
      await fetch('/api/cloudinary/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: form.cover_public_id, resource_type: 'image' }) })
    }
    setForm({ ...form, coverImage: '', cover_public_id: '' })
  }
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {imageField && (
            <div>
              <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />صورة الغلاف</Label>
              {form.coverImage ? (
                <div className="relative rounded-2xl overflow-hidden mt-1 border-2 border-neutral-200">
                  <img src={form.coverImage} alt="cover" className="w-full h-40 object-cover" />
                  <button type="button" onClick={removeCover} className="absolute top-2 end-2 bg-red-600 text-white p-1.5 rounded-lg shadow-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ) : (
                <FileUpload folder={imageField.folder} accept="image/*" kind="image" maxSize={10 * 1024 * 1024} label="ارفع صورة (10MB كحد أقصى)" onUploaded={(u) => setForm({ ...form, coverImage: u.url, cover_public_id: u.public_id })} />
              )}
            </div>
          )}
          {fields.map(f => (<div key={f.k}><Label>{f.l}</Label>{f.textarea ? <Textarea rows={3} value={form[f.k] || ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })} /> : <Input type={f.num ? 'number' : 'text'} value={form[f.k] || ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />}</div>))}
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>إلغاء</Button><Button type="submit" className="btn-primary"><Save className="w-4 h-4 me-1.5" />حفظ</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ManageMessages() {
  const [items, setItems] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [reply, setReply] = useState('')
  const refresh = () => fetch('/api/manager/contact-messages').then(r => r.json()).then(d => setItems(d.items || []))
  useEffect(() => { refresh() }, [])
  const send = async () => {
    await fetch(`/api/manager/contact-messages/${replyTo.id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply }) })
    toast.success('تم الإرسال'); setReplyTo(null); setReply(''); refresh()
  }
  return (<>
    <h3 className="text-xl font-black mb-4">رسائل التواصل ({items.length})</h3>
    <div className="space-y-3">{items.map(m => (<Card key={m.id}><CardContent className="p-5">
      <div className="flex justify-between mb-2"><div className="font-bold">{m.name}</div><div className="text-xs text-neutral-500">{new Date(m.createdAt).toLocaleString('ar')}</div></div>
      <div className="text-sm text-neutral-600 mb-2">{m.email}</div>
      <p className="text-sm bg-neutral-50 p-3 rounded-lg mb-3">{m.message}</p>
      {m.replied ? <div className="border-r-4 border-green-500 ps-3 bg-green-50 p-2 text-sm rounded"><div className="text-xs text-green-700 font-bold mb-1">رد بواسطة {m.repliedBy}:</div>{m.reply}</div> : <Button size="sm" onClick={() => setReplyTo(m)} className="btn-primary"><Send className="w-3.5 h-3.5 me-1" />الرد</Button>}
    </CardContent></Card>))}</div>
    {replyTo && (
      <Dialog open={true} onOpenChange={(o) => !o && setReplyTo(null)}>
        <DialogContent dir="rtl"><DialogHeader><DialogTitle>الرد على {replyTo.name}</DialogTitle></DialogHeader>
          <Textarea rows={5} value={reply} onChange={e => setReply(e.target.value)} placeholder="ردّك..." />
          <DialogFooter><Button variant="outline" onClick={() => setReplyTo(null)}>إلغاء</Button><Button onClick={send} className="btn-primary"><Send className="w-4 h-4 me-1.5" />إرسال</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </>)
}

function ManageApps() {
  const [apps, setApps] = useState([])
  const [cons, setCons] = useState([])
  useEffect(() => {
    fetch('/api/manager/applications').then(r => r.json()).then(d => setApps(d.items || []))
    fetch('/api/manager/consultations').then(r => r.json()).then(d => setCons(d.items || []))
  }, [])
  return (<>
    <Tabs defaultValue="apps">
      <TabsList><TabsTrigger value="apps">طلبات Ausbildung ({apps.length})</TabsTrigger><TabsTrigger value="cons">استشارات السفر ({cons.length})</TabsTrigger></TabsList>
      <TabsContent value="apps"><div className="space-y-2 mt-3">{apps.map(a => (<Card key={a.id}><CardContent className="p-4"><div className="flex justify-between"><div><div className="font-bold">{a.name} — {a.jobTitle}</div><div className="text-sm text-neutral-600">{a.email} · {a.phone}</div>{a.notes && <div className="text-sm text-neutral-500 mt-1">{a.notes}</div>}</div><Badge>{a.status}</Badge></div></CardContent></Card>))}</div></TabsContent>
      <TabsContent value="cons"><div className="space-y-2 mt-3">{cons.map(c => (<Card key={c.id}><CardContent className="p-4"><div className="flex justify-between"><div><div className="font-bold">{c.name} — {c.visaType}</div><div className="text-sm text-neutral-600">{c.email} · {c.phone}</div><div className="text-sm">التاريخ المفضل: {c.preferredDate || '-'}</div>{c.notes && <div className="text-sm text-neutral-500 mt-1">{c.notes}</div>}</div><Badge>{c.status}</Badge></div></CardContent></Card>))}</div></TabsContent>
    </Tabs>
  </>)
}

// ==================== TEACHER PANEL ====================
function TeacherPanel({ user }) {
  const [courses, setCourses] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/teacher/courses').then(r => r.json()).then(d => { setCourses(d.courses || []); setLoading(false) }) }, [])
  if (active) return <TeacherCourseWorkspace course={active} onBack={() => setActive(null)} />
  const totalStudents = courses.reduce((s, c) => s + (c.studentCount || 0), 0)
  const totalFiles = courses.reduce((s, c) => s + (c.fileCount || 0), 0)
  const totalUnread = courses.reduce((s, c) => s + (c.unreadCount || 0), 0)
  return (
    <section className="py-8 bg-gradient-to-br from-neutral-50 to-white min-h-screen" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h1 className="text-3xl font-black flex items-center gap-2"><GraduationCap className="w-8 h-8 text-[#FFCE00]" />لوحة المعلم</h1><p className="text-neutral-600 text-sm mt-1">مرحباً {user.name} — كورساتك بانتظارك</p></div>
          <Badge className="bg-[#FFCE00] text-[#1A1A1A] text-base px-4 py-1.5"><GraduationCap className="w-4 h-4 me-1.5" />Teacher</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-[#1A1A1A] to-neutral-800 text-white"><CardContent className="p-5"><div className="flex items-center justify-between"><div><div className="text-xs opacity-70 font-semibold">كورساتي</div><div className="text-3xl font-black mt-1">{courses.length}</div></div><BookOpen className="w-8 h-8 opacity-50" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-[#CC0000] to-red-700 text-white"><CardContent className="p-5"><div className="flex items-center justify-between"><div><div className="text-xs opacity-70 font-semibold">إجمالي الطلاب</div><div className="text-3xl font-black mt-1">{totalStudents}</div></div><Users className="w-8 h-8 opacity-50" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-[#FFCE00] to-amber-400"><CardContent className="p-5"><div className="flex items-center justify-between"><div><div className="text-xs font-semibold opacity-70">المواد المرفوعة</div><div className="text-3xl font-black mt-1">{totalFiles}</div></div><FileText className="w-8 h-8 opacity-50" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-[#2C5F9E] to-blue-700 text-white"><CardContent className="p-5"><div className="flex items-center justify-between"><div><div className="text-xs opacity-70 font-semibold">رسائل غير مقروءة</div><div className="text-3xl font-black mt-1">{totalUnread}</div></div><MessageSquare className="w-8 h-8 opacity-50" /></div></CardContent></Card>
        </div>
        <h2 className="text-xl font-black mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-[#CC0000]" />كورساتي</h2>
        {loading ? <Loading t={T.ar} /> : courses.length === 0 ? <Card><CardContent className="p-12 text-center text-neutral-500"><AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" /><p>لم يتم تعيين أي كورس لك بعد. تواصل مع الإدارة.</p></CardContent></Card> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{courses.map(c => (
            <Card key={c.id} className="card-hover cursor-pointer border-2 border-transparent hover:border-[#FFCE00] overflow-hidden" onClick={() => setActive(c)}>
              <div className="h-2 flag-gradient-h" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-[#1A1A1A] text-white font-black text-base px-3 py-1">{c.level}</Badge>
                  {c.unreadCount > 0 && <Badge className="bg-[#CC0000] text-white animate-pulse"><MessageSquare className="w-3 h-3 me-1" />{c.unreadCount}</Badge>}
                </div>
                <h3 className="text-lg font-bold mb-1 line-clamp-1">{c.title_ar}</h3>
                <div className="text-xs text-neutral-500 mb-4">{c.duration_ar} · {c.hours}h</div>
                <div className="space-y-1.5 text-sm border-t pt-3 mb-4">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#CC0000]" /><span className="text-neutral-500">الطلاب المسجّلون:</span><span className="font-bold ms-auto">{c.studentCount}</span></div>
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#CC0000]" /><span className="text-neutral-500">المواد:</span><span className="font-bold ms-auto">{c.fileCount}</span></div>
                  {c.nextSession ? <div className="flex items-center gap-2 text-xs bg-blue-50 p-2 rounded-lg mt-2"><Calendar className="w-4 h-4 text-blue-600" /><span className="text-blue-700 font-semibold">الجلسة القادمة:</span><span className="ms-auto font-bold">{c.nextSession.date}</span></div> : <div className="text-xs text-neutral-400">لا جلسات قادمة</div>}
                </div>
                <Button className="w-full btn-primary"><Eye className="w-4 h-4 me-1.5" />دخول الكورس</Button>
              </CardContent>
            </Card>
          ))}</div>
        )}
      </div>
    </section>
  )
}

function TeacherCourseWorkspace({ course, onBack }) {
  return (
    <section className="py-8 bg-gradient-to-br from-neutral-50 to-white min-h-screen" dir="rtl">
      <div className="container mx-auto px-4">
        <Button variant="outline" onClick={onBack} className="mb-4"><ArrowRight className="w-4 h-4 me-1.5 rotate-180" />رجوع لكورساتي</Button>
        <Card className="mb-6 overflow-hidden border-2 border-[#FFCE00]"><div className="h-2 flag-gradient-h" />
          <CardContent className="p-6 flex items-center gap-4 flex-wrap">
            <Badge className="bg-[#1A1A1A] text-white font-black text-2xl px-4 py-2">{course.level}</Badge>
            <div className="flex-1"><h2 className="text-2xl font-black">{course.title_ar}</h2><div className="text-sm text-neutral-600">{course.duration_ar} · {course.hours}h · بدء {course.start_date} · {course.studentCount || 0} طالب</div></div>
            <Badge variant="outline" className="text-xs">معزول تماماً 🔒</Badge>
          </CardContent>
        </Card>
        <Tabs defaultValue="students">
          <TabsList className="grid grid-cols-5 mb-6 h-auto">
            <TabsTrigger value="students"><Users className="w-4 h-4 me-1" />الطلاب</TabsTrigger>
            <TabsTrigger value="sessions"><Video className="w-4 h-4 me-1" />الجلسات</TabsTrigger>
            <TabsTrigger value="materials"><FileText className="w-4 h-4 me-1" />المواد</TabsTrigger>
            <TabsTrigger value="grades"><Trophy className="w-4 h-4 me-1" />الدرجات</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="w-4 h-4 me-1" />الرسائل</TabsTrigger>
          </TabsList>
          <TabsContent value="students"><TeacherStudents courseId={course.id} courseLevel={course.level} /></TabsContent>
          <TabsContent value="sessions"><TeacherSessions courseId={course.id} /></TabsContent>
          <TabsContent value="materials"><TeacherMaterials courseId={course.id} /></TabsContent>
          <TabsContent value="grades"><TeacherGrades courseId={course.id} /></TabsContent>
          <TabsContent value="messages"><TeacherMessages courseId={course.id} /></TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function TeacherStudents({ courseId, courseLevel }) {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState(null)
  useEffect(() => { fetch(`/api/teacher/courses/${courseId}/students`).then(r => r.json()).then(d => setStudents(d.students || [])) }, [courseId])
  const filtered = students.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
  return (<>
    <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
      <h3 className="text-xl font-black flex items-center gap-2"><Users className="w-5 h-5 text-[#CC0000]" />طلاب {courseLevel} ({filtered.length})</h3>
      <div className="relative"><Input placeholder="بحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 ps-9" /><span className="absolute top-2.5 start-3 text-neutral-400"><Users className="w-4 h-4" /></span></div>
    </div>
    {filtered.length === 0 ? <Empty t={T.ar} /> : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(s => (
        <Card key={s.id} className="card-hover cursor-pointer" onClick={() => setProfile(s)}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              {s.photo?.url ? <img src={s.photo.url} alt={s.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#FFCE00]" /> : <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A1A1A] via-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-xl font-black shrink-0">{s.name?.charAt(0)?.toUpperCase()}</div>}
              <div className="flex-1 min-w-0"><div className="font-bold truncate">{s.name}</div><div className="text-xs text-neutral-500 truncate">{s.email}</div></div>
            </div>
            <div className="space-y-1 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{s.phone || '—'}</div>
              <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />سُجّل: {new Date(s.registration?.createdAt).toLocaleDateString('ar')}</div>
              <Badge className="bg-amber-500 text-white text-xs mt-2">{s.registration?.status}</Badge>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3"><Eye className="w-3.5 h-3.5 me-1.5" />فتح الملف</Button>
          </CardContent>
        </Card>
      ))}</div>
    )}
    {profile && <StudentProfileModal courseId={courseId} student={profile} onClose={() => setProfile(null)} />}
  </>)
}

function StudentProfileModal({ courseId, student, onClose }) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(`/api/teacher/courses/${courseId}/students/${student.id}/profile`).then(r => r.json()).then(setData) }, [courseId, student.id])
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A1A1A] via-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-2xl font-black shrink-0">{student.name?.charAt(0)?.toUpperCase()}</div>
            <div><DialogTitle className="text-2xl">{student.name}</DialogTitle><DialogDescription>{student.email} · {student.phone || '—'}</DialogDescription></div>
          </div>
        </DialogHeader>
        {!data ? <Loading t={T.ar} /> : (
          <Tabs defaultValue="info">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="info"><User className="w-4 h-4 me-1" />الملف</TabsTrigger>
              <TabsTrigger value="grades"><Trophy className="w-4 h-4 me-1" />الدرجات ({data.grades?.length || 0})</TabsTrigger>
              <TabsTrigger value="attendance"><ClipboardCheck className="w-4 h-4 me-1" />الحضور</TabsTrigger>
              <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 me-1" />المحادثات ({data.chatHistory?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-2">
              <Card><CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">الاسم الكامل:</span><span className="font-semibold">{data.student?.name}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">البريد:</span><span className="font-semibold">{data.student?.email}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">الهاتف:</span><span className="font-semibold">{data.student?.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">تاريخ الإنضمام:</span><span className="font-semibold">{new Date(data.student?.createdAt).toLocaleDateString('ar')}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">تاريخ التسجيل بالكورس:</span><span className="font-semibold">{new Date(data.registration?.createdAt).toLocaleDateString('ar')}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">حالة الكورس:</span><Badge>{data.registration?.status}</Badge></div>
                <div className="flex justify-between"><span className="text-neutral-500">المبلغ:</span><span className="font-semibold">${data.registration?.price_usd}</span></div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="grades" className="space-y-2">
              {data.grades?.length === 0 ? <Empty t={T.ar} /> : data.grades.map(g => (<Card key={g.id}><CardContent className="p-4">
                <div className="flex justify-between items-start"><div><div className="text-2xl font-black text-[#CC0000]">{g.grade}</div>{g.comment && <div className="text-sm mt-1">{g.comment}</div>}{g.note && <div className="mt-2 p-2 bg-amber-50 border-r-2 border-amber-500 text-xs"><Shield className="w-3 h-3 inline me-1" /><span className="font-bold">ملاحظة خاصة (أنت والإدارة فقط):</span> {g.note}</div>}</div><div className="text-xs text-neutral-500 text-end"><div>{new Date(g.createdAt).toLocaleDateString('ar')}</div><div>{g.addedByName}</div></div></div>
              </CardContent></Card>))}
            </TabsContent>
            <TabsContent value="attendance" className="space-y-2">
              {data.attendance?.length === 0 ? <Empty t={T.ar} /> : data.attendance.map(a => (<Card key={a.id}><CardContent className="p-3 flex items-center justify-between">
                <div><div className="font-semibold text-sm">{a.session?.title || 'جلسة'}</div><div className="text-xs text-neutral-500">{a.session?.date} · {a.session?.time}</div></div>
                {a.present ? <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 me-1" />حاضر</Badge> : <Badge className="bg-red-500 text-white"><X className="w-3 h-3 me-1" />غائب</Badge>}
              </CardContent></Card>))}
            </TabsContent>
            <TabsContent value="chat">
              <ScrollArea className="h-72 border rounded-lg p-3 bg-neutral-50">
                {data.chatHistory?.length === 0 ? <div className="text-center text-neutral-500 py-8">لا توجد محادثات</div> : data.chatHistory.map(m => (<div key={m.id} className={`mb-2 flex ${m.fromRole === 'teacher' ? 'justify-end' : 'justify-start'}`}><div className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${m.fromRole === 'teacher' ? 'bg-[#CC0000] text-white' : 'bg-white border'}`}><div>{m.text}</div><div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString('ar')}</div></div></div>))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TeacherSessions({ courseId }) {
  const [items, setItems] = useState([])
  const [students, setStudents] = useState([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', time: '', zoomLink: '' })
  const [confirm, setConfirm] = useState(null)
  const [attSession, setAttSession] = useState(null)
  const [records, setRecords] = useState({})
  const refresh = () => fetch(`/api/teacher/courses/${courseId}/sessions`).then(r => r.json()).then(d => setItems(d.sessions || []))
  useEffect(() => { refresh(); fetch(`/api/teacher/courses/${courseId}/students`).then(r => r.json()).then(d => setStudents(d.students || [])) }, [courseId])
  const add = async () => {
    await fetch(`/api/teacher/courses/${courseId}/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ title: '', date: '', time: '', zoomLink: '' }); setAdding(false); refresh(); toast.success('تمت إضافة الجلسة (تم إشعار الطلاب تلقائياً)')
  }
  const del = async (s) => { await fetch(`/api/teacher/courses/${courseId}/sessions/${s.id}`, { method: 'DELETE' }); refresh(); setConfirm(null); toast.success('تم') }
  const openAtt = (s) => { setAttSession(s); setRecords(Object.fromEntries(students.map(st => [st.id, true]))) }
  const saveAtt = async () => {
    const recs = Object.entries(records).map(([studentId, present]) => ({ studentId, present }))
    await fetch(`/api/teacher/courses/${courseId}/attendance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: attSession.id, records: recs }) })
    toast.success('تم حفظ الحضور'); setAttSession(null)
  }
  return (<>
    <div className="flex justify-between mb-4 flex-wrap gap-2"><h3 className="text-xl font-black flex items-center gap-2"><Video className="w-5 h-5 text-[#CC0000]" />الجلسات ({items.length})</h3><Button onClick={() => setAdding(true)} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />جلسة جديدة + Zoom</Button></div>
    <div className="space-y-2">{items.map(s => (<Card key={s.id}><CardContent className="p-4 flex items-center gap-3 flex-wrap">
      <Calendar className="w-5 h-5 text-[#CC0000]" />
      <div className="flex-1 min-w-[200px]"><div className="font-bold">{s.title}</div><div className="text-sm text-neutral-500">{s.date} · {s.time}</div></div>
      {s.zoomLink && <a href={s.zoomLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-[#2C5F9E] text-white text-xs font-bold flex items-center gap-1"><Video className="w-3 h-3" />Zoom</a>}
      <Button size="sm" variant="outline" onClick={() => openAtt(s)}><ClipboardCheck className="w-3.5 h-3.5 me-1" />الحضور</Button>
      <Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirm(s)}><Trash2 className="w-3.5 h-3.5" /></Button>
    </CardContent></Card>))}</div>
    {adding && (
      <Dialog open={true} onOpenChange={(o) => !o && setAdding(false)}>
        <DialogContent dir="rtl"><DialogHeader><DialogTitle>إضافة جلسة جديدة</DialogTitle><DialogDescription>سيتم إشعار جميع طلاب الكورس تلقائياً</DialogDescription></DialogHeader>
          <div className="space-y-3"><div><Label>عنوان الجلسة / الموضوع</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="مثال: درس الفصل الثاني" /></div><div className="grid grid-cols-2 gap-2"><div><Label>التاريخ</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div><div><Label>الوقت</Label><Input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="18:00" /></div></div><div><Label>رابط Zoom</Label><Input value={form.zoomLink} onChange={e => setForm({ ...form, zoomLink: e.target.value })} placeholder="https://zoom.us/j/..." /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setAdding(false)}>إلغاء</Button><Button onClick={add} className="btn-primary"><Save className="w-4 h-4 me-1.5" />نشر الجلسة</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    {attSession && (
      <Dialog open={true} onOpenChange={(o) => !o && setAttSession(null)}>
        <DialogContent dir="rtl" className="max-w-lg"><DialogHeader><DialogTitle>حضور جلسة: {attSession.title}</DialogTitle><DialogDescription>{attSession.date} · {attSession.time}</DialogDescription></DialogHeader>
          <div className="space-y-2 max-h-72 overflow-y-auto">{students.map(st => (<label key={st.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#CC0000] flex items-center justify-center text-white text-xs font-bold">{st.name?.charAt(0)?.toUpperCase()}</div><span className="font-semibold text-sm">{st.name}</span></div><Switch checked={records[st.id] !== false} onCheckedChange={(v) => setRecords({ ...records, [st.id]: v })} /></label>))}</div>
          <DialogFooter><Button variant="outline" onClick={() => setAttSession(null)}>إلغاء</Button><Button onClick={saveAtt} className="btn-primary"><Save className="w-4 h-4 me-1.5" />حفظ الحضور</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    {confirm && <ConfirmDialog title="حذف الجلسة" desc={`حذف ${confirm.title}؟`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
  </>)
}

function TeacherMessages({ courseId }) {
  const [mode, setMode] = useState('announcement')
  const [students, setStudents] = useState([])
  const [announcements, setAnns] = useState([])
  const [annText, setAnnText] = useState('')
  const [activeStudent, setActiveStudent] = useState(null)
  const [chatMsgs, setChatMsgs] = useState([])
  const [chatText, setChatText] = useState('')
  useEffect(() => {
    fetch(`/api/teacher/courses/${courseId}/students`).then(r => r.json()).then(d => setStudents(d.students || []))
    fetch(`/api/teacher/courses/${courseId}/announcements`).then(r => r.json()).then(d => setAnns(d.announcements || []))
  }, [courseId])
  const refreshAnn = () => fetch(`/api/teacher/courses/${courseId}/announcements`).then(r => r.json()).then(d => setAnns(d.announcements || []))
  const sendAnn = async () => {
    if (!annText.trim()) return
    await fetch(`/api/teacher/courses/${courseId}/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: annText }) })
    setAnnText(''); refreshAnn(); toast.success('تم نشر الإعلان (إشعار لكل الطلاب)')
  }
  const loadChat = (s) => {
    setActiveStudent(s)
    fetch(`/api/teacher/courses/${courseId}/chat?studentId=${s.id}`).then(r => r.json()).then(d => setChatMsgs(d.messages || []))
  }
  const sendChat = async () => {
    if (!chatText.trim()) return
    await fetch(`/api/teacher/courses/${courseId}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: activeStudent.id, text: chatText }) })
    setChatText(''); loadChat(activeStudent)
  }
  return (<>
    <div className="flex gap-2 mb-4">
      <Button onClick={() => setMode('announcement')} variant={mode === 'announcement' ? 'default' : 'outline'} className={mode === 'announcement' ? 'btn-primary' : ''}><Megaphone className="w-4 h-4 me-1.5" />إعلان جماعي لكل الطلاب</Button>
      <Button onClick={() => setMode('private')} variant={mode === 'private' ? 'default' : 'outline'} className={mode === 'private' ? 'btn-primary' : ''}><MessageSquare className="w-4 h-4 me-1.5" />محادثة خاصة مع طالب</Button>
    </div>
    {mode === 'announcement' ? (<>
      <Card className="mb-4 border-2 border-[#FFCE00]/40"><CardContent className="p-4 space-y-2">
        <div className="text-sm text-neutral-600 mb-1 flex items-center gap-1.5"><Megaphone className="w-4 h-4 text-[#CC0000]" />إعلان جماعي — سيُرسل إشعار لكل طلاب الكورس فوراً</div>
        <Textarea rows={3} value={annText} onChange={e => setAnnText(e.target.value)} placeholder="اكتب إعلاناً للجميع..." />
        <Button onClick={sendAnn} className="btn-primary"><Send className="w-4 h-4 me-1.5" />نشر الإعلان</Button>
      </CardContent></Card>
      <h4 className="font-bold mb-3 text-sm text-neutral-600">سجل الإعلانات ({announcements.length})</h4>
      <div className="space-y-2">{announcements.map(a => (<Card key={a.id}><CardContent className="p-4"><div className="text-sm">{a.text}</div><div className="text-xs text-neutral-500 mt-2 flex items-center gap-1"><User className="w-3 h-3" />{a.fromName} · {new Date(a.createdAt).toLocaleString('ar')}</div></CardContent></Card>))}</div>
    </>) : (
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1"><CardContent className="p-3"><div className="font-bold mb-2 text-sm">الطلاب ({students.length})</div><div className="space-y-1 max-h-96 overflow-y-auto">{students.map(s => (<button key={s.id} onClick={() => loadChat(s)} className={`w-full text-start p-2 rounded-lg text-sm flex items-center gap-2 ${activeStudent?.id === s.id ? 'bg-[#CC0000] text-white' : 'hover:bg-neutral-100'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStudent?.id === s.id ? 'bg-white text-[#CC0000]' : 'bg-gradient-to-br from-[#1A1A1A] to-[#CC0000] text-white'}`}>{s.name?.charAt(0)?.toUpperCase()}</div><span className="truncate">{s.name}</span></button>))}</div></CardContent></Card>
        <Card className="md:col-span-2"><CardContent className="p-3">{!activeStudent ? <div className="text-center text-neutral-500 py-12"><MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />اختر طالباً لبدء المحادثة</div> : (<>
          <div className="font-bold mb-3 pb-2 border-b flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#CC0000] flex items-center justify-center text-white text-xs font-bold">{activeStudent.name?.charAt(0)?.toUpperCase()}</div>{activeStudent.name}</div>
          <ScrollArea className="h-72 mb-3 bg-neutral-50 rounded-lg p-2">{chatMsgs.length === 0 ? <div className="text-center text-neutral-400 py-12 text-sm">لا رسائل بعد. ابدأ المحادثة!</div> : chatMsgs.map(m => (<div key={m.id} className={`mb-2 flex ${m.fromRole === 'teacher' ? 'justify-end' : 'justify-start'}`}><div className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${m.fromRole === 'teacher' ? 'bg-[#CC0000] text-white' : 'bg-white border'}`}><div>{m.text}</div><div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString('ar')}</div></div></div>))}</ScrollArea>
          <div className="flex gap-2"><Input value={chatText} onChange={e => setChatText(e.target.value)} placeholder="رسالتك الخاصة..." onKeyDown={e => e.key === 'Enter' && sendChat()} /><Button onClick={sendChat} className="btn-primary"><Send className="w-4 h-4" /></Button></div>
        </>)}</CardContent></Card>
      </div>
    )}
  </>)
}

function TeacherMaterials({ courseId }) {
  const [items, setItems] = useState([])
  const [adding, setAdding] = useState(false)
  const [uploaded, setUploaded] = useState(null)
  const [title, setTitle] = useState('')
  const [confirm, setConfirm] = useState(null)
  const refresh = () => fetch(`/api/teacher/courses/${courseId}/materials`).then(r => r.json()).then(d => setItems(d.materials || []))
  useEffect(() => { refresh() }, [courseId])
  const save = async () => {
    if (!uploaded || !title.trim()) { toast.error('أدخل العنوان وارفع ملفاً'); return }
    const ext = uploaded.format || uploaded.name?.split('.').pop()?.toLowerCase()
    const typeInfo = fileTypeIcon(ext)
    await fetch(`/api/teacher/courses/${courseId}/materials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, type: typeInfo.label, url: uploaded.url, public_id: uploaded.public_id, resource_type: uploaded.resource_type, format: uploaded.format, bytes: uploaded.bytes, fileName: uploaded.name }) })
    setUploaded(null); setTitle(''); setAdding(false); refresh(); toast.success('تم نشر المادة (إشعار للطلاب)')
  }
  const del = async (m) => {
    if (m.public_id) {
      await fetch('/api/cloudinary/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: m.public_id, resource_type: m.resource_type || 'image' }) })
    }
    await fetch(`/api/teacher/courses/${courseId}/materials/${m.id}`, { method: 'DELETE' })
    refresh(); setConfirm(null); toast.success('تم الحذف')
  }
  const fmtSize = (b) => { if (!b) return ''; const mb = b / 1024 / 1024; return mb < 1 ? `${Math.round(b / 1024)} KB` : `${mb.toFixed(1)} MB` }
  return (<>
    <div className="flex justify-between mb-4 flex-wrap gap-2">
      <h3 className="text-xl font-black flex items-center gap-2"><FileText className="w-5 h-5 text-[#CC0000]" />المواد التعليمية ({items.length})</h3>
      <Button onClick={() => setAdding(true)} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />رفع ملف جديد</Button>
    </div>
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800"><CheckCircle2 className="w-4 h-4 inline me-1" />الملفات تُرفع مباشرة إلى Cloudinary بشكل آمن. PDF, Word, PowerPoint, MP4, MP3 — حتى 50MB.</div>
    {items.length === 0 ? <Empty t={T.ar} /> : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{items.map(m => {
        const ti = fileTypeIcon(m.format)
        const isImage = m.resource_type === 'image'
        return (<Card key={m.id} className="card-hover overflow-hidden">
          {isImage && m.url ? <img src={m.url} alt={m.title} className="w-full h-32 object-cover" /> : (<div className="w-full h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-5xl">{ti.icon}</div>)}
          <CardContent className="p-3">
            <div className="font-bold text-sm truncate mb-1">{m.title}</div>
            <div className="text-xs text-neutral-500 mb-2">{ti.label} · {fmtSize(m.bytes)}</div>
            <div className="flex gap-1">
              <a href={m.url} target="_blank" rel="noreferrer" className="flex-1"><Button size="sm" variant="outline" className="w-full"><Eye className="w-3.5 h-3.5 me-1" />فتح</Button></a>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirm(m)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </CardContent>
        </Card>)
      })}</div>
    )}
    {adding && (
      <Dialog open={true} onOpenChange={(o) => !o && (setAdding(false), setUploaded(null), setTitle(''))}>
        <DialogContent dir="rtl"><DialogHeader><DialogTitle>رفع مادة جديدة</DialogTitle><DialogDescription>سيُرسل إشعار تلقائي لكل طلاب الكورس</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>عنوان المادة</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: كتاب الدرس الأول" /></div>
            <div><Label>الملف</Label>
              {uploaded ? (
                <Card className="bg-green-50 border-green-200"><CardContent className="p-3 flex items-center gap-3">
                  <div className="text-3xl">{fileTypeIcon(uploaded.format).icon}</div>
                  <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{uploaded.name}</div><div className="text-xs text-neutral-600">{fileTypeIcon(uploaded.format).label} · {fmtSize(uploaded.bytes)}</div></div>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => setUploaded(null)}><X className="w-3.5 h-3.5" /></Button>
                </CardContent></Card>
              ) : (
                <FileUpload folder={`ddh/teacher/${courseId}/materials`} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.webm,.mp3,.wav,.png,.jpg,.jpeg,.webp" onUploaded={setUploaded} label="اسحب ملفاً أو اضغط للاختيار" />
              )}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setAdding(false); setUploaded(null); setTitle('') }}>إلغاء</Button><Button onClick={save} className="btn-primary" disabled={!uploaded || !title.trim()}><Save className="w-4 h-4 me-1.5" />نشر للطلاب</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    {confirm && <ConfirmDialog title="حذف المادة" desc={`سيتم حذف "${confirm.title}" نهائياً من Cloudinary.`} onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
  </>)
}

function TeacherGrades({ courseId }) {
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [adding, setAdding] = useState(null)
  const [form, setForm] = useState({ grade: '', comment: '', note: '' })
  const refresh = useCallback(() => {
    fetch(`/api/teacher/courses/${courseId}/students`).then(r => r.json()).then(d => setStudents(d.students || []))
    fetch(`/api/teacher/courses/${courseId}/grades`).then(r => r.json()).then(d => setGrades(d.grades || []))
  }, [courseId])
  useEffect(() => { refresh() }, [refresh])
  const add = async () => {
    await fetch(`/api/teacher/courses/${courseId}/grades`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: adding.id, grade: form.grade, comment: form.comment, note: form.note }) })
    setForm({ grade: '', comment: '', note: '' }); setAdding(null); refresh(); toast.success('تمت إضافة الدرجة')
  }
  return (<>
    <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-[#FFCE00]" />درجات الطلاب</h3>
    <div className="space-y-3">{students.map(s => {
      const sg = grades.filter(g => g.studentId === s.id)
      return (<Card key={s.id}><CardContent className="p-4">
        <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#CC0000] flex items-center justify-center text-white font-bold">{s.name?.charAt(0)?.toUpperCase()}</div><div className="font-bold">{s.name}</div></div><Button size="sm" onClick={() => setAdding(s)} className="btn-primary"><Plus className="w-3.5 h-3.5 me-1" />إضافة درجة</Button></div>
        {sg.length === 0 ? <div className="text-sm text-neutral-400 ms-12">لا توجد درجات بعد</div> : <div className="ms-12 space-y-1.5">{sg.map(g => (<div key={g.id} className="flex items-start gap-2 text-sm bg-neutral-50 p-2 rounded-lg"><Badge className="bg-[#FFCE00] text-[#1A1A1A] font-bold">{g.grade}</Badge><div className="flex-1">{g.comment && <div className="text-xs">{g.comment}</div>}{g.note && <div className="text-xs mt-1 p-1.5 bg-amber-50 border-r-2 border-amber-500 rounded-l text-amber-800"><Shield className="w-3 h-3 inline me-1" />خاص: {g.note}</div>}</div><div className="text-[10px] text-neutral-400">{new Date(g.createdAt).toLocaleDateString('ar')}</div></div>))}</div>}
      </CardContent></Card>)
    })}</div>
    {adding && (
      <Dialog open={true} onOpenChange={(o) => !o && setAdding(null)}>
        <DialogContent dir="rtl"><DialogHeader><DialogTitle>إضافة درجة لـ {adding.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>الدرجة</Label><Input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="مثال: A أو 85/100" /></div>
            <div><Label>تعليق (يراه الطالب)</Label><Textarea rows={2} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="ملاحظات عامة" /></div>
            <div><Label className="flex items-center gap-1.5 text-amber-700"><Shield className="w-3.5 h-3.5" />ملاحظة خاصة (أنت والإدارة فقط — لا يراها الطالب)</Label><Textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="ملاحظة سرية" className="border-amber-300 bg-amber-50/30" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAdding(null)}>إلغاء</Button><Button onClick={add} className="btn-primary"><Save className="w-4 h-4 me-1.5" />حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </>)
}

function TeacherAttendance({ courseId }) {
  const [sessions, setSessions] = useState([])
  const [students, setStudents] = useState([])
  const [active, setActive] = useState(null)
  const [records, setRecords] = useState({})
  useEffect(() => {
    fetch(`/api/teacher/courses/${courseId}/sessions`).then(r => r.json()).then(d => setSessions(d.sessions || []))
    fetch(`/api/teacher/courses/${courseId}/students`).then(r => r.json()).then(d => setStudents(d.students || []))
  }, [courseId])
  const open = (s) => { setActive(s); setRecords(Object.fromEntries(students.map(st => [st.id, true]))) }
  const save = async () => {
    const recs = Object.entries(records).map(([studentId, present]) => ({ studentId, present }))
    await fetch(`/api/teacher/courses/${courseId}/attendance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: active.id, records: recs }) })
    toast.success('تم حفظ الحضور'); setActive(null)
  }
  return (<>
    <h3 className="text-xl font-black mb-4">تسجيل الحضور</h3>
    {sessions.length === 0 ? <div className="text-neutral-500">أنشئ جلسة أولاً من تبويب الجلسات</div> : (<div className="grid md:grid-cols-2 gap-3">{sessions.map(s => (<Card key={s.id} className="cursor-pointer card-hover" onClick={() => open(s)}><CardContent className="p-4 flex items-center justify-between"><div><div className="font-bold">{s.title}</div><div className="text-sm text-neutral-500">{s.date} · {s.time}</div></div><ClipboardCheck className="w-5 h-5 text-[#CC0000]" /></CardContent></Card>))}</div>)}
    {active && (
      <Dialog open={true} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent dir="rtl" className="max-w-lg"><DialogHeader><DialogTitle>حضور: {active.title}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-72 overflow-y-auto">{students.map(st => (<label key={st.id} className="flex items-center justify-between p-2 border rounded-lg"><span className="font-semibold">{st.name}</span><Switch checked={records[st.id] !== false} onCheckedChange={(v) => setRecords({ ...records, [st.id]: v })} /></label>))}</div>
          <DialogFooter><Button variant="outline" onClick={() => setActive(null)}>إلغاء</Button><Button onClick={save} className="btn-primary"><Save className="w-4 h-4 me-1.5" />حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </>)
}

function TeacherAnnouncements({ courseId }) {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const refresh = () => fetch(`/api/teacher/courses/${courseId}/announcements`).then(r => r.json()).then(d => setItems(d.announcements || []))
  useEffect(() => { refresh() }, [courseId])
  const send = async () => {
    if (!text.trim()) return
    await fetch(`/api/teacher/courses/${courseId}/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    setText(''); refresh(); toast.success('تم نشر الإعلان')
  }
  return (<>
    <h3 className="text-xl font-black mb-4">الإعلانات الجماعية</h3>
    <Card className="mb-4"><CardContent className="p-4 space-y-2"><Textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="اكتب إعلاناً لكل طلاب الكورس..." /><Button onClick={send} className="btn-primary"><Megaphone className="w-4 h-4 me-1.5" />نشر</Button></CardContent></Card>
    <div className="space-y-2">{items.map(a => (<Card key={a.id}><CardContent className="p-4"><div>{a.text}</div><div className="text-xs text-neutral-500 mt-2">{a.fromName} · {new Date(a.createdAt).toLocaleString('ar')}</div></CardContent></Card>))}</div>
  </>)
}

function TeacherChat({ courseId }) {
  const [students, setStudents] = useState([])
  const [active, setActive] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  useEffect(() => { fetch(`/api/teacher/courses/${courseId}/students`).then(r => r.json()).then(d => setStudents(d.students || [])) }, [courseId])
  const load = (s) => {
    setActive(s)
    fetch(`/api/teacher/courses/${courseId}/chat?studentId=${s.id}`).then(r => r.json()).then(d => setMsgs(d.messages || []))
  }
  const send = async () => {
    if (!text.trim()) return
    await fetch(`/api/teacher/courses/${courseId}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: active.id, text }) })
    setText(''); load(active)
  }
  return (<div className="grid md:grid-cols-3 gap-4">
    <Card className="md:col-span-1"><CardContent className="p-3"><div className="font-bold mb-2">الطلاب</div><div className="space-y-1 max-h-96 overflow-y-auto">{students.map(s => (<button key={s.id} onClick={() => load(s)} className={`w-full text-start p-2 rounded-lg text-sm ${active?.id === s.id ? 'bg-[#CC0000] text-white' : 'hover:bg-neutral-100'}`}>{s.name}</button>))}</div></CardContent></Card>
    <Card className="md:col-span-2"><CardContent className="p-3">{!active ? <div className="text-center text-neutral-500 py-12">اختر طالباً لبدء المحادثة</div> : (<>
      <div className="font-bold mb-2 pb-2 border-b">محادثة مع: {active.name}</div>
      <ScrollArea className="h-72 mb-3">{msgs.length === 0 ? <div className="text-center text-neutral-400 py-8">لا رسائل</div> : msgs.map(m => (<div key={m.id} className={`mb-2 flex ${m.fromRole === 'teacher' ? 'justify-end' : 'justify-start'}`}><div className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${m.fromRole === 'teacher' ? 'bg-[#CC0000] text-white' : 'bg-neutral-100'}`}><div>{m.text}</div><div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString('ar')}</div></div></div>))}</ScrollArea>
      <div className="flex gap-2"><Input value={text} onChange={e => setText(e.target.value)} placeholder="رسالتك..." onKeyDown={e => e.key === 'Enter' && send()} /><Button onClick={send} className="btn-primary"><Send className="w-4 h-4" /></Button></div>
    </>)}</CardContent></Card>
  </div>)
}


// ==================== File Upload (uses /components/ddh/shared) ====================

function ProfilePhotoUploader({ user, onUploaded, onRemove }) {
  const [open, setOpen] = useState(false)
  return (<>
    <button onClick={() => setOpen(true)} className="absolute -bottom-1 -end-1 bg-[#CC0000] text-white p-1.5 rounded-full shadow-lg hover:bg-[#A30000] transition" title="تغيير الصورة"><Pencil className="w-3 h-3" /></button>
    {open && (
      <Dialog open={true} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader><DialogTitle>الصورة الشخصية</DialogTitle><DialogDescription>ارفع صورة شخصية لتظهر في ملفك ولمعلميك</DialogDescription></DialogHeader>
          <FileUpload folder={`ddh/users/${user.id}/profile`} accept="image/*" kind="image" maxSize={5 * 1024 * 1024} label="ارفع صورة (5MB)" onUploaded={(u) => { onUploaded(u); setOpen(false) }} />
          {onRemove && <Button variant="outline" onClick={() => { onRemove(); setOpen(false) }} className="w-full text-red-600"><Trash2 className="w-4 h-4 me-1.5" />حذف الصورة الحالية</Button>}
        </DialogContent>
      </Dialog>
    )}
  </>)
}


function PageHero({ img, title, sub }) {
  return (<div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-10"><img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 hero-overlay" /><div className="absolute top-0 right-0 left-0 h-1.5 flag-gradient-h" /><div className="absolute inset-0 flex flex-col justify-center px-8 text-white"><h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">{title}</h1><p className="text-white/85 max-w-2xl">{sub}</p></div></div>)
}
function Row({ icon: Icon, label, val }) { return <div className="flex items-start gap-2 text-neutral-700"><Icon className="w-4 h-4 text-[#CC0000] mt-0.5 shrink-0" /><span className="text-xs text-neutral-500 me-1.5 font-semibold">{label}:</span><span className="font-medium flex-1">{val}</span></div> }
function Loading({ t }) { return <div className="py-20 text-center text-neutral-500">{t.common.loading}</div> }
function Empty({ t }) { return <div className="py-12 text-center text-neutral-500 bg-white rounded-2xl border border-dashed">{t.dash.empty}</div> }

export default App
