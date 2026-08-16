'use client'
import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Linkedin, Twitter, Send } from 'lucide-react'
import { LOGO_URL } from '@/lib/constants'

// TikTok has no lucide icon — small inline SVG matching the icon set
const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const SOCIAL_DEFS = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'x', label: 'X', Icon: Twitter },
  { key: 'telegram', label: 'Telegram', Icon: Send },
]

export function Footer({ t, lang, goto, flags = {} }) {
  const quickLinks = ['home', 'courses', 'vocational', 'travel']
  const [social, setSocial] = useState({})
  useEffect(() => {
    fetch('/api/content/social_links').then(r => r.json()).then(d => setSocial(d.data || {})).catch(() => {})
  }, [])
  const socialItems = SOCIAL_DEFS
    .map(s => ({ ...s, url: String(social[s.key] || '').trim() }))
    .filter(s => s.url)
    .map(s => ({ ...s, url: /^https?:\/\//i.test(s.url) ? s.url : `https://${s.url}` }))
  return (
    <footer className="bg-[#1A1A1A] text-white mt-20"><div className="h-1 flag-gradient-h" />
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="bg-white inline-flex p-3 rounded-2xl mb-4 shadow-lg"><img src={LOGO_URL} alt="Das Deutsche Haus" className="h-16 w-auto object-contain" /></div>
          <p className="text-sm text-white/60 leading-relaxed">{lang === 'ar' ? 'جسر تعليمي وثقافي بين سوريا وألمانيا.' : 'Bildungsbrücke zwischen Syrien und Deutschland.'}</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">{lang === 'ar' ? 'روابط سريعة' : 'Schnelllinks'}</h4>
          <ul className="space-y-2 text-sm text-white/70">{quickLinks.map(p => <li key={p}><button onClick={() => goto(p)} className="hover:text-[#FFCE00]">{t.nav[p]}</button></li>)}</ul>
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
              <a href={`tel:${(process.env.NEXT_PUBLIC_PHONE || '+49 1525 4196668').replace(/\s/g, '')}`} className="hover:text-[#FFCE00]" dir="ltr">
                {process.env.NEXT_PUBLIC_PHONE || '+49 1525 4196668'}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'info@das-deutsche-haus.com'}`} className="hover:text-[#FFCE00]" dir="ltr">
                {process.env.NEXT_PUBLIC_EMAIL || 'info@das-deutsche-haus.com'}
              </a>
            </li>
          </ul>
          {socialItems.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {socialItems.map(({ key, label, Icon, url }) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                  className="w-9 h-9 rounded-full bg-white/10 text-white/80 hover:bg-[#FFCE00] hover:text-[#1A1A1A] flex items-center justify-center transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
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
