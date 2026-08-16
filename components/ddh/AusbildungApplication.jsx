'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Send, Briefcase, CheckCircle2 } from 'lucide-react'
import { PhoneInput } from '@/components/ddh/PhoneInput'

// ==================== Ausbildung Application Section (#bewerbung) ====================
const VOC_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Noch nicht gelernt']
const VOC_EDUCATION = [
  { v: 'Hauptschule', ar: 'تعليم أساسي (Hauptschule)' },
  { v: 'Realschule', ar: 'تعليم متوسط (Realschule)' },
  { v: 'Abitur', ar: 'شهادة ثانوية (Abitur)' },
  { v: 'Berufsausbildung', ar: 'تدريب مهني (Berufsausbildung)' },
  { v: 'Studium / Universität', ar: 'دراسة جامعية (Universität)' },
  { v: 'Andere', ar: 'مؤهل آخر' },
]

export function AusbildungApplication({ lang, user, job }) {
  const ar = lang === 'ar'
  const L = {
    heading: ar ? 'قدّم طلبك الآن' : 'Ihre Bewerbung',
    applyingFor: ar ? 'التقديم على:' : 'Bewerbung für:',
    pickFirst: ar ? 'اختر فرصة التدريب المناسبة من القائمة أعلاه ثم اضغط "قدّم الآن" لفتح نموذج التقديم.' : 'Bitte wählen Sie oben eine Ausbildung aus und klicken Sie auf „Jetzt bewerben", um das Bewerbungsformular zu öffnen.',
    personal: ar ? 'البيانات الشخصية' : 'Persönliche Daten',
    name: ar ? 'الاسم الكامل' : 'Vor- und Nachname',
    email: ar ? 'البريد الإلكتروني' : 'E-Mail',
    phone: ar ? 'رقم الهاتف' : 'Telefonnummer',
    country: ar ? 'البلد / المدينة الحالية' : 'Land / Stadt',
    langEdu: ar ? 'اللغة والتعليم' : 'Sprache & Bildung',
    germanLevel: ar ? 'مستوى اللغة الألمانية' : 'Deutschkenntnisse',
    education: ar ? 'المؤهل الدراسي' : 'Schulabschluss / Ausbildung',
    notes: ar ? 'رسالة / ملاحظات (اختياري)' : 'Nachricht / Anmerkungen (optional)',
    select: ar ? 'اختر...' : 'Bitte wählen...',
    notLearned: ar ? 'لم أتعلم الألمانية بعد' : 'Noch nicht gelernt',
    submit: ar ? 'إرسال الطلب' : 'Bewerbung absenden',
    sending: ar ? 'جاري الإرسال...' : 'Wird gesendet...',
    successTitle: ar ? 'تم استلام طلبك بنجاح' : 'Bewerbung erfolgreich gesendet',
    successMsg: ar ? 'شكراً لتقديمك. وصلنا طلبك بنجاح، وسيتواصل معك فريقنا في أقرب وقت ممكن لمتابعة الخطوات التالية.' : 'Vielen Dank für Ihre Bewerbung. Wir haben Ihre Anfrage erhalten und werden uns so bald wie möglich bei Ihnen melden.',
    again: ar ? 'تقديم طلب آخر' : 'Weitere Bewerbung senden',
    errName: ar ? 'يرجى إدخال الاسم الكامل' : 'Bitte geben Sie Ihren Vor- und Nachnamen ein.',
    errEmail: ar ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    errPhone: ar ? 'يرجى إدخال رقم الهاتف' : 'Bitte geben Sie Ihre Telefonnummer ein.',
    errLevel: ar ? 'يرجى اختيار مستوى اللغة الألمانية' : 'Bitte wählen Sie Ihre Deutschkenntnisse aus.',
    errEdu: ar ? 'يرجى اختيار المؤهل الدراسي' : 'Bitte wählen Sie Ihren Schulabschluss aus.',
    errGeneric: ar ? 'تعذّر إرسال الطلب — يرجى المحاولة مرة أخرى' : 'Die Bewerbung konnte nicht gesendet werden — bitte versuchen Sie es erneut.',
  }
  const emptyForm = { name: '', email: '', phone: '', country: '', germanLevel: '', education: '', notes: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })) }

  // Prefill from logged-in user + reset success state when a new Ausbildung is chosen
  useEffect(() => {
    if (job) {
      setSuccess(false)
      setForm(f => ({ ...f, name: f.name || user?.name || '', email: f.email || user?.email || '', phone: f.phone || user?.phone || '' }))
    }
  }, [job, user])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = L.errName
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = L.errEmail
    if (!form.phone.trim()) e.phone = L.errPhone
    if (!form.germanLevel) e.germanLevel = L.errLevel
    if (!form.education) e.education = L.errEdu
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (submitting) return
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setSubmitting(true)
    try {
      const r = await fetch('/api/vocational/applications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, lang, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), country: form.country.trim(), germanLevel: form.germanLevel, education: form.education, notes: form.notes.trim() }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || d.error) { toast.error(d.error || L.errGeneric); return }
      setSuccess(true)
      setForm(emptyForm)
    } catch {
      toast.error(L.errGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (k) => errors[k] ? <p id={`voc-err-${k}`} role="alert" className="text-[#CC0000] text-xs mt-1 font-semibold">{errors[k]}</p> : null

  return (
    <section id="bewerbung" aria-labelledby="bewerbung-title" className="scroll-mt-28 mt-14 max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        <div className="h-2 flag-gradient-h" />
        <CardContent className="p-6 md:p-8">
          <h2 id="bewerbung-title" className="text-2xl font-black mb-1 flex items-center gap-2"><Send className="w-5 h-5 text-[#CC0000]" />{L.heading}</h2>

          {!job ? (
            <p className="text-neutral-600 text-sm mt-3 leading-relaxed">{L.pickFirst}</p>
          ) : success ? (
            <div className="mt-4 text-center py-6" role="status">
              <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">{L.successTitle}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed max-w-md mx-auto mb-5">{L.successMsg}</p>
              <Button variant="outline" onClick={() => setSuccess(false)}>{L.again}</Button>
            </div>
          ) : (
            <>
              <div className="mt-3 mb-5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-[#2C5F9E] shrink-0" />
                <div className="text-sm"><span className="text-neutral-500">{L.applyingFor}</span> <strong className="font-black">{ar ? job.title_ar : job.title_de}</strong></div>
              </div>
              <form onSubmit={submit} noValidate className="space-y-5">
                <fieldset className="space-y-3">
                  <legend className="text-sm font-black text-neutral-800 border-b pb-1.5 mb-1 w-full">{L.personal}</legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="voc-name">{L.name} <span className="text-[#CC0000]">*</span></Label>
                      <Input id="voc-name" autoComplete="name" value={form.name} onChange={e => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'voc-err-name' : undefined} />
                      {fieldError('name')}
                    </div>
                    <div>
                      <Label htmlFor="voc-email">{L.email} <span className="text-[#CC0000]">*</span></Label>
                      <Input id="voc-email" type="email" dir="ltr" autoComplete="email" inputMode="email" value={form.email} onChange={e => set('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'voc-err-email' : undefined} />
                      {fieldError('email')}
                    </div>
                    <div>
                      <Label htmlFor="voc-phone">{L.phone} <span className="text-[#CC0000]">*</span></Label>
                      <PhoneInput id="voc-phone" lang={lang} defaultCode={ar ? '+963' : '+49'} value={form.phone} onChange={(v) => set('phone', v)} invalid={!!errors.phone} describedBy={errors.phone ? 'voc-err-phone' : undefined} />
                      {fieldError('phone')}
                    </div>
                    <div>
                      <Label htmlFor="voc-country">{L.country}</Label>
                      <Input id="voc-country" autoComplete="country-name" value={form.country} onChange={e => set('country', e.target.value)} />
                    </div>
                  </div>
                </fieldset>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-black text-neutral-800 border-b pb-1.5 mb-1 w-full">{L.langEdu}</legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="voc-level">{L.germanLevel} <span className="text-[#CC0000]">*</span></Label>
                      <Select value={form.germanLevel} onValueChange={v => set('germanLevel', v)}>
                        <SelectTrigger id="voc-level" aria-invalid={!!errors.germanLevel}><SelectValue placeholder={L.select} /></SelectTrigger>
                        <SelectContent>
                          {VOC_LEVELS.map(lv => <SelectItem key={lv} value={lv}>{lv === 'Noch nicht gelernt' ? L.notLearned : lv}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {fieldError('germanLevel')}
                    </div>
                    <div>
                      <Label htmlFor="voc-edu">{L.education} <span className="text-[#CC0000]">*</span></Label>
                      <Select value={form.education} onValueChange={v => set('education', v)}>
                        <SelectTrigger id="voc-edu" aria-invalid={!!errors.education}><SelectValue placeholder={L.select} /></SelectTrigger>
                        <SelectContent>
                          {VOC_EDUCATION.map(o => <SelectItem key={o.v} value={o.v}>{ar ? o.ar : o.v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {fieldError('education')}
                    </div>
                  </div>
                </fieldset>
                <div>
                  <Label htmlFor="voc-notes">{L.notes}</Label>
                  <Textarea id="voc-notes" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
                </div>
                <Button type="submit" disabled={submitting} className="btn-primary w-full py-6 text-base font-bold">
                  {submitting ? L.sending : L.submit}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
