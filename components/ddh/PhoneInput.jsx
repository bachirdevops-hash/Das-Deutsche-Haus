'use client'
import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// International dial codes — Middle East first (main audience), then Europe/common
export const DIAL_CODES = [
  { code: '+49', ar: 'ألمانيا', de: 'Deutschland' },
  { code: '+963', ar: 'سوريا', de: 'Syrien' },
  { code: '+962', ar: 'الأردن', de: 'Jordanien' },
  { code: '+961', ar: 'لبنان', de: 'Libanon' },
  { code: '+964', ar: 'العراق', de: 'Irak' },
  { code: '+90', ar: 'تركيا', de: 'Türkei' },
  { code: '+20', ar: 'مصر', de: 'Ägypten' },
  { code: '+966', ar: 'السعودية', de: 'Saudi-Arabien' },
  { code: '+971', ar: 'الإمارات', de: 'VAE' },
  { code: '+965', ar: 'الكويت', de: 'Kuwait' },
  { code: '+974', ar: 'قطر', de: 'Katar' },
  { code: '+973', ar: 'البحرين', de: 'Bahrain' },
  { code: '+968', ar: 'عُمان', de: 'Oman' },
  { code: '+970', ar: 'فلسطين', de: 'Palästina' },
  { code: '+967', ar: 'اليمن', de: 'Jemen' },
  { code: '+218', ar: 'ليبيا', de: 'Libyen' },
  { code: '+216', ar: 'تونس', de: 'Tunesien' },
  { code: '+213', ar: 'الجزائر', de: 'Algerien' },
  { code: '+212', ar: 'المغرب', de: 'Marokko' },
  { code: '+249', ar: 'السودان', de: 'Sudan' },
  { code: '+43', ar: 'النمسا', de: 'Österreich' },
  { code: '+41', ar: 'سويسرا', de: 'Schweiz' },
  { code: '+31', ar: 'هولندا', de: 'Niederlande' },
  { code: '+32', ar: 'بلجيكا', de: 'Belgien' },
  { code: '+33', ar: 'فرنسا', de: 'Frankreich' },
  { code: '+44', ar: 'بريطانيا', de: 'Großbritannien' },
  { code: '+46', ar: 'السويد', de: 'Schweden' },
  { code: '+45', ar: 'الدنمارك', de: 'Dänemark' },
  { code: '+47', ar: 'النرويج', de: 'Norwegen' },
  { code: '+39', ar: 'إيطاليا', de: 'Italien' },
  { code: '+34', ar: 'إسبانيا', de: 'Spanien' },
  { code: '+30', ar: 'اليونان', de: 'Griechenland' },
  { code: '+1', ar: 'أمريكا / كندا', de: 'USA / Kanada' },
]

function parseValue(value) {
  const v = String(value || '').trim()
  if (!v) return null
  const known = DIAL_CODES.map(d => d.code).filter(c => v.startsWith(c)).sort((a, b) => b.length - a.length)[0]
  if (known) return { code: known, digits: v.slice(known.length).replace(/\D/g, '') }
  return { code: null, digits: v.replace(/\D/g, '') }
}

/**
 * Phone field with international dial-code select + digits-only input.
 * Emits the full value as "+49 15254196668" (or '' when empty).
 */
export function PhoneInput({ id, value, onChange, lang = 'ar', defaultCode = '+49', invalid, describedBy }) {
  const parsed = useMemo(() => parseValue(value), [value])
  const [code, setCode] = useState(parsed?.code || defaultCode)
  const digits = parsed?.digits || ''

  // Sync code when a prefilled value (e.g. logged-in user's phone) arrives asynchronously
  useEffect(() => { if (parsed?.code && parsed.code !== code) setCode(parsed.code) }, [parsed?.code]) // eslint-disable-line react-hooks/exhaustive-deps

  const emit = (c, d) => onChange(d ? `${c} ${d}` : '')
  return (
    <div className="flex gap-2" dir="ltr">
      <Select value={code} onValueChange={(c) => { setCode(c); if (digits) emit(c, digits) }}>
        <SelectTrigger className="w-[7.5rem] shrink-0 font-semibold" aria-label={lang === 'ar' ? 'رمز الدولة' : 'Ländervorwahl'}>
          <SelectValue>{code}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {DIAL_CODES.map(d => (
            <SelectItem key={d.code} value={d.code}>{d.code} — {lang === 'ar' ? d.ar : d.de}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id} type="tel" inputMode="numeric" autoComplete="tel-national" className="flex-1"
        placeholder={lang === 'ar' ? 'رقم الهاتف (أرقام فقط)' : 'Telefonnummer (nur Ziffern)'}
        value={digits}
        onChange={(e) => emit(code, e.target.value.replace(/\D/g, '').slice(0, 15))}
        aria-invalid={invalid || undefined} aria-describedby={describedBy}
      />
    </div>
  )
}
