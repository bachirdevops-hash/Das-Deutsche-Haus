'use client'
import { useState, useRef, useEffect } from 'react'
import { Globe, Menu, X, ChevronDown, LogOut, LayoutDashboard, ShieldCheck, Shield, GraduationCap, Award } from 'lucide-react'
import { LOGO_URL } from '@/lib/constants'
import { NotificationBell } from '@/components/ddh/layout/NotificationBell'

export function Header({ t, lang, setLang, page, goto, user, navOpen, setNavOpen, setAuthMode, logout }) {
  const isAr = lang === 'ar'
  const [openMenu, setOpenMenu] = useState(null) // 'edu' | 'career' | 'about' | 'media' | null
  const [mobileGroup, setMobileGroup] = useState(null)
  const navRef = useRef(null)

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const onClick = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null) }
    const onEsc = (e) => { if (e.key === 'Escape') setOpenMenu(null) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onEsc) }
  }, [])

  // Close on page change
  useEffect(() => { setOpenMenu(null); setMobileGroup(null) }, [page])

  const myPanel = user?.role === 'super_admin'
    ? { id: 'admin', label: t.nav.admin, icon: Shield }
    : user?.role === 'manager'
      ? { id: 'manager', label: t.nav.manager, icon: ShieldCheck }
      : user?.role === 'teacher'
        ? { id: 'teacher', label: t.nav.teacher, icon: GraduationCap }
        : { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard }

  // Dropdown groups
  const groups = [
    {
      key: 'edu', label: t.nav.groupEdu,
      items: [{ kind: 'goto', id: 'courses', label: t.nav.courses }],
    },
    {
      key: 'career', label: t.nav.groupCareer,
      items: [
        { kind: 'goto', id: 'vocational', label: t.nav.vocational },
        { kind: 'goto', id: 'travel', label: t.nav.travel },
      ],
    },
    {
      key: 'about', label: t.nav.groupAbout,
      items: [
        { kind: 'goto', id: 'about', label: t.nav.about },
        { kind: 'goto', id: 'contact', label: t.nav.contact },
      ],
    },
    {
      key: 'media', label: t.nav.groupMedia,
      items: [
        { kind: 'href', href: '/blog', label: t.nav.blog },
        { kind: 'href', href: '/activities', label: t.nav.activities },
      ],
    },
  ]

  const handleItem = (it) => {
    setOpenMenu(null); setNavOpen(false); setMobileGroup(null)
    if (it.kind === 'goto') goto(it.id)
    else if (it.kind === 'href') window.location.href = it.href
  }

  const fontStack = "'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm" style={{ fontFamily: fontStack }} ref={navRef}>
      <div className="h-1 flag-gradient-h" />
      <div className="container mx-auto px-4 h-[76px] flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => goto('home')} className="flex items-center gap-2.5 group shrink-0" aria-label="Home">
          <img src={LOGO_URL} alt="Das Deutsche Haus" className="h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* الرئيسية */}
          <NavLink active={page === 'home'} onClick={() => goto('home')}>{t.nav.home}</NavLink>

          {/* Dropdowns */}
          {groups.map(g => {
            const isActive = g.items.some(i => i.kind === 'goto' && page === i.id)
            const isOpen = openMenu === g.key
            return (
              <div key={g.key} className="relative">
                <button
                  onClick={() => setOpenMenu(isOpen ? null : g.key)}
                  onMouseEnter={() => setOpenMenu(g.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-1 ${isActive || isOpen ? 'bg-neutral-100 text-[#1A1A1A]' : 'text-neutral-700 hover:bg-neutral-100'}`}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                >
                  {g.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div
                    onMouseLeave={() => setOpenMenu(null)}
                    className="absolute top-full mt-1 min-w-[200px] bg-white rounded-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.18)] border border-neutral-200 overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    style={{ [isAr ? 'right' : 'left']: 0 }}
                    role="menu"
                  >
                    {g.items.map((it, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleItem(it)}
                        role="menuitem"
                        className={`w-full text-${isAr ? 'right' : 'left'} px-4 py-2.5 text-sm font-semibold transition hover:bg-[#FFCE00]/15 hover:text-[#CC0000] ${(it.kind === 'goto' && page === it.id) ? 'bg-[#FFCE00]/10 text-[#CC0000]' : 'text-neutral-700'}`}
                      >
                        {it.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* telc — RED PROMINENT BUTTON */}
          <button
            onClick={() => goto('telc')}
            className={`group ms-1 px-4 py-2 rounded-lg text-sm font-black tracking-tight transition-all inline-flex items-center gap-1.5 shadow-[0_4px_14px_-4px_rgba(204,0,0,0.55)] hover:shadow-[0_8px_22px_-4px_rgba(204,0,0,0.65)] hover:-translate-y-0.5 ${page === 'telc' ? 'bg-[#A30000] text-white ring-2 ring-[#FFCE00] ring-offset-1' : 'bg-[#CC0000] text-white hover:bg-[#A30000]'}`}
            aria-label="telc Prüfungen"
          >
            <Award className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span>{t.nav.telc}</span>
          </button>

          {/* DE Visitors — Gold border, ALWAYS in German (targets German audience) */}
          <a
            href="/german-visitors"
            className="ms-1 px-3 py-2 rounded-lg text-sm font-bold transition border-2 border-[#FFCE00] bg-[#FFCE00]/10 text-[#1A1A1A] hover:bg-[#FFCE00]/25 inline-flex items-center gap-1.5"
            title="Für deutsche Besucher"
            lang="de"
            dir="ltr"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            <span className="text-[11px] font-black bg-[#FFCE00] text-[#1A1A1A] px-1.5 py-0.5 rounded">DE</span>
            <span>Für deutsche Besucher</span>
          </a>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLang(isAr ? 'de' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-neutral-300 hover:border-[#CC0000] hover:bg-red-50 transition text-xs font-bold"
            aria-label="Switch language"
          >
            <Globe className="w-4 h-4" />
            <span>{isAr ? 'DE' : 'AR'}</span>
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <NotificationBell />
              <button
                onClick={() => goto(myPanel.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFCE00] text-[#1A1A1A] font-bold text-sm hover:bg-[#E6B800] transition"
              >
                <myPanel.icon className="w-4 h-4" />{myPanel.label}
              </button>
              <button onClick={logout} className="px-2.5 py-2 rounded-lg border border-neutral-300 text-sm font-semibold hover:bg-neutral-50 transition" title={t.nav.logout}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setAuthMode('login')} className="px-3 sm:px-4 py-2 rounded-lg bg-[#CC0000] hover:bg-[#A30000] text-white text-xs sm:text-sm font-bold transition shadow-[0_4px_14px_-4px_rgba(204,0,0,0.5)] hover:shadow-[0_8px_22px_-4px_rgba(204,0,0,0.6)] hover:-translate-y-0.5 whitespace-nowrap">
                {t.nav.login}
              </button>
            </div>
          )}

          {/* For mobile logged-in users: show notification bell + quick panel button */}
          {user && (
            <div className="flex md:hidden items-center gap-1">
              <NotificationBell />
            </div>
          )}

          <button onClick={() => setNavOpen(!navOpen)} className="lg:hidden p-2 rounded-lg hover:bg-neutral-100" aria-label="Menu">
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {navOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-200 shadow-lg max-h-[calc(100vh-77px)] overflow-y-auto">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {/* الرئيسية */}
            <MobileLink active={page === 'home'} onClick={() => { goto('home'); setNavOpen(false) }}>{t.nav.home}</MobileLink>

            {/* Dropdown groups */}
            {groups.map(g => {
              const isOpen = mobileGroup === g.key
              return (
                <div key={g.key} className="border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setMobileGroup(isOpen ? null : g.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold transition ${isOpen ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
                  >
                    <span>{g.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="bg-neutral-50 border-t border-neutral-200">
                      {g.items.map((it, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleItem(it)}
                          className={`w-full text-${isAr ? 'right' : 'left'} px-5 py-2.5 text-sm font-semibold transition border-t first:border-t-0 border-neutral-200/70 hover:bg-white ${(it.kind === 'goto' && page === it.id) ? 'text-[#CC0000]' : 'text-neutral-700'}`}
                        >
                          {it.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* telc — RED PROMINENT (mobile) */}
            <button
              onClick={() => { goto('telc'); setNavOpen(false) }}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-black tracking-tight shadow-[0_4px_14px_-4px_rgba(204,0,0,0.55)] mt-1 ${page === 'telc' ? 'bg-[#A30000] text-white ring-2 ring-[#FFCE00]' : 'bg-[#CC0000] text-white'}`}
            >
              <Award className="w-4 h-4" strokeWidth={2.5} />{t.nav.telc}
            </button>

            {/* DE Visitors (mobile) — ALWAYS in German */}
            <a
              href="/german-visitors"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold border-2 border-[#FFCE00] bg-[#FFCE00]/10 text-[#1A1A1A] hover:bg-[#FFCE00]/25"
              lang="de"
              dir="ltr"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              <span className="text-[11px] font-black bg-[#FFCE00] text-[#1A1A1A] px-1.5 py-0.5 rounded">DE</span>
              Für deutsche Besucher
            </a>

            {/* Auth (mobile) */}
            <div className="border-t pt-3 mt-2 flex flex-col gap-2">
              {user ? (<>
                <button onClick={() => { goto(myPanel.id); setNavOpen(false) }} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#FFCE00] text-[#1A1A1A] font-bold">
                  <myPanel.icon className="w-4 h-4" />{myPanel.label}
                </button>
                <button onClick={logout} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border font-semibold">
                  <LogOut className="w-4 h-4" />{t.nav.logout}
                </button>
              </>) : (<>
                <button onClick={() => { setAuthMode('login'); setNavOpen(false) }} className="px-3 py-2.5 rounded-lg bg-[#CC0000] hover:bg-[#A30000] text-white font-bold">
                  {t.nav.login}
                </button>
              </>)}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${active ? 'bg-[#1A1A1A] text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
    >
      {children}
    </button>
  )
}

function MobileLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition ${active ? 'bg-[#1A1A1A] text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
    >
      <span>{children}</span>
    </button>
  )
}

export default Header
