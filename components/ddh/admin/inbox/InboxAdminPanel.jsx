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
import { Inbox, BookOpen, Award, Briefcase, Plane, Mail, Phone, Calendar, Trash2, Eye, RefreshCw, MessageSquare, Printer } from 'lucide-react'
import { ConfirmDialog } from '@/components/ddh/shared'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'

const STATUS_LABELS = {
  new: 'جديد', pending_payment: 'بانتظار الدفع', contacted: 'تم التواصل', converted: 'معتمد',
  closed: 'مغلق', reserved: 'محجوز', submitted: 'مُقدّم', pending: 'معلّق', confirmed: 'مؤكد', cancelled: 'ملغى',
}

// 🖨️ Opens a clean, printer-friendly page for a single request and triggers the
// browser print dialog — from there the admin can print or save as PDF directly.
function printLead(item, resource) {
  const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const row = (label, value, ltr = false) => (value === undefined || value === null || value === '') ? '' :
    `<tr><th>${esc(label)}</th><td${ltr ? ' dir="ltr" style="text-align:left"' : ''}>${esc(value).replace(/\n/g, '<br/>')}</td></tr>`
  const dateStr = (d) => { try { return new Date(d).toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return d || '' } }

  const rows = [
    row('نوع الطلب', resource.label),
    row('الموضوع', resource.titleField(item)),
    row('الاسم', item.name),
    row('البريد الإلكتروني', item.email, true),
    row('الهاتف', item.phone, true),
    row('البلد / المدينة', item.country),
    row('مستوى الألمانية', item.germanLevel, true),
    row('المؤهل الدراسي', item.education, true),
    row('نوع الاستشارة', item.consultationTypeName),
    row('موعد الاستشارة', item.slotDate ? `${item.slotDate} — ${item.slotTime || ''}` : ''),
    row('التاريخ المفضل', item.preferredDate),
    row('المدة (دقائق)', item.durationMinutes),
    row('السعر', item.price > 0 ? `$${item.price}` : ''),
    row('رسالة العميل', item.message || item.notes),
    row('ملاحظات الإدارة', item.adminNotes),
    row('الحالة', STATUS_LABELS[item.status || 'new'] || item.status),
    row('المصدر', item.source === 'public_form' ? 'نموذج عام (بدون حساب)' : 'مستخدم مسجّل'),
    row('تاريخ الطلب', dateStr(item.createdAt)),
    row('رقم الطلب', item.id, true),
  ].join('')

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>
<title>${esc(resource.label)} — ${esc(item.name || '')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1A1A1A; margin: 0; padding: 32px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1A1A1A; padding-bottom: 14px; margin-bottom: 6px; }
  .brand { font-size: 22px; font-weight: 900; }
  .brand small { display: block; font-size: 12px; font-weight: 400; color: #666; margin-top: 2px; }
  .flag { height: 6px; background: linear-gradient(to left, #000 33%, #CC0000 33% 66%, #FFCC00 66%); margin-bottom: 22px; }
  h1 { font-size: 17px; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th, td { border: 1px solid #ddd; padding: 9px 12px; vertical-align: top; text-align: right; }
  th { background: #f7f7f5; width: 170px; font-weight: 700; color: #444; }
  .foot { margin-top: 26px; font-size: 11px; color: #888; display: flex; justify-content: space-between; }
  @media print { body { padding: 0; } .noprint { display: none; } }
  .noprint { margin-top: 24px; text-align: center; }
  .noprint button { background: #1A1A1A; color: #fff; border: 0; padding: 10px 26px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; }
</style></head><body>
  <div class="head">
    <div class="brand">Das Deutsche Haus<small>das-deutsche-haus.com — info@das-deutsche-haus.com</small></div>
    <div style="font-size:12px;color:#666">تاريخ الطباعة: ${dateStr(Date.now())}</div>
  </div>
  <div class="flag"></div>
  <h1>${esc(resource.label)}${item.name ? ' — ' + esc(item.name) : ''}</h1>
  <table>${rows}</table>
  <div class="foot"><span>Das Deutsche Haus — وثيقة داخلية</span><span>${esc(item.id || '')}</span></div>
  <div class="noprint"><button onclick="window.print()">طباعة / حفظ PDF</button></div>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print() }, 350) })</script>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) { toast.error('يرجى السماح بالنوافذ المنبثقة للطباعة') ; return }
  w.document.write(html)
  w.document.close()
}

const RESOURCES = [
  { key: 'course-registrations', label: 'تسجيلات الكورسات', icon: BookOpen, color: '#CC0000', titleField: (it) => it.courseName || it.level || 'كورس' },
  { key: 'vocational-applications', label: 'طلبات Ausbildung', icon: Briefcase, color: '#2C5F9E', titleField: (it) => it.jobTitle || 'تدريب مهني' },
  { key: 'travel-consultations', label: 'استشارات سفر', icon: Plane, color: '#1A1A1A', titleField: (it) => it.consultationTypeName || it.visaType || 'استشارة' },
  { key: 'contact-messages', label: 'رسائل التواصل', icon: MessageSquare, color: '#9333ea', noConvert: true, titleField: (it) => (it.message || '').slice(0, 60) || 'رسالة' },
]

async function apiGet(url) { const r = await fetch(url, { credentials: 'include' }); return r.json() }
async function apiSend(url, method, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: body ? JSON.stringify(body) : undefined })
  return r.json()
}

export function InboxAdminPanel() {
  const [counts, setCounts] = useState({})
  const loadCounts = useCallback(async () => {
    const r = await apiGet('/api/admin/inbox-counts')
    setCounts(r.counts || {})
  }, [])
  useEffect(() => { loadCounts() }, [loadCounts])
  return (
    <ErrorBoundary>
      <section dir="rtl" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Inbox className="w-8 h-8 text-[#CC0000]" />
            <h2 className="text-3xl font-black tracking-tight">صندوق الواردات الموحّد</h2>
          </div>
          <p className="text-sm text-neutral-600">كل الطلبات الواردة من نماذج الموقع — تسجيلات الكورسات، طلبات Ausbildung، استشارات السفر، ورسائل تواصل معنا.</p>
        </div>

        <Tabs defaultValue={RESOURCES[0].key}>
          <TabsList className="flex flex-wrap h-auto bg-white border rounded-2xl p-1.5 gap-1 mb-6">
            {RESOURCES.map(r => {
              const Ic = r.icon
              const n = counts[r.key] || 0
              return (
                <TabsTrigger key={r.key} value={r.key} className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
                  <Ic className="w-4 h-4 ms-1.5" />{r.label}
                  {n > 0 && <span className="me-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#CC0000] text-white text-[11px] font-black">{n}</span>}
                </TabsTrigger>
              )
            })}
          </TabsList>
          {RESOURCES.map(r => (
            <TabsContent key={r.key} value={r.key}>
              <LeadList resource={r} onChanged={loadCounts} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </ErrorBoundary>
  )
}

function LeadList({ resource, onChanged }) {
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
    if (r.error) toast.error(r.error); else { toast.success('تم الحذف'); load(); onChanged?.() }
  }
  const updateStatus = async (id, status) => {
    const r = await apiSend(`/api/admin/${resource.key}/${id}`, 'PATCH', { status })
    if (r.error) toast.error(r.error); else { toast.success('تم التحديث'); load(); onChanged?.() }
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
                  {item.germanLevel && <div className="text-xs text-neutral-600 mt-0.5">Deutsch: {item.germanLevel}{item.country ? ` · ${item.country}` : ''}</div>}
                  {item.price_usd > 0 && <div className="text-xs text-neutral-600">${item.price_usd}</div>}
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-1 text-xs text-neutral-600"><Calendar className="w-3 h-3" />{new Date(item.createdAt).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <StatusBadge status={item.status || 'new'} />
                  <SourceBadge source={item.source} />
                </div>
                <div className="md:col-span-4 flex gap-1.5 justify-end flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setViewing(item)}><Eye className="w-3.5 h-3.5 ms-1" />عرض</Button>
                  <Button size="sm" variant="outline" onClick={() => printLead(item, resource)} title="طباعة / حفظ PDF"><Printer className="w-3.5 h-3.5 ms-1" />طباعة</Button>
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
          {item.country && <InfoRow label="البلد / المدينة" value={item.country} />}
          {item.germanLevel && <InfoRow label="مستوى الألمانية" value={item.germanLevel} dir="ltr" />}
          {item.education && <InfoRow label="المؤهل الدراسي" value={item.education} dir="ltr" />}
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
          <Button variant="outline" onClick={() => printLead({ ...item, adminNotes }, resource)}><Printer className="w-4 h-4 ms-1.5" />طباعة</Button>
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
