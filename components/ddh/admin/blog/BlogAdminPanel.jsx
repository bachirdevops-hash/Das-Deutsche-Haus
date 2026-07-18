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
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Save, ExternalLink, Filter, Calendar, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { ConfirmDialog, FileUpload } from '@/components/ddh/shared'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { RichTextEditor } from '@/components/ddh/RichTextEditor'
import { BLOG_CATEGORIES, getCategoryLabel, getCategoryColor } from '@/lib/blog_categories'

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'مسودة', color: 'bg-neutral-100 text-neutral-700' },
  { value: 'Published', label: 'منشور', color: 'bg-green-100 text-green-700' },
  { value: 'Hidden', label: 'مخفي', color: 'bg-amber-100 text-amber-700' },
]

export function BlogAdminPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [langFilter, setLangFilter] = useState('all')

  const refresh = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (catFilter !== 'all') params.set('category', catFilter)
    if (langFilter !== 'all') params.set('lang', langFilter)
    const r = await api.get(`/api/admin/blog?${params}`, { silent: true })
    if (r.ok) setItems(r.data.items || [])
    setLoading(false)
  }
  useEffect(() => { refresh() }, [statusFilter, catFilter, langFilter])
  useEffect(() => { const t = setTimeout(refresh, 400); return () => clearTimeout(t) }, [search])

  const newPost = () => setEditing({
    title: '', slug: '', category: 'education', language: 'ar', content: '', excerpt: '',
    coverImage: '', author: { name: '', photo: '' }, status: 'Draft',
    publishDate: new Date().toISOString().slice(0, 16), metaDescription: '',
  })

  const save = async (data) => {
    const payload = { ...data }
    if (payload.publishDate && payload.publishDate.length === 16) payload.publishDate = new Date(payload.publishDate).toISOString()
    const r = editing.id
      ? await api.patch(`/api/admin/blog/${editing.id}`, payload, { silent: true })
      : await api.post('/api/admin/blog', payload, { silent: true })
    if (r.ok) { toast.success(editing.id ? 'تم التحديث' : 'تم النشر'); refresh(); setEditing(null) }
    else toast.error(r.error || 'فشلت العملية')
  }
  const del = async () => {
    const r = await api.delete(`/api/admin/blog/${delTarget.id}`, { silent: true })
    if (r.ok) { toast.success('تم الحذف'); refresh(); setDelTarget(null) }
  }
  const togglePublish = async (it) => {
    const newStatus = it.status === 'Published' ? 'Hidden' : 'Published'
    const r = await api.patch(`/api/admin/blog/${it.id}`, { status: newStatus }, { silent: true })
    if (r.ok) { toast.success(newStatus === 'Published' ? 'تم النشر' : 'تم الإخفاء'); refresh() }
  }

  return (
    <ErrorBoundary>
      <section dir="rtl" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-white text-xl">📰</div>
            <div>
              <h2 className="font-black text-xl">إدارة المدوّنة</h2>
              <p className="text-xs text-neutral-500">{items.length} مقال</p>
            </div>
          </div>
          <Button onClick={newPost} className="bg-[#CC0000] hover:bg-[#A30000] text-white"><Plus className="w-4 h-4 me-1" />مقال جديد</Button>
        </div>

        <div className="bg-white rounded-2xl p-4 border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {BLOG_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><Filter className="w-4 h-4 ms-1.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={langFilter} onValueChange={setLangFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌐 كل اللغات</SelectItem>
              <SelectItem value="ar">🇸🇾 العربية</SelectItem>
              <SelectItem value="de">🇩🇪 الألمانية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase font-bold text-neutral-500">
                <tr>
                  <th className="text-start p-3">الغلاف</th>
                  <th className="text-start p-3">العنوان</th>
                  <th className="text-start p-3">الفئة</th>
                  <th className="text-start p-3">الكاتب</th>
                  <th className="text-start p-3">التاريخ</th>
                  <th className="text-start p-3">المشاهدات</th>
                  <th className="text-start p-3">الحالة</th>
                  <th className="text-start p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={8} className="p-8 text-center text-neutral-500">جاري التحميل...</td></tr>
                  : items.length === 0 ? <tr><td colSpan={8} className="p-12 text-center text-neutral-500"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />لا توجد مقالات</td></tr>
                  : items.map(p => {
                    const stat = STATUS_OPTIONS.find(s => s.value === p.status) || STATUS_OPTIONS[0]
                    return (
                      <tr key={p.id} className="border-t hover:bg-neutral-50/50">
                        <td className="p-3">{p.coverImage ? <img src={p.coverImage} alt="" className="w-14 h-10 rounded-lg object-cover" /> : <div className="w-14 h-10 rounded-lg bg-neutral-100" />}</td>
                        <td className="p-3"><div className="font-bold line-clamp-1">{p.title}</div><div className="text-[10px] text-neutral-400 truncate max-w-[260px]" dir="ltr">/{p.slug}</div></td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(p.category)}`}>{getCategoryLabel(p.category)}</span><span className="ms-1 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100">{p.language === 'de' ? '🇩🇪' : '🇸🇾'}</span></td>
                        <td className="p-3 text-xs">{p.author?.name || '—'}</td>
                        <td className="p-3 text-xs"><Calendar className="inline w-3 h-3 ms-1" />{new Date(p.publishDate).toLocaleDateString('ar')}</td>
                        <td className="p-3 text-center font-bold">{p.views || 0}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${stat.color}`}>{stat.label}</span></td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => togglePublish(p)} title={p.status === 'Published' ? 'إخفاء' : 'نشر'} className="p-1.5 rounded-lg hover:bg-neutral-100">{p.status === 'Published' ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}</button>
                            <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" title="معاينة" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><ExternalLink className="w-4 h-4" /></a>
                            <button onClick={() => setEditing(p)} title="تعديل" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDelTarget(p)} title="حذف" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {editing && <PostFormDialog post={editing} onClose={() => setEditing(null)} onSave={save} />}
        {delTarget && <ConfirmDialog title="حذف المقال" desc={`هل أنت متأكد من حذف "${delTarget.title}"؟`} onConfirm={del} onCancel={() => setDelTarget(null)} />}
      </section>
    </ErrorBoundary>
  )
}

function PostFormDialog({ post, onClose, onSave }) {
  const [form, setForm] = useState({ ...post, publishDate: post.publishDate ? new Date(post.publishDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16) })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setAuthor = (k, v) => setForm(p => ({ ...p, author: { ...(p.author || {}), [k]: v } }))

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    if (!form.excerpt) {
      const stripped = (form.content || '').replace(/<[^>]+>/g, ' ').slice(0, 160).trim()
      form.excerpt = stripped + (stripped.length >= 160 ? '...' : '')
    }
    await onSave(form); setBusy(false)
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{post.id ? 'تعديل المقال' : 'مقال جديد'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><Label>العنوان <span className="text-red-500">*</span></Label><Input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="عنوان جذّاب..." /></div>
            <div><Label>Slug (تلقائي إن تُرك فارغاً)</Label><Input value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="my-post-slug" dir="ltr" /></div>
            <div><Label>الفئة</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BLOG_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>اسم الكاتب</Label><Input value={form.author?.name || ''} onChange={e => setAuthor('name', e.target.value)} /></div>
            <div><Label>تاريخ النشر (يمكن جدولة المستقبل)</Label><Input type="datetime-local" value={form.publishDate} onChange={e => set('publishDate', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>صورة الغلاف</Label><FileUpload accept="image/*" value={form.coverImage} onChange={(url) => set('coverImage', url)} kind="image" folder="ddh/blog" /></div>
            <div className="md:col-span-2"><Label>صورة الكاتب</Label><FileUpload accept="image/*" value={form.author?.photo} onChange={(url) => setAuthor('photo', url)} kind="image" folder="ddh/blog" /></div>
          </div>
          <div>
            <Label>المحتوى <span className="text-red-500">*</span></Label>
            <RichTextEditor value={form.content} onChange={v => set('content', v)} />
          </div>
          <div><Label>المقتطف القصير (يُولَّد تلقائياً إن تُرك فارغاً)</Label><Textarea rows={2} value={form.excerpt || ''} onChange={e => set('excerpt', e.target.value)} placeholder="أول 150 حرف..." /></div>
          <div><Label>وصف SEO (Meta description)</Label><Textarea rows={2} value={form.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} /></div>
          <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
            <div><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>لغة المقال</Label>
              <Select value={form.language || 'ar'} onValueChange={v => set('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">🇸🇾 العربية</SelectItem>
                  <SelectItem value="de">🇩🇪 الألمانية (Deutsch)</SelectItem>
                </SelectContent>
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

export default BlogAdminPanel
