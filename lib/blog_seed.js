// Default blog seed data — Arabic-first content
import { v4 as uuidv4 } from 'uuid'

export const BLOG_CATEGORIES = ['education', 'news', 'tips', 'germany_life', 'success', 'other']

const slugify = (s) => {
  // Try Latin first; fallback to short uuid for Arabic-only titles
  const latin = (s || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  // If only dashes/numbers/empty (no real letters), fallback
  if (!latin || !/[a-z]/.test(latin)) return `post-${uuidv4().slice(0, 8)}`
  return latin
}

const author = { name: 'فريق Das Deutsche Haus', photo: '' }
const authorDE = { name: 'Das Deutsche Haus Team', photo: '' }

const DEFAULT_POSTS_DE = [
  {
    title: 'Wie wählen Sie den richtigen Deutschkurs?',
    category: 'education',
    excerpt: 'Ein vollständiger Leitfaden zur Auswahl des richtigen Sprachniveaus von A1 bis C2 — nach Ihren Zielen und Ihrem aktuellen Niveau.',
    coverImage: 'https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg',
    content: `<p>Deutsch zu lernen ist eine lange Reise, und die Wahl des richtigen Kurses von Anfang an spart Ihnen Zeit und Geld. In diesem Artikel erklären wir, wie Sie Ihr Einstiegsniveau bestimmen.</p>
<h2>1. Definieren Sie Ihr Ziel</h2>
<p>Bevor Sie sich für einen Kurs anmelden, fragen Sie sich: Möchten Sie in Deutschland arbeiten? Studieren? Oder einfach nur kommunizieren?</p>
<ul><li>Für Gesundheitsberufe: mindestens <strong>B2</strong></li><li>Für die Universität: <strong>C1</strong> oder <strong>TestDaF</strong></li><li>Für eine Ausbildung: meistens <strong>B1</strong> ausreichend</li></ul>
<h2>2. Einstufungstest</h2>
<p>Bei Das Deutsche Haus bieten wir einen kostenlosen Online-Einstufungstest an, der Ihr genaues Niveau bestimmt.</p>
<blockquote>Tipp: Beginnen Sie nicht auf einem Niveau, das über Ihren Fähigkeiten liegt — Sie verlieren die Grundlagen und werden später Schwierigkeiten haben.</blockquote>
<h2>3. Dauer der Niveaus</h2>
<p>Jedes Niveau dauert in der Regel 4 bis 8 Wochen Intensivkurs (15 Stunden pro Woche).</p>`,
    metaDescription: 'Wie Sie das richtige Niveau Ihres Deutschkurses wählen, um Ihre Studien- oder Arbeitsziele in Deutschland zu erreichen.',
  },
  {
    title: '10 Dinge, die Sie vor der Reise nach Syrien wissen sollten',
    category: 'germany_life',
    excerpt: 'Vom Visum bis zur SIM-Karte — ein praktischer Leitfaden für deutsche Reisende, die Syrien zum ersten Mal besuchen.',
    coverImage: 'https://images.unsplash.com/photo-1737275848383-77b3a089dab2',
    content: `<p>Eine Reise nach Syrien ist ein einzigartiges Abenteuer. Hier sind die 10 wichtigsten Dinge, die Sie vor Ihrer Abreise wissen sollten.</p>
<h2>1. Visum</h2>
<p>Deutsche Staatsbürger benötigen ein Visum. Wir bei Das Deutsche Haus helfen Ihnen beim gesamten Antragsprozess (5–10 Werktage Bearbeitung).</p>
<h2>2. Sicherheit</h2>
<p>Die touristischen Hauptstädte (Damaskus, Aleppo, Palmyra, Latakia) sind seit 2024 wieder sicher zugänglich. 24/7 deutschsprachiger Notfallsupport.</p>
<h2>3. Währung</h2>
<p>USD und EUR werden weitgehend akzeptiert. Bringen Sie Bargeld in kleinen Stückelungen mit.</p>
<h2>4. Sprache</h2>
<blockquote>Auch wenn Sie kein Arabisch sprechen — alle unsere Guides sprechen fließend Deutsch!</blockquote>
<h2>5–10. Weitere wichtige Tipps</h2>
<ul><li>SIM-Karte am Flughafen kaufen (5–10 EUR/Woche)</li><li>Kreditkarten funktionieren eingeschränkt — Bargeld bevorzugen</li><li>Beste Reisezeit: März–Mai und September–November</li><li>Respektvolle Kleidung beim Besuch von Moscheen</li><li>Internet/WLAN in Hotels und Cafés verfügbar</li><li>24/7 WhatsApp-Support von Das Deutsche Haus</li></ul>`,
    metaDescription: '10 wesentliche Tipps für deutsche Touristen, die Syrien besuchen — Visum, Sicherheit, Währung, Sprache und mehr.',
  },
  {
    title: 'Erfolgsgeschichte: Klaus aus München entdeckt Damaskus',
    category: 'success',
    excerpt: 'Wie Klaus, ein 45-jähriger Architekt aus München, eine unvergessliche 10-tägige Reise durch Syrien mit Das Deutsche Haus erlebte.',
    coverImage: 'https://images.unsplash.com/photo-1602674471917-2f5fbd54535e',
    content: `<p><strong>Klaus Müller</strong>, 45 Jahre alt, Architekt aus München, hatte schon immer einen Traum: Syrien zu besuchen, das Land mit 10.000 Jahren Geschichte. Im Frühjahr 2026 wurde dieser Traum Wirklichkeit.</p>
<h2>Die Vorbereitung</h2>
<p>Klaus kontaktierte Das Deutsche Haus über die WhatsApp-Hotline. Innerhalb von 24 Stunden erhielt er eine maßgeschneiderte 10-tägige Tour: Damaskus, Palmyra, Aleppo, Krak des Chevaliers.</p>
<h2>Die Reise</h2>
<blockquote>"Ich war sprachlos. Damaskus ist wie ein lebendiges Museum. Die Menschen, das Essen, die Architektur — alles übertraf meine Erwartungen." — Klaus</blockquote>
<h2>Höhepunkte</h2>
<ul><li>Sonnenaufgang in Palmyra zwischen den antiken Säulen</li><li>Abendessen mit einer syrischen Familie in der Altstadt</li><li>Aleppo-Zitadelle und der traditionelle Souq</li><li>Krak des Chevaliers Kreuzritterburg</li></ul>
<h2>Fazit</h2>
<p>"Ich werde wiederkommen. Syrien hat eine Magie, die man erlebt haben muss."</p>`,
    metaDescription: 'Eine echte Erfolgsgeschichte: Wie ein deutscher Architekt aus München eine unvergessliche Reise durch Syrien erlebte.',
  },
]

const DEFAULT_POSTS = [
  {
    title: 'كيف تختار كورس اللغة الألمانية المناسب لك؟',
    category: 'education',
    excerpt: 'دليلك الشامل لاختيار المستوى الدراسي الصحيح من A1 إلى C2 وفقاً لأهدافك ومستواك الحالي.',
    coverImage: 'https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg',
    content: `<p>تعلّم اللغة الألمانية رحلة طويلة، واختيار الكورس المناسب من البداية يوفّر عليك الوقت والمال. في هذا المقال نستعرض كيف تحدّد المستوى الذي يجب أن تبدأ منه.</p>
<h2>1. تحديد الهدف من تعلّم الألمانية</h2>
<p>قبل التسجيل في أي كورس، اسأل نفسك: هل تريد العمل في ألمانيا؟ الدراسة الجامعية؟ التواصل اليومي فقط؟</p>
<ul><li>للعمل في مهن صحية: تحتاج <strong>B2</strong> كحدّ أدنى</li><li>للجامعة: <strong>C1</strong> أو <strong>TestDaF</strong></li><li>لـ Ausbildung: <strong>B1</strong> غالباً كافٍ</li></ul>
<h2>2. اختبار تحديد المستوى</h2>
<p>نقدّم في Das Deutsche Haus اختبار تحديد مستوى مجاني عبر الإنترنت يحدّد لك بدقة من أين تبدأ.</p>
<blockquote>نصيحة: لا تبدأ من مستوى أعلى من قدراتك — ستفقد الأساسيات وستعاني لاحقاً.</blockquote>
<h2>3. مدّة كل مستوى</h2>
<p>عادةً ما يستغرق كل مستوى من 4 إلى 8 أسابيع للدراسة المكثّفة (15 ساعة أسبوعياً).</p>`,
    metaDescription: 'كيف تختار المستوى المناسب من كورسات اللغة الألمانية لتحقيق أهدافك في الدراسة أو العمل في ألمانيا.',
  },
  {
    title: 'نصائح ذهبية لاجتياز امتحان telc B1 من المرة الأولى',
    category: 'tips',
    excerpt: 'استراتيجيات عملية واستراتيجيات حل مفصّلة لكل قسم من أقسام امتحان telc B1: استماع، قراءة، كتابة، ومحادثة.',
    coverImage: 'https://images.pexels.com/photos/4348078/pexels-photo-4348078.jpeg',
    content: `<p>امتحان <strong>telc B1</strong> هو البوابة الرسمية للحصول على تأشيرة العمل أو Ausbildung في ألمانيا. إليك أهم النصائح لاجتيازه.</p>
<h2>قسم الاستماع (Hörverstehen)</h2>
<ul><li>اقرأ الأسئلة قبل بدء التسجيل</li><li>ركّز على الكلمات المفتاحية فقط</li><li>تدرّب على لهجات مختلفة (ZDF, Deutsche Welle)</li></ul>
<h2>قسم القراءة (Leseverstehen)</h2>
<ul><li>اقرأ السؤال أولاً ثم النص</li><li>لا تقرأ كل كلمة — استخدم القراءة السريعة</li><li>إدارة الوقت: لا تقضِ أكثر من 4 دقائق على نص</li></ul>
<h2>قسم الكتابة (Schriftlicher Ausdruck)</h2>
<p>يجب أن تكتب رسالة من <strong>150-200 كلمة</strong>. استخدم القالب التالي:</p>
<ol><li>المخاطبة الرسمية: Sehr geehrte Damen und Herren</li><li>المقدّمة: ich schreibe Ihnen, weil...</li><li>المحتوى الرئيسي: 3-4 جمل</li><li>الخاتمة: Mit freundlichen Grüßen</li></ol>
<h2>قسم المحادثة (Mündlicher Ausdruck)</h2>
<blockquote>الثقة أهم من الكمال — تكلّم بهدوء وتجنّب فترات الصمت الطويلة.</blockquote>`,
    metaDescription: 'استراتيجيات وأسرار لاجتياز امتحان telc B1 في المرّة الأولى — من خبراء Das Deutsche Haus.',
  },
  {
    title: 'قصة نجاح: من حلب إلى ميونخ — رحلة علي مع Ausbildung',
    category: 'success',
    excerpt: 'كيف تمكّن علي البالغ من العمر 22 عاماً من الانتقال من حلب إلى ميونخ والحصول على عقد تدريب مهني في شركة BMW.',
    coverImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    content: `<p>قبل عامين، كان <strong>علي</strong> يدرس في حلب ويحلم بالعمل في ألمانيا. اليوم، يعيش في ميونخ ويتدرّب في BMW. هذه قصته كما رواها لنا.</p>
<h2>البداية: كورس A1 في Das Deutsche Haus</h2>
<p>سجّل علي في كورس A1 المكثّف في فرعنا في دمشق. كان يدرس 4 ساعات يومياً، 5 أيام في الأسبوع.</p>
<blockquote>"أصعب مرحلة كانت الأسابيع الأولى — كل شيء جديد. لكن المعلّم كان رائعاً وجعلني أحبّ اللغة." — علي</blockquote>
<h2>المستويات تتراكم: A2, B1</h2>
<ul><li>A1: 6 أسابيع</li><li>A2: 8 أسابيع</li><li>B1: 10 أسابيع + امتحان telc B1 (نجح بدرجة 85%)</li></ul>
<h2>الـ Ausbildung: التقديم والمقابلة</h2>
<p>قدّم علي عبر برنامج Das Deutsche Haus لـ Ausbildung، وتمّت المقابلة عبر Zoom. حصل على عقد <strong>Mechatroniker</strong> في BMW براتب شهري €1,180.</p>
<h2>الحياة في ميونخ</h2>
<p>"الانتقال صعب في البداية، لكن الزملاء ساعدوني كثيراً. الحياة هنا مختلفة لكنها تستحقّ كل لحظة من الجهد."</p>`,
    metaDescription: 'قصة نجاح حقيقية: كيف انتقل علي من حلب إلى ميونخ وحصل على Ausbildung في BMW عبر Das Deutsche Haus.',
  },
  {
    title: '10 أشياء يجب أن تعرفها قبل السفر إلى ألمانيا',
    category: 'germany_life',
    excerpt: 'من فتح الحساب البنكي إلى التأمين الصحي والـ Anmeldung — دليل شامل لأول 30 يوماً في ألمانيا.',
    coverImage: 'https://images.pexels.com/photos/3933842/pexels-photo-3933842.jpeg',
    content: `<p>الانتقال إلى ألمانيا قرار كبير. هذه قائمة بأهم 10 أشياء يجب الانتباه لها فور وصولك.</p>
<h2>1. التسجيل في البلدية (Anmeldung)</h2>
<p>خلال <strong>14 يوماً</strong> من وصولك، يجب التسجيل في البلدية المحلية. هذه الخطوة شرط أساسي لكل ما يأتي بعدها.</p>
<h2>2. فتح حساب بنكي</h2>
<p>أنصح بـ N26 أو DKB لسهولة الفتح للأجانب — يمكنك إنشاء الحساب أونلاين خلال 10 دقائق.</p>
<h2>3. التأمين الصحي (Krankenversicherung)</h2>
<p>إجباري! اختر بين TK, AOK, Barmer. التكلفة تقريباً <strong>€110/شهر</strong> للطلاب.</p>
<h2>4. شريحة الهاتف</h2>
<p>ALDI Talk أو Lidl Connect: عقد مرن وأسعار رخيصة (€10/شهر مع 5GB).</p>
<h2>5. تأشيرة الإقامة</h2>
<p>ستحتاج لتحويل تأشيرة الدخول إلى Aufenthaltstitel في مكتب الأجانب (Ausländerbehörde).</p>
<h2>6-10. باقي القائمة</h2>
<ul><li>رقم ضريبي (Steueridentifikationsnummer)</li><li>شراء بطاقة المواصلات الشهرية</li><li>تسجيل البريد عند Deutsche Post</li><li>الاشتراك في GEZ (رسم البثّ العام)</li><li>التواصل مع الجالية المحلية</li></ul>`,
    metaDescription: '10 خطوات أساسية يجب القيام بها فور الوصول إلى ألمانيا — من Anmeldung إلى التأمين الصحي.',
  },
  {
    title: 'افتتاح فرعنا الجديد في حلب — أبواب مفتوحة للجميع',
    category: 'news',
    excerpt: 'يسرّنا الإعلان عن افتتاح فرع Das Deutsche Haus الثاني في حلب لخدمة طلابنا في الشمال السوري.',
    coverImage: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg',
    content: `<p>بعد نجاح فرع دمشق، يسعدنا إعلان افتتاح فرعنا الجديد في <strong>حلب</strong> ابتداءً من الشهر القادم.</p>
<h2>الموقع</h2>
<p>الفرع يقع في قلب حي الفرقان — قريب من جميع المواصلات العامة وسهل الوصول.</p>
<h2>الكورسات المتاحة</h2>
<ul><li>كورسات لغة من A1 إلى C1</li><li>تحضير امتحانات telc</li><li>استشارات Ausbildung</li><li>استشارات تأشيرات الدراسة والعمل</li></ul>
<h2>عروض الافتتاح</h2>
<blockquote>خصم 25% على كورسات الافتتاح + اختبار تحديد مستوى مجاني للجميع.</blockquote>
<p>للتسجيل أو الاستفسار، تواصل معنا عبر WhatsApp 24/7.</p>`,
    metaDescription: 'افتتاح فرع Das Deutsche Haus الجديد في حلب مع عروض حصرية على كورسات اللغة الألمانية.',
  },
]

export async function seedBlogIfEmpty(db) {
  const existing = await db.collection('blog_posts').countDocuments().catch(() => 0)
  if (existing > 0) return
  const now = Date.now()
  const arDocs = DEFAULT_POSTS.map((p, i) => {
    const slug = slugify(p.title) + '-' + uuidv4().slice(0, 6)
    return {
      id: uuidv4(), slug, language: 'ar',
      title: p.title, category: p.category, content: p.content, excerpt: p.excerpt,
      coverImage: p.coverImage, author: { ...author }, status: 'Published',
      publishDate: new Date(now - i * 86400000 * 3).toISOString(),
      metaDescription: p.metaDescription, views: Math.floor(Math.random() * 200) + 50,
      createdAt: new Date(now - i * 86400000 * 3).toISOString(),
    }
  })
  const deDocs = DEFAULT_POSTS_DE.map((p, i) => {
    const slug = slugify(p.title) + '-' + uuidv4().slice(0, 6)
    return {
      id: uuidv4(), slug, language: 'de',
      title: p.title, category: p.category, content: p.content, excerpt: p.excerpt,
      coverImage: p.coverImage, author: { ...authorDE }, status: 'Published',
      publishDate: new Date(now - i * 86400000 * 2).toISOString(),
      metaDescription: p.metaDescription, views: Math.floor(Math.random() * 150) + 30,
      createdAt: new Date(now - i * 86400000 * 2).toISOString(),
    }
  })
  await db.collection('blog_posts').insertMany([...arDocs, ...deDocs])
}

export const slugifyTitle = slugify
