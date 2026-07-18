'use client'
import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Calendar, Inbox, Phone, Mail, MessageCircle, Plus, Pencil, Trash2, Eye, EyeOff, Search, ArrowUp, ArrowDown, Star, Save, X, Check, AlertTriangle, FileText, Image as ImageIcon, MapPin, Layers, HelpCircle, BookOpen, Users, Settings, ShieldAlert, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import { ConfirmDialog, FileUpload } from '@/components/ddh/shared'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'

// ============== MAIN PANEL ==============
export function GermanAdminPanel() {
  return (
    <ErrorBoundary>
      <section dir="rtl" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🇩🇪</div>
            <h2 className="text-3xl font-black tracking-tight">إدارة صفحة الزوار الألمان</h2>
          </div>
          <p className="text-sm text-neutral-600">إدارة كاملة لصفحة <code className="text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded">/german-visitors</code> — كل التغييرات تنعكس فوراً.</p>
        </div>
        <Tabs defaultValue="bookings">
          <TabsList className="flex flex-wrap h-auto bg-white border rounded-2xl p-1.5 gap-1 mb-6">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Inbox className="w-4 h-4 ms-1.5" />الحجوزات</TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Layers className="w-4 h-4 ms-1.5" />طلبات الخدمات</TabsTrigger>
            <TabsTrigger value="emergency" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><ShieldAlert className="w-4 h-4 ms-1.5" />أرقام الطوارئ</TabsTrigger>
            <TabsTrigger value="packages" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><MapPin className="w-4 h-4 ms-1.5" />الباقات السياحية</TabsTrigger>
            <TabsTrigger value="experiences" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Star className="w-4 h-4 ms-1.5" />التجارب</TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Users className="w-4 h-4 ms-1.5" />الشهادات</TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><ImageIcon className="w-4 h-4 ms-1.5" />المعرض</TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><HelpCircle className="w-4 h-4 ms-1.5" />الأسئلة</TabsTrigger>
            <TabsTrigger value="flashcards" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><BookOpen className="w-4 h-4 ms-1.5" />البطاقات</TabsTrigger>
            <TabsTrigger value="why" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Star className="w-4 h-4 ms-1.5" />لماذا سوريا</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Settings className="w-4 h-4 ms-1.5" />إعدادات الصفحة</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings"><BookingsManager /></TabsContent>
          <TabsContent value="services"><ServiceRequestsManager /></TabsContent>
          <TabsContent value="emergency"><EmergencyManager /></TabsContent>
          <TabsContent value="packages"><PackagesManager /></TabsContent>
          <TabsContent value="experiences"><ExperiencesManager /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsManager /></TabsContent>
          <TabsContent value="gallery"><GalleryManager /></TabsContent>
          <TabsContent value="faq"><FaqManager /></TabsContent>
          <TabsContent value="flashcards"><FlashcardsManager /></TabsContent>
          <TabsContent value="why"><WhyCardsManager /></TabsContent>
          <TabsContent value="settings"><PageSettingsManager /></TabsContent>
        </Tabs>
      </section>
    </ErrorBoundary>
  )
}

// ============== STATUS HELPERS ==============
const STATUS_CONFIG = {
  New: { label: 'جديد 🔴', cls: 'bg-red-100 text-red-700 border-red-300', next: 'Contacted' },
  Contacted: { label: 'تم التواصل 🟡', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300', next: 'Confirmed' },
  Confirmed: { label: 'مؤكّد 🟢', cls: 'bg-green-100 text-green-700 border-green-300', next: 'Completed' },
  Completed: { label: 'مكتمل ✅', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', next: 'New' },
  Cancelled: { label: 'ملغى ⚫', cls: 'bg-neutral-200 text-neutral-700 border-neutral-300', next: 'New' },
}
const STATUS_OPTIONS = ['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled']

function StatusPill({ status, onClick }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.New
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.cls} hover:opacity-80 transition`}>
      {c.label}
    </button>
  )
}

// ============== BOOKINGS MANAGER ==============
function BookingsManager() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // booking object for notes
  const [delTarget, setDelTarget] = useState(null)
  const [packages, setPackages] = useState([])

  const refresh = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    const r = await api.get(`/api/admin/german/bookings?${params}`, { silent: true })
    if (r.ok) setItems(r.data.items || [])
    setLoading(false)
  }
  useEffect(() => { refresh() }, [statusFilter])
  useEffect(() => {
    api.get('/api/admin/german/packages', { silent: true }).then(r => r.ok && setPackages(r.data.items || []))
  }, [])

  const debouncedSearch = useMemo(() => {
    const t = setTimeout(refresh, 400)
    return () => clearTimeout(t)
  }, [search])
  useEffect(() => debouncedSearch, [search])

  const cycleStatus = async (b) => {
    const next = STATUS_CONFIG[b.status || 'New']?.next || 'Contacted'
    const r = await api.patch(`/api/admin/german/bookings/${b.id}`, { status: next }, { silent: true })
    if (r.ok) { setItems(items.map(x => x.id === b.id ? { ...x, status: next } : x)); toast.success(`تم تحديث الحالة إلى: ${STATUS_CONFIG[next]?.label || next}`) }
  }
  const updateNotes = async (notes) => {
    const r = await api.patch(`/api/admin/german/bookings/${editing.id}`, { adminNotes: notes }, { silent: true })
    if (r.ok) { toast.success('تم حفظ الملاحظات'); refresh(); setEditing(null) }
  }
  const del = async () => {
    const r = await api.delete(`/api/admin/german/bookings/${delTarget.id}`, { silent: true })
    if (r.ok) { setItems(items.filter(x => x.id !== delTarget.id)); toast.success('تم الحذف'); setDelTarget(null) }
  }

  const waLink = (b) => `https://wa.me/${(b.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hallo ${b.name}, vielen Dank für Ihre Buchungsanfrage bei Das Deutsche Haus.`)}`
  const mailLink = (b) => `mailto:${b.email}?subject=${encodeURIComponent('Ihre Buchungsanfrage — Das Deutsche Haus')}&body=${encodeURIComponent(`Hallo ${b.name},\n\nvielen Dank für Ihre Anfrage. Wir melden uns mit weiteren Details.\n\nMit freundlichen Grüßen\nDas Deutsche Haus`)}`

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input placeholder="بحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 ms-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-sm text-neutral-500">{items.length} حجز</div>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs uppercase font-bold text-neutral-500">
              <tr>
                <th className="text-start p-3">الاسم</th>
                <th className="text-start p-3">التواصل</th>
                <th className="text-start p-3">التواريخ</th>
                <th className="text-start p-3">عدد المسافرين</th>
                <th className="text-start p-3">الباقة</th>
                <th className="text-start p-3">الحالة</th>
                <th className="text-start p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="p-8 text-center text-neutral-500">جاري التحميل...</td></tr>
                : items.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-neutral-500"><Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />لا توجد حجوزات</td></tr>
                : items.map(b => {
                  const pkg = packages.find(p => p.id === b.packageId)
                  return (
                    <tr key={b.id} className="border-t hover:bg-neutral-50/50">
                      <td className="p-3"><div className="font-bold">{b.name}</div><div className="text-xs text-neutral-500" dir="ltr">{b.email}</div></td>
                      <td className="p-3"><div className="text-xs" dir="ltr">{b.phone}</div><div className="text-[10px] text-neutral-400 mt-0.5">{new Date(b.createdAt).toLocaleDateString('ar')}</div></td>
                      <td className="p-3 text-xs"><div>{b.dateFrom || '—'}</div><div className="text-neutral-500">→ {b.dateTo || '—'}</div></td>
                      <td className="p-3 text-center font-bold">{b.travelers || 1}</td>
                      <td className="p-3 text-xs">{pkg?.name || <span className="text-neutral-400 italic">غير محدد</span>}</td>
                      <td className="p-3"><StatusPill status={b.status || 'New'} onClick={() => cycleStatus(b)} /></td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <a href={waLink(b)} target="_blank" rel="noreferrer" title="WhatsApp" className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><MessageCircle className="w-4 h-4" /></a>
                          <a href={mailLink(b)} title="Email" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Mail className="w-4 h-4" /></a>
                          <button onClick={() => setEditing(b)} title="ملاحظات" className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600"><FileText className="w-4 h-4" /></button>
                          <button onClick={() => setDelTarget(b)} title="حذف" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <NotesDialog item={editing} onClose={() => setEditing(null)} onSave={updateNotes} />}
      {delTarget && <ConfirmDialog title="حذف الحجز" desc={`هل أنت متأكد من حذف حجز "${delTarget.name}"؟`} onConfirm={del} onCancel={() => setDelTarget(null)} />}
    </div>
  )
}

function NotesDialog({ item, onClose, onSave }) {
  const [notes, setNotes] = useState(item.adminNotes || '')
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader><DialogTitle>تفاصيل {item.name}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3 bg-neutral-50 rounded-xl p-3">
            <div><div className="text-xs text-neutral-500">البريد</div><div className="font-bold" dir="ltr">{item.email}</div></div>
            <div><div className="text-xs text-neutral-500">الهاتف</div><div className="font-bold" dir="ltr">{item.phone || item.whatsapp}</div></div>
            <div><div className="text-xs text-neutral-500">من</div><div className="font-bold">{item.dateFrom || '—'}</div></div>
            <div><div className="text-xs text-neutral-500">إلى</div><div className="font-bold">{item.dateTo || '—'}</div></div>
            <div className="col-span-2"><div className="text-xs text-neutral-500">الطلبات الخاصة</div><div className="text-xs">{item.requests || item.notes || '—'}</div></div>
            {item.source && <div className="col-span-2"><div className="text-xs text-neutral-500">المصدر</div><div className="text-xs">{item.source}</div></div>}
          </div>
          <div>
            <Label>ملاحظات الإدارة (داخلية)</Label>
            <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات لطاقم الإدارة فقط..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          <Button onClick={() => onSave(notes)} className="bg-[#1A1A1A] text-white"><Save className="w-4 h-4 me-1.5" />حفظ الملاحظات</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============== SERVICE REQUESTS MANAGER ==============
const SERVICE_LABELS = {
  consult: 'Online-Beratung', 'arabic-mini': 'Arabisch-Kurs', 'guide-pdf': 'Reiseführer PDF', visa: 'Visum-Hilfe', insurance: 'Reiseversicherung',
  pickup: 'Flughafen-Abholung', accommodation: 'Unterkunft', translator: 'Übersetzer', sim: 'SIM-Karte', orientation: 'Orientierungstour',
  'daily-guide': 'Täglicher Guide', business: 'Geschäftstermine', translation: 'Übersetzung', 'family-dinner': 'Familien-Essen', 'photo-tour': 'Foto-Tour',
  cooking: 'Kochkurs', desert: 'Wüsten-Ausflug', emergency: 'Notfall-Support',
}

function ServiceRequestsManager() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [delTarget, setDelTarget] = useState(null)

  const refresh = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    const r = await api.get(`/api/admin/german/service-requests?${params}`, { silent: true })
    if (r.ok) setItems(r.data.items || [])
    setLoading(false)
  }
  useEffect(() => { refresh() }, [statusFilter])
  useEffect(() => { const t = setTimeout(refresh, 400); return () => clearTimeout(t) }, [search])

  const cycleStatus = async (b) => {
    const next = STATUS_CONFIG[b.status || 'New']?.next || 'Contacted'
    const r = await api.patch(`/api/admin/german/service-requests/${b.id}`, { status: next }, { silent: true })
    if (r.ok) { setItems(items.map(x => x.id === b.id ? { ...x, status: next } : x)); toast.success('تم التحديث') }
  }
  const updateNotes = async (notes) => {
    const r = await api.patch(`/api/admin/german/service-requests/${editing.id}`, { adminNotes: notes }, { silent: true })
    if (r.ok) { toast.success('تم الحفظ'); refresh(); setEditing(null) }
  }
  const del = async () => {
    const r = await api.delete(`/api/admin/german/service-requests/${delTarget.id}`, { silent: true })
    if (r.ok) { setItems(items.filter(x => x.id !== delTarget.id)); toast.success('تم الحذف'); setDelTarget(null) }
  }
  const waLink = (b) => `https://wa.me/${(b.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hallo ${b.name}, vielen Dank für Ihre Service-Anfrage.`)}`
  const LOC_LABELS = { germany: 'Noch in Deutschland', transit: 'Transit', syria: 'In Syrien', jordan: 'Jordanien', lebanon: 'Libanon' }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-sm text-neutral-500">{items.length} طلب</div>
      </div>
      <div className="grid gap-4">
        {loading ? <div className="p-8 text-center bg-white rounded-2xl border">جاري التحميل...</div>
          : items.length === 0 ? <div className="p-12 text-center bg-white rounded-2xl border"><Layers className="w-10 h-10 mx-auto mb-2 opacity-30" /><div className="text-neutral-500">لا توجد طلبات</div></div>
          : items.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-black text-lg">{b.name}</div>
                  <div className="text-xs text-neutral-500" dir="ltr">{b.email} · {b.whatsapp}</div>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {b.location && <span className="bg-neutral-100 px-2 py-0.5 rounded-full"><MapPin className="inline w-3 h-3 ms-1" />{LOC_LABELS[b.location] || b.location}</span>}
                    {b.dateFrom && <span className="bg-blue-50 px-2 py-0.5 rounded-full"><Calendar className="inline w-3 h-3 ms-1" />{b.dateFrom} → {b.dateTo}</span>}
                    <span className="bg-amber-50 px-2 py-0.5 rounded-full"><Users className="inline w-3 h-3 ms-1" />{b.travelers}</span>
                  </div>
                </div>
                <StatusPill status={b.status || 'New'} onClick={() => cycleStatus(b)} />
              </div>
              {(b.services || []).length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase text-neutral-500 mb-1.5">الخدمات المطلوبة ({(b.services || []).length})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(b.services || []).map(s => <span key={s} className="text-[11px] bg-[#FFCE00]/20 border border-[#FFCE00]/40 px-2 py-1 rounded-md font-medium">{SERVICE_LABELS[s] || s}</span>)}
                  </div>
                </div>
              )}
              {b.notes && <div className="text-xs text-neutral-600 bg-neutral-50 rounded-lg p-2 mb-3">💬 {b.notes}</div>}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                <a href={waLink(b)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600"><MessageCircle className="w-3.5 h-3.5" />WhatsApp</a>
                <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600"><Mail className="w-3.5 h-3.5" />Email</a>
                <button onClick={() => setEditing(b)} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border hover:bg-neutral-50"><FileText className="w-3.5 h-3.5" />ملاحظات</button>
                <button onClick={() => setDelTarget(b)} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" />حذف</button>
                <span className="ms-auto text-[10px] text-neutral-400">{new Date(b.createdAt).toLocaleString('ar')}</span>
              </div>
              {b.adminNotes && <div className="mt-2 text-xs bg-yellow-50 border-r-4 border-yellow-400 p-2 rounded">📝 {b.adminNotes}</div>}
            </div>
          ))}
      </div>
      {editing && <NotesDialog item={editing} onClose={() => setEditing(null)} onSave={updateNotes} />}
      {delTarget && <ConfirmDialog title="حذف الطلب" desc={`حذف طلب ${delTarget.name}؟`} onConfirm={del} onCancel={() => setDelTarget(null)} />}
    </div>
  )
}

// ============== GENERIC SIMPLE CRUD ==============
function SimpleCrud({ collection, title, fields, listRender, defaults = {}, hint }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = none, {} = new, {id...} = edit existing
  const [delTarget, setDelTarget] = useState(null)

  const refresh = async () => {
    setLoading(true)
    const r = await api.get(`/api/admin/german/${collection}`, { silent: true })
    if (r.ok) setItems(r.data.items || [])
    setLoading(false)
  }
  useEffect(() => { refresh() }, [])

  const save = async (data) => {
    const r = editing.id
      ? await api.patch(`/api/admin/german/${collection}/${editing.id}`, data, { silent: true })
      : await api.post(`/api/admin/german/${collection}`, { ...data, sortOrder: (items.length + 1) }, { silent: true })
    if (r.ok) { toast.success(editing.id ? 'تم التحديث' : 'تمت الإضافة'); refresh(); setEditing(null) }
    else toast.error(r.error || 'فشلت العملية')
  }
  const del = async () => {
    const r = await api.delete(`/api/admin/german/${collection}/${delTarget.id}`, { silent: true })
    if (r.ok) { toast.success('تم الحذف'); refresh(); setDelTarget(null) }
  }
  const move = async (item, dir) => {
    const idx = items.findIndex(x => x.id === item.id)
    const swap = items[idx + dir]
    if (!swap) return
    await Promise.all([
      api.patch(`/api/admin/german/${collection}/${item.id}`, { sortOrder: swap.sortOrder }, { silent: true }),
      api.patch(`/api/admin/german/${collection}/${swap.id}`, { sortOrder: item.sortOrder }, { silent: true }),
    ])
    refresh()
  }
  const toggleVisible = async (item) => {
    const key = item.visible !== undefined ? 'visible' : 'status'
    const newVal = key === 'visible' ? !item.visible : (item.status === 'Available' ? 'Unavailable' : 'Available')
    await api.patch(`/api/admin/german/${collection}/${item.id}`, { [key]: newVal }, { silent: true })
    refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border">
        <div>
          <h3 className="font-black text-lg">{title}</h3>
          {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
        </div>
        <Button onClick={() => setEditing({ ...defaults })} className="bg-[#CC0000] hover:bg-[#A30000] text-white"><Plus className="w-4 h-4 me-1" />إضافة جديد</Button>
      </div>
      {loading ? <div className="p-8 text-center bg-white rounded-2xl border">جاري التحميل...</div>
        : items.length === 0 ? <div className="p-12 text-center bg-white rounded-2xl border text-neutral-500">لا توجد عناصر — اضغط "إضافة جديد"</div>
        : <div className="space-y-2">
          {items.map((it, i) => (
            <div key={it.id} className="bg-white rounded-2xl border p-4 flex items-center gap-3 hover:shadow-sm transition">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(it, -1)} disabled={i === 0} className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => move(it, 1)} disabled={i === items.length - 1} className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
              </div>
              <div className="flex-1 min-w-0">{listRender(it)}</div>
              <div className="flex items-center gap-1.5">
                {(it.visible !== undefined || it.status !== undefined) && (
                  <button onClick={() => toggleVisible(it)} className="p-1.5 rounded-lg hover:bg-neutral-100" title={it.visible || it.status === 'Available' ? 'مخفي' : 'إظهار'}>
                    {(it.visible || it.status === 'Available') ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}
                  </button>
                )}
                <button onClick={() => setEditing(it)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDelTarget(it)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      {editing && <FormDialog item={editing} fields={fields} onClose={() => setEditing(null)} onSave={save} title={title} />}
      {delTarget && <ConfirmDialog title="تأكيد الحذف" desc="هل أنت متأكد من حذف هذا العنصر؟" onConfirm={del} onCancel={() => setDelTarget(null)} />}
    </div>
  )
}

// Reusable form dialog driven by `fields` config
function FormDialog({ item, fields, onClose, onSave, title }) {
  const [form, setForm] = useState({ ...item })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    await onSave(form); setBusy(false)
  }
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item.id ? 'تعديل' : 'إضافة'} — {title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {fields.map(f => (
            <div key={f.key} className={f.full ? 'col-span-2' : ''}>
              <Label>{f.label}{f.required && <span className="text-red-500"> *</span>}</Label>
              {f.type === 'textarea' ? <Textarea rows={f.rows || 3} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} required={f.required} placeholder={f.placeholder} />
                : f.type === 'number' ? <Input type="number" min={f.min ?? 0} value={form[f.key] ?? ''} onChange={e => set(f.key, Number(e.target.value))} required={f.required} />
                : f.type === 'select' ? <Select value={form[f.key] || f.options[0].value} onValueChange={v => set(f.key, v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                : f.type === 'switch' ? <div className="flex items-center gap-2"><Switch checked={!!form[f.key]} onCheckedChange={v => set(f.key, v)} /><span className="text-sm text-neutral-600">{form[f.key] ? 'مرئي' : 'مخفي'}</span></div>
                : f.type === 'image' ? <FileUpload accept="image/*" value={form[f.key]} onChange={(url) => set(f.key, url)} kind="image" folder="ddh/german" />
                : f.type === 'tags' ? <TagsInput value={form[f.key] || []} onChange={v => set(f.key, v)} placeholder={f.placeholder} />
                : f.type === 'list' ? <ListInput value={form[f.key] || []} onChange={v => set(f.key, v)} placeholder={f.placeholder} />
                : <Input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} required={f.required} placeholder={f.placeholder} dir={f.dir} />}
              {f.hint && <p className="text-[10px] text-neutral-500 mt-1">{f.hint}</p>}
            </div>
          ))}
          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={busy} className="bg-[#1A1A1A] text-white"><Save className="w-4 h-4 me-1.5" />{busy ? 'جاري الحفظ...' : 'حفظ'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TagsInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => { if (input.trim()) { onChange([...value, input.trim()]); setInput('') } }
  return (
    <div>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} />
        <Button type="button" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {value.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-full text-xs">{t}<button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-neutral-500 hover:text-red-600"><X className="w-3 h-3" /></button></span>
        ))}
      </div>
    </div>
  )
}

function ListInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => { if (input.trim()) { onChange([...value, input.trim()]); setInput('') } }
  return (
    <div>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} />
        <Button type="button" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <ul className="mt-2 space-y-1">
        {value.map((t, i) => (
          <li key={i} className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-lg text-sm">
            <span className="flex-1">{t}</span>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-neutral-400 hover:text-red-600"><X className="w-3 h-3" /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============== EMERGENCY MANAGER ==============
function EmergencyManager() {
  const fields = [
    { key: 'category', label: 'الفئة', type: 'select', required: true, options: [{ value: 'embassy', label: 'سفارة' }, { value: 'syria_emergency', label: 'طوارئ سوريا' }, { value: 'ddh_support', label: 'دعم DDH' }, { value: 'other', label: 'أخرى' }] },
    { key: 'icon', label: 'الأيقونة (Emoji)', type: 'text', placeholder: '🇩🇪 🚔 🚑 ...' },
    { key: 'name', label: 'الاسم', type: 'text', required: true, placeholder: 'Deutsche Botschaft Damaskus' },
    { key: 'phone', label: 'رقم الهاتف', type: 'text', dir: 'ltr', placeholder: '+963 11 ...' },
    { key: 'website', label: 'الموقع الإلكتروني', type: 'text', dir: 'ltr' },
    { key: 'address', label: 'العنوان', type: 'text' },
    { key: 'country', label: 'الدولة', type: 'select', options: [{ value: 'Syria', label: 'سوريا' }, { value: 'Jordan', label: 'الأردن' }, { value: 'Lebanon', label: 'لبنان' }, { value: 'Germany', label: 'ألمانيا' }] },
    { key: 'visible', label: 'مرئي على الصفحة', type: 'switch' },
  ]
  return <SimpleCrud
    collection="emergency"
    title="أرقام الطوارئ والسفارات"
    hint="السفارات / طوارئ سوريا / دعم Das Deutsche Haus"
    defaults={{ category: 'embassy', country: 'Syria', visible: true, icon: '🇩🇪' }}
    fields={fields}
    listRender={(it) => (
      <div>
        <div className="font-bold text-sm">{it.icon} {it.name}</div>
        <div className="text-xs text-neutral-500" dir="ltr">{it.phone} {it.website && `· ${it.website}`}</div>
        <Badge variant="outline" className="text-[9px] mt-1">{it.category}</Badge>
      </div>
    )}
  />
}

// ============== PACKAGES MANAGER ==============
function PackagesManager() {
  const fields = [
    { key: 'name', label: 'اسم الباقة (بالألمانية)', type: 'text', required: true, dir: 'ltr', placeholder: 'Damascus Classic' },
    { key: 'duration_days', label: 'المدة (أيام)', type: 'number', required: true, min: 1 },
    { key: 'price_eur', label: 'السعر (€)', type: 'number', required: true, min: 0 },
    { key: 'cover_image', label: 'صورة الغلاف', type: 'image' },
    { key: 'cities', label: 'المدن (Tags)', type: 'tags', placeholder: 'Damaskus، Aleppo...' },
    { key: 'included', label: 'الخدمات المشمولة', type: 'list', placeholder: 'Hotel inkl. Frühstück...' },
    { key: 'not_included', label: 'غير مشمول', type: 'list', placeholder: 'Internationale Flüge...' },
    { key: 'max_group', label: 'الحد الأقصى للمجموعة', type: 'number', min: 1 },
    { key: 'difficulty', label: 'مستوى الصعوبة', type: 'select', options: [{ value: 'Easy', label: 'سهل' }, { value: 'Medium', label: 'متوسط' }, { value: 'Adventure', label: 'مغامرة' }] },
    { key: 'status', label: 'الحالة', type: 'select', options: [{ value: 'Available', label: 'متاح' }, { value: 'Full', label: 'ممتلئ' }, { value: 'Coming Soon', label: 'قريباً' }] },
  ]
  return <SimpleCrud
    collection="packages"
    title="الباقات السياحية"
    defaults={{ name: '', duration_days: 7, price_eur: 499, cities: [], included: [], not_included: [], max_group: 8, difficulty: 'Easy', status: 'Available' }}
    fields={fields}
    listRender={(it) => (
      <div className="flex items-center gap-3">
        {it.cover_image && <img src={it.cover_image} alt="" className="w-14 h-14 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <div className="font-bold">{it.name}</div>
          <div className="text-xs text-neutral-500">{it.duration_days} أيام · €{it.price_eur} · {it.cities?.join('، ')}</div>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-[9px]">{it.status}</Badge>
            <Badge variant="outline" className="text-[9px]">{it.difficulty}</Badge>
          </div>
        </div>
      </div>
    )}
  />
}

// ============== EXPERIENCES MANAGER ==============
function ExperiencesManager() {
  const fields = [
    { key: 'icon', label: 'الأيقونة (Emoji)', type: 'text', placeholder: '🍳 🕌 📸 ...' },
    { key: 'title', label: 'العنوان (بالألمانية)', type: 'text', required: true, dir: 'ltr' },
    { key: 'description', label: 'الوصف', type: 'textarea', required: true, dir: 'ltr' },
    { key: 'duration', label: 'المدة', type: 'text', placeholder: '3 Stunden / Halbtags' },
    { key: 'price_eur', label: 'السعر للشخص (€)', type: 'number', required: true, min: 0 },
    { key: 'cover_image', label: 'صورة الغلاف', type: 'image' },
    { key: 'max_participants', label: 'الحد الأقصى للمشاركين', type: 'number', min: 1 },
    { key: 'status', label: 'الحالة', type: 'select', options: [{ value: 'Available', label: 'متاح' }, { value: 'Unavailable', label: 'غير متاح' }] },
  ]
  return <SimpleCrud collection="experiences" title="التجارب الفريدة" defaults={{ icon: '✨', status: 'Available', max_participants: 8, price_eur: 25 }} fields={fields}
    listRender={(it) => (
      <div className="flex items-center gap-3">
        {it.cover_image && <img src={it.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <div className="font-bold">{it.icon} {it.title}</div>
          <div className="text-xs text-neutral-500 truncate">{it.duration} · €{it.price_eur}</div>
        </div>
      </div>
    )}
  />
}

// ============== TESTIMONIALS MANAGER ==============
function TestimonialsManager() {
  const fields = [
    { key: 'name', label: 'الاسم', type: 'text', required: true, dir: 'ltr' },
    { key: 'city', label: 'المدينة في ألمانيا', type: 'text', dir: 'ltr', placeholder: 'München, Berlin...' },
    { key: 'photo', label: 'الصورة', type: 'image', hint: 'اتركها فارغة لاستخدام الأحرف الأولى' },
    { key: 'text', label: 'نص الشهادة (ألماني)', type: 'textarea', required: true, dir: 'ltr', rows: 4 },
    { key: 'rating', label: 'التقييم (1-5)', type: 'number', min: 1, max: 5 },
    { key: 'package_name', label: 'الباقة المحجوزة', type: 'text', dir: 'ltr' },
    { key: 'visible', label: 'إظهار', type: 'switch' },
  ]
  return <SimpleCrud collection="testimonials" title="شهادات الزوار الألمان" defaults={{ rating: 5, visible: true }} fields={fields}
    listRender={(it) => (
      <div className="flex items-center gap-3">
        {it.photo ? <img src={it.photo} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-xs font-black">{it.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{it.name} · {it.city}</div>
          <div className="text-xs text-neutral-500 truncate">{it.text}</div>
          <div className="flex gap-0.5 mt-0.5">{Array.from({ length: it.rating || 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-[#FFCE00] text-[#FFCE00]" />)}</div>
        </div>
      </div>
    )}
  />
}

// ============== GALLERY MANAGER ==============
function GalleryManager() {
  const fields = [
    { key: 'url', label: 'رفع الصورة', type: 'image', required: true },
    { key: 'caption', label: 'التعليق (بالألمانية)', type: 'text', dir: 'ltr', placeholder: 'Palmyra im Sonnenuntergang...' },
    { key: 'visible', label: 'إظهار', type: 'switch' },
  ]
  return <SimpleCrud collection="gallery" title="معرض الصور" defaults={{ visible: true }} fields={fields}
    listRender={(it) => (
      <div className="flex items-center gap-3">
        {it.url && <img src={it.url} alt="" className="w-20 h-14 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{it.caption || 'بدون تعليق'}</div>
          <div className="text-[10px] text-neutral-400 truncate" dir="ltr">{it.url}</div>
        </div>
      </div>
    )}
  />
}

// ============== FAQ MANAGER ==============
function FaqManager() {
  const fields = [
    { key: 'question', label: 'السؤال (ألماني)', type: 'text', required: true, dir: 'ltr' },
    { key: 'answer', label: 'الإجابة (ألماني)', type: 'textarea', required: true, dir: 'ltr', rows: 5 },
    { key: 'visible', label: 'إظهار', type: 'switch' },
  ]
  return <SimpleCrud collection="faq" title="الأسئلة الشائعة" defaults={{ visible: true }} fields={fields}
    listRender={(it) => (
      <div>
        <div className="font-bold text-sm" dir="ltr">{it.question}</div>
        <div className="text-xs text-neutral-500 line-clamp-2 mt-0.5" dir="ltr">{it.answer}</div>
      </div>
    )}
  />
}

// ============== FLASHCARDS MANAGER ==============
function FlashcardsManager() {
  const fields = [
    { key: 'de', label: 'الكلمة الألمانية', type: 'text', required: true, dir: 'ltr' },
    { key: 'ar', label: 'الترجمة العربية', type: 'text', required: true },
    { key: 'pronunciation', label: 'النطق (Latin)', type: 'text', required: true, dir: 'ltr', placeholder: 'Marhaba' },
  ]
  return <SimpleCrud collection="flashcards" title="بطاقات تعلّم العربية" defaults={{}} fields={fields}
    listRender={(it) => (
      <div className="flex items-center gap-3">
        <div className="text-sm font-bold" dir="ltr">{it.de}</div>
        <ArrowDown className="w-3 h-3 text-neutral-400 rotate-90" />
        <div className="text-sm" dir="rtl">{it.ar}</div>
        <span className="text-xs text-neutral-500" dir="ltr">({it.pronunciation})</span>
      </div>
    )}
  />
}

// ============== WHY CARDS MANAGER ==============
function WhyCardsManager() {
  const fields = [
    { key: 'icon', label: 'الأيقونة (Emoji)', type: 'text', required: true, placeholder: '🏛️ 🍽️ 💰 🤝' },
    { key: 'title', label: 'العنوان (ألماني)', type: 'text', required: true, dir: 'ltr' },
    { key: 'description', label: 'الوصف (ألماني)', type: 'textarea', required: true, dir: 'ltr', rows: 3 },
  ]
  return <SimpleCrud collection="why-cards" title='بطاقات "لماذا سوريا؟"' defaults={{ icon: '✨' }} fields={fields}
    listRender={(it) => (
      <div>
        <div className="font-bold text-sm">{it.icon} {it.title}</div>
        <div className="text-xs text-neutral-500 truncate" dir="ltr">{it.description}</div>
      </div>
    )}
  />
}

// ============== PAGE SETTINGS ==============
function PageSettingsManager() {
  const [s, setS] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => { api.get('/api/admin/german/page-settings', { silent: true }).then(r => { if (r.ok) setS(r.data.settings || {}); setLoading(false) }) }, [])
  const set = (k, v) => setS(p => ({ ...p, [k]: v }))
  const save = async () => {
    setBusy(true)
    const r = await api.put('/api/admin/german/page-settings', s, { silent: true })
    setBusy(false)
    if (r.ok) toast.success('تم حفظ الإعدادات')
  }
  if (loading || !s) return <div className="p-8 text-center bg-white rounded-2xl border">جاري التحميل...</div>

  const SECTIONS_TOGGLE = [
    { key: 'show_packages', label: 'الباقات السياحية' },
    { key: 'show_experiences', label: 'التجارب الفريدة' },
    { key: 'show_faq', label: 'الأسئلة الشائعة' },
    { key: 'show_flashcards', label: 'بطاقات تعلم العربية' },
    { key: 'show_testimonials', label: 'الشهادات' },
    { key: 'show_gallery', label: 'المعرض' },
    { key: 'show_booking', label: 'نموذج الحجز' },
    { key: 'show_service_request', label: 'نموذج طلب الخدمات' },
    { key: 'show_emergency', label: 'قسم الطوارئ' },
  ]

  return (
    <div className="space-y-5">
      {/* Hero */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-black text-lg">قسم الـ Hero</h3>
          <div><Label>العنوان الرئيسي</Label><Input value={s.hero_title || ''} onChange={e => set('hero_title', e.target.value)} dir="ltr" /></div>
          <div><Label>العنوان الفرعي</Label><Textarea rows={2} value={s.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} dir="ltr" /></div>
          <div><Label>صورة الخلفية</Label><FileUpload accept="image/*" value={s.hero_image} onChange={(url) => set('hero_image', url)} kind="image" folder="ddh/german" /></div>
          <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
            <div><Label>زر CTA 1 — النص</Label><Input value={s.cta1_text || ''} onChange={e => set('cta1_text', e.target.value)} dir="ltr" /></div>
            <div><Label>زر CTA 1 — الرابط</Label><Input value={s.cta1_link || ''} onChange={e => set('cta1_link', e.target.value)} dir="ltr" placeholder="#packages" /></div>
            <div><Label>زر CTA 2 — النص</Label><Input value={s.cta2_text || ''} onChange={e => set('cta2_text', e.target.value)} dir="ltr" /></div>
            <div><Label>زر CTA 2 — الرابط</Label><Input value={s.cta2_link || ''} onChange={e => set('cta2_link', e.target.value)} dir="ltr" placeholder="#booking" /></div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp & SEO */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-black text-lg">إعدادات WhatsApp و SEO</h3>
          <div><Label>رقم WhatsApp للدعم 24/7 (بدون رمز +)</Label><Input value={s.whatsapp_number || ''} onChange={e => set('whatsapp_number', e.target.value)} dir="ltr" placeholder="963111234567" /></div>
          <div><Label>رسالة WhatsApp التلقائية (ألماني)</Label><Textarea rows={2} value={s.whatsapp_message || ''} onChange={e => set('whatsapp_message', e.target.value)} dir="ltr" placeholder="Hallo! Ich interessiere mich für eine Reise nach Syrien..." /></div>
          <div className="pt-3 border-t"><Label>SEO — عنوان الصفحة (ألماني)</Label><Input value={s.seo_title || ''} onChange={e => set('seo_title', e.target.value)} dir="ltr" /></div>
          <div><Label>SEO — وصف الصفحة (Meta description)</Label><Textarea rows={2} value={s.seo_description || ''} onChange={e => set('seo_description', e.target.value)} dir="ltr" /></div>
          <div><Label>SEO — كلمات مفتاحية (مفصولة بفواصل)</Label><Input value={s.seo_keywords || ''} onChange={e => set('seo_keywords', e.target.value)} dir="ltr" placeholder="Syrien Reise, Damaskus..." /></div>
        </CardContent>
      </Card>

      {/* Show/Hide Sections */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-black text-lg">إظهار/إخفاء الأقسام</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {SECTIONS_TOGGLE.map(t => (
              <div key={t.key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <span className="text-sm font-semibold">{t.label}</span>
                <Switch checked={s[t.key] !== false} onCheckedChange={v => set(t.key, v)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2 sticky bottom-4">
        <Button onClick={save} disabled={busy} className="bg-[#1A1A1A] text-white shadow-lg"><Save className="w-4 h-4 me-1.5" />{busy ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}</Button>
      </div>
    </div>
  )
}

export default GermanAdminPanel
