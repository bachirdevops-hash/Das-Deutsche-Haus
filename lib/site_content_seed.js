// Seed file for site_content + dynamic lists (team, partnerships, visa types, FAQs, consultation types)
// Idempotent: only inserts if collection/key empty.
import { v4 as uuidv4 } from 'uuid'

// ===== SECTION KEYS =====
export const CONTENT_KEYS = [
  'home_hero',          // 🆕 hero badge + quick badge
  'home_highlights',    // 🆕 3 quick cards under hero
  'home_featured',      // 🆕 featured programs section title/subtitle
  'home_stats',
  'home_why',
  'home_testimonials',
  'home_news',          // 🆕 recent news section header
  'home_events',        // 🆕 events section header
  'home_cta',
  'about_hero',
  'about_mission',
  'visa_page',
]

// ===== DEFAULT CONTENT =====
const DEFAULTS = {
  home_hero: {
    badge: 'تسجيلات سبتمبر 2026 — مفتوحة الآن',
    badgePin: 'جديد',
    cta1Label: 'سجّل في كورس',
    cta1Action: 'goto:courses',
    cta2Label: 'احجز امتحان telc',
    cta2Action: 'goto:telc',
  },
  home_highlights: {
    title: '',
    subtitle: '',
    items: [
      { id: 'h1', icon: 'Trophy', value: '94%', title: 'نسبة نجاح telc', description: 'تجاوز طلابنا امتحانات telc الرسمية بمعدل اجتياز 94% — من بين الأعلى في المنطقة.', color: '#FFCE00', order: 1 },
      { id: 'h2', icon: 'Users', value: '1 : 12', title: 'طالب لكل مدرّس', description: 'صفوف صغيرة بمعدل 12 طالباً للمدرّس الواحد — اهتمام شخصي وتعليم مكثّف.', color: '#CC0000', order: 2 },
      { id: 'h3', icon: 'Globe', value: '🇸🇾 → 🇩🇪', title: 'جسر سوريا - ألمانيا', description: 'تواصل مباشر مع مدرّسين ومستشارين من ألمانيا، شراكات حصرية مع شركات Ausbildung.', color: '#1A1A1A', order: 3 },
    ],
  },
  home_featured: {
    title: 'الكورسات المُميّزة',
    subtitle: 'تعلّم الألمانية بأحدث الأساليب — كل المستويات من A1 إلى C2',
    showAll: true,
    ctaLabel: 'كل الكورسات',
    ctaAction: 'goto:courses',
  },
  home_stats: {
    items: [
      { id: 's1', value: '4,200+', label: 'طالب وطالبة', icon: 'Users', color: '#CC0000', order: 1 },
      { id: 's2', value: '180+', label: 'كورس مكتمل', icon: 'BookOpen', color: '#1A1A1A', order: 2 },
      { id: 's3', value: '94%', label: 'نسبة نجاح telc', icon: 'Trophy', color: '#FFCE00', order: 3 },
      { id: 's4', value: '25+', label: 'شريك ألماني', icon: 'Building2', color: '#2C5F9E', order: 4 },
    ],
  },
  home_why: {
    title: 'لماذا Das Deutsche Haus؟',
    subtitle: 'خبرة، اعتماد، ونتائج موثّقة',
    cards: [
      { id: 'w1', icon: 'ShieldCheck', title: 'مركز telc معتمد', description: 'نُجري امتحانات telc الرسمية المعتمدة من السفارات الألمانية والجامعات الأوروبية.', color: '#CC0000', order: 1 },
      { id: 'w2', icon: 'GraduationCap', title: 'مدرّسون متخصصون', description: 'فريق تدريسي حاصل على شهادات DAF/DAZ ألمانية.', color: '#1A1A1A', order: 2 },
      { id: 'w3', icon: 'Briefcase', title: 'شراكات ألمانية حصرية', description: 'عقود Ausbildung مع شركات كبرى مثل Siemens، BMW، Charité.', color: '#FFCE00', order: 3 },
    ],
  },
  home_testimonials: {
    title: 'ماذا يقول طلابنا',
    subtitle: 'قصص نجاح حقيقية من خرّيجي المعهد',
  },
  home_news: {
    title: 'آخر الأخبار والمقالات',
    subtitle: 'مقالات تعليمية، نصائح للتأشيرات، وتحديثات المعهد',
    ctaLabel: 'كل المقالات',
    ctaAction: 'href:/blog',
  },
  home_events: {
    title: 'الفعاليات والأنشطة القادمة',
    subtitle: 'ورش، لقاءات، ومحاضرات — انضمّ إلينا',
    ctaLabel: 'كل الفعاليات',
    ctaAction: 'href:/activities',
  },
  home_cta: {
    title: 'جاهز لبدء رحلتك إلى ألمانيا؟',
    subtitle: 'انضمّ إلى أكثر من 4,000 طالب وطالبة بدأوا رحلتهم معنا',
    button1: { label: 'اكتشف الكورسات', action: 'goto:courses', enabled: true },
    button2: { label: 'احجز امتحان telc', action: 'goto:telc', enabled: true },
    button3: { label: 'احجز استشارة', action: 'href:/visa-types#booking', enabled: true },
  },
  about_hero: {
    title: 'عن المعهد',
    subtitle: 'منذ 2018 — جسر بين سوريا وألمانيا',
  },
  about_mission: {
    storyTitle: 'قصتنا',
    story: 'تأسس Das Deutsche Haus عام 2018 على يد فريق من الأكاديميين الألمان والسوريين بهدف بناء جسر تعليمي وثقافي حقيقي بين سوريا وألمانيا. خرّجنا أكثر من 4,200 طالب وطالبة، وأرسلنا 850+ متدرّباً إلى Ausbildung، ونسبة اجتياز telc 94%.',
    missionTitle: 'رسالتنا',
    mission: 'تمكين الشباب السوري من الوصول إلى التعليم والعمل في ألمانيا من خلال تدريب لغوي عالي الجودة، استشارات تأشيرات موثوقة، وشراكات أكاديمية ومهنية حصرية.',
    visionTitle: 'رؤيتنا',
    vision: 'أن نكون البوابة الأولى والأكثر موثوقية للتواصل الأكاديمي والثقافي بين سوريا وألمانيا، ونساهم في بناء جيل سوري عالمي.',
    teamTitle: 'فريق العمل',
    accredTitle: 'الاعتمادات والشراكات',
  },
  visa_page: {
    heroTitle: 'خدمات التأشيرات والاستشارات',
    heroSubtitle: 'دليلك الشامل للسفر والدراسة والعمل في ألمانيا',
    cardsTitle: 'أنواع التأشيرات التي ندعمها',
    cardsSubtitle: 'نُرشدك خطوة بخطوة في كل نوع تأشيرة',
    faqTitle: 'الأسئلة الشائعة',
    faqSubtitle: 'إجابات سريعة عن أكثر ما يهمّك',
    bookingTitle: 'احجز موعد استشارة',
    bookingSubtitle: 'احجز جلسة مع أحد مستشارينا — نُجيب على كل أسئلتك',
  },
}

// ===== DEFAULT LISTS =====
const DEFAULT_TEAM_MEMBERS = [
  { id: uuidv4(), name: 'Dr. Klaus Müller', role: 'مدير أكاديمي', bio: 'دكتوراه في علم اللغة التطبيقي من جامعة هايدلبرغ. خبرة 15+ سنة في تدريس اللغة الألمانية للناطقين بغيرها.', photo: '', order: 1, published: true, linkedIn: '', email: '' },
  { id: uuidv4(), name: 'فاطمة عبد الله', role: 'منسقة telc', bio: 'حاصلة على شهادة DaF من معهد جوته. مسؤولة عن تنسيق امتحانات telc وضمان جودة التدريب.', photo: '', order: 2, published: true, linkedIn: '', email: '' },
]

const DEFAULT_PARTNERSHIPS = [
  { id: uuidv4(), name: 'telc GmbH Frankfurt', logo: '', order: 1, published: true, link: 'https://www.telc.net' },
  { id: uuidv4(), name: 'Goethe-Institut', logo: '', order: 2, published: true, link: 'https://www.goethe.de' },
  { id: uuidv4(), name: 'IHK Berlin', logo: '', order: 3, published: true, link: '' },
  { id: uuidv4(), name: 'DAAD', logo: '', order: 4, published: true, link: 'https://www.daad.de' },
  { id: uuidv4(), name: 'BAMF', logo: '', order: 5, published: true, link: '' },
  { id: uuidv4(), name: 'Charité Berlin', logo: '', order: 6, published: true, link: '' },
]

const DEFAULT_VISA_TYPES = [
  { id: uuidv4(), title: 'تأشيرة دراسة', description: 'للقبول الجامعي والكورسات اللغوية والتحضيرية في ألمانيا.', emoji: '🎓', color: '#CC0000', order: 1, published: true, link: '' },
  { id: uuidv4(), title: 'تأشيرة عمل (Blue Card)', description: 'للعقود المهنية للحاصلين على شهادات جامعية معترف بها.', emoji: '💼', color: '#1A1A1A', order: 2, published: true, link: '' },
  { id: uuidv4(), title: 'تأشيرة تدريب مهني (Ausbildung)', description: 'لعقود التدريب المهني مع شركات ألمانية كبرى.', emoji: '🏆', color: '#FFCE00', order: 3, published: true, link: '' },
  { id: uuidv4(), title: 'لمّ شمل عائلي', description: 'لانضمام أفراد العائلة إلى مقيمين أو مواطنين في ألمانيا.', emoji: '👨‍👩‍👧', color: '#2C5F9E', order: 4, published: true, link: '' },
]

const DEFAULT_VISA_FAQS = [
  { id: uuidv4(), question: 'كم يستغرق الحصول على تأشيرة الدراسة؟', answer: 'عادةً بين 6 إلى 12 أسبوعاً حسب السفارة وفترة الذروة. ننصح بتقديم الطلب قبل 3 أشهر على الأقل من بدء الكورس.', order: 1, published: true },
  { id: uuidv4(), question: 'هل يجب فتح حساب مسدود (Sperrkonto)؟', answer: 'نعم، يُطلب لإثبات القدرة المالية. المبلغ المطلوب لعام 2026 هو €11,208 (حوالي €934 شهرياً لمدة سنة).', order: 2, published: true },
  { id: uuidv4(), question: 'ما المستوى اللغوي المطلوب للدراسة في ألمانيا؟', answer: 'B2 على الأقل للدراسة الأكاديمية، وC1 لبعض التخصصات الطبية والقانونية. كورسات اللغة المُكثّفة تتطلّب A1 على الأقل.', order: 3, published: true },
  { id: uuidv4(), question: 'هل تُرتّبون موعد السفارة الألمانية؟', answer: 'نعم، نُساعدك في حجز موعد السفارة، تجهيز الأوراق الكاملة، وتدريبك على المقابلة الشخصية.', order: 4, published: true },
  { id: uuidv4(), question: 'ما هي تكلفة الاستشارة؟', answer: 'الاستشارة الأولى (30 دقيقة) مجانية تماماً. الاستشارات المتقدمة تبدأ من $50 وتشمل مراجعة كاملة لملفك.', order: 5, published: true },
]

const DEFAULT_CONSULTATION_TYPES = [
  { id: uuidv4(), name: 'استشارة عامة (مجانية)', description: 'جلسة استكشافية لتقييم وضعك واختيار المسار المناسب', durationMinutes: 30, price: 0, order: 1, published: true },
  { id: uuidv4(), name: 'استشارة تأشيرة دراسة', description: 'مراجعة كاملة لملف الدراسة + توجيهات السفارة', durationMinutes: 60, price: 50, order: 2, published: true },
  { id: uuidv4(), name: 'استشارة تأشيرة عمل / Blue Card', description: 'تقييم المؤهلات + مساعدة في معادلة الشهادات', durationMinutes: 60, price: 70, order: 3, published: true },
  { id: uuidv4(), name: 'استشارة Ausbildung', description: 'اختيار التخصص المناسب + ربطك بالشركاء', durationMinutes: 45, price: 40, order: 4, published: true },
  { id: uuidv4(), name: 'استشارة لمّ شمل', description: 'مراجعة المتطلبات وتجهيز الأوراق', durationMinutes: 45, price: 50, order: 5, published: true },
]

// ===== SEEDER =====
export async function seedSiteContentIfEmpty(db) {
  // Seed site_content keys
  for (const key of CONTENT_KEYS) {
    const exists = await db.collection('site_content').findOne({ key })
    if (!exists) {
      await db.collection('site_content').insertOne({
        key,
        data: DEFAULTS[key] || {},
        updatedAt: new Date().toISOString(),
      })
    }
  }
  // Seed lists if empty
  const seedList = async (coll, items) => {
    const cnt = await db.collection(coll).countDocuments()
    if (cnt === 0 && items.length > 0) {
      const stamped = items.map(it => ({ ...it, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }))
      await db.collection(coll).insertMany(stamped)
    }
  }
  await seedList('team_members', DEFAULT_TEAM_MEMBERS)
  await seedList('partnerships', DEFAULT_PARTNERSHIPS)
  await seedList('visa_types', DEFAULT_VISA_TYPES)
  await seedList('visa_faqs', DEFAULT_VISA_FAQS)
  await seedList('consultation_types', DEFAULT_CONSULTATION_TYPES)
}
