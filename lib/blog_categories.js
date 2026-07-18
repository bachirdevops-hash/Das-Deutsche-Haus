// Bilingual blog category labels
export const BLOG_CATEGORIES = [
  { value: 'education', ar: 'تعليم', de: 'Bildung', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'news', ar: 'أخبار المعهد', de: 'Nachrichten', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'tips', ar: 'نصائح', de: 'Tipps', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'germany_life', ar: 'الحياة في ألمانيا', de: 'Leben in Deutschland', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'success', ar: 'قصص نجاح', de: 'Erfolgsgeschichten', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'other', ar: 'أخرى', de: 'Sonstiges', color: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
]

export const getCategoryLabel = (val, lang = 'ar') => BLOG_CATEGORIES.find(c => c.value === val)?.[lang] || val
export const getCategoryColor = (val) => BLOG_CATEGORIES.find(c => c.value === val)?.color || 'bg-neutral-100 text-neutral-700 border-neutral-300'

export const calcReadTime = (html) => {
  const text = (html || '').replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 180))
}
