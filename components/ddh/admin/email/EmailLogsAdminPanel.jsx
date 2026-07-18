'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Mail, RefreshCw, Trash2, Eye, AlertTriangle, CheckCircle2, Clock, Search, Send, XCircle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ddh/shared'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'

const TYPE_LABELS = {
  admin_course_registration: { ar: 'إشعار أدمن - تسجيل كورس', emoji: '🎓' },
  admin_telc_booking: { ar: 'إشعار أدمن - حجز telc', emoji: '🏆' },
  admin_vocational_application: { ar: 'إشعار أدمن - Ausbildung', emoji: '💼' },
  admin_travel_consultation: { ar: 'إشعار أدمن - استشارة', emoji: '✈️' },
  confirm_course_registration: { ar: 'تأكيد طالب - كورس', emoji: '✅' },
  confirm_telc_booking: { ar: 'تأكيد طالب - telc', emoji: '✅' },
  confirm_vocational_application: { ar: 'تأكيد طالب - Ausbildung', emoji: '✅' },
  confirm_travel_consultation: { ar: 'تأكيد طالب - استشارة', emoji: '✅' },
  user_welcome: { ar: 'ترحيب طالب جديد', emoji: '🎉' },
  password_reset: { ar: 'إعادة كلمة المرور', emoji: '🔐' },
}

async function apiGet(url) { const r = await fetch(url, { credentials: 'include' }); return r.json() }
async function apiSend(url, method) {
  const r = await fetch(url, { method, credentials: 'include' })
  return r.json()
}

export function EmailLogsAdminPanel() {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, skipped: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (search) params.set('search', search)
    const qs = params.toString()
    const r = await apiGet(`/api/admin/email-logs${qs ? '?' + qs : ''}`)
    setItems(r.items || [])
    setStats(r.stats || { total: 0, sent: 0, failed: 0, skipped: 0 })
    setLoading(false)
  }, [statusFilter, typeFilter, search])
  useEffect(() => { load() }, [load])

  const deleteOne = async (id) => {
    const r = await apiSend(`/api/admin/email-logs/${id}`, 'DELETE')
    if (r.error) toast.error(r.error); else { toast.success('تم الحذف'); load() }
  }
  const clearAll = async () => {
    const r = await apiSend('/api/admin/email-logs/clear', 'POST')
    if (r.error) toast.error(r.error); else { toast.success(`تم حذف ${r.deleted} سجل`); load() }
    setConfirmClear(false)
  }

  return (
    <ErrorBoundary>
      <section dir="rtl" className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-8 h-8 text-[#CC0000]" />
              <h2 className="text-3xl font-black tracking-tight">سجل الإيميلات</h2>
            </div>
            <p className="text-sm text-neutral-600">جميع الإيميلات المُرسَلة عبر Resend — الإشعارات الإدارية، إيميلات التأكيد، الترحيب بالطلاب الجدد، وإعادة كلمة المرور.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 ms-1.5" />تحديث</Button>
            {stats.total > 0 && <Button variant="outline" className="text-red-600 border-red-200" onClick={() => setConfirmClear(true)}><Trash2 className="w-4 h-4 ms-1.5" />مسح الكل</Button>}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="إجمالي" value={stats.total} color="#1A1A1A" Icon={Mail} />
          <StatCard label="مُرسَل" value={stats.sent} color="#16a34a" Icon={CheckCircle2} />
          <StatCard label="فشل" value={stats.failed} color="#CC0000" Icon={XCircle} />
          <StatCard label="متخطّى" value={stats.skipped} color="#888" Icon={Clock} />
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4 grid md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-neutral-400" />
                <Input placeholder="ابحث بالبريد الإلكتروني..." value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
              </div>
            </div>
            <div className="md:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="sent">✅ مُرسَل</SelectItem>
                  <SelectItem value="failed">❌ فشل</SelectItem>
                  <SelectItem value="skipped">⏭️ متخطّى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="النوع" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.emoji} {v.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Status banner if no Resend key */}
        {stats.skipped > 0 && stats.sent === 0 && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <strong className="text-amber-900">لم يتم إرسال إيميلات فعلية بعد.</strong>
                <p className="text-amber-700 mt-1">إذا كانت الحالة &quot;متخطّى&quot; فهذا يعني أن <code>RESEND_API_KEY</code> غير مُكوَّن في <code>.env</code>. أضف المفتاح ثم أعد تشغيل السيرفر.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-neutral-500">جاري التحميل...</div>
        ) : items.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-neutral-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            لا توجد إيميلات بهذه المعايير
          </CardContent></Card>
        ) : (
          <Card><CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b text-neutral-600">
                <tr>
                  <th className="text-start p-3 font-semibold">الحالة</th>
                  <th className="text-start p-3 font-semibold">النوع</th>
                  <th className="text-start p-3 font-semibold">إلى</th>
                  <th className="text-start p-3 font-semibold">الموضوع</th>
                  <th className="text-start p-3 font-semibold">الوقت</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id} className="border-b hover:bg-neutral-50">
                    <td className="p-3"><StatusBadge status={it.status} /></td>
                    <td className="p-3">
                      <div className="text-xs">
                        <span className="me-1">{TYPE_LABELS[it.type]?.emoji || '📧'}</span>
                        {TYPE_LABELS[it.type]?.ar || it.type}
                      </div>
                    </td>
                    <td className="p-3 text-xs font-mono" dir="ltr">{it.to}</td>
                    <td className="p-3 text-xs line-clamp-1 max-w-xs">{it.subject}</td>
                    <td className="p-3 text-xs text-neutral-500 whitespace-nowrap">{new Date(it.createdAt).toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => setViewing(it)}><Eye className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteOne(it.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        )}

        {viewing && <EmailDetailDialog log={viewing} onClose={() => setViewing(null)} />}
        {confirmClear && <ConfirmDialog title="مسح كل سجل الإيميلات" desc={`سيتم حذف ${stats.total} سجل نهائياً. لا يمكن التراجع.`} onConfirm={clearAll} onCancel={() => setConfirmClear(false)} />}
      </section>
    </ErrorBoundary>
  )
}

function StatCard({ label, value, color, Icon }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <div className="text-2xl font-black" style={{ color }}>{value}</div>
          <div className="text-xs text-neutral-600 font-semibold">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }) {
  const config = {
    sent: { label: 'مُرسَل', cls: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
    failed: { label: 'فشل', cls: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
    skipped: { label: 'متخطّى', cls: 'bg-neutral-100 text-neutral-600 border-neutral-300', icon: Clock },
  }[status] || { label: status, cls: 'bg-neutral-100 text-neutral-600' }
  const Ic = config.icon
  return (
    <Badge variant="outline" className={`${config.cls} gap-1`}>
      {Ic && <Ic className="w-3 h-3" />}
      {config.label}
    </Badge>
  )
}

function EmailDetailDialog({ log, onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#CC0000]" />
            تفاصيل الإيميل
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <Row label="الحالة" value={<StatusBadge status={log.status} />} />
          <Row label="النوع" value={`${TYPE_LABELS[log.type]?.emoji || '📧'} ${TYPE_LABELS[log.type]?.ar || log.type}`} />
          <Row label="من" value={log.from} dir="ltr" />
          <Row label="إلى" value={log.to} dir="ltr" />
          <Row label="الموضوع" value={log.subject} />
          <Row label="الوقت" value={new Date(log.createdAt).toLocaleString('ar-EG-u-nu-latn')} />
          {log.providerMessageId && <Row label="Resend ID" value={log.providerMessageId} dir="ltr" mono />}
          {log.error && <Row label="الخطأ" value={<span className="text-red-600">{log.error}</span>} />}
          {log.meta && Object.keys(log.meta).length > 0 && (
            <Row label="بيانات إضافية" value={<pre className="text-xs bg-neutral-50 p-2 rounded mt-1 overflow-x-auto" dir="ltr">{JSON.stringify(log.meta, null, 2)}</pre>} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, dir, mono }) {
  return (
    <div className="grid grid-cols-4 gap-3 py-2 border-b">
      <div className="text-xs text-neutral-500 font-semibold">{label}</div>
      <div className={`col-span-3 ${mono ? 'font-mono text-xs' : ''}`} dir={dir}>{value || '—'}</div>
    </div>
  )
}
