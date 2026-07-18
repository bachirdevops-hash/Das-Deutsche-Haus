import { v4 as uuidv4 } from 'uuid'

export const ACTIVITY_TYPES = [
  { value: 'workshop', label_ar: 'ورشة عمل', icon: '🛠️', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'lecture', label_ar: 'محاضرة', icon: '🎓', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'celebration', label_ar: 'احتفال', icon: '🎉', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'trip', label_ar: 'رحلة', icon: '🚌', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'open_day', label_ar: 'يوم مفتوح', icon: '🏛️', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'intensive', label_ar: 'دورة مكثّفة', icon: '⚡', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'other', label_ar: 'أخرى', icon: '✨', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
]

export const ACTIVITY_STATUS = [
  { value: 'Draft', label_ar: 'مسودّة', color: 'bg-neutral-100 text-neutral-700' },
  { value: 'Published', label_ar: 'منشور', color: 'bg-green-100 text-green-700' },
  { value: 'Hidden', label_ar: 'مخفي', color: 'bg-amber-100 text-amber-700' },
  { value: 'Cancelled', label_ar: 'ملغى', color: 'bg-red-100 text-red-700' },
]

export const REG_STATUS = [
  { value: 'Pending', label_ar: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
  { value: 'Confirmed', label_ar: 'مؤكَّد', color: 'bg-green-100 text-green-700' },
  { value: 'Cancelled', label_ar: 'ملغى', color: 'bg-red-100 text-red-700' },
]

export const getActivityType = (v) => ACTIVITY_TYPES.find(t => t.value === v) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1]

export function activitySlugify(s) {
  if (!s) return 'activity'
  // Keep Arabic + Latin + numbers, transliterate spaces to dashes
  return String(s).trim().toLowerCase()
    .replace(/[\s\u0600-\u06FF]+/g, m => m.trim() ? '-' + encodeURIComponent(m.trim()).replace(/%/g, '').toLowerCase() : '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'activity'
}

export async function seedActivitiesIfEmpty(db) {
  const cnt = await db.collection('activities').countDocuments()
  if (cnt > 0) return

  const now = new Date()
  const futureDate = (days, hour = 17, min = 0) => {
    const d = new Date(now); d.setDate(d.getDate() + days); d.setHours(hour, min, 0, 0)
    return d.toISOString()
  }

  const samples = [
    {
      id: uuidv4(),
      slug: 'workshop-resume-deutsch',
      title: 'ورشة كتابة السيرة الذاتية بالألمانية',
      type: 'workshop',
      description: '<p>ورشة عملية شاملة تتعلّم فيها كتابة <strong>Lebenslauf</strong> احترافي يطابق المعايير الألمانية. ستحصل على قوالب جاهزة، مراجعة شخصية لسيرتك الذاتية، ونصائح عن خطاب التغطية (Anschreiben).</p><h3>ما الذي ستتعلّمه؟</h3><ul><li>هيكل الـLebenslauf الألماني الرسمي</li><li>الكلمات المفتاحية المهمّة (Keywords)</li><li>كيف تكتب Anschreiben يلفت الانتباه</li><li>مراجعة فردية لسيرتك خلال الورشة</li></ul><p><strong>المُدرّب:</strong> Frau Dr. Sarah Müller — مستشارة موارد بشرية في برلين منذ 12 عاماً.</p>',
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
      date: futureDate(14, 17, 0),
      endTime: futureDate(14, 20, 0),
      location: 'مقر Das Deutsche Haus — دمشق، أبو رمانة',
      mapLink: 'https://maps.google.com/?q=Damascus,Abu+Rummaneh',
      price: 25,
      currency: 'USD',
      isFree: false,
      requiresRegistration: true,
      totalSeats: 20,
      registeredCount: 0,
      registrationDeadline: futureDate(13, 23, 59),
      status: 'Published',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      slug: 'open-day-2026',
      title: 'يوم مفتوح: تعرّف على كورسات الألمانية',
      type: 'open_day',
      description: '<p>افتح أبواب رحلتك إلى ألمانيا في يومنا المفتوح! تعرّف على جميع المستويات (A1 → C2)، احصل على <strong>اختبار تحديد المستوى مجاناً</strong>، وقابل المعلمين قبل التسجيل.</p><h3>أنشطة اليوم:</h3><ul><li>🎤 جلسة تعريفية بالكورسات (10:00 ص)</li><li>📝 اختبار تحديد المستوى (مجاناً)</li><li>☕ ضيافة + لقاءات مع المعلمين</li><li>🎁 خصم 15% لكل من يسجّل في نفس اليوم</li></ul><p>الحضور مفتوح للجميع — أحضر صديقاً!</p>',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
      date: futureDate(7, 10, 0),
      endTime: futureDate(7, 16, 0),
      location: 'مقر Das Deutsche Haus — دمشق',
      mapLink: 'https://maps.google.com/?q=Damascus',
      price: 0,
      currency: 'USD',
      isFree: true,
      requiresRegistration: false,
      totalSeats: 0,
      registeredCount: 0,
      registrationDeadline: '',
      status: 'Published',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      slug: 'lecture-life-in-germany',
      title: 'محاضرة: الحياة اليومية في ألمانيا',
      type: 'lecture',
      description: '<p>محاضرة شاملة من خرّيج ألماني عاد لمشاركة تجربته. تعرّف على كل ما يخصّ <strong>الحياة في ألمانيا</strong>: السكن، التأمين، التنقّل، الثقافة، والعلاقات الاجتماعية.</p><h3>المحاور الرئيسية:</h3><ul><li>إيجاد سكن ميسور (WG، Studentenwohnheim)</li><li>التأمين الصحي والبنوك</li><li>التنقّل والمواصلات (Deutschlandticket)</li><li>الثقافة والعادات الاجتماعية</li><li>قصص حقيقية ونصائح عملية</li></ul><p><strong>المتحدّث:</strong> أ. علي الحلبي — خريج RWTH Aachen، يعيش في ألمانيا منذ 7 سنوات.</p>',
      coverImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
      date: futureDate(21, 19, 0),
      endTime: futureDate(21, 21, 0),
      location: 'قاعة Das Deutsche Haus — دمشق',
      mapLink: 'https://maps.google.com/?q=Damascus',
      price: 0,
      currency: 'USD',
      isFree: true,
      requiresRegistration: true,
      totalSeats: 50,
      registeredCount: 0,
      registrationDeadline: futureDate(20, 23, 59),
      status: 'Published',
      createdAt: new Date().toISOString(),
    },
  ]

  await db.collection('activities').insertMany(samples)
}
