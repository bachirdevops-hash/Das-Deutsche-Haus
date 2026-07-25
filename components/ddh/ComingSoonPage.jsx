'use client'
import { Sparkles, Clock, ArrowRight } from 'lucide-react'

// 🎨 ComingSoonPage — Beautiful, motivational placeholder.
// Zero details revealed about "why" it's disabled — pure teasing to excite visitors.
// Uses German flag palette + Arabic-first, German fallback.

export default function ComingSoonPage({ lang = 'ar', title, subtitle, onGoHome }) {
  const t = {
    ar: {
      badge: 'قريباً',
      badgeSub: 'BALD',
      title: title || 'شيء مميز في الطريق إليك',
      subtitle: subtitle || 'نُعِدّ لك تجربة استثنائية — ترقّبوا الإعلان قريباً.',
      cta: 'العودة إلى الصفحة الرئيسية',
      tag: 'Das Deutsche Haus · جسر بين سوريا وألمانيا',
    },
    de: {
      badge: 'BALD',
      badgeSub: 'قريباً',
      title: title || 'Etwas Besonderes ist unterwegs',
      subtitle: subtitle || 'Wir bereiten ein außergewöhnliches Erlebnis für Sie vor — bleiben Sie gespannt.',
      cta: 'Zur Startseite',
      tag: 'Das Deutsche Haus · Brücke zwischen Syrien und Deutschland',
    },
  }
  const L = t[lang] || t.ar

  return (
    <section dir={lang === 'de' ? 'ltr' : 'rtl'} className="min-h-[85vh] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#FAFAF8] via-white to-[#FFCE00]/10">
      {/* Decorative background — German flag bars */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="flex-1 bg-[#1A1A1A]" />
        <div className="flex-1 bg-[#CC0000]" />
        <div className="flex-1 bg-[#FFCE00]" />
      </div>
      <div className="absolute -top-20 -end-20 w-80 h-80 rounded-full bg-[#CC0000]/5 blur-3xl" />
      <div className="absolute -bottom-20 -start-20 w-96 h-96 rounded-full bg-[#FFCE00]/10 blur-3xl" />

      <div className="container mx-auto px-6 py-16 relative z-10 text-center max-w-2xl">
        {/* Bilingual badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white shadow-lg border border-[#FFCE00]/50">
          <Sparkles className="w-4 h-4 text-[#CC0000] animate-pulse" />
          <span className="font-black text-sm text-[#CC0000] tracking-wide">{L.badge}</span>
          <span className="w-px h-4 bg-neutral-300" />
          <span className="font-black text-sm text-[#1A1A1A] tracking-wide">{L.badgeSub}</span>
        </div>

        {/* Animated clock icon */}
        <div className="mx-auto mb-8 relative w-28 h-28 sm:w-32 sm:h-32">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#CC0000] to-[#A30000] shadow-2xl rotate-6 transition-transform group-hover:rotate-12" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#333] flex items-center justify-center -rotate-3">
            <Clock className="w-14 h-14 sm:w-16 sm:h-16 text-[#FFCE00]" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-[#1A1A1A] leading-tight">
          {L.title}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 mb-10 leading-relaxed max-w-lg mx-auto">
          {L.subtitle}
        </p>

        {/* Decorative dots — visual interest */}
        <div className="flex justify-center gap-2 mb-10">
          <div className="w-2 h-2 rounded-full bg-[#1A1A1A] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#CC0000] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#FFCE00] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        <button
          onClick={onGoHome ? onGoHome : () => { if (typeof window !== 'undefined') window.location.href = '/' }}
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-[#CC0000] hover:bg-[#A30000] text-white font-bold text-sm sm:text-base transition-all shadow-[0_8px_25px_-5px_rgba(204,0,0,0.5)] hover:shadow-[0_12px_35px_-5px_rgba(204,0,0,0.6)] hover:-translate-y-0.5"
        >
          <ArrowRight className={`w-4 h-4 ${lang === 'de' ? '' : 'rotate-180'}`} />
          {L.cta}
        </button>

        <p className="text-[11px] text-neutral-400 mt-12 tracking-wide font-semibold">{L.tag}</p>
      </div>
    </section>
  )
}
