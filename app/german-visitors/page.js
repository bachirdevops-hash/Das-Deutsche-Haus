'use client'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Star, Calendar, Users, Globe, Phone, Mail, MapPin, MessageCircle, ArrowRight, Clock, Euro, CheckCircle2, X, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, AlertTriangle, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { LOGO_URL } from '@/lib/constants'

const SERVICE_GROUPS = [
  { key: 'before', title: 'Vor der Ankunft', items: [
    { id: 'consult', label: 'Online-Beratung über Syrien (30 Min Video-Call)' },
    { id: 'arabic-mini', label: 'Intensiver Arabisch-Mini-Kurs (online, 1 Woche)' },
    { id: 'guide-pdf', label: 'Syrien 2026 — kompletter Reiseführer (PDF per E-Mail)' },
    { id: 'visa', label: 'Hilfe bei Visum & Einreise-Verfahren' },
    { id: 'insurance', label: 'Reiseversicherungs-Empfehlung' },
  ]},
  { key: 'arrival', title: 'Bei der Ankunft', items: [
    { id: 'pickup', label: 'Flughafen-Abholung (privates Auto)' },
    { id: 'accommodation', label: 'Sichere Unterkunft organisieren' },
    { id: 'translator', label: 'Persönlicher Deutsch-Arabisch Guide / Übersetzer' },
    { id: 'sim', label: 'SIM-Karte + Internetpaket' },
    { id: 'orientation', label: 'Orientierungstour (erster Tag)' },
  ]},
  { key: 'stay', title: 'Während des Aufenthalts', items: [
    { id: 'daily-guide', label: 'Täglicher privater Guide' },
    { id: 'business', label: 'Geschäftstermine arrangieren' },
    { id: 'translation', label: 'Übersetzungsdienste (Dokumente / Meetings)' },
    { id: 'family-dinner', label: 'Abendessen bei lokaler Familie' },
    { id: 'photo-tour', label: 'Fotografie-Tour Guide' },
    { id: 'cooking', label: 'Kochkurs-Buchung' },
    { id: 'desert', label: 'Wüsten- / Palmyra-Ausflug' },
    { id: 'emergency', label: 'Notfall-Support (24/7)' },
  ]},
]

const LOCATIONS = [
  { value: 'germany', label: 'Noch in Deutschland' },
  { value: 'transit', label: 'Auf dem Weg (Transit)' },
  { value: 'syria', label: 'Bereits in Syrien' },
  { value: 'jordan', label: 'In Jordanien' },
  { value: 'lebanon', label: 'Im Libanon' },
]

export default function GermanVisitorsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null) // index in gallery
  const [flippedCards, setFlippedCards] = useState({})

  useEffect(() => {
    api.get('/api/german/page-data', { silent: true }).then(r => {
      if (r.ok) setData(r.data)
      setLoading(false)
    })
    document.documentElement.lang = 'de'
    document.documentElement.dir = 'ltr'
    document.title = 'Willkommen in Syrien — Das Deutsche Haus'
  }, [])

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#FFCE00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/70">Wird geladen...</p>
        </div>
      </div>
    )
  }

  const { settings, why, packages, experiences, faq, flashcards, testimonials, gallery, emergency } = data
  const embassies = emergency.filter(e => e.category === 'embassy')
  const syriaEm = emergency.filter(e => e.category === 'syria_emergency')
  const ddhSupport = emergency.filter(e => e.category === 'ddh_support')[0]
  const waNumber = (settings?.whatsapp_number || ddhSupport?.phone || '963111234567').replace(/\D/g, '')

  return (
    <ErrorBoundary>
      <div lang="de" dir="ltr" className="min-h-screen bg-white text-[#1A1A1A]" style={{ fontFamily: "'Inter','IBM Plex Sans',system-ui,sans-serif" }}>
        <TopNav settings={settings} waNumber={waNumber} />
        <Hero settings={settings} />
        <WhySyria why={why} />
        {settings.show_packages && <Packages packages={packages} waNumber={waNumber} />}
        {settings.show_experiences && <Experiences experiences={experiences} />}
        {settings.show_faq && <FAQSection faq={faq} />}
        {settings.show_flashcards && <Flashcards flashcards={flashcards} flippedCards={flippedCards} setFlippedCards={setFlippedCards} />}
        {settings.show_testimonials && <Testimonials testimonials={testimonials} />}
        {settings.show_gallery && <Gallery gallery={gallery} setLightbox={setLightbox} />}
        {settings.show_booking && <BookingForm packages={packages} />}
        {settings.show_service_request && <ServiceRequestForm />}
        {settings.show_emergency && <EmergencySection embassies={embassies} syriaEm={syriaEm} ddhSupport={ddhSupport} waNumber={waNumber} />}
        <FooterDE />

        {lightbox !== null && <Lightbox gallery={gallery} index={lightbox} onClose={() => setLightbox(null)} setIndex={setLightbox} />}
        <StickyEmergencyBar waNumber={waNumber} />
      </div>
    </ErrorBoundary>
  )
}

// ============== TOP NAV ==============
function TopNav({ settings, waNumber }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200 shadow-sm">
      <div className="h-1 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
      <div className="container mx-auto px-4 h-[64px] flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 group">
          <img src={LOGO_URL} alt="Das Deutsche Haus" className="h-12 w-auto object-contain group-hover:scale-105 transition" />
          <span className="hidden md:inline text-sm font-bold text-neutral-700">Das Deutsche Haus</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-700">
          <a href="#packages" className="hover:text-[#CC0000] transition">Reisepakete</a>
          <a href="#experiences" className="hover:text-[#CC0000] transition">Erlebnisse</a>
          <a href="#faq" className="hover:text-[#CC0000] transition">FAQ</a>
          <a href="#booking" className="hover:text-[#CC0000] transition">Buchen</a>
        </nav>
        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition shadow-md">
          <MessageCircle className="w-4 h-4" /> WhatsApp 24/7
        </a>
      </div>
    </header>
  )
}

// ============== HERO ==============
function Hero({ settings }) {
  return (
    <section className="relative min-h-[640px] md:min-h-[720px] flex items-center overflow-hidden bg-[#0A0A0A] pt-16">
      <div className="absolute inset-0">
        <img src={settings.hero_image} alt="Syria" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
      <div className="absolute top-16 left-0 right-0 h-1.5 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
      <div className="relative container mx-auto px-4 py-20 text-white">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#FFCE00]/15 backdrop-blur border border-[#FFCE00]/40 text-[#FFCE00] px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" /> Brücke zwischen Deutschland und Syrien
          </div>
          <h1 className="text-4xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">{settings.hero_title}</h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-2xl leading-relaxed">{settings.hero_subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <a href={settings.cta1_link || '#packages'} className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#A30000] text-white px-7 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition">
              {settings.cta1_text} <ArrowRight className="w-5 h-5" />
            </a>
            <a href={settings.cta2_link || '#booking'} className="inline-flex items-center gap-2 bg-[#FFCE00] hover:bg-[#E6B800] text-[#1A1A1A] px-7 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-yellow-500/30 hover:-translate-y-0.5 transition">
              {settings.cta2_text}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============== WHY SYRIA ==============
function WhySyria({ why }) {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-[#FFCE00]/20 text-[#1A1A1A] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Warum Syrien?</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Eine einzigartige Reise erwartet Sie</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {why.map(c => (
            <div key={c.id} className="group bg-white rounded-3xl p-7 border border-neutral-200 hover:border-[#FFCE00] hover:shadow-2xl hover:-translate-y-1 transition">
              <div className="w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-[#FFCE00]/20 to-[#CC0000]/10 flex items-center justify-center text-3xl">{c.icon}</div>
              <h3 className="text-lg font-black mb-2">{c.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============== PACKAGES ==============
function Packages({ packages, waNumber }) {
  const STATUS_BADGE = {
    Available: { label: 'Verfügbar', cls: 'bg-green-100 text-green-700 border-green-300' },
    Full: { label: 'Ausgebucht', cls: 'bg-red-100 text-red-700 border-red-300' },
    'Coming Soon': { label: 'Demnächst', cls: 'bg-blue-100 text-blue-700 border-blue-300' },
  }
  const DIFF_BADGE = {
    Easy: { label: 'Einfach', cls: 'bg-green-50 text-green-600' },
    Medium: { label: 'Mittel', cls: 'bg-yellow-50 text-yellow-700' },
    Adventure: { label: 'Abenteuer', cls: 'bg-orange-50 text-orange-700' },
  }
  return (
    <section id="packages" className="py-20 bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-[#CC0000]/20 text-[#FFCE00] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Reisepakete</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Wählen Sie Ihr Abenteuer</h2>
          <p className="text-white/60 mt-3 max-w-2xl mx-auto">Von der Damaskus-Klassik bis zum Wüsten-Abenteuer — alles inklusive, alles auf Deutsch.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(p => {
            const status = STATUS_BADGE[p.status] || STATUS_BADGE.Available
            const diff = DIFF_BADGE[p.difficulty] || DIFF_BADGE.Easy
            const waMsg = encodeURIComponent(`Hallo! Ich interessiere mich für das Paket "${p.name}" (${p.duration_days} Tage / €${p.price_eur}).`)
            return (
              <div key={p.id} className="group bg-[#1A1A1A] rounded-3xl overflow-hidden border border-white/10 hover:border-[#FFCE00]/50 hover:shadow-2xl transition">
                <div className="relative h-56 overflow-hidden">
                  <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${status.cls}`}>{status.label}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${diff.cls}`}>{diff.label}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#FFCE00] text-[#1A1A1A] px-3 py-1.5 rounded-xl font-black text-lg">€{p.price_eur}</div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-black mb-1">{p.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-white/60">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{p.duration_days} Tage</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />Max {p.max_group}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.cities || []).map(c => <span key={c} className="text-[10px] bg-white/10 px-2 py-1 rounded-full">{c}</span>)}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#FFCE00] uppercase mb-1.5">Inklusive</div>
                    <ul className="space-y-1">
                      {(p.included || []).slice(0, 4).map((x, i) => <li key={i} className="text-xs text-white/80 flex gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />{x}</li>)}
                      {(p.included || []).length > 4 && <li className="text-xs text-white/50 italic">+ {(p.included || []).length - 4} weitere</li>}
                    </ul>
                  </div>
                  <a href={`https://wa.me/${waNumber}?text=${waMsg}`} target="_blank" rel="noreferrer" className="block w-full py-3 rounded-xl bg-[#CC0000] hover:bg-[#A30000] text-white font-bold text-center text-sm transition">Jetzt buchen via WhatsApp</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============== EXPERIENCES ==============
function Experiences({ experiences }) {
  return (
    <section id="experiences" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-[#FFCE00]/20 text-[#1A1A1A] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Einzigartige Erlebnisse</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Mehr als nur eine Reise</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map(e => (
            <div key={e.id} className="group bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:shadow-2xl hover:-translate-y-1 transition">
              <div className="relative h-48 overflow-hidden">
                <img src={e.cover_image} alt={e.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl">{e.icon}</div>
                <div className="absolute bottom-3 right-3 bg-[#1A1A1A]/80 backdrop-blur text-white px-2.5 py-1 rounded-lg text-xs font-bold">€{e.price_eur} / Person</div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-black mb-1.5">{e.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-3 line-clamp-3">{e.description}</p>
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="inline-flex items-center gap-1 text-neutral-500"><Clock className="w-3 h-3" />{e.duration}</span>
                  <span className="inline-flex items-center gap-1 text-neutral-500"><Users className="w-3 h-3" />Max {e.max_participants}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============== FAQ ==============
function FAQSection({ faq }) {
  return (
    <section id="faq" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-[#CC0000]/10 text-[#CC0000] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Praktische Infos</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Häufige Fragen</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faq.map(q => (
            <AccordionItem key={q.id} value={q.id} className="bg-white rounded-2xl border border-neutral-200 px-5 data-[state=open]:border-[#FFCE00] data-[state=open]:shadow-md">
              <AccordionTrigger className="text-left font-bold hover:no-underline py-4">{q.question}</AccordionTrigger>
              <AccordionContent className="text-neutral-700 leading-relaxed pb-5">{q.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

// ============== FLASHCARDS ==============
function Flashcards({ flashcards, flippedCards, setFlippedCards }) {
  const flip = (id) => setFlippedCards(p => ({ ...p, [id]: !p[id] }))
  return (
    <section className="py-20 bg-gradient-to-br from-[#FFCE00]/10 via-white to-[#CC0000]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-[#1A1A1A] text-[#FFCE00] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Interaktiv</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Lerne 10 wichtige arabische Wörter</h2>
          <p className="text-neutral-600 mt-3 max-w-xl mx-auto">Bevor du nach Syrien reist — die Einheimischen freuen sich über jedes Wort! Klicke auf eine Karte zum Umdrehen.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {flashcards.map(f => {
            const flipped = !!flippedCards[f.id]
            return (
              <button
                key={f.id}
                onClick={() => flip(f.id)}
                className="group relative h-36 [perspective:1000px] focus:outline-none"
                aria-label={`Karte: ${f.de}`}
              >
                <div className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-2xl border-2 border-neutral-200 group-hover:border-[#FFCE00] shadow-md flex flex-col items-center justify-center p-3 text-center">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase mb-2">Deutsch</div>
                    <div className="text-xl font-black">{f.de}</div>
                    <div className="text-[10px] text-neutral-400 mt-2">Klicken zum Umdrehen ↻</div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[#1A1A1A] to-[#330000] text-white rounded-2xl border-2 border-[#FFCE00] shadow-lg flex flex-col items-center justify-center p-3 text-center">
                    <div className="text-[10px] font-bold text-[#FFCE00] uppercase mb-1">Arabisch</div>
                    <div className="text-2xl font-black mb-1" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui" }}>{f.ar}</div>
                    <div className="text-[11px] text-white/70 italic">{f.pronunciation}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <div className="text-center mt-10">
          <a href="/?goto=courses" className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white px-7 py-3.5 rounded-2xl font-bold transition">
            Vollständigen Arabisch-Kurs buchen <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

// ============== TESTIMONIALS ==============
function Testimonials({ testimonials }) {
  if (!testimonials.length) return null
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-[#FFCE00]/20 text-[#1A1A1A] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Stimmen</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Was unsere Gäste sagen</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map(t => (
            <div key={t.id} className="bg-gradient-to-br from-white to-neutral-50 rounded-3xl p-6 border border-neutral-200 hover:shadow-xl transition">
              <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FFCE00] text-[#FFCE00]" />)}</div>
              <p className="text-sm text-neutral-700 leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white font-black text-sm">{t.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{t.name}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{t.city} · {t.package_name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============== GALLERY ==============
function Gallery({ gallery, setLightbox }) {
  if (!gallery.length) return null
  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-[#CC0000]/10 text-[#CC0000] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Galerie</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Syrien in Bildern</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {gallery.map((g, i) => (
            <button key={g.id} onClick={() => setLightbox(i)} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-200 focus:outline-none focus:ring-4 focus:ring-[#FFCE00]/40">
              <img src={g.url} alt={g.caption} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">{g.caption}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Lightbox({ gallery, index, onClose, setIndex }) {
  const next = () => setIndex((index + 1) % gallery.length)
  const prev = () => setIndex((index - 1 + gallery.length) % gallery.length)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])
  const item = gallery[index]
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onClose() }} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X className="w-5 h-5" /></button>
      <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><ChevronLeft className="w-5 h-5" /></button>
      <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><ChevronRight className="w-5 h-5" /></button>
      <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={item.url} alt={item.caption} className="w-full max-h-[80vh] object-contain rounded-2xl" />
        <p className="text-center text-white/80 text-sm mt-4">{item.caption}</p>
      </div>
    </div>
  )
}

// ============== BOOKING FORM ==============
function BookingForm({ packages }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', dateFrom: '', dateTo: '', travelers: 1, packageId: '', requests: '', source: '' })
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    const r = await api.post('/api/german/bookings', form, { silent: true })
    setBusy(false)
    if (!r.ok) { toast.error(r.error || 'Fehler'); return }
    toast.success(r.data?.message || 'Vielen Dank! Wir melden uns bald bei Ihnen.')
    setForm({ name: '', email: '', phone: '', dateFrom: '', dateTo: '', travelers: 1, packageId: '', requests: '', source: '' })
  }
  return (
    <section id="booking" className="py-20 bg-gradient-to-br from-[#0A0A0A] to-[#1A0000] text-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-[#FFCE00]/20 text-[#FFCE00] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Buchungsanfrage</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Buchen Sie Ihre Reise</h2>
          <p className="text-white/60 mt-3">Wir antworten innerhalb von 24 Stunden — auf Deutsch.</p>
        </div>
        <form onSubmit={submit} className="bg-white text-[#1A1A1A] rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Vollständiger Name *"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="E-Mail *"><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Telefon / WhatsApp *"><Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+49 ..." /></Field>
            <Field label="Anzahl Reisende"><Input type="number" min="1" max="20" value={form.travelers} onChange={e => setForm({ ...form, travelers: e.target.value })} /></Field>
            <Field label="Anreise"><Input type="date" value={form.dateFrom} onChange={e => setForm({ ...form, dateFrom: e.target.value })} /></Field>
            <Field label="Abreise"><Input type="date" value={form.dateTo} onChange={e => setForm({ ...form, dateTo: e.target.value })} /></Field>
          </div>
          <Field label="Interessiertes Paket">
            <Select value={form.packageId || 'none'} onValueChange={v => setForm({ ...form, packageId: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Bitte wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Noch unentschieden —</SelectItem>
                {packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.duration_days} T · €{p.price_eur})</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Besondere Wünsche"><Textarea rows={3} value={form.requests} onChange={e => setForm({ ...form, requests: e.target.value })} placeholder="Allergien, Mobilität, spezielle Interessen..." /></Field>
          <Field label="Wie haben Sie von uns gehört?"><Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Google, Instagram, Empfehlung..." /></Field>
          <Button type="submit" disabled={busy} className="w-full h-12 bg-[#CC0000] hover:bg-[#A30000] text-white font-bold text-base rounded-xl shadow-lg disabled:opacity-50">
            {busy ? 'Wird gesendet...' : <><Send className="w-4 h-4 mr-2" /> Anfrage senden</>}
          </Button>
        </form>
      </div>
    </section>
  )
}

// ============== SERVICE REQUEST FORM ==============
function ServiceRequestForm() {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', location: '', dateFrom: '', dateTo: '', travelers: 1, services: [], notes: '' })
  const [busy, setBusy] = useState(false)
  const toggleService = (id) => setForm(p => ({ ...p, services: p.services.includes(id) ? p.services.filter(s => s !== id) : [...p.services, id] }))
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    const r = await api.post('/api/german/service-requests', form, { silent: true })
    setBusy(false)
    if (!r.ok) { toast.error(r.error || 'Fehler'); return }
    toast.success(r.data?.message || 'Vielen Dank!')
    setForm({ name: '', email: '', whatsapp: '', location: '', dateFrom: '', dateTo: '', travelers: 1, services: [], notes: '' })
  }
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-[#1A1A1A] text-[#FFCE00] rounded-full text-xs font-bold uppercase tracking-widest mb-4">Maßgeschneiderte Leistungen</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Leistungsanfrage</h2>
          <p className="text-neutral-600 mt-3 max-w-2xl mx-auto">Wählen Sie genau die Dienstleistungen, die Sie brauchen — vor, während oder nach Ihrer Reise.</p>
        </div>
        <form onSubmit={submit} className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl p-8 border border-neutral-200 shadow-xl space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Vollständiger Name *"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="E-Mail *"><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="WhatsApp (mit Ländercode) *"><Input required value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="+49 ..." /></Field>
            <Field label="Aktueller Standort">
              <Select value={form.location || 'none'} onValueChange={v => setForm({ ...form, location: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Bitte wählen..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Bitte wählen —</SelectItem>
                  {LOCATIONS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Anreise"><Input type="date" value={form.dateFrom} onChange={e => setForm({ ...form, dateFrom: e.target.value })} /></Field>
            <Field label="Abreise"><Input type="date" value={form.dateTo} onChange={e => setForm({ ...form, dateTo: e.target.value })} /></Field>
          </div>

          <div>
            <div className="text-sm font-bold mb-3">Welche Leistungen benötigen Sie? <span className="text-neutral-500 font-normal">(Mehrfachauswahl)</span></div>
            <div className="space-y-5">
              {SERVICE_GROUPS.map(g => (
                <div key={g.key} className="bg-white rounded-2xl p-5 border border-neutral-200">
                  <div className="text-xs font-black uppercase text-[#CC0000] tracking-wider mb-3">{g.title}</div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {g.items.map(it => {
                      const checked = form.services.includes(it.id)
                      return (
                        <label key={it.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${checked ? 'border-[#FFCE00] bg-[#FFCE00]/10' : 'border-neutral-200 hover:border-neutral-300'}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleService(it.id)} className="w-4 h-4 accent-[#CC0000]" />
                          <span className="text-sm font-medium">{it.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Field label="Besondere Anmerkungen"><Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Erzählen Sie uns mehr über Ihre Bedürfnisse..." /></Field>

          <Button type="submit" disabled={busy} className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-bold text-base rounded-xl disabled:opacity-50">
            {busy ? 'Wird gesendet...' : <><Send className="w-4 h-4 mr-2" /> Anfrage senden ({form.services.length} Leistungen)</>}
          </Button>
        </form>
      </div>
    </section>
  )
}

// ============== EMERGENCY SECTION ==============
function EmergencySection({ embassies, syriaEm, ddhSupport, waNumber }) {
  return (
    <section className="py-20 bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#CC0000]/20 border border-[#CC0000]/50 text-[#FF6666] rounded-full text-xs font-bold uppercase tracking-widest mb-4"><AlertTriangle className="w-3.5 h-3.5" />Wichtige Nummern</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Notfälle & Botschaften</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">Speichern Sie diese Nummern, bevor Sie reisen.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {/* Embassies */}
          <div className="bg-[#1A1A1A] border border-[#FFCE00]/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#FFCE00] font-black text-sm uppercase tracking-wider"><Globe className="w-4 h-4" />Deutsche Botschaften</div>
            {embassies.map(e => (
              <div key={e.id} className="border-t border-white/10 pt-4 first:border-0 first:pt-0">
                <div className="font-bold text-sm mb-1">{e.icon} {e.name}</div>
                {e.phone && <a href={`tel:${e.phone}`} className="block text-xs text-white/70 hover:text-[#FFCE00]">📞 {e.phone}</a>}
                {e.website && <a href={e.website} target="_blank" rel="noreferrer" className="block text-xs text-white/70 hover:text-[#FFCE00] truncate">🌐 {e.website}</a>}
                {e.address && <div className="text-[11px] text-white/50 mt-1">📍 {e.address}</div>}
              </div>
            ))}
          </div>
          {/* Syria Emergency */}
          <div className="bg-[#1A1A1A] border border-[#CC0000]/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#FF6666] font-black text-sm uppercase tracking-wider"><AlertTriangle className="w-4 h-4" />Notrufe Syrien</div>
            {syriaEm.map(e => (
              <a key={e.id} href={`tel:${e.phone}`} className="flex items-center gap-3 border-t border-white/10 pt-4 first:border-0 first:pt-0 hover:bg-white/5 rounded-lg p-2 -m-2 transition">
                <span className="text-2xl">{e.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{e.name}</div>
                  <div className="text-lg font-black text-[#FFCE00]">{e.phone}</div>
                </div>
              </a>
            ))}
          </div>
          {/* DDH Support */}
          <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-3xl p-6 border border-green-400/40 flex flex-col">
            <div className="flex items-center gap-2 text-green-200 font-black text-sm uppercase tracking-wider mb-4"><MessageCircle className="w-4 h-4" />Das Deutsche Haus</div>
            <div className="flex-1">
              <div className="text-2xl font-black mb-2">{ddhSupport?.name || 'WhatsApp Support'}</div>
              <div className="text-3xl font-black text-[#FFCE00] mb-1">{ddhSupport?.phone}</div>
              <div className="text-xs text-green-100/80 mb-4">{ddhSupport?.address || 'Deutsch & Englisch · 24/7'}</div>
            </div>
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="block w-full py-3.5 bg-white text-green-700 font-bold rounded-xl text-center hover:bg-green-50 transition">
              <MessageCircle className="inline w-4 h-4 mr-2" />WhatsApp öffnen
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============== STICKY EMERGENCY BAR ==============
function StickyEmergencyBar({ waNumber }) {
  return (
    <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3.5 rounded-full font-bold shadow-2xl hover:scale-105 transition">
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">24/7 Support</span>
    </a>
  )
}

// ============== FOOTER DE ==============
function FooterDE() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="h-1 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
      <div className="container mx-auto px-4 py-10 text-center">
        <img src={LOGO_URL} alt="Das Deutsche Haus" className="h-16 w-auto mx-auto mb-4 bg-white p-2 rounded-2xl" />
        <p className="text-sm text-white/60 max-w-md mx-auto">Bildungs- und Reisebrücke zwischen Deutschland und Syrien — Sicher · Authentisch · Unvergesslich.</p>
        <div className="flex justify-center gap-6 mt-6 text-xs text-white/50">
          <a href="/" className="hover:text-[#FFCE00]">Hauptseite</a>
          <a href="/?goto=courses" className="hover:text-[#FFCE00]">Deutschkurse</a>
          <a href="/?goto=contact" className="hover:text-[#FFCE00]">Kontakt</a>
        </div>
        <div className="mt-6 text-xs text-white/40">© 2026 Das Deutsche Haus · Syria ↔ Germany 🇸🇾🇩🇪</div>
      </div>
    </footer>
  )
}

// ============== HELPERS ==============
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}
