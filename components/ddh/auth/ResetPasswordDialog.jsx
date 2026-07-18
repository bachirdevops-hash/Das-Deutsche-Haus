'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { BrandenburgGateIcon, FlagStripe } from '@/components/ddh/icons'
import { AuthInput } from '@/components/ddh/auth/AuthInput'
import { api } from '@/lib/api'

export function ResetPasswordDialog({ token, onClose }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (pw.length < 6) { toast.error('كلمة المرور قصيرة (6 أحرف على الأقل)'); return }
    if (pw !== pw2) { toast.error('كلمتا المرور غير متطابقتين'); return }
    setBusy(true)
    try {
      const r = await api.post('/api/auth/reset-password', { token, password: pw }, { silent: true })
      if (!r.ok) { toast.error(r.error || 'فشلت إعادة التعيين'); return }
      setDone(true); toast.success('تم تحديث كلمة المرور!')
      setTimeout(onClose, 2500)
    } finally { setBusy(false) }
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        dir="rtl"
        className="max-w-[440px] p-0 overflow-hidden bg-white border-0 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)] rounded-[28px]"
        style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}
      >
        <div className="px-8 pt-9 pb-5 bg-white">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFCE00]/25 rounded-full blur-2xl scale-110" aria-hidden="true" />
              <BrandenburgGateIcon className="relative w-[68px] h-[68px] text-[#FFCE00] drop-shadow-[0_2px_4px_rgba(255,206,0,0.35)]" />
            </div>
          </div>
          <FlagStripe className="mb-4" />
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-[22px] font-black text-center text-neutral-900 tracking-tight leading-tight">إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription className="text-center text-[13px] text-neutral-500 px-2">أدخل كلمة المرور الجديدة لحسابك</DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 pb-8 bg-white">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-500" strokeWidth={2.4} />
              </div>
              <p className="font-black text-lg text-neutral-900 mb-1">تم التحديث بنجاح!</p>
              <p className="text-sm text-neutral-500">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3.5">
              <AuthInput
                icon={Lock}
                type={showPw ? 'text' : 'password'}
                required minLength={6}
                label="كلمة المرور الجديدة"
                value={pw} onChange={setPw} dir="ltr" autoComplete="new-password"
                trailing={<button type="button" onClick={() => setShowPw(!showPw)} className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1" tabIndex={-1}>{showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button>}
              />
              <AuthInput
                icon={Lock}
                type={showPw2 ? 'text' : 'password'}
                required minLength={6}
                label="تأكيد كلمة المرور"
                value={pw2} onChange={setPw2} dir="ltr" autoComplete="new-password"
                trailing={<button type="button" onClick={() => setShowPw2(!showPw2)} className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1" tabIndex={-1}>{showPw2 ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button>}
              />
              <Button
                type="submit" disabled={busy}
                className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all text-[14px] tracking-wide disabled:opacity-60"
              >
                {busy ? (<span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري التحديث...</span>) : 'تحديث كلمة المرور'}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ResetPasswordDialog
