'use client'
import { MessageCircle } from 'lucide-react'

export function WhatsAppFloat() {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '963111234567'
  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-2xl flex items-center justify-center text-white transition hover:scale-110"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  )
}

export default WhatsAppFloat
