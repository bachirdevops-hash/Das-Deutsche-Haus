// One-off: update contact info (WhatsApp/phone/email) across CMS content in MongoDB.
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME
if (!MONGO_URL || !DB_NAME) { console.error('Missing MONGO_URL/DB_NAME'); process.exit(1) }

const REPLACEMENTS = [
  ['info@dasdeutschehaus.sy', 'info@das-deutsche-haus.com'],
  ['tel:+963111234567', 'tel:+4915254196668'],
  ['+963 11 123 4567', '+49 1525 4196668'],
  ['+963 11 1234567', '+49 1525 4196668'],
  ['963111234567', '4915254196668'],
  ['https://dasdeutschehaus.sy">dasdeutschehaus.sy', 'https://das-deutsche-haus.com">das-deutsche-haus.com'],
  ['dasdeutschehaus.sy', 'das-deutsche-haus.com'],
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

const COLLS = ['legal_pages', 'site_content', 'german_page_settings', 'emergency_contacts',
  'german_why_cards', 'german_packages', 'german_experiences', 'german_faq',
  'german_testimonials', 'german_gallery', 'blog_posts', 'team_members', 'partners']

for (const coll of COLLS) {
  let changed = 0
  const docs = await db.collection(coll).find({}).toArray().catch(() => [])
  for (const doc of docs) {
    const { _id, ...rest } = doc
    const cleaned = deepClean(rest)
    if (JSON.stringify(cleaned) !== JSON.stringify(rest)) {
      await db.collection(coll).updateOne({ _id }, { $set: cleaned })
      changed++
    }
  }
  if (changed) report[coll] = changed
}

// Verify nothing old remains
const OLD = ['dasdeutschehaus.sy', '963111234567', '+963 11 123']
for (const coll of COLLS) {
  const docs = await db.collection(coll).find({}).toArray().catch(() => [])
  const hits = docs.filter(d => { const j = JSON.stringify(d); return OLD.some(o => j.includes(o)) })
  if (hits.length) report['REMAINING_' + coll] = hits.length
}

console.log(JSON.stringify(report, null, 2))
await client.close()
