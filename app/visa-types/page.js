'use client'
import { useState, useEffect } from 'react'
import { PhoneInput } from '@/components/ddh/PhoneInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plane, Calendar, Clock, DollarSign, ArrowRight, Phone, MessageCircle, Sparkles } from 'lucide-react'
import { Header } from '@/components/ddh/layout/Header'
import { Footer } from '@/components/ddh/layout/Footer'
import { WhatsAppFloat } from '@/components/ddh/layout/WhatsAppFloat'
import { AuthDialog } from '@/components/ddh/auth/AuthDialog'
import { T } from '@/lib/translations'
import { fetchContent, fetchList } from '@/lib/content'

export default function VisaTypesPage() {
  const [lang, setLang] = useState('ar')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [content, setContent] = useState({})
  const [types, setTypes] = useState([])
  const [faqs, setFaqs] = useState([])
  const [consultations, setConsultations] = useState([])

  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr' }, [lang])
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => d?.user && setUser(d.user)).catch(() => {})
    fetchContent('visa_page').then(setContent)
    fetchList('visa-types-list').then(setTypes)
    fetchList('visa-faqs').then(setFaqs)
    fetchList('consultation-types').then(setConsultations)
  }, [])

  // 🎯 Re-anchor to #booking AFTER async content above it has loaded (otherwise the browser's
  // initial anchor scroll gets pushed away by late-rendering sections)
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#booking') return
    const timer = setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 450)
    return () => clearTimeout(timer)
  }, [types, consultations])

  const t = T[lang]
  const goto = (id) => {
    if (id === 'home') window.location.href = '/'
    else window.location.href = `/?page=${id}`
  }
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); window.location.href = '/' }

  const scrollToBooking = () => {
    const el = document.getElementById('booking')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-white">
      <Header t={t} lang={lang} setLang={setLang} page="visa-types" goto={goto} user={user} navOpen={navOpen} setNavOpen={setNavOpen} setAuthMode={setAuthMode} logout={logout} />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#CC0000] text-white py-20 overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 flag-gradient-h" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Badge className="bg-[#FFCE00] text-[#1A1A1A] hover:bg-[#FFCE00] mb-5 px-3 py-1 font-bold"><Sparkles className="w-3.5 h-3.5 me-1" />خدمات التأشيرات</Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-4">{content.heroTitle || 'خدمات التأشيرات والاستشارات'}</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">{content.heroSubtitle || 'دليلك الشامل للسفر والدراسة والعمل في ألمانيا'}</p>
            <Button onClick={scrollToBooking} className="btn-gold px-7 py-6 rounded-xl font-bold text-base"><Calendar className="w-5 h-5 me-2" />احجز استشارتك الآن</Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-2 flag-gradient-h" />
        </section>

        {/* Visa Types Cards */}
        <section className="py-16 bg-[#FAFAF8]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3">{content.cardsTitle || 'أنواع التأشيرات'}</h2>
              {content.cardsSubtitle && <p className="text-neutral-600">{content.cardsSubtitle}</p>}
            </div>
            {types.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">جاري التحميل...</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {types.map((v) => (
                  <Card key={v.id} className="card-hover border-2 border-transparent hover:border-[#FFCE00]/50">
                    <CardContent className="p-7">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl" style={{ background: `${v.color || '#CC0000'}15` }}>{v.emoji || '✈️'}</div>
                      <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                      <p className="text-neutral-600 text-sm leading-relaxed mb-4">{v.description}</p>
                      {v.link ? (
                        <a href={v.link} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#CC0000]">المزيد <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></a>
                      ) : (
                        <button onClick={scrollToBooking} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#CC0000]">احجز استشارة <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} /></button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black mb-3">{content.faqTitle || 'الأسئلة الشائعة'}</h2>
                {content.faqSubtitle && <p className="text-neutral-600">{content.faqSubtitle}</p>}
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((f) => (
                  <AccordionItem key={f.id} value={f.id} className="bg-white border-2 rounded-xl px-5">
                    <AccordionTrigger className="text-start font-bold py-4 hover:no-underline">{f.question}</AccordionTrigger>
                    <AccordionContent className="text-neutral-700 leading-relaxed pb-4 whitespace-pre-line">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Booking Form */}
        <section id="booking" className="py-16 bg-gradient-to-br from-[#FAFAF8] to-white scroll-mt-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3">{content.bookingTitle || 'احجز موعد استشارة'}</h2>
              {content.bookingSubtitle && <p className="text-neutral-600">{content.bookingSubtitle}</p>}
            </div>
            <ConsultationBookingForm consultations={consultations} user={user} lang={lang} />
          </div>
        </section>
      </main>
      <Footer t={t} lang={lang} goto={goto} />
      <WhatsAppFloat />
      {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} onAuth={(u) => { setUser(u); setAuthMode(null) }} t={t} lang={lang} />}
    </div>
  )
}

// ===== Slot-based consultation booking (Availability Slots → Bookings) =====
const BOOK_L = {
  ar: {
    title: 'احجز موعد استشارة', chooseDay: 'اختر اليوم', chooseTime: 'اختر الوقت المناسب',
    yourInfo: 'معلوماتك', name: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'رقم الهاتف',
    type: 'نوع الاستشارة', typePh: 'اختر نوع الاستشارة', notes: 'ملاحظات إضافية', notesPh: 'أخبرنا عن وضعك أو أسئلتك...',
    summary: 'ملخص الحجز', date: 'التاريخ', time: 'الوقت', duration: 'المدة', min: 'دقيقة',
    submit: 'تأكيد الحجز', submitting: 'جاري الحجز...',
    successTitle: 'تم تأكيد حجزك بنجاح!', successNext: 'سيتواصل معك فريقنا قبل الموعد لتأكيد التفاصيل. إذا احتجت لتعديل أو إلغاء الموعد، تواصل معنا عبر واتساب أو البريد.',
    bookAnother: 'حجز موعد آخر', free: 'مجاناً',
    empty: 'لا توجد مواعيد استشارة متاحة حالياً.', emptySub: 'يرجى المحاولة لاحقاً أو التواصل معنا مباشرة عبر واتساب.',
    contactUs: 'تواصل عبر واتساب', slotTaken: 'عذراً — تم حجز هذا الموعد للتو. اختر وقتاً آخر.',
    errGeneric: 'حدث خطأ، يرجى المحاولة مجدداً', required: 'يرجى تعبئة الاسم والبريد ورقم الهاتف',
    available: 'متاح',
  },
  de: {
    title: 'Beratungstermin buchen', chooseDay: 'Tag auswählen', chooseTime: 'Passende Uhrzeit wählen',
    yourInfo: 'Ihre Angaben', name: 'Vollständiger Name', email: 'E-Mail', phone: 'Telefonnummer',
    type: 'Beratungsart', typePh: 'Beratungsart wählen', notes: 'Anmerkungen', notesPh: 'Erzählen Sie uns kurz von Ihrem Anliegen...',
    summary: 'Buchungsübersicht', date: 'Datum', time: 'Uhrzeit', duration: 'Dauer', min: 'Minuten',
    submit: 'Termin verbindlich buchen', submitting: 'Wird gebucht...',
    successTitle: 'Ihr Termin wurde erfolgreich gebucht!', successNext: 'Unser Team meldet sich vor dem Termin bei Ihnen, um die Details zu bestätigen. Für Änderungen oder Stornierungen kontaktieren Sie uns bitte per WhatsApp oder E-Mail.',
    bookAnother: 'Weiteren Termin buchen', free: 'Kostenlos',
    empty: 'Derzeit sind keine Beratungstermine verfügbar.', emptySub: 'Bitte schauen Sie später wieder vorbei oder kontaktieren Sie uns direkt.',
    contactUs: 'Per WhatsApp kontaktieren', slotTaken: 'Dieser Termin wurde soeben vergeben. Bitte wählen Sie eine andere Uhrzeit.',
    errGeneric: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', required: 'Bitte Name, E-Mail und Telefonnummer angeben',
    available: 'Verfügbar',
  },
}

function fmtDay(dateStr, lang) {
  try {
    const d = new Date(`${dateStr}T12:00:00`)
    return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'ar-SY', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
  } catch { return dateStr }
}

function ConsultationBookingForm({ consultations, user, lang = 'ar' }) {
  const L = BOOK_L[lang] || BOOK_L.ar
  const [slots, setSlots] = useState(null) // null = loading
  const [selDate, setSelDate] = useState(null)
  const [selSlot, setSelSlot] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', consultationTypeId: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const loadSlots = () => fetch('/api/consultation-slots').then(r => r.json()).then(d => setSlots(d.slots || [])).catch(() => setSlots([]))
  useEffect(() => { loadSlots() }, [])
  useEffect(() => { if (user) setForm(f => ({ ...f, name: user.name, email: user.email, phone: user.phone || '' })) }, [user])
  useEffect(() => { if (!form.consultationTypeId && consultations.length > 0) setForm(f => ({ ...f, consultationTypeId: consultations[0].id })) }, [consultations])

  const byDate = {}
  ;(slots || []).forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s) })
  const dates = Object.keys(byDate).sort()
  useEffect(() => { if (dates.length && (!selDate || !byDate[selDate])) setSelDate(dates[0]) }, [slots]) // eslint-disable-line

  const selected = consultations.find(c => c.id === form.consultationTypeId)
  const waNum = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '4915254196668').replace(/\D/g, '')

  const submit = async (e) => {
    e.preventDefault()
    if (submitting) return // double-submit guard
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) { toast.error(L.required); return }
    setSubmitting(true)
    try {
      const r = await fetch('/api/consultation-bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selSlot.id, ...form }),
      })
      const d = await r.json()
      if (r.status === 409) { toast.error(L.slotTaken); setSelSlot(null); setSlots(null); loadSlots() }
      else if (d.error) toast.error(d.error)
      else { setSuccess(d.booking); setSlots(null); loadSlots() }
    } catch { toast.error(L.errGeneric) }
    setSubmitting(false)
  }

  // ✅ SUCCESS STATE
  if (success) {
    return (
      <Card className="border-2 border-green-200 bg-green-50/40 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h3 className="text-2xl font-black mb-4">{L.successTitle}</h3>
          <div className="inline-block text-start bg-white border rounded-xl p-5 mb-5 space-y-1.5 text-sm">
            <div><strong>{L.date}:</strong> {fmtDay(success.slotDate, lang)}</div>
            <div><strong>{L.time}:</strong> <span dir="ltr">{success.slotTime} – {success.slotEndTime}</span></div>
            <div><strong>{L.duration}:</strong> {success.duration} {L.min}</div>
            {success.consultationTypeName && <div><strong>{L.type}:</strong> {success.consultationTypeName}</div>}
          </div>
          <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6">{L.successNext}</p>
          <Button onClick={() => { setSuccess(null); setSelSlot(null) }} variant="outline" className="font-bold">{L.bookAnother}</Button>
        </CardContent>
      </Card>
    )
  }

  // ⏳ LOADING
  if (slots === null) {
    return <Card className="border-2 border-[#FFCE00]/30"><CardContent className="p-12 text-center text-neutral-400">...</CardContent></Card>
  }

  // 📭 EMPTY STATE
  if (dates.length === 0) {
    return (
      <Card className="border-2 border-neutral-200 shadow-lg">
        <CardContent className="p-10 text-center">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-black mb-2">{L.empty}</h3>
          <p className="text-neutral-500 text-sm mb-6">{L.emptySub}</p>
          <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"><MessageCircle className="w-5 h-5" />{L.contactUs}</a>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[#FFCE00]/30 shadow-lg">
      <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#CC0000]" />{L.title}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* STEP 1 — day */}
        <div>
          <Label className="font-bold mb-2 block">1. {L.chooseDay}</Label>
          <div className="flex flex-wrap gap-2">
            {dates.map(d => (
              <button key={d} type="button" onClick={() => { setSelDate(d); setSelSlot(null) }}
                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition ${selDate === d ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white border-neutral-200 hover:border-[#FFCE00]'}`}>
                {fmtDay(d, lang)}
              </button>
            ))}
          </div>
        </div>
        {/* STEP 2 — time */}
        {selDate && (
          <div>
            <Label className="font-bold mb-2 block">2. {L.chooseTime}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(byDate[selDate] || []).map(s => (
                <button key={s.id} type="button" onClick={() => setSelSlot(s)}
                  className={`px-3 py-3 rounded-xl border-2 text-sm font-bold transition ${selSlot?.id === s.id ? 'bg-[#CC0000] text-white border-[#CC0000]' : 'bg-white border-neutral-200 hover:border-[#CC0000]/50'}`}>
                  <span dir="ltr">{s.startTime} – {s.endTime}</span>
                  <span className="block text-[10px] font-semibold opacity-70 mt-0.5">{selSlot?.id === s.id ? '✓' : L.available} · {s.duration} {L.min}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* STEP 3 — info + summary */}
        {selSlot && (
          <form onSubmit={submit} className="space-y-3 border-t pt-5">
            <Label className="font-bold block">3. {L.yourInfo}</Label>
            <div className="p-3 bg-yellow-50 border border-[#FFCE00]/50 rounded-xl text-sm flex flex-wrap gap-x-4 gap-y-1">
              <strong>{L.summary}:</strong>
              <span>{fmtDay(selSlot.date, lang)}</span>
              <span dir="ltr">{selSlot.startTime} – {selSlot.endTime}</span>
              <span>{selSlot.duration} {L.min}</span>
            </div>
            <div><Label>{L.name} *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>{L.email} *</Label><Input type="email" dir="ltr" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>{L.phone} *</Label><PhoneInput lang={lang} defaultCode={lang === 'ar' ? '+963' : '+49'} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></div>
            </div>
            <div>
              <Label>{L.type}</Label>
              <Select value={form.consultationTypeId} onValueChange={(v) => setForm({ ...form, consultationTypeId: v })}>
                <SelectTrigger><SelectValue placeholder={L.typePh} /></SelectTrigger>
                <SelectContent>
                  {consultations.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} · {c.price > 0 ? `$${c.price}` : L.free}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>{L.notes}</Label><Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={L.notesPh} /></div>
            <Button type="submit" disabled={submitting} className="w-full btn-primary py-6 font-bold text-base">{submitting ? L.submitting : L.submit}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
