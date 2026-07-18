'use client'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Save, Briefcase, Building2, Calendar, Euro, RefreshCw, Users } from 'lucide-react'

const EMPTY_FORM = {
  title_ar: '',
  title_de: '',
  partner: '',
  duration_ar: '',
  duration_de: '',
  salary: '',
  requirements_ar: '',
  requirements_de: '',
  description_ar: '',
  description_de: '',
  is_active: true,
}

export default function JobsAdminPanel() {
  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([]) // applications per job
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/manager/jobs').then(r => r.json()),
        fetch('/api/admin/vocational-applications').then(r => r.json()),
      ])
      setJobs(jobsRes.items || [])
      setApps(appsRes.items || [])
    } catch (e) {
      toast.error('فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const del = async (j) => {
    const r = await fetch(`/api/manager/jobs/${j.id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('تم حذف الوظيفة'); refresh(); setConfirm(null) }
    else toast.error('فشل الحذف')
  }

  return (<>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
      <div>
        <h3 className="text-xl font-black flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#CC0000]" />تدريبات Ausbildung ({jobs.length})</h3>
        <p className="text-[12.5px] text-neutral-500 mt-1">إدارة فرص التدريب المهني في ألمانيا — أضف، عدّل، احذف.</p>
      </div>
      <Button onClick={() => setCreating(true)} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />إضافة وظيفة جديدة</Button>
    </div>

    {loading ? (
      <div className="text-center py-16 text-neutral-500"><RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />جاري التحميل...</div>
    ) : jobs.length === 0 ? (
      <Card><CardContent className="p-10 text-center text-neutral-500">
        <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="font-bold mb-3">لا توجد وظائف بعد</p>
        <Button onClick={() => setCreating(true)} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />أضف أول وظيفة</Button>
      </CardContent></Card>
    ) : (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {jobs.map(j => {
          // Match applications by job title or jobId
          const jobApps = apps.filter(a => a.jobId === j.id || a.title === j.title_ar || a.title === j.title_de)
          return (
            <Card key={j.id} className="overflow-hidden border-2 hover:border-[#CC0000]/30 transition-all hover:shadow-lg">
              <div className="h-2 flag-gradient-h" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Briefcase className="w-5 h-5 text-[#FFCE00] shrink-0" />
                    {j.is_active === false && <Badge variant="outline" className="text-red-600 border-red-300">مُعطّل</Badge>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditing(j)} title="تعديل"><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => setConfirm(j)} title="حذف"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <h4 className="font-black text-base mb-1 line-clamp-1">{j.title_ar}</h4>
                <p className="text-[12px] text-neutral-500 mb-1" dir="ltr">{j.title_de}</p>

                <div className="border-t pt-3 mt-3 space-y-2 text-[12.5px] text-neutral-700">
                  <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-neutral-400" /><strong className="text-neutral-900">الشريك:</strong> {j.partner || '—'}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-neutral-400" /><strong className="text-neutral-900">المدة:</strong> {j.duration_ar || '—'}</div>
                  <div className="flex items-center gap-1.5"><Euro className="w-3.5 h-3.5 text-neutral-400" /><strong className="text-neutral-900">الراتب:</strong> {j.salary || '—'}</div>
                </div>

                {j.requirements_ar && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11.5px] text-amber-900">
                    <strong>المتطلبات:</strong> {j.requirements_ar}
                  </div>
                )}

                <div className="border-t pt-3 mt-3 flex items-center justify-between text-[12.5px]">
                  <span className="text-neutral-500">📥 المتقدّمون</span>
                  <Badge className={jobApps.length > 0 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'}>{jobApps.length}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )}

    {creating && <JobFormDialog onClose={() => setCreating(false)} onSaved={() => { refresh(); setCreating(false) }} />}
    {editing && <JobFormDialog job={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    {confirm && (
      <Dialog open={true} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle className="text-red-600">⚠️ تأكيد الحذف</DialogTitle></DialogHeader>
          <p>هل أنت متأكد من حذف وظيفة <strong>{confirm.title_ar}</strong>؟</p>
          <p className="text-[12.5px] text-red-600 bg-red-50 rounded-lg p-2.5 border border-red-200">⚠️ هذا سيؤدي إلى إخفاء الوظيفة من الموقع. الطلبات الموجودة ستبقى محفوظة.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => del(confirm)}><Trash2 className="w-4 h-4 me-1.5" />حذف نهائي</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </>)
}

function JobFormDialog({ job, onClose, onSaved }) {
  const [form, setForm] = useState(() => job ? { ...EMPTY_FORM, ...job } : EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const url = job ? `/api/manager/jobs/${job.id}` : '/api/manager/jobs'
      const method = job ? 'PATCH' : 'POST'
      const body = {
        title_ar: form.title_ar,
        title_de: form.title_de,
        partner: form.partner,
        duration_ar: form.duration_ar,
        duration_de: form.duration_de,
        salary: form.salary,
        requirements_ar: form.requirements_ar,
        requirements_de: form.requirements_de,
        description_ar: form.description_ar,
        description_de: form.description_de,
        is_active: form.is_active !== false,
      }
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) throw new Error('Save failed')
      toast.success(job ? '✓ تم تحديث الوظيفة' : '✓ تم إنشاء الوظيفة')
      onSaved()
    } catch (e) {
      toast.error('فشل الحفظ — حاول مرة أخرى')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#CC0000]" />
            {job ? `تعديل وظيفة` : 'إضافة وظيفة جديدة'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>العنوان (عربي) *</Label>
              <Input required value={form.title_ar} onChange={e => set('title_ar', e.target.value)} placeholder="مثال: تمريض ورعاية صحية" />
            </div>
            <div>
              <Label>العنوان (Deutsch) *</Label>
              <Input required value={form.title_de} onChange={e => set('title_de', e.target.value)} placeholder="z.B. Pflegefachmann/-frau" dir="ltr" />
            </div>
          </div>

          <div>
            <Label>الشركة الشريكة *</Label>
            <Input required value={form.partner} onChange={e => set('partner', e.target.value)} placeholder="مثال: Siemens AG, Charité Berlin" dir="ltr" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>المدة (عربي)</Label>
              <Input value={form.duration_ar} onChange={e => set('duration_ar', e.target.value)} placeholder="3 سنوات" />
            </div>
            <div>
              <Label>المدة (Deutsch)</Label>
              <Input value={form.duration_de} onChange={e => set('duration_de', e.target.value)} placeholder="3 Jahre" dir="ltr" />
            </div>
          </div>

          <div>
            <Label>الراتب الشهري</Label>
            <Input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="مثال: €1,200 - €1,400" dir="ltr" />
          </div>

          <div>
            <Label>المتطلبات (عربي)</Label>
            <Textarea rows={2} value={form.requirements_ar} onChange={e => set('requirements_ar', e.target.value)} placeholder="مثال: B2 ألماني، شهادة ثانوية، صحة جيدة" />
          </div>
          <div>
            <Label>المتطلبات (Deutsch)</Label>
            <Textarea rows={2} value={form.requirements_de} onChange={e => set('requirements_de', e.target.value)} dir="ltr" placeholder="z.B. B2 Deutsch, Abitur" />
          </div>

          <div>
            <Label>وصف إضافي (عربي) — اختياري</Label>
            <Textarea rows={2} value={form.description_ar} onChange={e => set('description_ar', e.target.value)} placeholder="تفاصيل إضافية عن الوظيفة..." />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>إلغاء</Button>
            <Button type="submit" className="btn-primary" disabled={busy}>
              {busy ? <><RefreshCw className="w-4 h-4 me-1.5 animate-spin" />جاري...</> : <><Save className="w-4 h-4 me-1.5" />{job ? 'حفظ' : 'إنشاء'}</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
