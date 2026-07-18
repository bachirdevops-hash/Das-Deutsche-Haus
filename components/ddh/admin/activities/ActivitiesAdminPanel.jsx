'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Save, ExternalLink, Filter, Calendar, Users, Download, MessageCircle, ArrowLeft, Eye, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { ConfirmDialog, FileUpload } from '@/components/ddh/shared'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { RichTextEditor } from '@/components/ddh/RichTextEditor'
import { ACTIVITY_TYPES, ACTIVITY_STATUS, REG_STATUS, getActivityType } from '@/lib/activities_seed'

export function ActivitiesAdminPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [viewRegs, setViewRegs] = useState(null) // activity object

  const refresh = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    const r = await api.get(`/api/admin/activities?${params}`, { silent: true })
    if (r.ok) setItems(r.data.items || [])
    setLoading(false)
  }
  useEffect(() => { refresh() }, [statusFilter, typeFilter])
  useEffect(() => { const t = setTimeout(refresh, 400); return () => clearTimeout(t) }, [search])

  const newActivity = () => setEditing({
    title: '', slug: '', type: 'workshop', description: '', coverImage: '',
    date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    endTime: '', location: '', mapLink: '',
    price: 0, currency: 'USD', isFree: true,
    requiresRegistration: false, totalSeats: 0, registrationDeadline: '',
    status: 'Draft',
  })

  const save = async (data) => {
    const payload = { ...data }
    if (payload.date && payload.date.length === 16) payload.date = new Date(payload.date).toISOString()
    if (payload.endTime && payload.endTime.length === 16) payload.endTime = new Date(payload.endTime).toISOString()
    if (payload.registrationDeadline && payload.registrationDeadline.length === 16) payload.registrationDeadline = new Date(payload.registrationDeadline).toISOString()
    const r = editing.id
      ? await api.patch(`/api/admin/activities/${editing.id}`, payload, { silent: true })
      : await api.post('/api/admin/activities', payload, { silent: true })
    if (r.ok) { toast.success(editing.id ? 'تم التحديث' : 'تم إنشاء النشاط'); refresh(); setEditing(null) }
    else toast.error(r.error || 'فشلت العملية')
  }
  const del = async () => {
    const r = await api.delete(`/api/admin/activities/${delTarget.id}`, { silent: true })
    if (r.ok) { toast.success('تم الحذف'); refresh(); setDelTarget(null) }
  }

  if (viewRegs) return <RegistrationsView activity={viewRegs} onBack={() => { setViewRegs(null); refresh() }} />

  return (
    <ErrorBoundary>
      <section dir="rtl" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-xl">🗓️</div>
            <div>
              <h2 className="font-black text-xl">إدارة النشاطات</h2>
              <p className="text-xs text-neutral-500">{items.length} نشاط</p>
            </div>
          </div>
          <Button onClick={newActivity} className="bg-[#CC0000] hover:bg-[#A30000] text-white"><Plus className="w-4 h-4 me-1" />نشاط جديد</Button>
        </div>

        <div className="bg-white rounded-2xl p-4 border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input placeholder="بحث بالعنوان..." value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              {ACTIVITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label_ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><Filter className="w-4 h-4 ms-1.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {ACTIVITY_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label_ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refresh} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase font-bold text-neutral-500">
                <tr>
                  <th className="text-start p-3">الغلاف</th>
                  <th className="text-start p-3">العنوان</th>
                  <th className="text-start p-3">النوع</th>
                  <th className="text-start p-3">التاريخ</th>
                  <th className="text-start p-3">المقاعد</th>
                  <th className="text-start p-3">السعر</th>
                  <th className="text-start p-3">التسجيل</th>
                  <th className="text-start p-3">الحالة</th>
                  <th className="text-start p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={9} className="p-8 text-center text-neutral-500">جاري التحميل...</td></tr>
                  : items.length === 0 ? <tr><td colSpan={9} className="p-12 text-center text-neutral-500"><Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />لا توجد نشاطات</td></tr>
                  : items.map(a => {
                    const type = getActivityType(a.type)
                    const stat = ACTIVITY_STATUS.find(s => s.value === a.status) || ACTIVITY_STATUS[0]
                    const isFull = a.requiresRegistration && a.totalSeats > 0 && (a.registeredCount || 0) >= a.totalSeats
                    return (
                      <tr key={a.id} className="border-t hover:bg-neutral-50/50">
                        <td className="p-3">{a.coverImage ? <img src={a.coverImage} alt="" className="w-14 h-10 rounded-lg object-cover" /> : <div className="w-14 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-lg">{type.icon}</div>}</td>
                        <td className="p-3"><div className="font-bold line-clamp-1">{a.title}</div><div className="text-[10px] text-neutral-400 truncate max-w-[260px]" dir="ltr">/{a.slug}</div></td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${type.color}`}>{type.icon} {type.label_ar}</span></td>
                        <td className="p-3 text-xs">{a.date ? new Date(a.date).toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                        <td className="p-3 text-xs">
                          {a.requiresRegistration ? (
                            <span className={isFull ? 'text-red-600 font-bold' : 'font-semibold'}>{a.registeredCount || 0} / {a.totalSeats || 0}</span>
                          ) : <span className="text-neutral-400">—</span>}
                        </td>
                        <td className="p-3 text-xs font-bold">{a.isFree ? <span className="text-green-600">مجاني</span> : `${a.price} ${a.currency === 'EUR' ? '€' : a.currency === 'SYP' ? 'ل.س' : '$'}`}</td>
                        <td className="p-3 text-xs">{a.requiresRegistration ? <span className="text-blue-600 font-bold">مفعّل</span> : <span className="text-neutral-400">حضور حر</span>}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${stat.color}`}>{stat.label_ar}</span></td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {a.requiresRegistration && <button onClick={() => setViewRegs(a)} title="التسجيلات" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 inline-flex items-center gap-1"><Users className="w-4 h-4" /><span className="text-[10px] font-bold">{a.registeredCount || 0}</span></button>}
                            <a href={`/activities/${a.slug}`} target="_blank" rel="noreferrer" title="معاينة" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"><ExternalLink className="w-4 h-4" /></a>
                            <button onClick={() => setEditing(a)} title="تعديل" className="p-1.5 rounded-lg hover:bg-neutral-100"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDelTarget(a)} title="حذف" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {editing && <ActivityFormDialog activity={editing} onClose={() => setEditing(null)} onSave={save} />}
        {delTarget && <ConfirmDialog title="حذف النشاط" desc={`هل أنت متأكد من حذف "${delTarget.title}"؟ سيتم حذف جميع التسجيلات المرتبطة به.`} onConfirm={del} onCancel={() => setDelTarget(null)} />}
      </section>
    </ErrorBoundary>
  )
}

function ActivityFormDialog({ activity, onClose, onSave }) {
  const [form, setForm] = useState({
    ...activity,
    date: activity.date ? new Date(activity.date).toISOString().slice(0, 16) : '',
    endTime: activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : '',
    registrationDeadline: activity.registrationDeadline ? new Date(activity.registrationDeadline).toISOString().slice(0, 16) : '',
  })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    if (!form.title) { toast.error('العنوان مطلوب'); setBusy(false); return }
    if (!form.date) { toast.error('التاريخ مطلوب'); setBusy(false); return }
    await onSave(form); setBusy(false)
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{activity.id ? 'تعديل النشاط' : 'نشاط جديد'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><Label>العنوان *</Label><Input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثلاً: ورشة كتابة السيرة الذاتية" /></div>
            <div><Label>Slug (تلقائي إن تُرك فارغاً)</Label><Input value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="my-activity" dir="ltr" /></div>
            <div><Label>النوع</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACTIVITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Label>صورة الغلاف</Label>
              <FileUpload accept="image/*" kind="image" folder="ddh/activities" onUploaded={(f) => set('coverImage', f.url)} label="اسحب صورة الغلاف هنا" />
              {form.coverImage && <div className="mt-2 relative inline-block"><img src={form.coverImage} alt="cover" className="h-20 rounded-lg" /><button type="button" onClick={() => set('coverImage', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button></div>}
            </div>
            <div><Label>التاريخ والوقت *</Label><Input required type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div><Label>وقت الانتهاء (اختياري)</Label><Input type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>المكان</Label><Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="مثلاً: مقر Das Deutsche Haus — دمشق" /></div>
            <div className="md:col-span-2"><Label>رابط الخريطة (Google Maps)</Label><Input value={form.mapLink} onChange={e => set('mapLink', e.target.value)} placeholder="https://maps.google.com/..." dir="ltr" /></div>
          </div>

          <div className="md:col-span-2"><Label>الوصف الكامل</Label><RichTextEditor value={form.description} onChange={v => set('description', v)} /></div>

          {/* Pricing */}
          <div className="bg-neutral-50 rounded-2xl p-4 border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="!mb-0">مجاني (Free)</Label>
              <Switch checked={!!form.isFree} onCheckedChange={(v) => { set('isFree', v); if (v) set('price', 0) }} />
            </div>
            {!form.isFree && (
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>السعر</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} /></div>
                <div><Label>العملة</Label>
                  <Select value={form.currency} onValueChange={v => set('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="SYP">ل.س (SYP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Registration */}
          <div className="bg-neutral-50 rounded-2xl p-4 border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="!mb-0">يحتاج تسجيل مسبق</Label>
              <Switch checked={!!form.requiresRegistration} onCheckedChange={(v) => set('requiresRegistration', v)} />
            </div>
            {form.requiresRegistration && (
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>إجمالي المقاعد</Label><Input type="number" min="0" value={form.totalSeats} onChange={e => set('totalSeats', e.target.value)} placeholder="0 = غير محدود" /></div>
                <div><Label>آخر موعد للتسجيل (اختياري)</Label><Input type="datetime-local" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} /></div>
                {form.id && <div className="md:col-span-2 text-xs text-neutral-500">عدد المسجّلين الحالي: <strong>{form.registeredCount || 0}</strong></div>}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
            <div><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACTIVITY_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={busy} className="bg-[#1A1A1A] text-white"><Save className="w-4 h-4 me-1.5" />{busy ? 'جاري الحفظ...' : 'حفظ'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RegistrationsView({ activity, onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingReg, setEditingReg] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [adding, setAdding] = useState(false)
  const [activityState, setActivityState] = useState(activity)

  const refresh = async () => {
    setLoading(true)
    const [regs, act] = await Promise.all([
      api.get(`/api/admin/activities/${activity.id}/registrations`, { silent: true }),
      api.get(`/api/admin/activities/${activity.id}`, { silent: true }),
    ])
    if (regs.ok) setItems(regs.data.items || [])
    if (act.ok) setActivityState(act.data.item)
    setLoading(false)
  }
  useEffect(() => { refresh() }, [])

  const save = async (data) => {
    const r = editingReg.id
      ? await api.patch(`/api/admin/activities/${activity.id}/registrations/${editingReg.id}`, data, { silent: true })
      : await api.post(`/api/admin/activities/${activity.id}/registrations`, data, { silent: true })
    if (r.ok) { toast.success(editingReg.id ? 'تم التحديث' : 'تم الإضافة'); refresh(); setEditingReg(null); setAdding(false) }
    else toast.error(r.error || 'فشلت العملية')
  }
  const del = async () => {
    const r = await api.delete(`/api/admin/activities/${activity.id}/registrations/${delTarget.id}`, { silent: true })
    if (r.ok) { toast.success('تم الحذف — تم استرجاع المقعد'); refresh(); setDelTarget(null) }
  }
  const exportCSV = () => {
    window.open(`/api/admin/activities/${activity.id}/export`, '_blank')
  }
  const whatsappLink = (phone) => {
    const cleaned = String(phone || '').replace(/[^\d+]/g, '')
    return `https://wa.me/${cleaned.replace(/^\+/, '')}`
  }

  const total = activityState.totalSeats || 0
  const taken = activityState.registeredCount || 0

  return (
    <ErrorBoundary>
      <section dir="rtl" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-neutral-100"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h2 className="font-black text-xl">تسجيلات النشاط</h2>
              <p className="text-xs text-neutral-500 line-clamp-1">{activityState.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">{taken} / {total || '∞'} مقعد</span>
            <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 me-1.5" />تصدير CSV</Button>
            <Button onClick={() => { setEditingReg({ name: '', email: '', phone: '', attendees: 1, notes: '', adminNotes: '', status: 'Confirmed' }); setAdding(true) }} className="bg-[#CC0000] hover:bg-[#A30000] text-white"><Plus className="w-4 h-4 me-1" />تسجيل يدوي</Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase font-bold text-neutral-500">
                <tr>
                  <th className="text-start p-3">الاسم</th>
                  <th className="text-start p-3">البريد</th>
                  <th className="text-start p-3">واتساب</th>
                  <th className="text-start p-3">الحضور</th>
                  <th className="text-start p-3">الحالة</th>
                  <th className="text-start p-3">التاريخ</th>
                  <th className="text-start p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} className="p-8 text-center text-neutral-500">جاري التحميل...</td></tr>
                  : items.length === 0 ? <tr><td colSpan={7} className="p-12 text-center text-neutral-500"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" />لا توجد تسجيلات بعد</td></tr>
                  : items.map(r => {
                    const stat = REG_STATUS.find(s => s.value === r.status) || REG_STATUS[0]
                    return (
                      <tr key={r.id} className="border-t hover:bg-neutral-50/50">
                        <td className="p-3 font-bold">{r.name}{r.notes && <div className="text-[10px] text-neutral-500 line-clamp-1 max-w-[200px]">📝 {r.notes}</div>}</td>
                        <td className="p-3 text-xs" dir="ltr">{r.email}</td>
                        <td className="p-3 text-xs" dir="ltr">{r.phone}</td>
                        <td className="p-3 text-center font-bold">{r.attendees}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${stat.color}`}>{stat.label_ar}</span></td>
                        <td className="p-3 text-xs">{new Date(r.createdAt).toLocaleDateString('ar-SY')}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <a href={whatsappLink(r.phone)} target="_blank" rel="noreferrer" title="واتساب" className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><MessageCircle className="w-4 h-4" /></a>
                            <button onClick={() => { setEditingReg(r); setAdding(false) }} title="تعديل" className="p-1.5 rounded-lg hover:bg-neutral-100"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDelTarget(r)} title="حذف" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {editingReg && <RegFormDialog reg={editingReg} adding={adding} onClose={() => { setEditingReg(null); setAdding(false) }} onSave={save} />}
        {delTarget && <ConfirmDialog title="حذف التسجيل" desc={`هل أنت متأكد من حذف تسجيل "${delTarget.name}"؟ سيتم استرجاع المقاعد.`} onConfirm={del} onCancel={() => setDelTarget(null)} />}
      </section>
    </ErrorBoundary>
  )
}

function RegFormDialog({ reg, adding, onClose, onSave }) {
  const [form, setForm] = useState({ ...reg })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    if (!form.name || !form.email || !form.phone) { toast.error('الحقول الأساسية مطلوبة'); setBusy(false); return }
    await onSave(form); setBusy(false)
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader><DialogTitle>{adding ? 'تسجيل يدوي جديد' : 'تعديل التسجيل'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>الاسم الكامل *</Label><Input required value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>البريد *</Label><Input required type="email" dir="ltr" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div><Label>واتساب *</Label><Input required type="tel" dir="ltr" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>عدد الحضور</Label><Input type="number" min="1" max="20" value={form.attendees} onChange={e => set('attendees', e.target.value)} /></div>
            <div><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REG_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>ملاحظات المُسجِّل</Label><Textarea rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} /></div>
          <div><Label>ملاحظات إدارية (لا تظهر للمستخدم)</Label><Textarea rows={2} value={form.adminNotes || ''} onChange={e => set('adminNotes', e.target.value)} /></div>
          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={busy} className="bg-[#1A1A1A] text-white"><Save className="w-4 h-4 me-1.5" />{busy ? 'جاري الحفظ...' : 'حفظ'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ActivitiesAdminPanel
