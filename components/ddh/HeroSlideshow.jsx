'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

// 10 معالم — تتناوب: ألماني → سوري → ألماني → سوري...
// Verified URLs from Unsplash + Pexels (free for commercial use)
const SLIDES = [
  // 🇩🇪 Brandenburg Gate, Berlin
  { src: 'https://images.unsplash.com/photo-1659413084271-ca1345764e15?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85', alt: 'Brandenburg Gate, Berlin' },
  // 🇸🇾 Umayyad Mosque, Damascus (الجامع الأموي - أيقونة دمشق التاريخية بدون أشخاص)
  { src: 'https://images.unsplash.com/photo-1562457141-8c1df886f92c?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85', alt: 'الجامع الأموي - دمشق' },
  // 🇩🇪 Neuschwanstein Castle, Bavaria
  { src: 'https://images.unsplash.com/photo-1557066911-9184d3f95959?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85', alt: 'Neuschwanstein Castle, Bavaria' },
  // 🇸🇾 Bosra al-Sham (Roman amphitheater)
  { src: 'https://images.pexels.com/photos/37314556/pexels-photo-37314556.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'بصرى الشام - المدرج الروماني' },
  // 🇩🇪 Cologne Cathedral
  { src: 'https://images.unsplash.com/photo-1617375402484-8a196422d93d?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85', alt: 'Cologne Cathedral' },
  // 🇸🇾 Frunloq Pine Forests, Latakia (غابات الفرنلق)
  { src: 'https://images.unsplash.com/photo-1766744228541-6d6d564af736?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85', alt: 'غابات الفرنلق - اللاذقية' },
  // 🇩🇪 Hamburg Speicherstadt
  { src: 'https://images.pexels.com/photos/30195965/pexels-photo-30195965.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Hamburg Speicherstadt' },
  // 🇸🇾 Syrian Coast (Mediterranean)
  { src: 'https://images.unsplash.com/photo-1631607608345-598c70e0410b?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85', alt: 'الساحل السوري' },
  // 🇩🇪 Berlin TV Tower (Fernsehturm)
  { src: 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85', alt: 'Berlin TV Tower' },
  // 🇸🇾 Bab Touma (Old Damascus)
  { src: 'https://images.pexels.com/photos/36947312/pexels-photo-36947312.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'باب توما - دمشق القديمة' },
]

const SLIDE_DURATION = 4000 // 4s
const TRANSITION_DURATION = 1000 // 1s

export default function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(i => (i + 1) % SLIDES.length)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1A1A1A]">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity ease-in-out"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            transitionDuration: `${TRANSITION_DURATION}ms`,
            zIndex: i === activeIndex ? 1 : 0,
          }}
          aria-hidden={i !== activeIndex}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            quality={80}
            priority={i === 0}
            className="object-cover"
            style={{ animation: i === activeIndex ? 'kenBurns 8s ease-out forwards' : 'none' }}
          />
        </div>
      ))}
      {/* Subtle Ken Burns effect for cinematic feel */}
      <style jsx global>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  )
}
