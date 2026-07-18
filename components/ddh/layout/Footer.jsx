'use client'
import { MapPin, Phone, Mail } from 'lucide-react'
import { LOGO_URL } from '@/lib/constants'

export function Footer({ t, lang, goto }) {
  return (
    <footer className="bg-[#1A1A1A] text-white mt-20"><div className="h-1 flag-gradient-h" />
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="bg-white inline-flex p-3 rounded-2xl mb-4 shadow-lg"><img src={LOGO_URL} alt="Das Deutsche Haus" className="h-16 w-auto object-contain" /></div>
          <p className="text-sm text-white/60 leading-relaxed">{lang === 'ar' ? 'جسر تعليمي وثقافي بين سوريا وألمانيا.' : 'Bildungsbrücke zwischen Syrien und Deutschland.'}</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">{lang === 'ar' ? 'روابط سريعة' : 'Schnelllinks'}</h4>
          <ul className="space-y-2 text-sm text-white/70">{['home', 'courses', 'telc', 'vocational', 'travel'].map(p => <li key={p}><button onClick={() => goto(p)} className="hover:text-[#FFCE00]">{t.nav[p]}</button></li>)}</ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">{lang === 'ar' ? 'المعهد' : 'Institut'}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><button onClick={() => goto('about')} className="hover:text-[#FFCE00]">{t.nav.about}</button></li>
            <li><button onClick={() => goto('contact')} className="hover:text-[#FFCE00]">{t.nav.contact}</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t.contact.title}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" />{lang === 'ar' ? 'دمشق، المزة' : 'Damaskus, Mazzeh'}</li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <a href={`tel:${(process.env.NEXT_PUBLIC_PHONE || '+963 11 123 4567').replace(/\s/g, '')}`} className="hover:text-[#FFCE00]" dir="ltr">
                {process.env.NEXT_PUBLIC_PHONE || '+963 11 123 4567'}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'info@dasdeutschehaus.sy'}`} className="hover:text-[#FFCE00]" dir="ltr">
                {process.env.NEXT_PUBLIC_EMAIL || 'info@dasdeutschehaus.sy'}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50 space-y-2">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a href="/privacy" className="hover:text-[#FFCE00]">{lang === 'ar' ? 'سياسة الخصوصية' : 'Datenschutz'}</a>
          <span className="text-white/30">·</span>
          <a href="/terms" className="hover:text-[#FFCE00]">{lang === 'ar' ? 'الشروط والأحكام' : 'AGB'}</a>
          <span className="text-white/30">·</span>
          <a href="/impressum" className="hover:text-[#FFCE00]">Impressum</a>
        </div>
        <div>© 2026 Das Deutsche Haus · Syria ↔ Germany 🇸🇾🇩🇪</div>
      </div>
    </footer>
  )
}

export default Footer
