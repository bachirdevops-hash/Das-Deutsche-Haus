'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Briefcase, Clock, Euro, CheckCircle2, Send, ArrowRight, ClipboardCheck, HelpCircle, Building2 } from 'lucide-react'
import { Header } from '@/components/ddh/layout/Header'
import { Footer } from '@/components/ddh/layout/Footer'
import { WhatsAppFloat } from '@/components/ddh/layout/WhatsAppFloat'
import { AuthDialog } from '@/components/ddh/auth/AuthDialog'
import { AusbildungApplication } from '@/components/ddh/AusbildungApplication'
import { T } from '@/lib/translations'

// Parses FAQ text blocks: each block separated by an empty line;
// first line = question, remaining lines = answer.
function parseFaq(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map(block => {
      const lines = block.trim().split('\n')
      if (lines.length < 2) return null
      return { q: lines[0].trim(), a: lines.slice(1).join('\n').trim() }
    })
    .filter(Boolean)
}

export default function AusbildungDetailPage() {
  const params = useParams()
  const slug = params?.slug
  const [lang, setLang] = useState('ar')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [job, setJob] = useState(undefined) // undefined = loading, null = not found

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('ddh_lang')
    if (saved === 'de' || saved === 'ar') setLang(saved)
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    if (typeof window !== 'undefined') localStorage.setItem('ddh_lang', lang)
  }, [lang])

  useEffect(() => {
    if (!slug) return
    fetch('/api/auth/me').then(r => r.json()).then(d => d?.user && setUser(d.user)).catch(() => {})
    fetch(`/api/vocational/jobs/${encodeURIComponent(slug)}`).then(r => r.ok ? r.json() : { job: null })
      .then(d => setJob(d.job || null))
      .catch(() => setJob(null))
  }, [slug])

  useEffect(() => {
    if (job) document.title = `${lang === 'ar' ? job.title_ar : job.title_de} — Ausbildung — Das Deutsche Haus`
  }, [job, lang])

  const t = T[lang]
  const ar = lang === 'ar'
  const goto = (id) => {
    if (id === 'home') window.location.href = '/'
    else window.location.href = `/?page=${id}`
  }
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); window.location.href = '/' }

  const scrollToApply = () => {
    document.getElementById('bewerbung')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', '#bewerbung')
  }

  const L = {
    apply: ar ? 'قدّم الآن' : 'Jetzt bewerben',
    duration: ar ? 'مدة التدريب' : 'Dauer',
    salary: ar ? 'الراتب الشهري' : 'Monatliches Gehalt',
    requirements: ar ? 'الشروط والمتطلبات' : 'Voraussetzungen',
    about: ar ? 'عن هذه المهنة' : 'Über diesen Beruf',
    career: ar ? 'أين ستعمل بعد التخرج؟' : 'Wo arbeiten Sie danach?',
    steps: ar ? 'خطوات التقديم معنا' : 'So läuft die Bewerbung ab',
    faq: ar ? 'أسئلة شائعة' : 'Häufige Fragen',
    back: ar ? 'كل فرص الـ Ausbildung' : 'Alle Ausbildungen',
    notFound: ar ? 'هذه الفرصة غير متاحة حالياً' : 'Diese Ausbildung ist derzeit nicht verfügbar.',
    notFoundSub: ar ? 'ربما تم إيقافها أو تغيير رابطها. تصفح الفرص المتاحة حالياً.' : 'Sie wurde möglicherweise deaktiviert. Sehen Sie sich die aktuellen Angebote an.',
    partner: ar ? 'جهة التدريب' : 'Träger',
  }

  const pick = (arVal, deVal) => (ar ? (arVal || deVal) : (deVal || arVal)) || ''

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-white">
      <Header t={t} lang={lang} setLang={setLang} page="ausbildung" goto={goto} user={user} navOpen={navOpen} setNavOpen={setNavOpen} setAuthMode={setAuthMode} logout={logout} />
      <main className="flex-1 pt-20">
        {job === undefined && (
          <div className="min-h-[50vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-neutral-200 border-t-[#CC0000] rounded-full animate-spin" /></div>
        )}

        {job === null && (
          <div className="min-h-[50vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <Briefcase className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
              <h1 className="text-2xl font-black mb-2">{L.notFound}</h1>
              <p className="text-neutral-500 mb-6">{L.notFoundSub}</p>
              <Button onClick={() => goto('vocational')} className="btn-primary font-bold">{L.back}</Button>
            </div>
          </div>
        )}

        {job && (
          <>
            {/* ===== Hero ===== */}
            <section className="relative bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#2C5F9E] text-white py-16 overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 flag-gradient-h" />
              <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge className="bg-[#FFCE00] text-[#1A1A1A] hover:bg-[#FFCE00] font-bold"><Briefcase className="w-3.5 h-3.5 me-1" />Ausbildung</Badge>
                    {job.partner && <Badge className="bg-white/15 text-white hover:bg-white/15 border border-white/25"><Building2 className="w-3.5 h-3.5 me-1" />{job.partner}</Badge>}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">{ar ? job.title_ar : job.title_de}</h1>
                  <p className="text-white/70 text-lg mb-7" dir="ltr">{ar ? job.title_de : ''}</p>
                  <Button onClick={scrollToApply} className="btn-primary px-8 py-6 rounded-xl font-black text-base">
                    <Send className="w-5 h-5 me-2" />{L.apply}
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2 flag-gradient-h" />
            </section>

            {/* ===== Key facts ===== */}
            <section className="bg-[#FAFAF8] py-10">
              <div className="container mx-auto px-4">
                <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {pick(job.duration_ar, job.duration_de) && (
                    <Card><CardContent className="p-5 flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-[#CC0000]/10 flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-[#CC0000]" /></div><div><div className="text-xs text-neutral-500 font-bold">{L.duration}</div><div className="font-black">{pick(job.duration_ar, job.duration_de)}</div></div></CardContent></Card>
                  )}
                  {job.salary && (
                    <Card><CardContent className="p-5 flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-[#FFCE00]/30 flex items-center justify-center shrink-0"><Euro className="w-5 h-5 text-[#1A1A1A]" /></div><div><div className="text-xs text-neutral-500 font-bold">{L.salary}</div><div className="font-black" dir="ltr">{job.salary}</div></div></CardContent></Card>
                  )}
                  {job.partner && (
                    <Card><CardContent className="p-5 flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-[#2C5F9E]/10 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5 text-[#2C5F9E]" /></div><div><div className="text-xs text-neutral-500 font-bold">{L.partner}</div><div className="font-black">{job.partner}</div></div></CardContent></Card>
                  )}
                </div>
              </div>
            </section>

            {/* ===== Content sections (render only what the admin filled) ===== */}
            <section className="py-12">
              <div className="container mx-auto px-4 max-w-3xl space-y-10">
                {pick(job.description_ar, job.description_de) && (
                  <div>
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Briefcase className="w-6 h-6 text-[#CC0000]" />{L.about}</h2>
                    <p className="text-neutral-700 leading-loose whitespace-pre-line">{pick(job.description_ar, job.description_de)}</p>
                  </div>
                )}

                {pick(job.requirements_ar, job.requirements_de) && (
                  <div>
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-[#CC0000]" />{L.requirements}</h2>
                    <Card><CardContent className="p-6 text-neutral-700 leading-relaxed whitespace-pre-line">{pick(job.requirements_ar, job.requirements_de)}</CardContent></Card>
                  </div>
                )}

                {pick(job.career_ar, job.career_de) && (
                  <div>
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Building2 className="w-6 h-6 text-[#CC0000]" />{L.career}</h2>
                    <p className="text-neutral-700 leading-loose whitespace-pre-line">{pick(job.career_ar, job.career_de)}</p>
                  </div>
                )}

                {pick(job.steps_ar, job.steps_de) && (
                  <div>
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><ClipboardCheck className="w-6 h-6 text-[#CC0000]" />{L.steps}</h2>
                    <ol className="space-y-3">
                      {pick(job.steps_ar, job.steps_de).split('\n').map(s => s.trim()).filter(Boolean).map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-[#FFCE00] font-black text-sm flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-neutral-700 leading-relaxed pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {parseFaq(pick(job.faq_ar, job.faq_de)).length > 0 && (
                  <div>
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><HelpCircle className="w-6 h-6 text-[#CC0000]" />{L.faq}</h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {parseFaq(pick(job.faq_ar, job.faq_de)).map((f, i) => (
                        <AccordionItem key={i} value={`faq-${i}`} className="bg-white border-2 rounded-xl px-5">
                          <AccordionTrigger className="text-start font-bold py-4 hover:no-underline">{f.q}</AccordionTrigger>
                          <AccordionContent className="text-neutral-700 leading-relaxed pb-4 whitespace-pre-line">{f.a}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            </section>

            {/* ===== Application form (shared component, job preselected) ===== */}
            <section className="pb-16 bg-gradient-to-br from-[#FAFAF8] to-white pt-4">
              <div className="container mx-auto px-4">
                <AusbildungApplication lang={lang} user={user} job={job} />
                <div className="text-center mt-8">
                  <button onClick={() => goto('vocational')} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#CC0000]">
                    {L.back} <ArrowRight className={`w-4 h-4 ${ar ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer t={t} lang={lang} goto={goto} />
      <WhatsAppFloat />
      {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} onAuth={(u) => { setUser(u); setAuthMode(null) }} t={t} lang={lang} />}
    </div>
  )
}
