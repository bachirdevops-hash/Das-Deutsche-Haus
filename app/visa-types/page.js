'use client'
import { useState, useEffect } from 'react'
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
            <ConsultationBookingForm consultations={consultations} user={user} />
          </div>
        </section>
      </main>
      <Footer t={t} lang={lang} goto={goto} />
      <WhatsAppFloat />
      {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} onAuth={(u) => { setUser(u); setAuthMode(null) }} t={t} lang={lang} />}
    </div>
  )
}

function ConsultationBookingForm({ consultations, user }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', consultationTypeId: '', preferredDate: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (user) setForm(f => ({ ...f, name: user.name, email: user.email, phone: user.phone || '' })) }, [user])
  useEffect(() => { if (!form.consultationTypeId && consultations.length > 0) setForm(f => ({ ...f, consultationTypeId: consultations[0].id })) }, [consultations])

  const selected = consultations.find(c => c.id === form.consultationTypeId)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = {
        ...form,
        visaType: selected?.name || 'consultation',
        consultationTypeName: selected?.name,
        durationMinutes: selected?.durationMinutes,
        price: selected?.price,
      }
      const r = await fetch('/api/travel/consultations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (d.error) toast.error(d.error)
      else {
        toast.success('تم حجز الاستشارة بنجاح! سنتواصل معك قريباً.')
        setForm({ name: '', email: '', phone: '', consultationTypeId: consultations[0]?.id || '', preferredDate: '', notes: '' })
      }
    } catch (err) { toast.error('حدث خطأ، حاول مجدداً') }
    setSubmitting(false)
  }

  return (
    <Card className="border-2 border-[#FFCE00]/30 shadow-lg">
      <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#CC0000]" />احجز موعد استشارة</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>الاسم الكامل</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>البريد الإلكتروني</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>رقم الهاتف</Label><Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div>
            <Label>نوع الاستشارة</Label>
            <Select value={form.consultationTypeId} onValueChange={(v) => setForm({ ...form, consultationTypeId: v })}>
              <SelectTrigger><SelectValue placeholder="اختر نوع الاستشارة" /></SelectTrigger>
              <SelectContent>
                {consultations.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-xs text-neutral-500">{c.durationMinutes} دقيقة · {c.price > 0 ? `$${c.price}` : 'مجاناً'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <div className="mt-2 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-700 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selected.durationMinutes} دقيقة</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{selected.price > 0 ? `$${selected.price}` : 'مجاناً'}</span>
                {selected.description && <span className="w-full">{selected.description}</span>}
              </div>
            )}
          </div>
          <div><Label>التاريخ المفضل</Label><Input type="date" value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} /></div>
          <div><Label>ملاحظات إضافية</Label><Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أخبرنا عن وضعك أو أسئلتك..." /></div>
          <Button type="submit" disabled={submitting} className="w-full btn-primary py-6 font-bold text-base">{submitting ? 'جاري الإرسال...' : 'احجز الاستشارة'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
