// One-off cleanup: remove telc references from CMS content stored in MongoDB.
// IMPORTANT: telc_exams & telc_bookings collections are intentionally NOT touched (user wants data preserved).
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME
if (!MONGO_URL || !DB_NAME) { console.error('Missing MONGO_URL/DB_NAME'); process.exit(1) }

const REPLACEMENTS = [
  ['احجز امتحان telc', 'تواصل معنا'],
  ['goto:telc', 'goto:contact'],
  ['تجاوز طلابنا امتحانات telc الرسمية بمعدل اجتياز 94%', 'اجتاز طلابنا امتحانات اللغة الرسمية بمعدل نجاح 94%'],
  ['نسبة نجاح telc', 'نسبة النجاح'],
  ['مركز telc معتمد', 'تعليم معتمد وموثوق'],
  ['نُجري امتحانات telc الرسمية المعتمدة من السفارات الألمانية والجامعات الأوروبية.', 'مناهج ألمانية معتمدة تؤهلك لشهادات اللغة المعترف بها من السفارات والجامعات الأوروبية.'],
  ['ونسبة اجتياز telc 94%.', 'ونسبة نجاح 94% في امتحانات اللغة الرسمية.'],
  ['telc Prüfung buchen', 'Kontaktiere uns'],
  ['telc B2 Pflege غيّر حياتي', 'كورس B2 للتمريض غيّر حياتي'],
  ['telc B2 Pflege hat mein Leben verändert.', 'Der B2-Pflegekurs hat mein Leben verändert.'],
  ['<li>امتحانات telc الرسمية المعتمدة</li>', ''],
  ['<li>امتحانات telc: لا استرداد (إلا في حالات استثنائية موثّقة)</li>', ''],
  ['<li>Offizielle telc-Prüfungen</li>', ''],
  ['<li>telc-Prüfungen: keine Erstattung (außer in dokumentierten Ausnahmefällen)</li>', ''],
  ['<li>B1: 10 أسابيع + امتحان telc B1 (نجح بدرجة 85%)</li>', '<li>B1: 10 أسابيع + اجتياز امتحان B1 بدرجة 85%</li>'],
  ['<li>تحضير امتحانات telc</li>', '<li>التحضير لامتحانات اللغة الرسمية</li>'],
  ['منسقة telc', 'منسقة الامتحانات'],
  ['مسؤولة عن تنسيق امتحانات telc وضمان جودة التدريب.', 'مسؤولة عن تنسيق الامتحانات الرسمية وضمان جودة التدريب.'],
  ['حجز امتحانات telc وطلب استشارات', 'طلب استشارات السفر والتقديم على Ausbildung'],
  // generic fallbacks (applied last)
  ['امتحانات telc المعتمدة', 'الامتحانات الرسمية المعتمدة'],
  ['امتحانات telc', 'الامتحانات الرسمية'],
  ['امتحان telc', 'الامتحان الرسمي'],
  ['شهادة telc', 'شهادة اللغة الرسمية'],
  ['telc-Prüfungen', 'offizielle Prüfungen'],
]

function applyReplacements(str) {
  let out = str
  for (const [a, b] of REPLACEMENTS) out = out.split(a).join(b)
  return out
}

function deepClean(val) {
  if (typeof val === 'string') return applyReplacements(val)
  if (Array.isArray(val)) return val.map(deepClean)
  if (val && typeof val === 'object') {
    const out = {}
    for (const k of Object.keys(val)) out[k] = deepClean(val[k])
    return out
  }
  return val
}

const client = new MongoClient(MONGO_URL)
await client.connect()
const db = client.db(DB_NAME)
const report = {}

// 1) site_features: delete telc flag row
const f = await db.collection('site_features').deleteMany({ key: 'telc' })
report.site_features_deleted = f.deletedCount

// 2) Deep-clean text collections (NOT telc_exams / telc_bookings)
for (const coll of ['site_content', 'team_members', 'legal_pages']) {
  let changed = 0
  const docs = await db.collection(coll).find({}).toArray()
  for (const doc of docs) {
    const { _id, ...rest } = doc
    const cleaned = deepClean(rest)
    if (JSON.stringify(cleaned) !== JSON.stringify(rest)) {
      await db.collection(coll).updateOne({ _id }, { $set: cleaned })
      changed++
    }
  }
  report[coll + '_updated'] = changed
}

// 3) partners: remove telc GmbH
const p = await db.collection('partners').deleteMany({ name: /telc/i })
report.partners_deleted = p.deletedCount

// 4) blog_posts: delete posts titled about telc, clean the rest
const bp = await db.collection('blog_posts').deleteMany({ title: /telc/i })
report.blog_posts_deleted = bp.deletedCount
let blogChanged = 0
const posts = await db.collection('blog_posts').find({}).toArray()
for (const doc of posts) {
  const { _id, ...rest } = doc
  const cleaned = deepClean(rest)
  if (JSON.stringify(cleaned) !== JSON.stringify(rest)) {
    await db.collection('blog_posts').updateOne({ _id }, { $set: cleaned })
    blogChanged++
  }
}
report.blog_posts_updated = blogChanged

// 5) Verify no telc left in cleaned collections
for (const coll of ['site_content', 'team_members', 'legal_pages', 'partners', 'blog_posts', 'site_features']) {
  const docs = await db.collection(coll).find({}).toArray()
  const hits = docs.filter(d => JSON.stringify(d).toLowerCase().includes('telc'))
  if (hits.length) report['REMAINING_' + coll] = hits.length
}

console.log(JSON.stringify(report, null, 2))
await client.close()
