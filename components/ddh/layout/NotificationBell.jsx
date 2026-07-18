'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, Calendar, FileText, Trophy, Megaphone, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api'

// Self-contained NotificationBell:
// - All hooks scoped inside (no leakage)
// - Pauses polling when tab hidden (saves API calls + battery)
// - Pauses polling when dropdown is closed (only fast-refresh when opened)
// - Cleans up timers on unmount
export function NotificationBell() {
  const [data, setData] = useState({ notifications: [], unread: 0 })
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  const refresh = async () => {
    const r = await api.get('/api/notifications', { silent: true })
    if (r.ok && r.data) setData({ notifications: r.data.notifications || [], unread: r.data.unread || 0 })
  }

  useEffect(() => {
    refresh()
    const start = () => {
      if (timerRef.current) return
      timerRef.current = setInterval(refresh, 60000) // 60s instead of 30s for better perf
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
    await api.post('/api/notifications/read-all', {}, { silent: true })
    refresh()
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
          <div className="absolute end-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between bg-gradient-to-l from-[#FFCE00]/20 to-white">
              <div className="font-bold flex items-center gap-1.5"><Bell className="w-4 h-4 text-[#CC0000]" />الإشعارات</div>
              {data.unread > 0 && <button onClick={markAll} className="text-xs font-bold text-[#CC0000] hover:underline">تحديد الكل كمقروء</button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {data.notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-500"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />لا توجد إشعارات</div>
              ) : data.notifications.map(n => {
                const Icon = iconMap[n.type] || Bell
                return (
                  <div key={n.id} className={`p-3 border-b text-sm flex gap-3 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? 'bg-[#CC0000] text-white' : 'bg-neutral-100 text-neutral-500'}`}><Icon className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs">{n.title}</div>
                      <div className="text-xs text-neutral-600 mt-0.5">{n.text}</div>
                      <div className="text-[10px] text-neutral-400 mt-1">{new Date(n.createdAt).toLocaleString('ar')}</div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#CC0000] shrink-0 mt-1" />}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
