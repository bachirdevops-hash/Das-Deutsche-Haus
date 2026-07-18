'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Tag, Filter, Sparkles, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { ErrorBoundary } from '@/components/ddh/ErrorBoundary'
import { ACTIVITY_TYPES, getActivityType } from '@/lib/activities_seed'

const FILTERS = [
  { value: 'all', label: 'الكل', icon: '✨' },
  { value: 'upcoming', label: 'قادمة', icon: '📅' },
  { value: 'free', label: 'مجانية', icon: '🎁' },
  { value: 'registration', label: 'تحتاج تسجيل', icon: '✍️' },
]

export default function ActivitiesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [type, setType] = useState('all')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('filter', filter)
    if (type !== 'all') params.set('type', type)
    const r = await api.get(`/api/activities?${params}`, { silent: true })
    if (r.ok) setItems(r.data.items || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [filter, type])
  useEffect(() => {
    document.title = 'النشاطات — Das Deutsche Haus'
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
  }, [])

  return (
    <ErrorBoundary>
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white" style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}>
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="h-1 flex"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <a href="/" className="font-black text-base md:text-lg text-[#1A1A1A] hover:text-[#CC0000] transition">Das Deutsche Haus</a>
            <h1 className="text-lg md:text-xl font-black hidden md:block">النشاطات</h1>
            <a href="/" className="text-xs md:text-sm font-bold text-neutral-700 hover:text-[#CC0000] inline-flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 rotate-180" />الرئيسية
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="py-14 md:py-20 text-center bg-gradient-to-br from-white via-[#FFCE00]/5 to-[#CC0000]/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,206,0,.15), transparent 40%), radial-gradient(circle at 80% 30%, rgba(204,0,0,.10), transparent 40%)' }} />
          <div className="container mx-auto px-4 max-w-3xl relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFCE00]/20 text-[#1A1A1A] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />نشاطات المعهد
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">انضمّ إلى نشاطاتنا</h2>
            <p className="text-neutral-600 leading-relaxed max-w-xl mx-auto">ورشات عمل، محاضرات، احتفالات، ورحلات — تجارب تفاعلية ترافق رحلتك نحو ألمانيا.</p>
          </div>
        </section>

        {/* Filters */}
        <div className="sticky top-16 bg-white/95 backdrop-blur z-20 border-b">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)} className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${filter === f.value ? 'bg-[#1A1A1A] text-white shadow' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}>
                  <span className="me-1.5">{f.icon}</span>{f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="text-xs font-bold text-neutral-500 inline-flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" />النوع:</div>
              <button onClick={() => setType('all')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${type === 'all' ? 'bg-[#CC0000] text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}>الكل</button>
              {ACTIVITY_TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${type === t.value ? 'bg-[#CC0000] text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                  <span className="me-1">{t.icon}</span>{t.label_ar}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <section className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-white rounded-2xl border h-96 animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold mb-1">لا توجد نشاطات حالياً</p>
              <p className="text-sm">جرّب فلتراً آخر — أو تابعنا قريباً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(a => <ActivityCard key={a.id} a={a} />)}
            </div>
          )}
        </section>

        <footer className="bg-[#1A1A1A] text-white py-8 text-center">
          <div className="h-1 flex mb-6"><div className="flex-1 bg-[#1A1A1A]" /><div className="flex-1 bg-[#CC0000]" /><div className="flex-1 bg-[#FFCE00]" /></div>
          <div className="container mx-auto px-4">
            <a href="/" className="hover:text-[#FFCE00]">← العودة للصفحة الرئيسية</a>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

function ActivityCard({ a }) {
  const t = getActivityType(a.type)
  const dateObj = a.date ? new Date(a.date) : null
  const dateStr = dateObj ? dateObj.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const timeStr = dateObj ? dateObj.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }) : ''
  const isPast = dateObj && dateObj.getTime() < Date.now()
  const total = a.totalSeats || 0
  const taken = a.registeredCount || 0
  const remaining = Math.max(0, total - taken)
  const isFull = a.requiresRegistration && total > 0 && remaining <= 0

  return (
    <a href={`/activities/${a.slug}`} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {a.coverImage ? (
          <img src={a.coverImage} alt={a.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000] to-[#FFCE00] flex items-center justify-center text-6xl">{t.icon}</div>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${t.color}`}>
          <span className="me-1">{t.icon}</span>{t.label_ar}
        </span>
        {a.isFree ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-600 text-white shadow">مجاني</span>
        ) : (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#CC0000] text-white shadow">{a.price} {a.currency === 'EUR' ? '€' : a.currency === 'SYP' ? 'ل.س' : '$'}</span>
        )}
        {isPast && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">انتهى</span></div>}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-black leading-tight mb-3 line-clamp-2 group-hover:text-[#CC0000] transition">{a.title}</h3>
        <div className="space-y-1.5 text-xs text-neutral-600 mb-4 flex-1">
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#CC0000]" />{dateStr}</div>
          {timeStr && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#CC0000]" />{timeStr}</div>}
          {a.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#CC0000]" /><span className="truncate">{a.location}</span></div>}
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          {a.requiresRegistration ? (
            isFull ? (
              <span className="text-xs font-bold text-red-600 inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />مكتمل 🔴</span>
            ) : total > 0 ? (
              <span className="text-xs font-bold text-green-700 inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{remaining} مقعد متبقّي</span>
            ) : (
              <span className="text-xs font-bold text-neutral-500 inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />تسجيل مفتوح</span>
            )
          ) : (
            <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" />حضور حر</span>
          )}
          <span className={`text-xs font-bold inline-flex items-center gap-1 ${isFull ? 'text-neutral-400' : 'text-[#CC0000] group-hover:translate-x-[-2px] transition'}`}>
            {a.requiresRegistration ? (isFull ? 'مكتمل' : 'سجّل الآن') : 'التفاصيل'}
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </span>
        </div>
      </div>
    </a>
  )
}
