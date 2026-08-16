'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ToggleLeft, ToggleRight, Info, Sparkles, RefreshCw } from 'lucide-react'
import { invalidateFeatureFlags } from '@/lib/useFeatureFlags'

// Same meta as backend — kept in sync manually (small list)
const FEATURE_META = {
  german_visitors: {
    label_ar: 'صفحة Für deutsche Besucher',
    hint_ar: 'تعطيل هذه الصفحة سيُخفي رابطها من الـ Navbar. الزوّار الذين يفتحونها مباشرة سيرون شاشة "قريباً".',
    icon: '🇩🇪',
  },
}

export default function FeatureFlagsAdminPanel() {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/site-features').then(r => r.json())
      setFeatures(r.features || [])
    } catch { toast.error('فشل تحميل الإعدادات') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { refresh() }, [refresh])

  const toggle = async (key, next) => {
    setBusy(key)
    try {
      const r = await fetch(`/api/admin/site-features/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      const d = await r.json()
      if (!r.ok || d.error) { toast.error(d.error || 'فشل التحديث'); return }
      setFeatures(fs => fs.map(f => f.key === key ? { ...f, enabled: next } : f))
      invalidateFeatureFlags() // notify the whole app to re-fetch flags
      toast.success(next ? '✓ الصفحة مُفعّلة الآن' : '⚠️ الصفحة أصبحت معطّلة (تعرض "قريباً")')
    } finally { setBusy(null) }
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#CC0000]" />
          إدارة الصفحات — Feature Flags
        </h3>
        <p className="text-[12.5px] text-neutral-500 mt-1 max-w-2xl">
          فعّل أو عطّل صفحات معيّنة دون حذفها. عند التعطيل، المحتوى يبقى محفوظاً بالكامل، ويعرض الموقع للزوار شاشة &quot;قريباً&quot; بشكل جذّاب لتشويقهم.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-neutral-500">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
          جاري التحميل...
        </div>
      ) : (
        <div className="grid gap-4 max-w-3xl">
          {features.map(f => {
            const meta = FEATURE_META[f.key] || { label_ar: f.key, hint_ar: '' }
            const isBusy = busy === f.key
            return (
              <Card key={f.key} className={`overflow-hidden border-2 transition-all ${f.enabled ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-300 bg-amber-50/50'}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${f.enabled ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        {meta.icon || '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-[15px]">{meta.label_ar}</h4>
                          {f.enabled
                            ? <Badge className="bg-emerald-600 text-white text-[10px]">مُفعّلة</Badge>
                            : <Badge className="bg-amber-600 text-white text-[10px]">قريباً</Badge>}
                        </div>
                        <p className="text-[12.5px] text-neutral-600 mt-1.5 leading-relaxed">{meta.hint_ar}</p>
                        {f.updatedAt && (
                          <p className="text-[10.5px] text-neutral-400 mt-2">آخر تحديث: {new Date(f.updatedAt).toLocaleString('ar')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isBusy
                        ? <RefreshCw className="w-4 h-4 animate-spin text-neutral-400" />
                        : (f.enabled ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-amber-600" />)}
                      <Switch checked={f.enabled} onCheckedChange={(v) => toggle(f.key, v)} disabled={isBusy} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-6 max-w-3xl">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-[12.5px] text-blue-900 flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">💡 كيف يعمل هذا النظام؟</p>
            <ul className="space-y-1 list-disc list-inside text-blue-800/90">
              <li>عند تعطيل صفحة، محتواها يبقى في قاعدة البيانات — لا يُحذف.</li>
              <li>الزوّار يرون شاشة &quot;قريباً&quot; بتصميم جذّاب — لا يعرفون أن الميزة مُعطّلة عمداً.</li>
              <li>الروابط والأزرار المتعلقة بالصفحة تختفي من كل الموقع تلقائياً.</li>
              <li>عند إعادة التفعيل، كل شيء يعود فوراً بدون فقد أي بيانات.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
