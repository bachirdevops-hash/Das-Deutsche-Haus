'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Pencil, Save, ExternalLink, FileText, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { RichTextEditor } from '@/components/ddh/RichTextEditor'

const PAGE_INFO = {
  privacy: { icon: '🔒', label_ar: 'سياسة الخصوصية', label_de: 'Datenschutz', publicPath: '/privacy' },
  terms: { icon: '📜', label_ar: 'الشروط والأحكام', label_de: 'AGB', publicPath: '/terms' },
  impressum: { icon: '📋', label_ar: 'بيانات النشر', label_de: 'Impressum', publicPath: '/impressum' },
}

export function LegalPagesAdminPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const refresh = async () => {
    setLoading(true)
    const r = await api.get('/api/admin/legal', { silent: true })
    if (r.ok) setItems(r.data.items || [])
    setLoading(false)
  }
  useEffect(() => { refresh() }, [])

  const togglePublish = async (page) => {
    const r = await api.patch(`/api/admin/legal/${page.slug}`, { published: !page.published }, { silent: true })
    if (r.ok) { toast.success(r.data.page.published ? 'تم النشر' : 'تم إخفاء الصفحة'); refresh() }
    else toast.error('فشلت العملية')
  }

  const save = async (data) => {
    const r = await api.patch(`/api/admin/legal/${editing.slug}`, data, { silent: true })
    if (r.ok) { toast.success('تم الحفظ بنجاح'); refresh(); setEditing(null) }
    else toast.error(r.error || 'فشل الحفظ')
  }

  return (
    <ErrorBoundary>
      <section dir="rtl" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white text-xl">⚖️</div>
            <div>
              <h2 className="font-black text-xl">الصفحات القانونية</h2>
              <p className="text-xs text-neutral-500">إدارة سياسة الخصوصية، الشروط، وImpressum</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border h-44 animate-pulse" />) : items.map(p => {
            const info = PAGE_INFO[p.slug] || {}
            return (
              <div key={p.slug} className="bg-white rounded-2xl border p-5 hover:shadow-lg transition flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{info.icon}</div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${p.published ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'}`}>
                    {p.published ? 'منشور ✓' : 'مخفي'}
                  </span>
                </div>
                <h3 className="font-black text-base mb-1">{p.title_ar}</h3>
                <p className="text-xs text-neutral-500 mb-1" dir="ltr">{p.title_de}</p>
                <p className="text-[10px] text-neutral-400 mt-auto pt-3 border-t" dir="ltr">/{p.slug}</p>
                <div className="flex items-center gap-2 mt-3 pt-2">
                  <Button onClick={() => setEditing(p)} size="sm" className="flex-1 bg-[#1A1A1A] text-white"><Pencil className="w-3.5 h-3.5 me-1" />تعديل</Button>
                  <button onClick={() => togglePublish(p)} className="p-2 rounded-lg hover:bg-neutral-100" title={p.published ? 'إخفاء' : 'نشر'}>
                    {p.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}
                  </button>
                  <a href={info.publicPath} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-amber-50 text-amber-600" title="معاينة">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 leading-relaxed flex items-start gap-2">
          <FileText className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>ملاحظة:</strong> هذه الصفحات حقوق ملكية كاملة لك. استخدم محرر النصوص الغني لإضافة/حذف الأقسام، وتنسيق المحتوى. كل صفحة تدعم محتوى ثنائي اللغة (عربي + ألماني). استخدم زر النشر/الإخفاء للتحكم بظهور كل صفحة على الموقع العام.
          </div>
        </div>

        {editing && <LegalEditDialog page={editing} onClose={() => setEditing(null)} onSave={save} />}
      </section>
    </ErrorBoundary>
  )
}

function LegalEditDialog({ page, onClose, onSave }) {
  const [form, setForm] = useState({
    title_ar: page.title_ar || '',
    title_de: page.title_de || '',
    metaDescription_ar: page.metaDescription_ar || '',
    metaDescription_de: page.metaDescription_de || '',
    content_ar: page.content_ar || '',
    content_de: page.content_de || '',
    published: !!page.published,
  })
  const [tab, setTab] = useState('ar')
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    if (!form.title_ar || !form.title_de) { toast.error('العنوان مطلوب بكلتا اللغتين'); setBusy(false); return }
    await onSave(form); setBusy(false)
  }

  const info = PAGE_INFO[page.slug] || {}

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle><span className="text-2xl me-2">{info.icon}</span>تعديل: {info.label_ar}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Language tabs */}
          <div className="flex gap-2 border-b pb-2">
            <button type="button" onClick={() => setTab('ar')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition ${tab === 'ar' ? 'bg-[#FFCE00]/20 text-[#1A1A1A] border-b-2 border-[#FFCE00]' : 'text-neutral-500 hover:bg-neutral-50'}`}>🇸🇾 العربية</button>
            <button type="button" onClick={() => setTab('de')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition ${tab === 'de' ? 'bg-[#FFCE00]/20 text-[#1A1A1A] border-b-2 border-[#FFCE00]' : 'text-neutral-500 hover:bg-neutral-50'}`}>🇩🇪 Deutsch</button>
          </div>

          {tab === 'ar' ? (
            <div className="space-y-3">
              <div><Label>العنوان (AR) *</Label><Input value={form.title_ar} onChange={e => set('title_ar', e.target.value)} /></div>
              <div><Label>الوصف للSEO (AR)</Label><Textarea rows={2} value={form.metaDescription_ar} onChange={e => set('metaDescription_ar', e.target.value)} placeholder="وصف مختصر يظهر في نتائج البحث (~150 حرف)" /></div>
              <div><Label>المحتوى (AR)</Label>
                <RichTextEditor value={form.content_ar} onChange={v => set('content_ar', v)} />
              </div>
            </div>
          ) : (
            <div className="space-y-3" dir="ltr">
              <div><Label>Title (DE) *</Label><Input value={form.title_de} onChange={e => set('title_de', e.target.value)} /></div>
              <div><Label>Meta Description (DE)</Label><Textarea rows={2} value={form.metaDescription_de} onChange={e => set('metaDescription_de', e.target.value)} placeholder="Kurze Beschreibung für Suchergebnisse (~150 Zeichen)" /></div>
              <div><Label>Content (DE)</Label>
                <RichTextEditor value={form.content_de} onChange={v => set('content_de', v)} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-neutral-50 rounded-xl p-3 border">
            <div>
              <Label className="!mb-0">منشور للزوار</Label>
              <p className="text-xs text-neutral-500 mt-0.5">عند الإيقاف، الصفحة العامة تظهر "غير متاحة"</p>
            </div>
            <Switch checked={form.published} onCheckedChange={(v) => set('published', v)} />
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

export default LegalPagesAdminPanel
