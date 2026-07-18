'use client'
import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Home as HomeIcon, Info, Plane, Users, Sparkles, MessageSquare, Award, HelpCircle, Clock, Star, Image as ImageIcon } from 'lucide-react'
import { FileUpload, ConfirmDialog } from '@/components/ddh/shared'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'

// ===== Helpers =====
async function apiGet(url) {
  const r = await fetch(url, { credentials: 'include' })
  return await r.json()
}
async function apiSend(url, method, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: body ? JSON.stringify(body) : undefined })
  return await r.json()
}

// ===== Main Panel =====
export function SiteContentAdminPanel() {
  return (
    <ErrorBoundary>
      <section dir="rtl" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📝</div>
            <h2 className="text-3xl font-black tracking-tight">إدارة محتوى الموقع</h2>
          </div>
          <p className="text-sm text-neutral-600">تحكّم كامل في نصوص الصفحة الرئيسية، صفحة عن المعهد، وصفحة التأشيرات. التغييرات تنعكس فوراً.</p>
        </div>

        <Tabs defaultValue="home">
          <TabsList className="flex flex-wrap h-auto bg-white border rounded-2xl p-1.5 gap-1 mb-6">
            <TabsTrigger value="home" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><HomeIcon className="w-4 h-4 ms-1.5" />الصفحة الرئيسية</TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Info className="w-4 h-4 ms-1.5" />عن المعهد</TabsTrigger>
            <TabsTrigger value="visa" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white"><Plane className="w-4 h-4 ms-1.5" />التأشيرات</TabsTrigger>
          </TabsList>

          <TabsContent value="home"><HomeContentManager /></TabsContent>
          <TabsContent value="about"><AboutContentManager /></TabsContent>
          <TabsContent value="visa"><VisaContentManager /></TabsContent>
        </Tabs>
      </section>
    </ErrorBoundary>
  )
}

// ============================================================
// HOME TAB — Stats + Why + Testimonials + CTA
// ============================================================
function HomeContentManager() {
  return (
    <Tabs defaultValue="hero">
      <TabsList className="flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-xl mb-5">
        <TabsTrigger value="hero" className="data-[state=active]:bg-white"><HomeIcon className="w-4 h-4 ms-1.5" />Hero</TabsTrigger>
        <TabsTrigger value="highlights" className="data-[state=active]:bg-white"><Award className="w-4 h-4 ms-1.5" />3 بطاقات مميّزة</TabsTrigger>
        <TabsTrigger value="stats" className="data-[state=active]:bg-white"><Sparkles className="w-4 h-4 ms-1.5" />الإحصائيات</TabsTrigger>
        <TabsTrigger value="why" className="data-[state=active]:bg-white"><Star className="w-4 h-4 ms-1.5" />لماذا نحن</TabsTrigger>
        <TabsTrigger value="featured" className="data-[state=active]:bg-white"><Sparkles className="w-4 h-4 ms-1.5" />الكورسات المميّزة</TabsTrigger>
        <TabsTrigger value="testimonials" className="data-[state=active]:bg-white"><MessageSquare className="w-4 h-4 ms-1.5" />الشهادات</TabsTrigger>
        <TabsTrigger value="news" className="data-[state=active]:bg-white"><Sparkles className="w-4 h-4 ms-1.5" />المركز الإعلامي</TabsTrigger>
        <TabsTrigger value="events" className="data-[state=active]:bg-white"><Star className="w-4 h-4 ms-1.5" />الفعاليات</TabsTrigger>
        <TabsTrigger value="cta" className="data-[state=active]:bg-white"><Award className="w-4 h-4 ms-1.5" />CTA</TabsTrigger>
      </TabsList>
      <TabsContent value="hero"><HomeHeroEditor /></TabsContent>
      <TabsContent value="highlights"><HomeHighlightsEditor /></TabsContent>
      <TabsContent value="stats"><HomeStatsEditor /></TabsContent>
      <TabsContent value="why"><HomeWhyEditor /></TabsContent>
      <TabsContent value="featured"><SimpleSectionEditor contentKey="home_featured" title="إعدادات قسم الكورسات المميّزة" fields={[
        { name: 'title', label: 'العنوان' },
        { name: 'subtitle', label: 'العنوان الفرعي', textarea: true },
        { name: 'ctaLabel', label: 'نص زر العرض الكامل' },
        { name: 'ctaAction', label: 'إجراء الزر', placeholder: 'goto:courses' },
      ]} /></TabsContent>
      <TabsContent value="testimonials"><HomeTestimonialsEditor /></TabsContent>
      <TabsContent value="news"><SimpleSectionEditor contentKey="home_news" title="قسم الأخبار / المركز الإعلامي" fields={[
        { name: 'title', label: 'العنوان' },
        { name: 'subtitle', label: 'العنوان الفرعي', textarea: true },
        { name: 'ctaLabel', label: 'نص زر العرض' },
        { name: 'ctaAction', label: 'إجراء الزر', placeholder: 'href:/blog' },
      ]} /></TabsContent>
      <TabsContent value="events"><SimpleSectionEditor contentKey="home_events" title="قسم الفعاليات" fields={[
        { name: 'title', label: 'العنوان' },
        { name: 'subtitle', label: 'العنوان الفرعي', textarea: true },
        { name: 'ctaLabel', label: 'نص زر العرض' },
        { name: 'ctaAction', label: 'إجراء الزر', placeholder: 'href:/activities' },
      ]} /></TabsContent>
      <TabsContent value="cta"><HomeCtaEditor /></TabsContent>
    </Tabs>
  )
}

// ===== Generic single-section editor (text-only fields) =====
function SimpleSectionEditor({ contentKey, title, fields }) {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet(`/api/admin/content/${contentKey}`).then(d => setData(d.data || {})) }, [contentKey])
  const save = async () => {
    setSaving(true)
    const r = await apiSend(`/api/admin/content/${contentKey}`, 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title={title} />
      <Card><CardContent className="p-4 space-y-3">
        {fields.map(f => (
          <div key={f.name}>
            <Label className="text-xs">{f.label}</Label>
            {f.textarea ? (
              <Textarea rows={2} value={data[f.name] || ''} onChange={e => setData({ ...data, [f.name]: e.target.value })} placeholder={f.placeholder} />
            ) : (
              <Input value={data[f.name] || ''} onChange={e => setData({ ...data, [f.name]: e.target.value })} placeholder={f.placeholder} />
            )}
          </div>
        ))}
      </CardContent></Card>
      <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
    </div>
  )
}

// ===== Home: Hero Editor =====
function HomeHeroEditor() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet('/api/admin/content/home_hero').then(d => setData(d.data || {})) }, [])
  const save = async () => {
    setSaving(true)
    const r = await apiSend('/api/admin/content/home_hero', 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title="قسم Hero — أعلى الصفحة" desc="الشارة الذهبية + النصوص + أزرار CTA." />
      <Card><CardContent className="p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label className="text-xs">شارة Hero (نص)</Label><Input value={data.badge || ''} onChange={e => setData({ ...data, badge: e.target.value })} placeholder="تسجيلات سبتمبر 2026 — مفتوحة الآن" /></div>
          <div><Label className="text-xs">شارة صغيرة (Pin)</Label><Input value={data.badgePin || ''} onChange={e => setData({ ...data, badgePin: e.target.value })} placeholder="جديد" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
          <div><Label className="text-xs">زر 1 - النص</Label><Input value={data.cta1Label || ''} onChange={e => setData({ ...data, cta1Label: e.target.value })} placeholder="سجّل في كورس" /></div>
          <div><Label className="text-xs">زر 1 - الإجراء</Label><Input value={data.cta1Action || ''} onChange={e => setData({ ...data, cta1Action: e.target.value })} placeholder="goto:courses" /></div>
          <div><Label className="text-xs">زر 2 - النص</Label><Input value={data.cta2Label || ''} onChange={e => setData({ ...data, cta2Label: e.target.value })} placeholder="احجز امتحان telc" /></div>
          <div><Label className="text-xs">زر 2 - الإجراء</Label><Input value={data.cta2Action || ''} onChange={e => setData({ ...data, cta2Action: e.target.value })} placeholder="goto:telc" /></div>
          <div><Label className="text-xs">زر 3 - النص (اتركه فارغ لإخفائه)</Label><Input value={data.cta3Label || ''} onChange={e => setData({ ...data, cta3Label: e.target.value })} placeholder="احجز استشارة" /></div>
          <div><Label className="text-xs">زر 3 - الإجراء</Label><Input value={data.cta3Action || ''} onChange={e => setData({ ...data, cta3Action: e.target.value })} placeholder="href:/visa-types#booking" /></div>
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed pt-2 border-t">💡 صيغ الإجراء: <code>goto:courses</code>, <code>goto:telc</code>, <code>href:/visa-types</code>, <code>signup</code>, <code>login</code></p>
      </CardContent></Card>
      <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
    </div>
  )
}

// ===== Home: Highlights Editor (3 cards) =====
function HomeHighlightsEditor() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet('/api/admin/content/home_highlights').then(d => setData(d.data || { items: [] })) }, [])
  const update = (idx, field, value) => {
    const items = [...(data.items || [])]
    items[idx] = { ...items[idx], [field]: value }
    setData({ ...data, items })
  }
  const move = (idx, dir) => {
    const items = [...(data.items || [])]
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    ;[items[idx], items[j]] = [items[j], items[idx]]
    items.forEach((it, i) => it.order = i + 1)
    setData({ ...data, items })
  }
  const add = () => {
    const items = [...(data.items || []), { id: crypto.randomUUID(), icon: 'Star', value: '100+', title: 'بطاقة جديدة', description: 'وصف...', color: '#CC0000', order: (data.items?.length || 0) + 1 }]
    setData({ ...data, items })
  }
  const remove = (idx) => setData({ ...data, items: (data.items || []).filter((_, i) => i !== idx) })
  const save = async () => {
    setSaving(true)
    const r = await apiSend('/api/admin/content/home_highlights', 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title="البطاقات المميّزة الـ 3 (تحت الـ Hero)" desc="بطاقات بارزة تُلخّص أهم 3 رسائل. لكل بطاقة: قيمة كبيرة، عنوان، وصف، أيقونة (lucide name أو إيموجي)، ولون." />
      <div className="grid gap-3">
        {(data.items || []).map((it, idx) => (
          <Card key={it.id || idx} className="border">
            <CardContent className="p-4 grid md:grid-cols-12 gap-3">
              <div className="md:col-span-2">
                <Label className="text-xs">القيمة الكبيرة</Label>
                <Input value={it.value || ''} onChange={e => update(idx, 'value', e.target.value)} placeholder="94%" />
              </div>
              <div className="md:col-span-4">
                <Label className="text-xs">العنوان</Label>
                <Input value={it.title || ''} onChange={e => update(idx, 'title', e.target.value)} placeholder="نسبة نجاح telc" />
              </div>
              <div className="md:col-span-3">
                <Label className="text-xs">الأيقونة (اسم أو إيموجي)</Label>
                <Input value={it.icon || ''} onChange={e => update(idx, 'icon', e.target.value)} placeholder="Trophy أو 🏆" />
              </div>
              <div className="md:col-span-3">
                <Label className="text-xs">اللون</Label>
                <div className="flex gap-1.5">
                  <Input type="color" value={it.color || '#CC0000'} onChange={e => update(idx, 'color', e.target.value)} className="w-12 p-1 h-9" />
                  <Input value={it.color || '#CC0000'} onChange={e => update(idx, 'color', e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="md:col-span-12">
                <Label className="text-xs">الوصف</Label>
                <Textarea rows={2} value={it.description || ''} onChange={e => update(idx, 'description', e.target.value)} />
              </div>
              <div className="md:col-span-12 flex gap-1 justify-end">
                <Button type="button" size="icon" variant="outline" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                <Button type="button" size="icon" variant="outline" onClick={() => move(idx, 1)} disabled={idx === (data.items?.length || 0) - 1}><ArrowDown className="w-4 h-4" /></Button>
                <Button type="button" size="icon" variant="outline" className="text-red-600" onClick={() => remove(idx)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={add}><Plus className="w-4 h-4 ms-1.5" />إضافة بطاقة</Button>
        <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
      </div>
    </div>
  )
}

// ===== Home: Stats Editor =====
function HomeStatsEditor() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet('/api/admin/content/home_stats').then(d => setData(d.data || { items: [] })) }, [])
  const update = (idx, field, value) => {
    const items = [...(data.items || [])]
    items[idx] = { ...items[idx], [field]: value }
    setData({ ...data, items })
  }
  const move = (idx, dir) => {
    const items = [...(data.items || [])]
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    ;[items[idx], items[j]] = [items[j], items[idx]]
    items.forEach((it, i) => it.order = i + 1)
    setData({ ...data, items })
  }
  const add = () => {
    const items = [...(data.items || []), { id: crypto.randomUUID(), value: '0+', label: 'إحصائية جديدة', icon: 'Star', color: '#CC0000', order: (data.items?.length || 0) + 1 }]
    setData({ ...data, items })
  }
  const remove = (idx) => {
    const items = (data.items || []).filter((_, i) => i !== idx)
    setData({ ...data, items })
  }
  const save = async () => {
    setSaving(true)
    const r = await apiSend('/api/admin/content/home_stats', 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title="قسم الإحصائيات" desc="الأرقام التي تظهر في أعلى الصفحة الرئيسية. اللون hex code (مثال: #CC0000)." />
      <div className="grid gap-3">
        {(data.items || []).map((item, idx) => (
          <Card key={item.id || idx} className="border">
            <CardContent className="p-4 grid md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-2">
                <Label className="text-xs">القيمة</Label>
                <Input value={item.value || ''} onChange={e => update(idx, 'value', e.target.value)} placeholder="180+" />
              </div>
              <div className="md:col-span-4">
                <Label className="text-xs">التسمية</Label>
                <Input value={item.label || ''} onChange={e => update(idx, 'label', e.target.value)} placeholder="كورس مكتمل" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">الأيقونة</Label>
                <Input value={item.icon || ''} onChange={e => update(idx, 'icon', e.target.value)} placeholder="BookOpen" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">اللون</Label>
                <div className="flex gap-1.5">
                  <Input type="color" value={item.color || '#CC0000'} onChange={e => update(idx, 'color', e.target.value)} className="w-12 p-1 h-9" />
                  <Input value={item.color || '#CC0000'} onChange={e => update(idx, 'color', e.target.value)} placeholder="#CC0000" className="flex-1" />
                </div>
              </div>
              <div className="md:col-span-2 flex gap-1 justify-end">
                <Button type="button" size="icon" variant="outline" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                <Button type="button" size="icon" variant="outline" onClick={() => move(idx, 1)} disabled={idx === (data.items?.length || 0) - 1}><ArrowDown className="w-4 h-4" /></Button>
                <Button type="button" size="icon" variant="outline" className="text-red-600" onClick={() => remove(idx)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={add}><Plus className="w-4 h-4 ms-1.5" />إضافة إحصائية</Button>
        <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
      </div>
      <p className="text-xs text-neutral-500">💡 أسماء الأيقونات المتاحة (lucide-react): Users, BookOpen, Trophy, Building2, GraduationCap, Award, Star, ShieldCheck, Briefcase, Sparkles</p>
    </div>
  )
}

// ===== Home: Why Editor =====
function HomeWhyEditor() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet('/api/admin/content/home_why').then(d => setData(d.data || { title: '', subtitle: '', cards: [] })) }, [])
  const updateCard = (idx, field, value) => {
    const cards = [...(data.cards || [])]
    cards[idx] = { ...cards[idx], [field]: value }
    setData({ ...data, cards })
  }
  const move = (idx, dir) => {
    const cards = [...(data.cards || [])]
    const j = idx + dir
    if (j < 0 || j >= cards.length) return
    ;[cards[idx], cards[j]] = [cards[j], cards[idx]]
    cards.forEach((it, i) => it.order = i + 1)
    setData({ ...data, cards })
  }
  const addCard = () => {
    const cards = [...(data.cards || []), { id: crypto.randomUUID(), icon: 'Star', title: 'ميزة جديدة', description: '', color: '#CC0000', order: (data.cards?.length || 0) + 1 }]
    setData({ ...data, cards })
  }
  const removeCard = (idx) => setData({ ...data, cards: (data.cards || []).filter((_, i) => i !== idx) })
  const save = async () => {
    setSaving(true)
    const r = await apiSend('/api/admin/content/home_why', 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title="قسم: لماذا Das Deutsche Haus؟" desc="العنوان الرئيسي للقسم + بطاقات المزايا." />
      <Card><CardContent className="p-4 space-y-3">
        <div><Label className="text-xs">العنوان الرئيسي</Label><Input value={data.title || ''} onChange={e => setData({ ...data, title: e.target.value })} /></div>
        <div><Label className="text-xs">العنوان الفرعي</Label><Input value={data.subtitle || ''} onChange={e => setData({ ...data, subtitle: e.target.value })} /></div>
      </CardContent></Card>

      <h4 className="font-bold text-lg pt-2">بطاقات المزايا</h4>
      <div className="grid gap-3">
        {(data.cards || []).map((card, idx) => (
          <Card key={card.id || idx} className="border">
            <CardContent className="p-4 grid md:grid-cols-12 gap-3">
              <div className="md:col-span-3">
                <Label className="text-xs">الأيقونة</Label>
                <Input value={card.icon || ''} onChange={e => updateCard(idx, 'icon', e.target.value)} placeholder="ShieldCheck" />
              </div>
              <div className="md:col-span-3">
                <Label className="text-xs">العنوان</Label>
                <Input value={card.title || ''} onChange={e => updateCard(idx, 'title', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">اللون</Label>
                <div className="flex gap-1.5">
                  <Input type="color" value={card.color || '#CC0000'} onChange={e => updateCard(idx, 'color', e.target.value)} className="w-10 p-1 h-9" />
                  <Input value={card.color || '#CC0000'} onChange={e => updateCard(idx, 'color', e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="md:col-span-12">
                <Label className="text-xs">الوصف</Label>
                <Textarea rows={2} value={card.description || ''} onChange={e => updateCard(idx, 'description', e.target.value)} />
              </div>
              <div className="md:col-span-12 flex gap-1 justify-end">
                <Button type="button" size="icon" variant="outline" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                <Button type="button" size="icon" variant="outline" onClick={() => move(idx, 1)} disabled={idx === (data.cards?.length || 0) - 1}><ArrowDown className="w-4 h-4" /></Button>
                <Button type="button" size="icon" variant="outline" className="text-red-600" onClick={() => removeCard(idx)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addCard}><Plus className="w-4 h-4 ms-1.5" />إضافة بطاقة</Button>
        <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
      </div>
    </div>
  )
}

// ===== Home: Testimonials Title =====
function HomeTestimonialsEditor() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet('/api/admin/content/home_testimonials').then(d => setData(d.data || { title: '' })) }, [])
  const save = async () => {
    setSaving(true)
    const r = await apiSend('/api/admin/content/home_testimonials', 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title="قسم الشهادات" desc="عنوان قسم 'ماذا يقول طلابنا'." />
      <Card><CardContent className="p-4 space-y-3">
        <div><Label className="text-xs">العنوان</Label><Input value={data.title || ''} onChange={e => setData({ ...data, title: e.target.value })} /></div>
      </CardContent></Card>
      <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
    </div>
  )
}

// ===== Home: CTA Editor =====
function HomeCtaEditor() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet('/api/admin/content/home_cta').then(d => setData(d.data || {})) }, [])
  const updBtn = (key, field, value) => setData({ ...data, [key]: { ...(data[key] || {}), [field]: value } })
  const save = async () => {
    setSaving(true)
    const r = await apiSend('/api/admin/content/home_cta', 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  const btnFields = [
    { key: 'button1', label: 'الزر 1 (ذهبي)' },
    { key: 'button2', label: 'الزر 2 (أبيض)' },
    { key: 'button3', label: 'الزر 3 (احجز استشارة)' },
  ]
  return (
    <div className="space-y-4">
      <PanelHeader title="قسم الدعوة للعمل (CTA) — أسفل الصفحة" desc="العنوان والنص + 3 أزرار قابلة للتخصيص." />
      <Card><CardContent className="p-4 space-y-3">
        <div><Label className="text-xs">العنوان</Label><Input value={data.title || ''} onChange={e => setData({ ...data, title: e.target.value })} /></div>
        <div><Label className="text-xs">النص الفرعي</Label><Textarea rows={2} value={data.subtitle || ''} onChange={e => setData({ ...data, subtitle: e.target.value })} /></div>
      </CardContent></Card>
      <div className="grid md:grid-cols-3 gap-3">
        {btnFields.map(({ key, label }) => (
          <Card key={key}><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-sm">{label}</h5>
              <Switch checked={data[key]?.enabled !== false} onCheckedChange={v => updBtn(key, 'enabled', v)} />
            </div>
            <div><Label className="text-xs">النص</Label><Input value={data[key]?.label || ''} onChange={e => updBtn(key, 'label', e.target.value)} /></div>
            <div>
              <Label className="text-xs">الإجراء</Label>
              <Input value={data[key]?.action || ''} onChange={e => updBtn(key, 'action', e.target.value)} />
              <p className="text-[10px] text-neutral-500 mt-1">signup | goto:courses | goto:telc | href:/visa-types#booking</p>
            </div>
          </CardContent></Card>
        ))}
      </div>
      <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
    </div>
  )
}

// ============================================================
// ABOUT TAB
// ============================================================
function AboutContentManager() {
  return (
    <Tabs defaultValue="text">
      <TabsList className="flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-xl mb-5">
        <TabsTrigger value="text" className="data-[state=active]:bg-white"><Info className="w-4 h-4 ms-1.5" />النصوص</TabsTrigger>
        <TabsTrigger value="team" className="data-[state=active]:bg-white"><Users className="w-4 h-4 ms-1.5" />فريق العمل</TabsTrigger>
        <TabsTrigger value="partnerships" className="data-[state=active]:bg-white"><Award className="w-4 h-4 ms-1.5" />الشراكات</TabsTrigger>
      </TabsList>
      <TabsContent value="text"><AboutTextEditor /></TabsContent>
      <TabsContent value="team"><TeamMembersManager /></TabsContent>
      <TabsContent value="partnerships"><PartnershipsManager /></TabsContent>
    </Tabs>
  )
}

function AboutTextEditor() {
  const [hero, setHero] = useState(null)
  const [mission, setMission] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    apiGet('/api/admin/content/about_hero').then(d => setHero(d.data || {}))
    apiGet('/api/admin/content/about_mission').then(d => setMission(d.data || {}))
  }, [])
  const save = async () => {
    setSaving(true)
    const r1 = await apiSend('/api/admin/content/about_hero', 'PATCH', { data: hero })
    const r2 = await apiSend('/api/admin/content/about_mission', 'PATCH', { data: mission })
    setSaving(false)
    if (r1.error || r2.error) toast.error(r1.error || r2.error); else toast.success('تم الحفظ ✓')
  }
  if (!hero || !mission) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title="نصوص صفحة عن المعهد" />
      <Card><CardContent className="p-4 space-y-3">
        <h4 className="font-bold">رأس الصفحة (Hero)</h4>
        <div><Label className="text-xs">العنوان</Label><Input value={hero.title || ''} onChange={e => setHero({ ...hero, title: e.target.value })} /></div>
        <div><Label className="text-xs">العنوان الفرعي</Label><Input value={hero.subtitle || ''} onChange={e => setHero({ ...hero, subtitle: e.target.value })} /></div>
      </CardContent></Card>
      <Card><CardContent className="p-4 space-y-3">
        <h4 className="font-bold">القصة / الرسالة / الرؤية</h4>
        <div><Label className="text-xs">عنوان قسم القصة</Label><Input value={mission.storyTitle || ''} onChange={e => setMission({ ...mission, storyTitle: e.target.value })} /></div>
        <div><Label className="text-xs">نص القصة</Label><Textarea rows={4} value={mission.story || ''} onChange={e => setMission({ ...mission, story: e.target.value })} /></div>
        <div><Label className="text-xs">عنوان قسم الرسالة</Label><Input value={mission.missionTitle || ''} onChange={e => setMission({ ...mission, missionTitle: e.target.value })} /></div>
        <div><Label className="text-xs">نص الرسالة</Label><Textarea rows={3} value={mission.mission || ''} onChange={e => setMission({ ...mission, mission: e.target.value })} /></div>
        <div><Label className="text-xs">عنوان قسم الرؤية</Label><Input value={mission.visionTitle || ''} onChange={e => setMission({ ...mission, visionTitle: e.target.value })} /></div>
        <div><Label className="text-xs">نص الرؤية</Label><Textarea rows={3} value={mission.vision || ''} onChange={e => setMission({ ...mission, vision: e.target.value })} /></div>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label className="text-xs">عنوان قسم الفريق</Label><Input value={mission.teamTitle || ''} onChange={e => setMission({ ...mission, teamTitle: e.target.value })} /></div>
          <div><Label className="text-xs">عنوان قسم الاعتمادات</Label><Input value={mission.accredTitle || ''} onChange={e => setMission({ ...mission, accredTitle: e.target.value })} /></div>
        </div>
      </CardContent></Card>
      <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ كل النصوص'}</Button>
    </div>
  )
}

// ===== Team Members CRUD =====
function TeamMembersManager() {
  return <CrudList
    title="فريق العمل"
    desc="أعضاء فريق المعهد. الصورة تُرفع عبر Cloudinary."
    resource="team-members"
    columns={[
      { field: 'photo', label: 'الصورة', render: (v) => v ? <img src={v} alt="" className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center text-neutral-400"><Users className="w-5 h-5" /></div> },
      { field: 'name', label: 'الاسم' },
      { field: 'role', label: 'المنصب' },
      { field: 'order', label: 'الترتيب' },
    ]}
    fields={[
      { name: 'photo', label: 'الصورة الشخصية', type: 'image' },
      { name: 'name', label: 'الاسم الكامل', type: 'text', required: true },
      { name: 'role', label: 'المنصب / الوظيفة', type: 'text', required: true },
      { name: 'bio', label: 'نبذة قصيرة', type: 'textarea' },
      { name: 'linkedIn', label: 'LinkedIn (رابط)', type: 'text' },
      { name: 'email', label: 'البريد الإلكتروني', type: 'text' },
      { name: 'order', label: 'الترتيب', type: 'number' },
      { name: 'published', label: 'منشور', type: 'switch', default: true },
    ]}
  />
}

// ===== Partnerships CRUD =====
function PartnershipsManager() {
  return <CrudList
    title="الشراكات والاعتمادات"
    desc="قائمة الشركاء والجهات المعتمدة. اللوغو يُرفع عبر Cloudinary."
    resource="partnerships"
    columns={[
      { field: 'logo', label: 'اللوغو', render: (v) => v ? <img src={v} alt="" className="w-16 h-12 object-contain rounded" /> : <div className="w-16 h-12 bg-neutral-200 rounded flex items-center justify-center text-neutral-400"><ImageIcon className="w-5 h-5" /></div> },
      { field: 'name', label: 'الاسم' },
      { field: 'order', label: 'الترتيب' },
    ]}
    fields={[
      { name: 'logo', label: 'اللوغو', type: 'image' },
      { name: 'name', label: 'اسم الجهة', type: 'text', required: true },
      { name: 'link', label: 'الرابط (اختياري)', type: 'text' },
      { name: 'order', label: 'الترتيب', type: 'number' },
      { name: 'published', label: 'منشور', type: 'switch', default: true },
    ]}
  />
}

// ============================================================
// VISA TAB
// ============================================================
function VisaContentManager() {
  return (
    <Tabs defaultValue="text">
      <TabsList className="flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-xl mb-5">
        <TabsTrigger value="text" className="data-[state=active]:bg-white"><Info className="w-4 h-4 ms-1.5" />النصوص</TabsTrigger>
        <TabsTrigger value="types" className="data-[state=active]:bg-white"><Plane className="w-4 h-4 ms-1.5" />أنواع التأشيرات</TabsTrigger>
        <TabsTrigger value="faqs" className="data-[state=active]:bg-white"><HelpCircle className="w-4 h-4 ms-1.5" />الأسئلة الشائعة</TabsTrigger>
        <TabsTrigger value="consult" className="data-[state=active]:bg-white"><Clock className="w-4 h-4 ms-1.5" />أنواع الاستشارات</TabsTrigger>
      </TabsList>
      <TabsContent value="text"><VisaTextEditor /></TabsContent>
      <TabsContent value="types"><VisaTypesManager /></TabsContent>
      <TabsContent value="faqs"><VisaFaqsManager /></TabsContent>
      <TabsContent value="consult"><ConsultationTypesManager /></TabsContent>
    </Tabs>
  )
}

function VisaTextEditor() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { apiGet('/api/admin/content/visa_page').then(d => setData(d.data || {})) }, [])
  const save = async () => {
    setSaving(true)
    const r = await apiSend('/api/admin/content/visa_page', 'PATCH', { data })
    setSaving(false)
    if (r.error) toast.error(r.error); else toast.success('تم الحفظ ✓')
  }
  if (!data) return <Loading />
  return (
    <div className="space-y-4">
      <PanelHeader title="نصوص صفحة التأشيرات" desc="رابط الصفحة: /visa-types" />
      <Card><CardContent className="p-4 space-y-3">
        <div><Label className="text-xs">عنوان الـ Hero</Label><Input value={data.heroTitle || ''} onChange={e => setData({ ...data, heroTitle: e.target.value })} /></div>
        <div><Label className="text-xs">العنوان الفرعي للـ Hero</Label><Input value={data.heroSubtitle || ''} onChange={e => setData({ ...data, heroSubtitle: e.target.value })} /></div>
        <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
          <div><Label className="text-xs">عنوان قسم البطاقات</Label><Input value={data.cardsTitle || ''} onChange={e => setData({ ...data, cardsTitle: e.target.value })} /></div>
          <div><Label className="text-xs">العنوان الفرعي للبطاقات</Label><Input value={data.cardsSubtitle || ''} onChange={e => setData({ ...data, cardsSubtitle: e.target.value })} /></div>
          <div><Label className="text-xs">عنوان قسم FAQ</Label><Input value={data.faqTitle || ''} onChange={e => setData({ ...data, faqTitle: e.target.value })} /></div>
          <div><Label className="text-xs">العنوان الفرعي للـ FAQ</Label><Input value={data.faqSubtitle || ''} onChange={e => setData({ ...data, faqSubtitle: e.target.value })} /></div>
          <div><Label className="text-xs">عنوان نموذج الحجز</Label><Input value={data.bookingTitle || ''} onChange={e => setData({ ...data, bookingTitle: e.target.value })} /></div>
          <div><Label className="text-xs">العنوان الفرعي للحجز</Label><Input value={data.bookingSubtitle || ''} onChange={e => setData({ ...data, bookingSubtitle: e.target.value })} /></div>
        </div>
      </CardContent></Card>
      <Button type="button" onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4 ms-1.5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
    </div>
  )
}

function VisaTypesManager() {
  return <CrudList
    title="أنواع التأشيرات"
    desc="البطاقات التي تظهر في صفحة /visa-types"
    resource="visa-types-list"
    columns={[
      { field: 'emoji', label: 'الأيقونة', render: (v) => <span className="text-2xl">{v || '✈️'}</span> },
      { field: 'title', label: 'العنوان' },
      { field: 'order', label: 'الترتيب' },
    ]}
    fields={[
      { name: 'emoji', label: 'إيموجي / أيقونة', type: 'text', placeholder: '🎓' },
      { name: 'title', label: 'العنوان', type: 'text', required: true },
      { name: 'description', label: 'الوصف', type: 'textarea' },
      { name: 'color', label: 'اللون (hex)', type: 'color' },
      { name: 'link', label: 'رابط (اختياري)', type: 'text' },
      { name: 'order', label: 'الترتيب', type: 'number' },
      { name: 'published', label: 'منشور', type: 'switch', default: true },
    ]}
  />
}

function VisaFaqsManager() {
  return <CrudList
    title="الأسئلة الشائعة"
    desc="أسئلة و أجوبة تظهر كـ Accordion في صفحة /visa-types"
    resource="visa-faqs"
    columns={[
      { field: 'question', label: 'السؤال' },
      { field: 'order', label: 'الترتيب' },
    ]}
    fields={[
      { name: 'question', label: 'السؤال', type: 'text', required: true },
      { name: 'answer', label: 'الإجابة', type: 'textarea', required: true },
      { name: 'order', label: 'الترتيب', type: 'number' },
      { name: 'published', label: 'منشور', type: 'switch', default: true },
    ]}
  />
}

function ConsultationTypesManager() {
  return <CrudList
    title="أنواع الاستشارات"
    desc="تظهر كخيارات في نموذج 'احجز موعد استشارة'"
    resource="consultation-types"
    columns={[
      { field: 'name', label: 'الاسم' },
      { field: 'durationMinutes', label: 'المدة (دقيقة)' },
      { field: 'price', label: 'السعر ($)' },
      { field: 'order', label: 'الترتيب' },
    ]}
    fields={[
      { name: 'name', label: 'اسم الاستشارة', type: 'text', required: true },
      { name: 'description', label: 'الوصف', type: 'textarea' },
      { name: 'durationMinutes', label: 'المدة بالدقائق', type: 'number', default: 30 },
      { name: 'price', label: 'السعر ($) — 0 للمجانية', type: 'number', default: 0 },
      { name: 'order', label: 'الترتيب', type: 'number' },
      { name: 'published', label: 'منشور', type: 'switch', default: true },
    ]}
  />
}

// ============================================================
// Generic CRUD List + Dialog Form
// ============================================================
function CrudList({ title, desc, resource, columns, fields }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await apiGet(`/api/admin/${resource}`)
    setItems(r.items || [])
    setLoading(false)
  }, [resource])
  useEffect(() => { load() }, [load])

  const onSave = async (data) => {
    const isNew = !editing?.id
    const url = isNew ? `/api/admin/${resource}` : `/api/admin/${resource}/${editing.id}`
    const method = isNew ? 'POST' : 'PATCH'
    const r = await apiSend(url, method, data)
    if (r.error) { toast.error(r.error); return false }
    toast.success(isNew ? 'تمت الإضافة ✓' : 'تم التحديث ✓')
    setShowForm(false)
    setEditing(null)
    await load()
    return true
  }
  const onDelete = async (id) => {
    const r = await apiSend(`/api/admin/${resource}/${id}`, 'DELETE')
    if (r.error) toast.error(r.error); else { toast.success('تم الحذف ✓'); load() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PanelHeader title={title} desc={desc} />
        <Button onClick={() => { setEditing({}); setShowForm(true) }} className="btn-primary"><Plus className="w-4 h-4 ms-1.5" />إضافة جديد</Button>
      </div>
      {loading ? <Loading /> : items.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-neutral-500">لا توجد عناصر بعد. أضف أول عنصر.</CardContent></Card>
      ) : (
        <Card><CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b text-neutral-600">
              <tr>{columns.map(c => <th key={c.field} className="text-start p-3 font-semibold">{c.label}</th>)}<th className="text-start p-3">منشور</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b hover:bg-neutral-50">
                  {columns.map(c => <td key={c.field} className="p-3">{c.render ? c.render(item[c.field], item) : <span className="line-clamp-2">{item[c.field] ?? '—'}</span>}</td>)}
                  <td className="p-3">{item.published !== false ? <Badge className="bg-green-100 text-green-700 border-green-300">✓</Badge> : <Badge variant="outline">معطّل</Badge>}</td>
                  <td className="p-3"><div className="flex gap-1 justify-end">
                    <Button size="icon" variant="outline" onClick={() => { setEditing(item); setShowForm(true) }}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="outline" className="text-red-600" onClick={() => setConfirm(item)}><Trash2 className="w-4 h-4" /></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {showForm && (
        <CrudFormDialog
          title={editing?.id ? 'تعديل' : 'إضافة جديد'}
          item={editing}
          fields={fields}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={onSave}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title="تأكيد الحذف"
          desc={`هل أنت متأكد من حذف "${confirm.name || confirm.title || confirm.question || 'هذا العنصر'}"؟`}
          onConfirm={() => { onDelete(confirm.id); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

function CrudFormDialog({ title, item, fields, onClose, onSave }) {
  const [data, setData] = useState(() => {
    const init = { ...item }
    fields.forEach(f => {
      if (init[f.name] === undefined && f.default !== undefined) init[f.name] = f.default
    })
    return init
  })
  const [saving, setSaving] = useState(false)
  const upd = (name, value) => setData(d => ({ ...d, [name]: value }))
  const submit = async (e) => {
    e.preventDefault()
    for (const f of fields) {
      if (f.required && !data[f.name]) { toast.error(`${f.label} مطلوب`); return }
    }
    setSaving(true)
    await onSave(data)
    setSaving(false)
  }
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {fields.map(f => (
            <div key={f.name}>
              <Label className="text-xs">{f.label}{f.required && <span className="text-red-600 ms-1">*</span>}</Label>
              {f.type === 'textarea' ? (
                <Textarea rows={3} value={data[f.name] || ''} onChange={e => upd(f.name, e.target.value)} placeholder={f.placeholder} />
              ) : f.type === 'number' ? (
                <Input type="number" value={data[f.name] ?? ''} onChange={e => upd(f.name, e.target.value === '' ? '' : Number(e.target.value))} placeholder={f.placeholder} />
              ) : f.type === 'switch' ? (
                <div className="flex items-center gap-2 pt-1"><Switch checked={data[f.name] !== false} onCheckedChange={v => upd(f.name, v)} /><span className="text-sm text-neutral-600">{data[f.name] !== false ? 'منشور' : 'معطّل'}</span></div>
              ) : f.type === 'color' ? (
                <div className="flex gap-2"><Input type="color" value={data[f.name] || '#CC0000'} onChange={e => upd(f.name, e.target.value)} className="w-12 p-1 h-9" /><Input value={data[f.name] || '#CC0000'} onChange={e => upd(f.name, e.target.value)} className="flex-1" /></div>
              ) : f.type === 'image' ? (
                <div className="space-y-2">
                  {data[f.name] && <img src={data[f.name]} alt="" className="max-h-32 rounded border" />}
                  <FileUpload folder={`ddh/site/${f.name}`} accept="image/*" kind="image" onUploaded={(res) => upd(f.name, res.url)} label={`اضغط لرفع ${f.label}`} />
                  <Input value={data[f.name] || ''} onChange={e => upd(f.name, e.target.value)} placeholder="أو الصق رابط الصورة هنا" />
                </div>
              ) : (
                <Input value={data[f.name] || ''} onChange={e => upd(f.name, e.target.value)} placeholder={f.placeholder} />
              )}
            </div>
          ))}
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" className="btn-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ===== Helpers =====
function PanelHeader({ title, desc }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      {desc && <p className="text-sm text-neutral-600">{desc}</p>}
    </div>
  )
}
function Loading() { return <div className="py-12 text-center text-neutral-500">جاري التحميل...</div> }
