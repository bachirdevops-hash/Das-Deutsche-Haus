'use client'
import { useRef, useEffect, useState } from 'react'
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, RotateCcw, Type } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

// Lightweight contentEditable rich text editor (no external deps)
// Supports: B, I, U, H2, H3, UL, OL, blockquote, link, image (Cloudinary), clear formatting
export function RichTextEditor({ value = '', onChange, placeholder = 'اكتب المقال هنا...' }) {
  const ref = useRef(null)
  const [showLink, setShowLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const fileInputRef = useRef(null)
  const savedRangeRef = useRef(null)

  // initial content
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || ''
  }, [])

  const exec = (cmd, val = null) => {
    ref.current?.focus()
    if (savedRangeRef.current) {
      const sel = window.getSelection()
      sel.removeAllRanges(); sel.addRange(savedRangeRef.current)
    }
    document.execCommand(cmd, false, val)
    handleInput()
  }

  const saveRange = () => {
    const sel = window.getSelection()
    if (sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const handleInput = () => {
    onChange?.(ref.current?.innerHTML || '')
  }

  const insertLink = () => {
    if (!linkUrl) return
    exec('createLink', linkUrl)
    setLinkUrl(''); setShowLink(false)
  }

  const insertImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const sigR = await api.get(`/api/cloudinary/signature?folder=ddh/blog`, { silent: true })
    if (!sigR.ok) { toast.error('فشل الرفع'); return }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('api_key', sigR.data.api_key)
    fd.append('timestamp', sigR.data.timestamp)
    fd.append('signature', sigR.data.signature)
    fd.append('folder', sigR.data.folder)
    if (sigR.data.upload_preset) fd.append('upload_preset', sigR.data.upload_preset)
    const upRes = await fetch(`https://api.cloudinary.com/v1_1/${sigR.data.cloud_name}/image/upload`, { method: 'POST', body: fd })
    const upData = await upRes.json()
    if (upData.secure_url) {
      exec('insertHTML', `<img src="${upData.secure_url}" alt="" style="max-width:100%;border-radius:12px;margin:12px 0" />`)
      toast.success('تم رفع الصورة')
    }
    e.target.value = ''
  }

  const Btn = ({ onClick, title, children, active }) => (
    <button type="button" onMouseDown={(e) => { e.preventDefault(); saveRange() }} onClick={onClick} title={title} className={`p-2 rounded-md transition ${active ? 'bg-[#FFCE00] text-[#1A1A1A]' : 'hover:bg-neutral-200 text-neutral-700'}`}>
      {children}
    </button>
  )

  return (
    <div className="rounded-xl border-2 border-neutral-200 bg-white overflow-hidden focus-within:border-[#FFCE00] transition">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-50 border-b">
        <Btn onClick={() => exec('bold')} title="عريض"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('italic')} title="مائل"><Italic className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('underline')} title="تسطير"><Underline className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-neutral-300 mx-1" />
        <Btn onClick={() => exec('formatBlock', '<h2>')} title="عنوان H2"><Heading2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('formatBlock', '<h3>')} title="عنوان H3"><Heading3 className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('formatBlock', '<p>')} title="فقرة"><Type className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-neutral-300 mx-1" />
        <Btn onClick={() => exec('insertUnorderedList')} title="قائمة نقط"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('insertOrderedList')} title="قائمة أرقام"><ListOrdered className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('formatBlock', '<blockquote>')} title="اقتباس"><Quote className="w-4 h-4" /></Btn>
        <div className="w-px h-5 bg-neutral-300 mx-1" />
        <Btn onClick={() => { saveRange(); setShowLink(!showLink) }} title="رابط" active={showLink}><LinkIcon className="w-4 h-4" /></Btn>
        <Btn onClick={() => fileInputRef.current?.click()} title="صورة"><ImageIcon className="w-4 h-4" /></Btn>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={insertImage} />
        <div className="w-px h-5 bg-neutral-300 mx-1" />
        <Btn onClick={() => exec('removeFormat')} title="إزالة التنسيق"><RotateCcw className="w-4 h-4" /></Btn>
      </div>
      {showLink && (
        <div className="flex gap-2 p-2 bg-yellow-50 border-b">
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-1.5 rounded-lg border text-sm" dir="ltr" autoFocus onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), insertLink())} />
          <button type="button" onClick={insertLink} className="px-3 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-xs font-bold">إدراج</button>
          <button type="button" onClick={() => setShowLink(false)} className="px-3 py-1.5 border rounded-lg text-xs">إلغاء</button>
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={saveRange}
        data-placeholder={placeholder}
        className="min-h-[280px] p-4 text-sm leading-relaxed outline-none ddh-richtext"
        dir="rtl"
        style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}
      />
      <style jsx>{`
        .ddh-richtext:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
        .ddh-richtext h2 { font-size: 1.25rem; font-weight: 800; margin: 0.6em 0 0.3em; color: #1A1A1A; }
        .ddh-richtext h3 { font-size: 1.1rem; font-weight: 700; margin: 0.5em 0 0.25em; color: #333; }
        .ddh-richtext p { margin: 0.5em 0; }
        .ddh-richtext ul, .ddh-richtext ol { padding-inline-start: 1.5em; margin: 0.5em 0; }
        .ddh-richtext ul { list-style: disc; }
        .ddh-richtext ol { list-style: decimal; }
        .ddh-richtext blockquote { border-inline-start: 4px solid #FFCE00; background: #FFF8E0; padding: 0.5em 1em; margin: 0.8em 0; border-radius: 0 8px 8px 0; font-style: italic; }
        .ddh-richtext a { color: #CC0000; text-decoration: underline; }
        .ddh-richtext img { max-width: 100%; border-radius: 12px; margin: 12px 0; }
      `}</style>
    </div>
  )
}

export default RichTextEditor
