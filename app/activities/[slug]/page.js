'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle2, Loader2, AlertTriangle, MapPinned, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { getActivityType } from '@/lib/activities_seed'

export default function ActivityDetailPage() {
  const params = useParams()
  const slug = params?.slug
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!slug) return
    api.get(`/api/activities/${slug}`, { silent: true }).then(r => {
      if (r.ok) setActivity(r.data.item)
      setLoading(false)
    })
  }, [slug])

  useEffect(() => {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
    if (activity) document.title = `${activity.title} — Das Deutsche Haus`
  }, [activity])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#CC0000]" /></div>
  if (!activity) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-2xl font-black mb-2">النشاط غير موجود</p>
        <a href="/activities" className="text-[#CC0000] font-bold">→ العودة للنشاطات</a>
      </div>
    </div>
  )

  const t = getActivityType(activity.type)
  const dateObj = activity.date ? new Date(activity.date) : null
  const endObj = activity.endTime ? new Date(activity.endTime) : null
  const dateStr = dateObj ? dateObj.toLocaleDateString('ar-SY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const startTime = dateObj ? dateObj.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }) : ''
  const endTime = endObj ? endObj.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }) : ''
  const isPast = dateObj && dateObj.getTime() < Date.now()
  const total = activity.totalSeats || 0
  const taken = activity.registeredCount || 0
  const remaining = Math.max(0, total - taken)
  const isFull = activity.requiresRegistration && total > 0 && remaining <= 0
  const deadlinePassed = activity.registrationDeadline && new Date(activity.registrationDeadline).getTime() < Date.now()
  const isCancelled = activity.status === 'Cancelled'
  const canRegister = activity.requiresRegistration && !isCancelled && !isPast && !isFull && !deadlinePassed

  return (
    <ErrorBoundary>
      <div dir="rtl" className="min-h-screen bg-white" style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}>
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="h-1 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/activities" className="font-bold text-sm hover:text-[#CC0000] transition inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4" />النشاطات</a>
            <a href="/" className="font-black text-base text-[#1A1A1A]">Das Deutsche Haus</a>
          </div>
        </header>

        {/* Cover */}
        <section className="relative">
          <div className="aspect-[21/9] bg-neutral-100 overflow-hidden relative max-h-[480px]">
            {activity.coverImage ? (
              <img src={activity.coverImage} alt={activity.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-9xl">{t.icon}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 text-white">
              <div className="container mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${t.color}`}><span className="me-1">{t.icon}</span>{t.label_ar}</span>
                  {activity.isFree ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">مجاني</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFCE00] text-[#1A1A1A]">{activity.price} {activity.currency === 'EUR' ? '€' : activity.currency === 'SYP' ? 'ل.س' : '$'}</span>
                  )}
                  {isCancelled && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">ملغى</span>}
                  {isPast && !isCancelled && <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-700 text-white">انتهى</span>}
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-4xl drop-shadow-lg">{activity.title}</h1>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isCancelled && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div><p className="font-black text-red-900 mb-1">تم إلغاء هذا النشاط</p><p className="text-sm text-red-700">نعتذر عن إلغاء هذا النشاط. يرجى متابعتنا للاطلاع على نشاطاتنا القادمة.</p></div>
              </div>
            )}

            {/* Meta cards */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-neutral-500 uppercase mb-1.5 tracking-wider">📅 التاريخ</div>
                <div className="font-black text-sm">{dateStr}</div>
                {startTime && <div className="text-xs text-neutral-600 mt-1"><Clock className="inline w-3 h-3 ms-0.5" />{startTime}{endTime && ` — ${endTime}`}</div>}
              </div>
              <div className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-neutral-500 uppercase mb-1.5 tracking-wider">📍 المكان</div>
                <div className="font-black text-sm">{activity.location || '—'}</div>
                {activity.mapLink && (
                  <a href={activity.mapLink} target="_blank" rel="noreferrer" className="text-xs text-[#CC0000] hover:underline inline-flex items-center gap-1 mt-1 font-bold"><MapPinned className="w-3 h-3" />فتح في الخرائط</a>
                )}
              </div>
            </div>

            {/* Description */}
            {activity.description && (
              <article className="prose prose-neutral max-w-none rounded-2xl bg-white border border-neutral-200 p-6 md:p-8" style={{ direction: 'rtl' }}>
                <div dangerouslySetInnerHTML={{ __html: activity.description }} className="leading-loose" />
              </article>
            )}
          </div>

          {/* Sidebar / Registration */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              {!activity.requiresRegistration ? (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center">
                  <Tag className="w-10 h-10 mx-auto mb-2 text-blue-600" />
                  <p className="font-black text-blue-900 mb-1">حضور حر — لا يحتاج تسجيل</p>
                  <p className="text-sm text-blue-700 leading-relaxed">الحضور مجاني وبدون تسجيل مسبق ✅</p>
                </div>
              ) : submitted ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center">
                  <CheckCircle2 className="w-14 h-14 mx-auto mb-3 text-green-600" />
                  <p className="font-black text-green-900 text-lg mb-2">تم التسجيل بنجاح! 🎉</p>
                  <p className="text-sm text-green-700 leading-relaxed">سنتواصل معك على واتساب قريباً لتأكيد الحجز.</p>
                </div>
              ) : isCancelled ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-red-600" />
                  <p className="font-black text-red-900 mb-1">النشاط ملغى</p>
                </div>
              ) : isFull ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center">
                  <Users className="w-10 h-10 mx-auto mb-2 text-red-600" />
                  <p className="font-black text-red-900 mb-1">اكتمل التسجيل ❌</p>
                  <p className="text-sm text-red-700">عذراً، تم حجز جميع المقاعد المتاحة.</p>
                </div>
              ) : isPast ? (
                <div className="bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-5 text-center">
                  <Clock className="w-10 h-10 mx-auto mb-2 text-neutral-500" />
                  <p className="font-black text-neutral-700 mb-1">انتهى موعد النشاط</p>
                </div>
              ) : deadlinePassed ? (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
                  <Clock className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                  <p className="font-black text-amber-900 mb-1">انتهت فترة التسجيل</p>
                </div>
              ) : (
                <RegistrationForm activity={activity} remaining={remaining} total={total} onSuccess={() => { setSubmitted(true); setActivity(p => ({ ...p, registeredCount: (p.registeredCount || 0) + 1 })) }} />
              )}

              <div className="bg-white border-2 border-neutral-200 rounded-2xl p-4 text-center">
                <a href="/activities" className="text-xs text-neutral-500 hover:text-[#CC0000] font-bold inline-flex items-center gap-1.5"><ArrowRight className="w-3 h-3" />عرض جميع النشاطات</a>
              </div>
            </div>
          </aside>
        </section>

        <footer className="bg-[#1A1A1A] text-white py-8 text-center">
          <div className="h-1 flex mb-6"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <div className="container mx-auto px-4">
            <a href="/" className="hover:text-[#FFCE00]">← العودة للصفحة الرئيسية</a>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

function RegistrationForm({ activity, remaining, total, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', attendees: 1, notes: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    const r = await api.post(`/api/activities/${activity.slug}/register`, form, { silent: true })
    setBusy(false)
    if (!r.ok) { toast.error(r.error || 'فشل التسجيل'); return }
    toast.success('تم التسجيل بنجاح!')
    onSuccess()
  }

  return (
    <div className="bg-white border-2 border-neutral-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black">سجّل الآن</h3>
        {total > 0 && <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full"><Users className="inline w-3 h-3 ms-0.5" />{remaining} مقعد متبقّي</span>}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>الاسم الكامل *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" /></div>
        <div><Label>البريد الإلكتروني *</Label><Input required type="email" dir="ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
        <div><Label>رقم واتساب *</Label><Input required type="tel" dir="ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+963 ..." /></div>
        <div><Label>عدد الحضور</Label><Input type="number" min="1" max="10" value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} /></div>
        <div><Label>ملاحظات (اختياري)</Label><Textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي طلبات خاصة..." /></div>
        <Button type="submit" disabled={busy} className="w-full h-12 bg-[#CC0000] hover:bg-[#A30000] text-white font-bold rounded-xl">
          {busy ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />جاري التسجيل...</span> : 'تأكيد التسجيل'}
        </Button>
        <p className="text-[10.5px] text-neutral-500 text-center leading-relaxed">سنتواصل معك عبر واتساب لتأكيد الحجز خلال 24 ساعة.</p>
      </form>
    </div>
  )
}
