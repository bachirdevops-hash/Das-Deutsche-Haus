'use client'
// 📅 Consultation Availability Slots — Admin Panel
// Model: Availability Slot → Booking. Cancelling a booking PRESERVES history and releases the slot.
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Calendar, Clock, Plus, Trash2, Ban, CheckCircle2, XCircle, User, RefreshCw } from 'lucide-react'

const api = async (url, opts = {}) => {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts })
  return r.json()
}

const fmtDay = (dateStr) => {
  try { return new Intl.DateTimeFormat('ar-SY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateStr}T12:00:00`)) }
  catch { return dateStr }
}

export default function ConsultationSlotsAdminPanel() {
  const [slots, setSlots] = useState([])
  const [now, setNow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPast, setShowPast] = useState(false)
  const [confirm, setConfirm] = useState(null) // { kind: 'cancel'|'delete', slot }
  // generation form
  const [gen, setGen] = useState({ date: '', startTime: '10:00', endTime: '18:00', duration: '30', customDuration: '', breakMinutes: '0' })
  const [generating, setGenerating] = useState(false)

  const load = () => {
    setLoading(true)
    api('/api/admin/consultation-slots').then(d => {
      setSlots(d.slots || [])
      setNow(d.now || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const isPast = (s) => now && (s.date < now.date || (s.date === now.date && s.startTime <= now.time))
  const visible = slots.filter(s => showPast ? true : !isPast(s))
  const byDate = {}
  visible.forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s) })
  const dates = Object.keys(byDate).sort()

  const stats = {
    available: visible.filter(s => s.status === 'available').length,
    booked: visible.filter(s => s.status === 'booked').length,
    disabled: visible.filter(s => s.status === 'disabled').length,
  }

  const generate = async () => {
    if (generating) return
    const duration = gen.duration === 'custom' ? gen.customDuration : gen.duration
    if (!gen.date) { toast.error('اختر التاريخ'); return }
    if (!duration || parseInt(duration) < 5) { toast.error('حدد مدة صالحة (5 دقائق على الأقل)'); return }
    setGenerating(true)
    const d = await api('/api/admin/consultation-slots/generate', {
      method: 'POST',
      body: JSON.stringify({ date: gen.date, startTime: gen.startTime, endTime: gen.endTime, duration, breakMinutes: gen.breakMinutes }),
    })
    setGenerating(false)
    if (d.error) { toast.error(d.error); return }
    toast.success(`تم إنشاء ${d.created} موعداً${d.skipped ? ` — تم تخطي ${d.skipped} (متداخلة مع مواعيد موجودة)` : ''}`)
    load()
  }

  const cancelBooking = async (slot) => {
    const d = await api(`/api/admin/consultation-bookings/${slot.bookingId}/cancel`, { method: 'POST' })
    if (d.error) toast.error(d.error)
    else { toast.success('تم إلغاء الحجز — الموعد أصبح متاحاً من جديد، وسجل الحجز محفوظ') ; load() }
    setConfirm(null)
  }
  const deleteSlot = async (slot) => {
    const d = await api(`/api/admin/consultation-slots/${slot.id}`, { method: 'DELETE' })
    if (d.error) toast.error(d.error)
    else { toast.success('تم حذف الموعد'); load() }
    setConfirm(null)
  }
  const toggleDisable = async (slot) => {
    const d = await api(`/api/admin/consultation-slots/${slot.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: slot.status === 'disabled' ? 'available' : 'disabled' }),
    })
    if (d.error) toast.error(d.error)
    else { toast.success(slot.status === 'disabled' ? 'تم تفعيل الموعد' : 'تم تعطيل الموعد'); load() }
  }

  const StatusBadge = ({ slot }) => {
    if (slot.status === 'booked') return <Badge className="bg-blue-600 text-white hover:bg-blue-600 gap-1"><User className="w-3 h-3" />محجوز</Badge>
    if (slot.status === 'disabled') return <Badge variant="outline" className="text-neutral-500 gap-1"><Ban className="w-3 h-3" />معطّل</Badge>
    return <Badge className="bg-green-600 text-white hover:bg-green-600 gap-1"><CheckCircle2 className="w-3 h-3" />متاح · Frei</Badge>
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2"><Calendar className="w-5 h-5 text-[#CC0000]" />مواعيد الاستشارات</h3>
          <p className="text-sm text-neutral-500 mt-1">أنشئ أوقات التوفر — الزوار يحجزون منها مباشرة. التوقيت بحسب ألمانيا (Europe/Berlin).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 ms-1" />تحديث</Button>
          <Button variant={showPast ? 'default' : 'outline'} size="sm" onClick={() => setShowPast(!showPast)}>{showPast ? 'إخفاء المنتهية' : 'إظهار المنتهية'}</Button>
        </div>
      </div>

      {/* ===== Slot generation ===== */}
      <Card className="border-2 border-[#FFCE00]/40">
        <CardContent className="p-5">
          <h4 className="font-black mb-4 flex items-center gap-2"><Plus className="w-4 h-4" />إنشاء مواعيد متعددة دفعة واحدة</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div><Label className="text-xs">التاريخ</Label><Input type="date" value={gen.date} onChange={e => setGen({ ...gen, date: e.target.value })} /></div>
            <div><Label className="text-xs">من الساعة</Label><Input type="time" value={gen.startTime} onChange={e => setGen({ ...gen, startTime: e.target.value })} /></div>
            <div><Label className="text-xs">إلى الساعة</Label><Input type="time" value={gen.endTime} onChange={e => setGen({ ...gen, endTime: e.target.value })} /></div>
            <div>
              <Label className="text-xs">مدة الموعد</Label>
              <Select value={gen.duration} onValueChange={v => setGen({ ...gen, duration: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 دقيقة</SelectItem>
                  <SelectItem value="30">30 دقيقة</SelectItem>
                  <SelectItem value="45">45 دقيقة</SelectItem>
                  <SelectItem value="60">60 دقيقة</SelectItem>
                  <SelectItem value="custom">مدة مخصصة...</SelectItem>
                </SelectContent>
              </Select>
              {gen.duration === 'custom' && <Input type="number" min="5" max="240" placeholder="بالدقائق" className="mt-2" value={gen.customDuration} onChange={e => setGen({ ...gen, customDuration: e.target.value })} />}
            </div>
            <div>
              <Label className="text-xs">استراحة بين المواعيد</Label>
              <Select value={gen.breakMinutes} onValueChange={v => setGen({ ...gen, breakMinutes: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">بدون استراحة</SelectItem>
                  <SelectItem value="5">5 دقائق</SelectItem>
                  <SelectItem value="10">10 دقائق</SelectItem>
                  <SelectItem value="15">15 دقيقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={generating} className="btn-primary mt-4 font-bold">{generating ? 'جاري الإنشاء...' : 'إنشاء المواعيد'}</Button>
          <p className="text-xs text-neutral-400 mt-2">مثال: من 10:00 إلى 20:00 بمدة 30 دقيقة = 20 موعداً. المواعيد المتداخلة مع مواعيد موجودة تُتخطى تلقائياً.</p>
        </CardContent>
      </Card>

      {/* ===== Stats ===== */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 font-bold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />متاح: {stats.available}</span>
        <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 font-bold text-blue-700 flex items-center gap-1.5"><User className="w-4 h-4" />محجوز: {stats.booked}</span>
        <span className="px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 font-bold text-neutral-500 flex items-center gap-1.5"><Ban className="w-4 h-4" />معطّل: {stats.disabled}</span>
      </div>

      {/* ===== Slots by day ===== */}
      {loading ? (
        <div className="py-12 text-center text-neutral-400">جاري التحميل...</div>
      ) : dates.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-neutral-500">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
          لا توجد مواعيد {showPast ? '' : 'قادمة '}— أنشئ مواعيد توفر من النموذج أعلاه.
        </CardContent></Card>
      ) : dates.map(d => (
        <Card key={d}>
          <CardContent className="p-4">
            <h4 className="font-black mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#CC0000]" />{fmtDay(d)} <span className="text-xs text-neutral-400 font-normal" dir="ltr">{d}</span></h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-start text-xs text-neutral-500 border-b">
                  <th className="text-start py-2 pe-3">الوقت</th>
                  <th className="text-start py-2 pe-3">المدة</th>
                  <th className="text-start py-2 pe-3">العميل</th>
                  <th className="text-start py-2 pe-3">الحالة</th>
                  <th className="text-start py-2">إجراءات</th>
                </tr></thead>
                <tbody>
                  {byDate[d].map(s => (
                    <tr key={s.id} className={`border-b last:border-0 ${isPast(s) ? 'opacity-50' : ''}`}>
                      <td className="py-2.5 pe-3 font-bold" dir="ltr">{s.startTime} – {s.endTime}</td>
                      <td className="py-2.5 pe-3 text-neutral-500">{s.duration} د</td>
                      <td className="py-2.5 pe-3">
                        {s.booking ? (
                          <div>
                            <div className="font-bold">{s.booking.name || '—'}</div>
                            <div className="text-xs text-neutral-500" dir="ltr">{s.booking.email}{s.booking.phone ? ` · ${s.booking.phone}` : ''}</div>
                            {s.booking.consultationTypeName && <div className="text-xs text-neutral-400">{s.booking.consultationTypeName}</div>}
                          </div>
                        ) : <span className="text-neutral-300">—</span>}
                      </td>
                      <td className="py-2.5 pe-3"><StatusBadge slot={s} /></td>
                      <td className="py-2.5">
                        <div className="flex gap-1.5">
                          {s.status === 'booked' && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirm({ kind: 'cancel', slot: s })}>
                              <XCircle className="w-3.5 h-3.5 ms-1" />إلغاء الحجز
                            </Button>
                          )}
                          {s.status !== 'booked' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => toggleDisable(s)}>
                                {s.status === 'disabled' ? <><CheckCircle2 className="w-3.5 h-3.5 ms-1" />تفعيل</> : <><Ban className="w-3.5 h-3.5 ms-1" />تعطيل</>}
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirm({ kind: 'delete', slot: s })}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ===== Confirmation dialogs ===== */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.kind === 'cancel' ? 'إلغاء حجز الاستشارة؟' : 'حذف الموعد؟'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === 'cancel' ? (
                <>هل تريد فعلاً إلغاء حجز <strong>{confirm?.slot?.booking?.name}</strong> ليوم <span dir="ltr">{confirm?.slot?.date} · {confirm?.slot?.startTime}</span>؟
                <br />سيبقى سجل الحجز محفوظاً بحالة "ملغى"، وسيصبح الموعد <strong>متاحاً من جديد</strong> للحجز من قبل الآخرين.</>
              ) : (
                <>سيتم حذف الموعد <span dir="ltr">{confirm?.slot?.date} · {confirm?.slot?.startTime}</span> نهائياً (الموعد غير محجوز).</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction className="bg-[#CC0000] hover:bg-[#A30000]" onClick={() => confirm?.kind === 'cancel' ? cancelBooking(confirm.slot) : deleteSlot(confirm.slot)}>
              {confirm?.kind === 'cancel' ? 'نعم، ألغِ الحجز' : 'نعم، احذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
