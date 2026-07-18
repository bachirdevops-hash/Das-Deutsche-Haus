'use client'
import { useState } from 'react'

// Reusable luxury auth input with icon, focus ring (gold), and trailing slot
export function AuthInput({ icon: Icon, label, value, onChange, type = 'text', required, minLength, placeholder, trailing, dir, autoComplete }) {
  const [focus, setFocus] = useState(false)
  return (
    <div>
      <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 px-1 tracking-wide uppercase">{label}</label>
      <div className={`flex items-center gap-2.5 h-12 px-3.5 rounded-xl border-2 bg-white transition-all duration-200 ${focus ? 'border-[#FFCE00] shadow-[0_0_0_4px_rgba(255,206,0,0.15)]' : 'border-neutral-200 hover:border-neutral-300'}`}>
        {Icon && <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${focus ? 'text-[#CC0000]' : 'text-neutral-400'}`} strokeWidth={2.2} />}
        <input
          type={type}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          dir={dir}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-neutral-400 text-neutral-900 min-w-0"
          style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}
        />
        {trailing}
      </div>
    </div>
  )
}

export default AuthInput
