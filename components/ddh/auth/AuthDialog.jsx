'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, Lock, UserCircle2, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { BrandenburgGateIcon, FlagStripe } from '@/components/ddh/icons'
import { AuthInput } from '@/components/ddh/auth/AuthInput'
import { api } from '@/lib/api'

export function AuthDialog({ mode, setMode, lang, t, onSuccess }) {
  // 🔒 Public signup is disabled — accounts are created only by Admin/Manager.
  // Force-coerce any 'signup' attempts back to 'login'.
  if (mode === 'signup') mode = 'login'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (!mode) {
      setForm({ name: '', email: '', phone: '', password: '' })
      setForgotMode(false)
      setShowPw(false)
    }
  }, [mode])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (forgotMode) {
        const r = await api.post('/api/auth/forgot-password', { email: form.email }, { silent: true })
        if (!r.ok) { toast.error(r.error || (lang === 'ar' ? 'فشلت العملية' : 'Fehlgeschlagen')); return }
        toast.success(r.data?.message || (lang === 'ar' ? 'تم إرسال رابط الاستعادة عبر البريد' : 'Reset-Link wurde per E-Mail gesendet'))
        setMode(null)
        return
      }
      const url = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body = mode === 'signup' ? form : { email: form.email, password: form.password }
      const r = await api.post(url, body, { silent: true })
      if (!r.ok) { toast.error(r.error || (lang === 'ar' ? 'فشلت العملية' : 'Fehlgeschlagen')); return }
      onSuccess(r.data.user)
      toast.success(mode === 'signup'
        ? (lang === 'ar' ? 'مرحباً بك في Das Deutsche Haus!' : 'Willkommen!')
        : (lang === 'ar' ? 'مرحباً بعودتك!' : 'Willkommen zurück!'))
    } finally {
      setBusy(false)
    }
  }

  const title = forgotMode
    ? (lang === 'ar' ? 'استعادة كلمة المرور' : 'Passwort zurücksetzen')
    : (mode === 'signup' ? t.auth.signupTitle : t.auth.loginTitle)
  const subtitle = forgotMode
    ? (lang === 'ar' ? 'أدخل بريدك لاستلام رابط إعادة التعيين' : 'Geben Sie Ihre E-Mail ein')
    : (mode === 'signup'
      ? (lang === 'ar' ? 'انضمّ إلى رحلتك نحو ألمانيا' : 'Beginne deine Reise nach Deutschland')
      : (lang === 'ar' ? 'مرحباً بعودتك إلى Das Deutsche Haus' : 'Willkommen zurück'))

  return (
    <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
      <DialogContent
        dir={t.dir}
        className="w-[calc(100vw-1.5rem)] max-w-[440px] p-0 overflow-hidden bg-white border-0 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)] rounded-[28px]"
        style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}
      >
        <div className="px-6 sm:px-8 pt-9 pb-5 bg-white relative">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFCE00]/25 rounded-full blur-2xl scale-110" aria-hidden="true" />
              <BrandenburgGateIcon className="relative w-[68px] h-[68px] text-[#FFCE00] drop-shadow-[0_2px_4px_rgba(255,206,0,0.35)]" />
            </div>
          </div>
          <FlagStripe className="mb-4" />
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-[22px] font-black text-center text-neutral-900 tracking-tight leading-tight">{title}</DialogTitle>
            <DialogDescription className="text-center text-[13px] text-neutral-500 px-2">{subtitle}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 sm:px-8 pb-8 bg-white">
          <form onSubmit={submit} className="space-y-3.5">
            {!forgotMode && mode === 'signup' && (
              <>
                <AuthInput icon={UserCircle2} type="text" required label={t.auth.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} dir={t.dir} autoComplete="name" />
                <AuthInput icon={Phone} type="tel" label={t.auth.phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+963 ..." dir="ltr" autoComplete="tel" />
              </>
            )}
            <AuthInput icon={Mail} type="email" required label={t.auth.email} value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" autoComplete="email" />
            {!forgotMode && (
              <AuthInput
                icon={Lock}
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                label={t.auth.password}
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                dir="ltr"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                trailing={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1" tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                }
              />
            )}

            {!forgotMode && mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <button type="button" onClick={() => setForgotMode(true)} className="text-[12px] font-semibold text-neutral-600 hover:text-[#CC0000] transition">
                  {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Passwort vergessen?'}
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all text-[14px] tracking-wide disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {lang === 'ar' ? 'جاري المعالجة...' : 'Lädt...'}
                </span>
              ) : (
                forgotMode
                  ? (lang === 'ar' ? 'إرسال رابط الاستعادة' : 'Link senden')
                  : (mode === 'signup' ? t.auth.signup : t.auth.login)
              )}
            </Button>
          </form>

          {forgotMode && (
            <div className="text-center mt-4">
              <button type="button" onClick={() => setForgotMode(false)} className="text-[12px] font-semibold text-neutral-600 hover:text-[#CC0000] inline-flex items-center gap-1">
                <ArrowRight className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Zurück zur Anmeldung'}
              </button>
            </div>
          )}

          {!forgotMode && (
            <div className="text-center mt-5 text-[12.5px] text-neutral-500 leading-relaxed">
              {lang === 'ar'
                ? 'ليس لديك حساب؟ تواصل مع الإدارة لإنشاء حساب لك بعد تأكيد تسجيلك في كورس أو خدمة.'
                : 'Noch kein Konto? Kontaktieren Sie die Verwaltung — Konten werden nach Bestätigung Ihrer Anmeldung erstellt.'}
            </div>
          )}

          <p className="text-center text-[10.5px] text-neutral-400 mt-5 leading-relaxed">
            {lang === 'ar' ? 'بالمتابعة، فإنك توافق على شروط الاستخدام وسياسة الخصوصية' : 'Mit der Anmeldung stimmen Sie unseren AGB & Datenschutz zu'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog
