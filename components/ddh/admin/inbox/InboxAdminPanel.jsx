'use client'
import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Inbox, BookOpen, Award, Briefcase, Plane, Mail, Phone, Calendar, UserPlus, Copy, CheckCircle2, Trash2, Eye, RefreshCw, MessageSquare } from 'lucide-react'
import { ConfirmDialog } from '@/components/ddh/shared'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'

const RESOURCES = [
  { key: 'course-registrations', label: 'تسجيلات الكورسات', icon: BookOpen, color: '#CC0000', titleField: (it) => it.courseName || it.level || 'كورس' },
  { key: 'telc-bookings', label: 'حجوزات telc', icon: Award, color: '#FFCE00', titleField: (it) => `${it.type || ''} · ${it.date || ''}` },
  { key: 'vocational-applications', label: 'طلبات Ausbildung', icon: Briefcase, color: '#2C5F9E', titleField: (it) => it.jobTitle || 'تدريب مهني' },
  { key: 'travel-consultations', label: 'استشارات سفر', icon: Plane, color: '#1A1A1A', titleField: (it) => it.consultationTypeName || it.visaType || 'استشارة' },
]

async function apiGet(url) { const r = await fetch(url, { credentials: 'include' }); return r.json() }
async function apiSend(url, method, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: body ? JSON.stringify(body) : undefined })
  return r.json()
}

export function InboxAdminPanel() {
  return (
    <ErrorBoundary>
      <section dir="rtl" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Inbox className="w-8 h-8 text-[#CC0000]" />
            <h2 className="text-3xl font-black tracking-tight">صندوق الواردات الموحّد</h2>
          </div>
          <p className="text-sm text-neutral-600">كل الطلبات الواردة من نماذج الموقع — تسجيلات الكورسات، حجوزات telc، طلبات Ausbildung، استشارات السفر. اعتمد الطلب لإنشاء حساب طالب تلقائياً.</p>
        </div>

        <Tabs defaultValue={RESOURCES[0].key}>
          <TabsList className="flex flex-wrap h-auto bg-white border rounded-2xl p-1.5 gap-1 mb-6">
            {RESOURCES.map(r => {
              const Ic = r.icon
              return (
                <TabsTrigger key={r.key} value={r.key} className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
                  <Ic className="w-4 h-4 ms-1.5" />{r.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          {RESOURCES.map(r => (
            <TabsContent key={r.key} value={r.key}>
              <LeadList resource={r} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </ErrorBoundary>
  )
}

function LeadList({ resource }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewing, setViewing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await apiGet(`/api/admin/${resource.key}`)
    setItems(r.items || [])
    setLoading(false)
  }, [resource.key])
  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? items : items.filter(it => (it.status || 'new') === filter)

  const onDelete = async (id) => {
    const r = await apiSend(`/api/admin/${resource.key}/${id}`, 'DELETE')
    if (r.error) toast.error(r.error); else { toast.success('تم الحذف'); load() }
  }
  const updateStatus = async (id, status) => {
    const r = await apiSend(`/api/admin/${resource.key}/${id}`, 'PATCH', { status })
    if (r.error) toast.error(r.error); else { toast.success('تم التحديث'); load() }
  }

  const statusCounts = {
    all: items.length,
    new: items.filter(it => (it.status || 'new') === 'new').length,
    pending_payment: items.filter(it => it.status === 'pending_payment').length,
    converted: items.filter(it => it.status === 'converted').length,
    closed: items.filter(it => it.status === 'closed').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { v: 'all', label: 'الكل', color: 'bg-neutral-100' },
          { v: 'new', label: 'جديدة', color: 'bg-red-100 text-red-700' },
          { v: 'pending_payment', label: 'بانتظار الدفع', color: 'bg-yellow-100 text-yellow-700' },
          { v: 'converted', label: 'تم اعتمادها', color: 'bg-green-100 text-green-700' },
          { v: 'closed', label: 'مغلقة', color: 'bg-neutral-200 text-neutral-700' },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filter === f.v ? 'bg-[#1A1A1A] text-white' : f.color + ' hover:opacity-80'}`}>
            {f.label} ({statusCounts[f.v] || 0})
          </button>
        ))}
        <Button size="sm" variant="outline" onClick={load} className="ms-auto"><RefreshCw className="w-3.5 h-3.5 ms-1.5" />تحديث</Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-neutral-500">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-neutral-500">
          <Inbox className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
          لا توجد طلبات في هذه الفئة
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(item => (
            <Card key={item.id} className={`border-2 transition ${(item.status || 'new') === 'new' ? 'border-red-200 bg-red-50/30' : 'border-neutral-200'}`}>
              <CardContent className="p-4 grid md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-3">
                  <div className="font-bold text-base">{item.name || 'بدون اسم'}</div>
                  <div className="flex items-center gap-1 text-xs text-neutral-600 mt-1"><Mail className="w-3 h-3" />{item.email || '—'}</div>
                  <div className="flex items-center gap-1 text-xs text-neutral-600"><Phone className="w-3 h-3" />{item.phone || '—'}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm font-semibold">{resource.titleField(item)}</div>
                  {item.price_usd > 0 && <div className="text-xs text-neutral-600">${item.price_usd}</div>}
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-1 text-xs text-neutral-600"><Calendar className="w-3 h-3" />{new Date(item.createdAt).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <StatusBadge status={item.status || 'new'} />
                  <SourceBadge source={item.source} />
                </div>
                <div className="md:col-span-4 flex gap-1.5 justify-end flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setViewing(item)}><Eye className="w-3.5 h-3.5 ms-1" />عرض</Button>
                  {item.status !== 'converted' && item.email && (
                    <ConvertToUserButton resource={resource.key} item={item} onConverted={load} />
                  )}
                  <Select value={item.status || 'new'} onValueChange={(v) => updateStatus(item.id, v)}>
                    <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديد</SelectItem>
                      <SelectItem value="pending_payment">بانتظار الدفع</SelectItem>
                      <SelectItem value="contacted">تم التواصل</SelectItem>
                      <SelectItem value="converted">معتمد</SelectItem>
                      <SelectItem value="closed">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" className="text-red-600 h-9 w-9" onClick={() => setConfirm(item)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewing && <LeadDetailDialog item={viewing} resource={resource} onClose={() => setViewing(null)} onSaved={load} />}
      {confirm && (
        <ConfirmDialog title="تأكيد الحذف" desc={`حذف طلب "${confirm.name || confirm.email}"؟ لا يمكن التراجع.`} onConfirm={() => { onDelete(confirm.id); setConfirm(null) }} onCancel={() => setConfirm(null)} />
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    new:              { label: 'جديد',           cls: 'bg-red-100 text-red-700 border-red-300' },
    pending_payment:  { label: 'بانتظار الدفع', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    contacted:        { label: 'تم التواصل',    cls: 'bg-blue-100 text-blue-700 border-blue-300' },
    converted:        { label: 'معتمد ✓',        cls: 'bg-green-100 text-green-700 border-green-300' },
    closed:           { label: 'مغلق',           cls: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
    reserved:         { label: 'محجوز',          cls: 'bg-blue-100 text-blue-700 border-blue-300' },
    submitted:        { label: 'مُقدّم',          cls: 'bg-purple-100 text-purple-700 border-purple-300' },
    pending:          { label: 'معلّق',          cls: 'bg-orange-100 text-orange-700 border-orange-300' },
  }[status] || { label: status, cls: 'bg-neutral-100 text-neutral-700' }
  return <Badge variant="outline" className={`${config.cls} mt-1`}>{config.label}</Badge>
}

function SourceBadge({ source }) {
  if (!source) return null
  if (source === 'public_form') return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-1 ms-1">نموذج عام</Badge>
  return null
}

function ConvertToUserButton({ resource, item, onConverted }) {
  const [showResult, setShowResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const convert = async () => {
    if (!confirm(`إنشاء حساب طالب لـ "${item.name}" بالبريد ${item.email}؟`)) return
    setLoading(true)
    const r = await apiSend(`/api/admin/${resource}/${item.id}/convert-to-user`, 'POST')
    setLoading(false)
    if (r.error) { toast.error(r.error); return }
    setShowResult(r)
    onConverted()
  }
  return (
    <>
      <Button size="sm" onClick={convert} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
        <UserPlus className="w-3.5 h-3.5 ms-1" />{loading ? '...' : 'إنشاء حساب'}
      </Button>
      {showResult && (
        <Dialog open onOpenChange={() => setShowResult(null)}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" />تم إنشاء الحساب</DialogTitle>
              <DialogDescription>{showResult.isExisting ? 'الطالب لديه حساب مسبق — تم ربط الطلب.' : 'أرسل هذه البيانات للطالب ليدخل لحسابه:'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <CopyRow label="الاسم" value={showResult.user?.name} />
              <CopyRow label="البريد الإلكتروني" value={showResult.user?.email} />
              {showResult.createdPassword && <CopyRow label="كلمة المرور المؤقتة" value={showResult.createdPassword} highlight />}
              {!showResult.createdPassword && <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">هذا الحساب كان موجوداً مسبقاً. لم يتم تغيير كلمة المرور.</div>}
              {showResult.createdPassword && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
                  ⚠️ احفظ كلمة المرور الآن — لن تظهر مرة أخرى. سيُطلب من الطالب تغييرها بعد أول دخول.
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-xs text-neutral-600 mb-2">نص جاهز للإرسال على WhatsApp:</p>
                <Textarea readOnly rows={5} className="text-xs" value={`مرحباً ${showResult.user?.name}،

تم إنشاء حسابك في Das Deutsche Haus.
البريد: ${showResult.user?.email}
${showResult.createdPassword ? `كلمة المرور المؤقتة: ${showResult.createdPassword}` : ''}

ادخل من: ${typeof window !== 'undefined' ? window.location.origin : ''}
نراك قريباً 🇩🇪`} />
              </div>
            </div>
            <DialogFooter><Button onClick={() => setShowResult(null)} className="btn-primary">تم</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function CopyRow({ label, value, highlight = false }) {
  const copy = () => { navigator.clipboard.writeText(value); toast.success('تم النسخ ✓') }
  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg ${highlight ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-neutral-50 border'}`}>
      <div className="flex-1">
        <div className="text-[10px] uppercase text-neutral-500 font-bold">{label}</div>
        <div className={`font-mono text-sm ${highlight ? 'font-bold text-base' : ''}`} dir="ltr">{value}</div>
      </div>
      <Button size="icon" variant="ghost" onClick={copy}><Copy className="w-4 h-4" /></Button>
    </div>
  )
}

function LeadDetailDialog({ item, resource, onClose, onSaved }) {
  const [adminNotes, setAdminNotes] = useState(item.adminNotes || '')
  const save = async () => {
    const r = await apiSend(`/api/admin/${resource.key}/${item.id}`, 'PATCH', { adminNotes })
    if (r.error) toast.error(r.error); else { toast.success('تم الحفظ ✓'); onSaved() }
  }
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><resource.icon className="w-5 h-5" style={{ color: resource.color }} />{resource.label}</DialogTitle>
          <DialogDescription>{resource.titleField(item)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <InfoRow label="الاسم" value={item.name} />
          <InfoRow label="البريد" value={item.email} />
          <InfoRow label="الهاتف" value={item.phone} dir="ltr" />
          {item.notes && <InfoRow label="ملاحظات العميل" value={item.notes} multiline />}
          {item.preferredDate && <InfoRow label="التاريخ المفضل" value={item.preferredDate} />}
          {item.consultationTypeName && <InfoRow label="نوع الاستشارة" value={item.consultationTypeName} />}
          {item.durationMinutes && <InfoRow label="المدة (دقائق)" value={item.durationMinutes} />}
          {item.price > 0 && <InfoRow label="السعر" value={`$${item.price}`} />}
          <InfoRow label="تاريخ الطلب" value={new Date(item.createdAt).toLocaleString('ar-EG-u-nu-latn')} />
          <InfoRow label="المصدر" value={item.source === 'public_form' ? 'نموذج عام (بدون حساب)' : 'مستخدم مسجّل'} />
          {item.assignedUserId && <InfoRow label="معرّف الحساب المرتبط" value={item.assignedUserId} dir="ltr" />}
          <div className="pt-2 border-t mt-2">
            <Label className="text-xs">ملاحظات داخلية (للأدمن فقط)</Label>
            <Textarea rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="مثلاً: تم التواصل بتاريخ ...، يدفع لاحقاً..." />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          <Button onClick={save} className="btn-primary">حفظ الملاحظات</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, value, dir, multiline }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b">
      <div className="text-xs text-neutral-500 font-semibold">{label}</div>
      <div className={`col-span-2 ${multiline ? 'whitespace-pre-line text-xs' : 'text-sm'}`} dir={dir}>{value || '—'}</div>
    </div>
  )
}
