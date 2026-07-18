'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, Calendar, FileText, Trophy, Megaphone, MessageSquare, X, Trash2, CheckCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

// Self-contained NotificationBell:
// - All hooks scoped inside (no leakage)
// - Pauses polling when tab hidden (saves API calls + battery)
// - Cleans up timers on unmount
// - Individual delete + navigation on click
export function NotificationBell() {
  const [data, setData] = useState({ notifications: [], unread: 0 })
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const timerRef = useRef(null)

  const refresh = async () => {
    const r = await api.get('/api/notifications', { silent: true })
    if (r.ok && r.data) setData({ notifications: r.data.notifications || [], unread: r.data.unread || 0 })
  }

  useEffect(() => {
    refresh()
    const start = () => {
      if (timerRef.current) return
      timerRef.current = setInterval(refresh, 60000)
    }
    const stop = () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
    const onVis = () => {
      if (document.visibilityState === 'visible') { refresh(); start() } else { stop() }
    }
    start()
    document.addEventListener('visibilitychange', onVis)
    return () => { stop(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  const markAll = async () => {
    setBusy(true)
    try {
      await api.post('/api/notifications/read-all', {}, { silent: true })
      await refresh()
    } finally { setBusy(false) }
  }

  const deleteOne = async (e, id) => {
    e.stopPropagation()
    setBusy(true)
    try {
      const r = await api.delete(`/api/notifications/${id}`, { silent: true })
      if (r.ok) {
        setData(d => ({ notifications: d.notifications.filter(n => n.id !== id), unread: Math.max(0, d.unread - (d.notifications.find(n => n.id === id && !n.read) ? 1 : 0)) }))
      }
    } finally { setBusy(false) }
  }

  const clearRead = async () => {
    setBusy(true)
    try {
      const r = await api.delete('/api/notifications/read', { silent: true })
      if (r.ok) {
        toast.success(`تم حذف ${r.data?.deleted || 0} إشعار مقروء`)
        await refresh()
      }
    } finally { setBusy(false) }
  }

  const clearAll = async () => {
    if (!confirm('هل تريد حذف جميع الإشعارات؟ لا يمكن التراجع.')) return
    setBusy(true)
    try {
      const r = await api.delete('/api/notifications', { silent: true })
      if (r.ok) {
        toast.success(`تم حذف ${r.data?.deleted || 0} إشعار`)
        setData({ notifications: [], unread: 0 })
      }
    } finally { setBusy(false) }
  }

  // Smart navigation on notification click
  const handleClick = async (n) => {
    // 1) Mark as read (optimistic)
    if (!n.read) {
      setData(d => ({
        notifications: d.notifications.map(x => x.id === n.id ? { ...x, read: true } : x),
        unread: Math.max(0, d.unread - 1),
      }))
      api.post(`/api/notifications/${n.id}`, {}, { silent: true }).catch(() => {})
    }

    // 2) Close dropdown
    setOpen(false)

    // 3) Navigate via CustomEvent (App.js listens and switches page/tab)
    if (n.link) {
      window.dispatchEvent(new CustomEvent('ddh-navigate', { detail: { link: n.link, notification: n } }))
    }
  }

  const iconMap = { session: Calendar, material: FileText, grade: Trophy, announcement: Megaphone, chat: MessageSquare }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition" aria-label="Notifications">
        <Bell className="w-4 h-4" />
        {data.unread > 0 && (
          <span className="absolute -top-1 -end-1 w-5 h-5 bg-[#CC0000] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {data.unread > 9 ? '9+' : data.unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 mt-2 w-[92vw] max-w-[380px] bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between gap-2 bg-gradient-to-l from-[#FFCE00]/20 to-white">
              <div className="font-bold flex items-center gap-1.5 shrink-0">
                <Bell className="w-4 h-4 text-[#CC0000]" />
                <span>الإشعارات</span>
                {data.unread > 0 && <span className="text-[10px] bg-[#CC0000] text-white rounded-full px-1.5 py-0.5">{data.unread} جديد</span>}
              </div>
              <div className="flex items-center gap-1">
                {data.unread > 0 && (
                  <button
                    onClick={markAll}
                    disabled={busy}
                    className="text-[11px] font-bold text-[#CC0000] hover:bg-red-50 rounded px-1.5 py-1 flex items-center gap-1 disabled:opacity-50"
                    title="تحديد الكل كمقروء"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قراءة الكل</span>
                  </button>
                )}
                {data.notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={busy}
                    className="text-[11px] font-bold text-neutral-600 hover:bg-neutral-100 hover:text-red-600 rounded px-1.5 py-1 flex items-center gap-1 disabled:opacity-50"
                    title="حذف جميع الإشعارات"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">حذف الكل</span>
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {data.notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-500">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد إشعارات</p>
                  <p className="text-[11px] text-neutral-400 mt-1">ستظهر هنا عند وصولها.</p>
                </div>
              ) : data.notifications.map(n => {
                const Icon = iconMap[n.type || n.kind] || Bell
                const clickable = !!n.link
                return (
                  <div
                    key={n.id}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={() => clickable && handleClick(n)}
                    onKeyDown={e => clickable && (e.key === 'Enter' || e.key === ' ') && handleClick(n)}
                    className={`group relative p-3 border-b text-sm flex gap-3 transition ${!n.read ? 'bg-blue-50/50' : ''} ${clickable ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? 'bg-[#CC0000] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pe-8">
                      <div className="font-bold text-xs">{n.title}</div>
                      <div className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{n.text || n.message}</div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        {new Date(n.createdAt).toLocaleString('ar')}
                        {clickable && <span className="ms-2 text-[#CC0000] font-bold">← اضغط للانتقال</span>}
                      </div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#CC0000] shrink-0 absolute top-3 end-9" />}
                    {/* Delete button — appears on hover, always on touch */}
                    <button
                      onClick={(e) => deleteOne(e, n.id)}
                      disabled={busy}
                      className="absolute top-2 end-2 w-6 h-6 flex items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-600 transition opacity-70 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-30"
                      title="حذف هذا الإشعار"
                      aria-label="حذف"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
            {data.notifications.length > 0 && data.notifications.some(n => n.read) && (
              <div className="p-2 border-t bg-neutral-50/50 flex justify-center">
                <button
                  onClick={clearRead}
                  disabled={busy}
                  className="text-[11px] font-semibold text-neutral-600 hover:text-red-600 flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  حذف الإشعارات المقروءة فقط
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
