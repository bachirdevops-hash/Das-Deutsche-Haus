'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { FileText, Trash2, AlertTriangle } from 'lucide-react'

// =============== File Upload (Cloudinary signed) ===============
export function FileUpload({ folder, accept, maxSize = 50 * 1024 * 1024, onUploaded, label = 'اسحب الملف هنا أو اضغط للاختيار', kind = 'auto' }) {
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file.size > maxSize) { toast.error(`الحجم أكبر من ${Math.round(maxSize / 1024 / 1024)}MB`); return }
    setBusy(true); setProgress(0)
    try {
      const resourceType = kind === 'image' ? 'image' : kind === 'video' ? 'video' : 'auto'
      const sigRes = await fetch(`/api/cloudinary/signature?folder=${encodeURIComponent(folder)}&resource_type=${resourceType}`)
      const sig = await sigRes.json()
      if (sig.error) { toast.error(sig.error); setBusy(false); return }
      const fd = new FormData()
      fd.append('file', file); fd.append('api_key', sig.api_key); fd.append('timestamp', sig.timestamp); fd.append('signature', sig.signature); fd.append('folder', sig.folder)
      const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)) }
      xhr.onload = () => {
        setBusy(false)
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText)
          onUploaded({ url: res.secure_url, public_id: res.public_id, resource_type: res.resource_type, format: res.format, bytes: res.bytes, name: file.name })
          toast.success('تم الرفع بنجاح')
        } else {
          let msg = 'فشل الرفع'; try { msg = JSON.parse(xhr.responseText).error?.message || msg } catch {}
          toast.error(msg)
        }
      }
      xhr.onerror = () => { setBusy(false); toast.error('خطأ في الاتصال') }
      xhr.send(fd)
    } catch (e) { setBusy(false); toast.error(e.message) }
  }

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${drag ? 'border-[#CC0000] bg-red-50' : 'border-neutral-300 hover:border-[#CC0000] hover:bg-neutral-50'}`}
      onClick={() => !busy && document.getElementById('fu-input-' + folder.replace(/\W/g, '_'))?.click()}>
      <input id={'fu-input-' + folder.replace(/\W/g, '_')} type="file" accept={accept} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      {busy ? (
        <div className="space-y-2">
          <div className="text-sm font-semibold">جاري الرفع... {progress}%</div>
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-[#CC0000] to-[#FFCE00] transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#CC0000]/10 flex items-center justify-center"><FileText className="w-6 h-6 text-[#CC0000]" /></div>
          <div className="font-bold text-sm">{label}</div>
          <div className="text-xs text-neutral-500">الحد الأقصى: {Math.round(maxSize / 1024 / 1024)}MB</div>
        </div>
      )}
    </div>
  )
}

export function fileTypeIcon(format) {
  const f = (format || '').toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(f)) return { icon: '🖼️', label: 'صورة' }
  if (['mp4', 'mov', 'webm', 'avi'].includes(f)) return { icon: '🎬', label: 'فيديو' }
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(f)) return { icon: '🎵', label: 'صوت' }
  if (f === 'pdf') return { icon: '📕', label: 'PDF' }
  if (['doc', 'docx'].includes(f)) return { icon: '📄', label: 'Word' }
  if (['ppt', 'pptx'].includes(f)) return { icon: '📊', label: 'PowerPoint' }
  if (['xls', 'xlsx'].includes(f)) return { icon: '📈', label: 'Excel' }
  return { icon: '📎', label: f?.toUpperCase() || 'ملف' }
}

// =============== Confirm Delete Dialog ===============
export function ConfirmDialog({ title, desc, onConfirm, onCancel }) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" />{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white"><Trash2 className="w-4 h-4 me-1.5" />تأكيد الحذف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============== Empty / Loading ===============
export function Loading({ label = 'جاري التحميل...' }) { return <div className="py-20 text-center text-neutral-500">{label}</div> }
export function Empty({ label = 'لا يوجد عناصر بعد' }) { return <div className="py-12 text-center text-neutral-500 bg-white rounded-2xl border border-dashed">{label}</div> }

// =============== Access Denied ===============
export function AccessDenied() {
  return (
    <section className="py-20 text-center" dir="rtl">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-black mb-2">صلاحيات غير كافية</h2>
      <p className="text-neutral-600">ليس لديك صلاحية الوصول إلى هذه الصفحة</p>
    </section>
  )
}
