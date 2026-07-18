'use client'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Save, Users, GraduationCap, Calendar, Euro, Clock, BookOpen, RefreshCw, UserCheck } from 'lucide-react'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const EMPTY_FORM = {
  level: 'A1',
  title_ar: '',
  title_de: '',
  desc_ar: '',
  desc_de: '',
  duration_ar: '',
  duration_de: '',
  hours: 80,
  price_usd: 200,
  schedule_ar: '',
  schedule_de: '',
  start_date: '',
  seats: 16,
  is_active: true,
}

export default function CoursesAdminPanel() {
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [stats, setStats] = useState({}) // courseId -> { registrations, teachers }
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [assignTeacherOpen, setAssignTeacherOpen] = useState(null) // course

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [coursesRes, usersRes, regsRes] = await Promise.all([
        fetch('/api/courses').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/course-registrations').then(r => r.json()),
      ])
      const allCourses = coursesRes.courses || []
      const allUsers = usersRes.users || []
      const allRegs = regsRes.items || []
      setCourses(allCourses)
      setTeachers(allUsers.filter(u => u.role === 'teacher'))
      // Compute stats: registrations + assigned teachers per course
      const map = {}
      for (const c of allCourses) {
        const regs = allRegs.filter(r => r.courseId === c.id)
        const assignedTeachers = allUsers.filter(u => u.role === 'teacher' && (u.assignedCourseIds || []).includes(c.id))
        map[c.id] = { registrations: regs.length, teachers: assignedTeachers }
      }
      setStats(map)
    } catch (e) {
      toast.error('فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const del = async (c) => {
    const r = await fetch(`/api/manager/courses/${c.id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('تم حذف الكورس'); refresh(); setConfirm(null) }
    else toast.error('فشل الحذف')
  }

  return (<>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
      <div>
        <h3 className="text-xl font-black flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#CC0000]" />كورسات اللغة الألمانية ({courses.length})</h3>
        <p className="text-[12.5px] text-neutral-500 mt-1">إدارة الكورسات من A1 إلى C2 — تعيين معلمين، عرض المسجّلين، وتعديل التفاصيل.</p>
      </div>
      <Button onClick={() => setCreating(true)} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />إضافة كورس جديد</Button>
    </div>

    {loading ? (
      <div className="text-center py-16 text-neutral-500"><RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />جاري التحميل...</div>
    ) : courses.length === 0 ? (
      <Card><CardContent className="p-10 text-center text-neutral-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="font-bold mb-3">لا توجد كورسات بعد</p>
        <Button onClick={() => setCreating(true)} className="btn-primary"><Plus className="w-4 h-4 me-1.5" />أضف أول كورس</Button>
      </CardContent></Card>
    ) : (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map(c => {
          const s = stats[c.id] || { registrations: 0, teachers: [] }
          return (
            <Card key={c.id} className="overflow-hidden border-2 hover:border-[#CC0000]/30 transition-all hover:shadow-lg">
              <div className="h-2 flag-gradient-h" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#CC0000] text-white font-black text-base px-2.5 py-1">{c.level}</Badge>
                    {c.is_active === false && <Badge variant="outline" className="text-red-600 border-red-300">مُعطّل</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(c)} title="تعديل"><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => setConfirm(c)} title="حذف"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <h4 className="font-black text-base mb-1 line-clamp-1">{c.title_ar}</h4>
                <p className="text-[12.5px] text-neutral-500 line-clamp-2 mb-3 min-h-[36px]">{c.desc_ar}</p>

                <div className="grid grid-cols-2 gap-2 text-[12px] text-neutral-700 mb-3">
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-neutral-400" />{c.duration_ar || '—'}</div>
                  <div className="flex items-center gap-1.5"><Euro className="w-3.5 h-3.5 text-neutral-400" />${c.price_usd}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-neutral-400" />{c.start_date || '—'}</div>
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-neutral-400" />{c.seats || 0} مقعد</div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-neutral-500">📥 المسجّلون</span>
                    <Badge className={s.registrations > 0 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'}>{s.registrations}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-neutral-500">👨‍🏫 المعلمون</span>
                    {s.teachers.length === 0 ? (
                      <span className="text-amber-600 font-semibold">غير معيّن</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {s.teachers.map(t => <Badge key={t.id} variant="outline" className="text-[11px] border-[#FFCE00] bg-[#FFCE00]/10">{t.name}</Badge>)}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-[12px] mt-2" onClick={() => setAssignTeacherOpen(c)}>
                    <UserCheck className="w-3.5 h-3.5 me-1.5" />{s.teachers.length > 0 ? 'تعديل المعلمين' : 'تعيين معلم'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )}

    {creating && <CourseFormDialog onClose={() => setCreating(false)} onSaved={() => { refresh(); setCreating(false) }} />}
    {editing && <CourseFormDialog course={editing} onClose={() => setEditing(null)} onSaved={() => { refresh(); setEditing(null) }} />}
    {confirm && (
      <Dialog open={true} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle className="text-red-600">⚠️ تأكيد حذف الكورس</DialogTitle></DialogHeader>
          <p>هل أنت متأكد من حذف كورس <strong>{confirm.title_ar}</strong> ({confirm.level})؟</p>
          <p className="text-[12.5px] text-red-600 bg-red-50 rounded-lg p-2.5 border border-red-200">⚠️ هذا سيؤدي إلى عدم ظهور الكورس على الموقع. لن تتأثر الـ Leads والتسجيلات الموجودة.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => del(confirm)}><Trash2 className="w-4 h-4 me-1.5" />حذف نهائي</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    {assignTeacherOpen && <AssignTeacherDialog course={assignTeacherOpen} teachers={teachers} onClose={() => setAssignTeacherOpen(null)} onSaved={() => { refresh(); setAssignTeacherOpen(null) }} />}
  </>)
}

function CourseFormDialog({ course, onClose, onSaved }) {
  const [form, setForm] = useState(() => course ? { ...EMPTY_FORM, ...course } : EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const url = course ? `/api/manager/courses/${course.id}` : '/api/manager/courses'
      const method = course ? 'PATCH' : 'POST'
      const body = {
        level: form.level,
        title_ar: form.title_ar,
        title_de: form.title_de,
        desc_ar: form.desc_ar,
        desc_de: form.desc_de,
        duration_ar: form.duration_ar,
        duration_de: form.duration_de,
        hours: Number(form.hours) || 0,
        price_usd: Number(form.price_usd) || 0,
        schedule_ar: form.schedule_ar,
        schedule_de: form.schedule_de,
        start_date: form.start_date,
        seats: Number(form.seats) || 0,
        is_active: form.is_active !== false,
      }
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) throw new Error('Save failed')
      toast.success(course ? '✓ تم تحديث الكورس' : '✓ تم إنشاء الكورس')
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
            <BookOpen className="w-5 h-5 text-[#CC0000]" />
            {course ? `تعديل كورس ${course.level}` : 'إنشاء كورس جديد'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>المستوى *</Label>
              <Select value={form.level} onValueChange={v => set('level', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>السعر (USD) *</Label>
              <Input type="number" required value={form.price_usd} onChange={e => set('price_usd', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>العنوان (عربي) *</Label>
              <Input required value={form.title_ar} onChange={e => set('title_ar', e.target.value)} placeholder="مثال: المستوى A1 — للمبتدئين" />
            </div>
            <div>
              <Label>العنوان (Deutsch) *</Label>
              <Input required value={form.title_de} onChange={e => set('title_de', e.target.value)} placeholder="z.B. Stufe A1 — Anfänger" dir="ltr" />
            </div>
          </div>

          <div>
            <Label>الوصف (عربي) *</Label>
            <Textarea rows={2} required value={form.desc_ar} onChange={e => set('desc_ar', e.target.value)} placeholder="وصف مختصر لمحتوى الكورس..." />
          </div>
          <div>
            <Label>الوصف (Deutsch)</Label>
            <Textarea rows={2} value={form.desc_de} onChange={e => set('desc_de', e.target.value)} dir="ltr" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>المدة (عربي)</Label>
              <Input value={form.duration_ar} onChange={e => set('duration_ar', e.target.value)} placeholder="8 أسابيع" />
            </div>
            <div>
              <Label>المدة (Deutsch)</Label>
              <Input value={form.duration_de} onChange={e => set('duration_de', e.target.value)} placeholder="8 Wochen" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>الساعات</Label>
              <Input type="number" value={form.hours} onChange={e => set('hours', e.target.value)} />
            </div>
            <div>
              <Label>عدد المقاعد</Label>
              <Input type="number" value={form.seats} onChange={e => set('seats', e.target.value)} />
            </div>
            <div>
              <Label>تاريخ البدء</Label>
              <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>الجدول الزمني (عربي)</Label>
            <Input value={form.schedule_ar} onChange={e => set('schedule_ar', e.target.value)} placeholder="سبت/ثلاثاء/خميس — 5:00م إلى 7:00م" />
          </div>
          <div>
            <Label>الجدول الزمني (Deutsch)</Label>
            <Input value={form.schedule_de} onChange={e => set('schedule_de', e.target.value)} placeholder="Sa/Di/Do — 17:00 bis 19:00" dir="ltr" />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>إلغاء</Button>
            <Button type="submit" className="btn-primary" disabled={busy}>
              {busy ? <><RefreshCw className="w-4 h-4 me-1.5 animate-spin" />جاري...</> : <><Save className="w-4 h-4 me-1.5" />{course ? 'حفظ' : 'إنشاء'}</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AssignTeacherDialog({ course, teachers, onClose, onSaved }) {
  const [busy, setBusy] = useState(false)
  const assigned = teachers.filter(t => (t.assignedCourseIds || []).includes(course.id))
  const [selectedIds, setSelectedIds] = useState(() => new Set(assigned.map(t => t.id)))
  const toggle = (id) => {
    const s = new Set(selectedIds)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelectedIds(s)
  }
  const save = async () => {
    setBusy(true)
    try {
      // For each teacher: update their assignedCourseIds (add course if selected, remove if not)
      const ops = teachers.map(async t => {
        const has = (t.assignedCourseIds || []).includes(course.id)
        const shouldHave = selectedIds.has(t.id)
        if (has === shouldHave) return
        const newIds = shouldHave
          ? [...new Set([...(t.assignedCourseIds || []), course.id])]
          : (t.assignedCourseIds || []).filter(c => c !== course.id)
        await fetch(`/api/admin/users/${t.id}/assign-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseIds: newIds }),
        })
      })
      await Promise.all(ops)
      toast.success('✓ تم تحديث المعلمين المعيّنين')
      onSaved()
    } catch (e) {
      toast.error('فشل التحديث')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#CC0000]" />
            تعيين معلمين لكورس {course.level}
          </DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-neutral-600">اختر المعلم/المعلمين المسؤولين عن هذا الكورس. سيتمكنون من رؤية الطلاب وإدارة المحتوى.</p>
        {teachers.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[13px] text-amber-800">
            ⚠️ لا يوجد معلمون في النظام. أضف معلماً من تبويب &quot;المستخدمون&quot; أولاً.
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {teachers.map(t => {
              const isAssigned = selectedIds.has(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggle(t.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition ${isAssigned ? 'border-[#CC0000] bg-red-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A1A] via-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-base font-black">
                      {t.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="text-start">
                      <div className="font-bold">{t.name}</div>
                      <div className="text-[11px] text-neutral-500">{t.email}</div>
                    </div>
                  </div>
                  {isAssigned && <Badge className="bg-[#CC0000] text-white">✓ معيّن</Badge>}
                </button>
              )
            })}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>إلغاء</Button>
          <Button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? <><RefreshCw className="w-4 h-4 me-1.5 animate-spin" />جاري...</> : <><Save className="w-4 h-4 me-1.5" />حفظ التعيين</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
