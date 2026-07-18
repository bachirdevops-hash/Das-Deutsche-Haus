// Brand-specific decorative icons (inline SVG, lightweight)
// ============== Brandenburg Gate Icon (Gold) ==============
export const BrandenburgGateIcon = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 80 72" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M28 8 Q31 4 36 5 Q40 4 44 5 Q49 4 52 8" />
    <circle cx="33" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="40" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="47" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <line x1="32" y1="9" x2="32" y2="13" />
    <line x1="40" y1="8.5" x2="40" y2="13" />
    <line x1="48" y1="9" x2="48" y2="13" />
    <path d="M14 16 L40 9 L66 16 Z" fill="currentColor" fillOpacity="0.15" />
    <line x1="12" y1="18" x2="68" y2="18" />
    <line x1="14" y1="21" x2="66" y2="21" />
    <line x1="14" y1="24" x2="66" y2="24" />
    <line x1="18" y1="26" x2="18" y2="60" />
    <line x1="26" y1="26" x2="26" y2="60" />
    <line x1="34" y1="26" x2="34" y2="60" />
    <line x1="46" y1="26" x2="46" y2="60" />
    <line x1="54" y1="26" x2="54" y2="60" />
    <line x1="62" y1="26" x2="62" y2="60" />
    <line x1="20" y1="28" x2="20" y2="58" strokeOpacity="0.5" strokeWidth="0.8" />
    <line x1="28" y1="28" x2="28" y2="58" strokeOpacity="0.5" strokeWidth="0.8" />
    <line x1="36" y1="28" x2="36" y2="58" strokeOpacity="0.5" strokeWidth="0.8" />
    <line x1="48" y1="28" x2="48" y2="58" strokeOpacity="0.5" strokeWidth="0.8" />
    <line x1="56" y1="28" x2="56" y2="58" strokeOpacity="0.5" strokeWidth="0.8" />
    <line x1="64" y1="28" x2="64" y2="58" strokeOpacity="0.5" strokeWidth="0.8" />
    <line x1="12" y1="61" x2="68" y2="61" />
    <line x1="10" y1="64" x2="70" y2="64" />
    <line x1="8" y1="67" x2="72" y2="67" />
    <line x1="6" y1="70" x2="74" y2="70" strokeWidth="2.5" />
  </svg>
)

// ============== Google G Icon (official colors) ==============
export const GoogleIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
)

// ============== German Flag Stripe ==============
export const FlagStripe = ({ className = '' }) => (
  <div className={`flex h-1 w-24 mx-auto rounded-full overflow-hidden shadow-sm ${className}`}>
    <div className="flex-1 bg-[#1A1A1A]" />
    <div className="flex-1 bg-[#CC0000]" />
    <div className="flex-1 bg-[#FFCE00]" />
  </div>
)
