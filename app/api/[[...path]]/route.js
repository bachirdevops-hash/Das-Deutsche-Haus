import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { v2 as cloudinary } from 'cloudinary'
import sgMail from '@sendgrid/mail'
import { seedGermanVisitorsIfEmpty } from '@/lib/german_seed'
import { seedBlogIfEmpty, slugifyTitle } from '@/lib/blog_seed'
import { seedActivitiesIfEmpty, activitySlugify } from '@/lib/activities_seed'
import { seedLegalPagesIfEmpty, LEGAL_PAGES } from '@/lib/legal_seed'
import { seedSiteContentIfEmpty, CONTENT_KEYS } from '@/lib/site_content_seed'
import { emailNewLeadToAdmin, emailConfirmationToLead, emailWelcomeUser, emailPasswordReset } from '@/lib/email'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function cloudinaryConfigured() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[SendGrid not configured] Would send email to:', to, 'subject:', subject)
    return { mocked: true, to, subject }
  }
  try {
    const msg = {
      to,
      from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com', name: process.env.SENDGRID_FROM_NAME || 'Das Deutsche Haus' },
      subject, text: text || subject, html,
    }
    await sgMail.send(msg)
    return { sent: true }
  } catch (e) {
    console.error('SendGrid error:', e?.response?.body || e.message)
    return { error: e.message }
  }
}

// ---------- Rate Limiter (in-memory) ----------
const rateLimitStore = new Map()
function rateLimit(key, max = 10, windowMs = 60000) {
  const now = Date.now()
  const arr = (rateLimitStore.get(key) || []).filter(t => now - t < windowMs)
  if (arr.length >= max) return { ok: false, retryAfter: Math.ceil((windowMs - (now - arr[0])) / 1000) }
  arr.push(now)
  rateLimitStore.set(key, arr)
  // Periodic cleanup
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      const filtered = v.filter(t => now - t < windowMs)
      if (filtered.length === 0) rateLimitStore.delete(k)
      else rateLimitStore.set(k, filtered)
    }
  }
  return { ok: true }
}

let _client = null
async function getDb() {
  if (!_client) {
    _client = new MongoClient(process.env.MONGO_URL)
    await _client.connect()
  }
  return _client.db(process.env.DB_NAME || 'das_deutsche_haus')
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
function hashPassword(p) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(p, salt, 64).toString('hex')
  return `${salt}:${hash}`
}
function verifyPassword(p, stored) {
  try {
    const [salt, hash] = stored.split(':')
    const test = crypto.scryptSync(p, salt, 64).toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'))
  } catch { return false }
}
function b64url(i) { return Buffer.from(i).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
function signToken(p) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const b = b64url(JSON.stringify({ ...p, iat: Date.now() }))
  const data = `${h}.${b}`
  const s = b64url(crypto.createHmac('sha256', JWT_SECRET).update(data).digest())
  return `${data}.${s}`
}
function verifyToken(t) {
  if (!t) return null
  try {
    const [h, b, s] = t.split('.')
    const exp = b64url(crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest())
    if (exp !== s) return null
    return JSON.parse(Buffer.from(b.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
  } catch { return null }
}
function getUserFromRequest(request) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/ddh_token=([^;]+)/)
  if (!m) return null
  return verifyToken(m[1])
}
async function getCurrentUser(db, request) {
  const u = getUserFromRequest(request)
  if (!u) return null
  const user = await db.collection('users').findOne({ id: u.id })
  if (!user || user.disabled) return null
  return user
}
function getIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''
}
async function logActivity(db, actor, action, entity, entityId, meta = {}, ip = '') {
  await db.collection('activity_logs').insertOne({
    id: uuidv4(),
    actorId: actor?.id || null, actorName: actor?.name || 'system', actorRole: actor?.role || 'system',
    action, entity, entityId: entityId || null, meta, ip,
    createdAt: new Date().toISOString(),
  })
}

async function notify(db, userIds, payload) {
  if (!userIds || userIds.length === 0) return
  const docs = userIds.filter(Boolean).map(uid => ({
    id: uuidv4(), userId: uid, ...payload, read: false, createdAt: new Date().toISOString(),
  }))
  if (docs.length) await db.collection('notifications').insertMany(docs)
}

// Notify all super_admin + manager users about a new public lead/registration
// Also fires Resend emails to admin + auto-reply to the lead (fire-and-forget).
async function notifyAdminsOfLead(db, kind, title, message, entityId, leadObj) {
  const admins = await db.collection('users').find(
    { role: { $in: ['super_admin', 'manager'] }, disabled: { $ne: true } },
    { projection: { id: 1 } }
  ).toArray()
  const userIds = admins.map(u => u.id)
  await notify(db, userIds, {
    kind,
    title,
    message,
    entityId: entityId || null,
    link: kind === 'course_registration' ? '/admin#courses'
        : kind === 'telc_booking' ? '/admin#telc'
        : kind === 'vocational_application' ? '/admin#vocational'
        : kind === 'travel_consultation' ? '/admin#consultations'
        : null,
    priority: 'high',
  })
  // 📧 Fire emails — best-effort, never blocks (no await)
  if (leadObj) {
    emailNewLeadToAdmin(db, kind, leadObj).catch(e => console.error('[email admin]', e?.message))
    emailConfirmationToLead(db, kind, leadObj).catch(e => console.error('[email confirm]', e?.message))
  }
}

async function getCourseStudentIds(db, courseId) {
  const regs = await db.collection('course_registrations').find({ courseId }, { projection: { userId: 1, assignedUserId: 1 } }).toArray()
  return regs.map(r => r.userId || r.assignedUserId).filter(Boolean)
}

async function seedSuperAdmin(db) {
  const exists = await db.collection('users').findOne({ email: 'bachir.devops@gmail.com' })
  if (exists) {
    if (exists.role !== 'super_admin' || exists.disabled) {
      await db.collection('users').updateOne({ id: exists.id }, { $set: { role: 'super_admin', disabled: false } })
    }
    return
  }
  await db.collection('users').insertOne({
    id: uuidv4(), name: 'Bachir Admin', email: 'bachir.devops@gmail.com',
    phone: '', password: hashPassword('@26042026Admin'),
    createdAt: new Date().toISOString(),
    role: 'super_admin', disabled: false, assignedCourseIds: [],
  })
}

async function seedIfEmpty(db) {
  const cnt = await db.collection('courses').countDocuments()
  if (cnt > 0) return
  const courses = [
    { id: uuidv4(), level: 'A1', title_ar: 'المستوى A1 — للمبتدئين', title_de: 'Stufe A1 — Anfänger', desc_ar: 'تعلّم أساسيات اللغة الألمانية: الأبجدية، التحيات، التعريف بالنفس، والمحادثات اليومية البسيطة.', desc_de: 'Lerne die Grundlagen der deutschen Sprache.', duration_ar: '8 أسابيع', duration_de: '8 Wochen', hours: 80, price_usd: 180, schedule_ar: 'سبت/ثلاثاء/خميس — 5:00م إلى 7:00م', schedule_de: 'Sa/Di/Do — 17:00 bis 19:00', start_date: '2026-07-15', seats: 18 },
    { id: uuidv4(), level: 'A2', title_ar: 'المستوى A2 — أساسي متقدم', title_de: 'Stufe A2 — Grundstufe', desc_ar: 'توسيع المفردات، الأفعال المنفصلة، الأزمنة الماضية، والتعبير عن الآراء البسيطة.', desc_de: 'Erweiterung des Wortschatzes.', duration_ar: '8 أسابيع', duration_de: '8 Wochen', hours: 80, price_usd: 200, schedule_ar: 'أحد/ثلاثاء/خميس — 7:00م إلى 9:00م', schedule_de: 'So/Di/Do — 19:00 bis 21:00', start_date: '2026-07-22', seats: 16 },
    { id: uuidv4(), level: 'B1', title_ar: 'المستوى B1 — متوسط', title_de: 'Stufe B1 — Mittelstufe', desc_ar: 'فهم النصوص الطويلة، المحادثات المعقدة، كتابة المقالات القصيرة، والاستعداد لشهادة B1 telc.', desc_de: 'Vorbereitung auf telc B1.', duration_ar: '10 أسابيع', duration_de: '10 Wochen', hours: 100, price_usd: 260, schedule_ar: 'سبت/إثنين/أربعاء — 4:00م إلى 6:00م', schedule_de: 'Sa/Mo/Mi — 16:00 bis 18:00', start_date: '2026-08-01', seats: 14 },
    { id: uuidv4(), level: 'B2', title_ar: 'المستوى B2 — متوسط متقدم', title_de: 'Stufe B2 — gehobene Mittelstufe', desc_ar: 'إتقان القواعد المتقدمة، النقاشات الأكاديمية، والاستعداد للعمل والدراسة في ألمانيا.', desc_de: 'Vorbereitung auf Studium und Beruf.', duration_ar: '12 أسبوع', duration_de: '12 Wochen', hours: 120, price_usd: 320, schedule_ar: 'أحد/ثلاثاء/خميس — 5:00م إلى 7:30م', schedule_de: 'So/Di/Do — 17:00 bis 19:30', start_date: '2026-08-10', seats: 12 },
    { id: uuidv4(), level: 'C1', title_ar: 'المستوى C1 — متقدم', title_de: 'Stufe C1 — Fortgeschritten', desc_ar: 'لغة أكاديمية ومهنية عالية، تحضير للدراسة الجامعية في ألمانيا.', desc_de: 'Hohes akademisches Niveau.', duration_ar: '14 أسبوع', duration_de: '14 Wochen', hours: 140, price_usd: 400, schedule_ar: 'سبت/أربعاء — 4:00م إلى 7:00م', schedule_de: 'Sa/Mi — 16:00 bis 19:00', start_date: '2026-08-20', seats: 10 },
    { id: uuidv4(), level: 'C2', title_ar: 'المستوى C2 — إتقان', title_de: 'Stufe C2 — Beherrschung', desc_ar: 'مستوى الناطق الأصلي. لغة ثقافية وأدبية ومهنية على أعلى مستوى.', desc_de: 'Muttersprachliches Niveau.', duration_ar: '16 أسبوع', duration_de: '16 Wochen', hours: 160, price_usd: 480, schedule_ar: 'أحد/ثلاثاء — 6:00م إلى 9:00م', schedule_de: 'So/Di — 18:00 bis 21:00', start_date: '2026-09-01', seats: 8 },
  ]
  await db.collection('courses').insertMany(courses)
  const telc = [
    { id: uuidv4(), type: 'telc Deutsch A1', date: '2026-08-05', time: '10:00', price_usd: 90, seats: 20 },
    { id: uuidv4(), type: 'telc Deutsch A2', date: '2026-08-12', time: '10:00', price_usd: 100, seats: 20 },
    { id: uuidv4(), type: 'telc Deutsch B1', date: '2026-08-20', time: '09:00', price_usd: 130, seats: 24 },
    { id: uuidv4(), type: 'telc Deutsch B2', date: '2026-09-03', time: '09:00', price_usd: 160, seats: 18 },
    { id: uuidv4(), type: 'telc Deutsch C1 Hochschule', date: '2026-09-15', time: '09:00', price_usd: 200, seats: 14 },
    { id: uuidv4(), type: 'telc Deutsch B1·B2 Pflege', date: '2026-09-22', time: '10:00', price_usd: 170, seats: 16 },
  ]
  await db.collection('telc_exams').insertMany(telc)
  const jobs = [
    { id: uuidv4(), title_ar: 'تمريض ورعاية صحية', title_de: 'Pflegefachmann/-frau', partner: 'Charité Berlin', duration_ar: '3 سنوات', duration_de: '3 Jahre', salary: '€1,200 - €1,400', requirements_ar: 'B2 ألماني، شهادة ثانوية، صحة جيدة', requirements_de: 'B2 Deutsch, Abitur' },
    { id: uuidv4(), title_ar: 'كهرباء صناعية', title_de: 'Elektroniker für Betriebstechnik', partner: 'Siemens AG', duration_ar: '3.5 سنة', duration_de: '3.5 Jahre', salary: '€1,000 - €1,250', requirements_ar: 'B1 ألماني، أساسيات رياضيات وفيزياء', requirements_de: 'B1 Deutsch, Mathe-Grundlagen' },
    { id: uuidv4(), title_ar: 'طهي وضيافة', title_de: 'Koch / Köchin', partner: 'Marriott Hotels DE', duration_ar: '3 سنوات', duration_de: '3 Jahre', salary: '€950 - €1,150', requirements_ar: 'A2 ألماني، شغف بالطبخ', requirements_de: 'A2 Deutsch' },
    { id: uuidv4(), title_ar: 'ميكانيكا سيارات', title_de: 'Kfz-Mechatroniker', partner: 'BMW Group', duration_ar: '3.5 سنة', duration_de: '3.5 Jahre', salary: '€1,050 - €1,300', requirements_ar: 'B1 ألماني، خبرة تقنية', requirements_de: 'B1 Deutsch' },
    { id: uuidv4(), title_ar: 'تطوير برمجيات', title_de: 'Fachinformatiker', partner: 'SAP SE', duration_ar: '3 سنوات', duration_de: '3 Jahre', salary: '€1,150 - €1,400', requirements_ar: 'B2 ألماني، أساسيات برمجة', requirements_de: 'B2 Deutsch, Programmiergrundlagen' },
    { id: uuidv4(), title_ar: 'لوجستيات ومستودعات', title_de: 'Fachkraft für Lagerlogistik', partner: 'DHL Deutschland', duration_ar: '3 سنوات', duration_de: '3 Jahre', salary: '€900 - €1,100', requirements_ar: 'A2 ألماني', requirements_de: 'A2 Deutsch' },
  ]
  await db.collection('vocational_jobs').insertMany(jobs)
}

function notFound() { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
function ok(d, init = {}) { return NextResponse.json(d, init) }
function forbidden() { return ok({ error: 'forbidden' }, { status: 403 }) }
function unauth() { return ok({ error: 'unauthorized' }, { status: 401 }) }

async function handle(request, { params }) {
  try {
    const db = await getDb()
    // ⚡ One-time seed per server instance — was running on every request causing ~3s latency
    if (!global.__ddhSeeded) {
      global.__ddhSeeded = true
      try {
        await seedSuperAdmin(db)
        await seedIfEmpty(db)
        await seedGermanVisitorsIfEmpty(db)
        await seedBlogIfEmpty(db)
        await seedActivitiesIfEmpty(db)
        await seedLegalPagesIfEmpty(db)
        await seedSiteContentIfEmpty(db)
      } catch (e) {
        console.error('[seed] error:', e?.message)
        global.__ddhSeeded = false // allow retry
      }
    }
    const path = ((await params)?.path || []).join('/')
    const method = request.method
    const ip = getIp(request)
    const segs = path.split('/').filter(Boolean)

    if (path === '' || path === 'health') return ok({ ok: true, service: 'Das Deutsche Haus API', version: '2.0' })

    // ===== AUTH =====
    // 🔒 Public signup is disabled — accounts are created only by Admin/Manager
    // via /api/admin/users (POST). The signup endpoint stays defined but returns 403.
    if (path === 'auth/signup' && method === 'POST') {
      return ok({ error: 'التسجيل العام معطّل. تواصل مع الإدارة لإنشاء حساب لك.' }, { status: 403 })
    }
    if (path === 'auth/signup' && method === 'POST' && false) {
      const { name, email, phone, password } = await request.json()
      if (!name || !email || !password) return ok({ error: 'البيانات ناقصة' }, { status: 400 })
      const exists = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (exists) return ok({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
      const user = { id: uuidv4(), name, email: email.toLowerCase(), phone: phone || '', password: hashPassword(password), createdAt: new Date().toISOString(), role: 'student', disabled: false, assignedCourseIds: [] }
      await db.collection('users').insertOne(user)
      await logActivity(db, user, 'signup', 'user', user.id, {}, ip)
      const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role })
      const res = ok({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } })
      res.headers.set('Set-Cookie', `ddh_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`)
      return res
    }
    if (path === 'auth/login' && method === 'POST') {
      const rl = rateLimit(`login:${ip}`, 10, 60000)
      if (!rl.ok) return ok({ error: `محاولات كثيرة. حاول بعد ${rl.retryAfter} ثانية.` }, { status: 429 })
      const { email, password } = await request.json()
      const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
      if (!user || !verifyPassword(password, user.password)) return ok({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
      if (user.disabled) return ok({ error: 'هذا الحساب معطّل. تواصل مع الإدارة.' }, { status: 403 })
      await logActivity(db, user, 'login', 'user', user.id, {}, ip)
      const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role })
      const res = ok({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } })
      res.headers.set('Set-Cookie', `ddh_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`)
      return res
    }

    if (path === 'auth/forgot-password' && method === 'POST') {
      const rl = rateLimit(`forgot:${ip}`, 5, 60000)
      if (!rl.ok) return ok({ error: `محاولات كثيرة. حاول بعد ${rl.retryAfter} ثانية.` }, { status: 429 })
      const { email } = await request.json()
      const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
      // Always return success to avoid email enumeration
      if (user && !user.disabled) {
        const token = uuidv4().replace(/-/g, '') + crypto.randomBytes(8).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        await db.collection('password_resets').insertOne({ id: uuidv4(), userId: user.id, token, expiresAt, used: false, createdAt: new Date().toISOString() })
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://telc-academy.preview.emergentagent.com'
        const resetUrl = `${baseUrl}/?reset=${token}`
        const html = `
          <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 32px;">
            <div style="background: linear-gradient(90deg, #1A1A1A 33%, #CC0000 33%, #CC0000 66%, #FFCE00 66%); height: 6px; border-radius: 3px 3px 0 0;"></div>
            <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,.05);">
              <h1 style="color: #1A1A1A; margin: 0 0 16px;">إعادة تعيين كلمة المرور</h1>
              <p style="color: #555; line-height: 1.7;">مرحباً ${user.name}،</p>
              <p style="color: #555; line-height: 1.7;">طلبت إعادة تعيين كلمة المرور لحسابك في <strong>Das Deutsche Haus</strong>. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background: #CC0000; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">إعادة تعيين كلمة المرور</a>
              </div>
              <p style="color: #888; font-size: 13px;">الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب ذلك، تجاهل هذا الإيميل.</p>
              <p style="color: #888; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 8px;">${resetUrl}</p>
            </div>
            <div style="text-align: center; padding: 16px; color: #888; font-size: 12px;">© 2026 Das Deutsche Haus · 🇸🇾 ↔ 🇩🇪</div>
          </div>`
        const result = await emailPasswordReset(db, { name: user.name, email: user.email, resetUrl })
        await logActivity(db, user, 'forgot_password', 'user', user.id, { emailSent: !result.error, skipped: result.skipped || false }, ip)
        if (result.skipped && process.env.NODE_ENV !== 'production') {
          console.warn('[DEV] Reset URL (email skipped):', resetUrl)
        }
      }
      return ok({ ok: true, message: 'إذا كان البريد مسجلاً، ستصلك رسالة إعادة تعيين خلال دقائق.' })
    }

    if (path === 'auth/reset-password' && method === 'POST') {
      const { token, password } = await request.json()
      if (!token || !password || password.length < 6) return ok({ error: 'بيانات ناقصة أو كلمة المرور قصيرة' }, { status: 400 })
      const reset = await db.collection('password_resets').findOne({ token })
      if (!reset || reset.used) return ok({ error: 'الرابط غير صالح أو مُستخدم' }, { status: 400 })
      if (new Date(reset.expiresAt).getTime() < Date.now()) return ok({ error: 'انتهت صلاحية الرابط' }, { status: 400 })
      const user = await db.collection('users').findOne({ id: reset.userId })
      if (!user) return ok({ error: 'المستخدم غير موجود' }, { status: 404 })
      await db.collection('users').updateOne({ id: user.id }, { $set: { password: hashPassword(password) } })
      await db.collection('password_resets').updateOne({ token }, { $set: { used: true, usedAt: new Date().toISOString() } })
      await logActivity(db, user, 'reset_password', 'user', user.id, {}, ip)
      return ok({ ok: true })
    }
    if (path === 'auth/logout' && method === 'POST') {
      const r = ok({ ok: true })
      r.headers.set('Set-Cookie', `ddh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
      return r
    }
    if (path === 'auth/me' && method === 'GET') {
      const user = await getCurrentUser(db, request)
      if (!user) return ok({ user: null })
      return ok({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, disabled: user.disabled, assignedCourseIds: user.assignedCourseIds || [], photo: user.photo || null } })
    }

      if (path === 'auth/me' && method === 'PATCH') {
        const me = await getCurrentUser(db, request)
        if (!me) return unauth()
        const body = await request.json()
        const update = {}
        if (body.name !== undefined) update.name = body.name
        if (body.phone !== undefined) update.phone = body.phone
        if (body.photo !== undefined) update.photo = body.photo // {url, public_id}
        await db.collection('users').updateOne({ id: me.id }, { $set: update })
        return ok({ ok: true })
      }

    // ===== CLOUDINARY (any logged-in user; folder restricted by role/path) =====
    if (path === 'cloudinary/signature' && method === 'GET') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (!cloudinaryConfigured()) return ok({ error: 'Cloudinary غير مُهيّأ. أضف المفاتيح في .env' }, { status: 500 })
      const url = new URL(request.url)
      const folder = url.searchParams.get('folder') || 'uploads'
      const resourceType = url.searchParams.get('resource_type') || 'auto'
      // Validate folder whitelist by role
      const allowedPrefixes = {
        super_admin: ['ddh/'],
        manager: ['ddh/courses/', 'ddh/blog/', 'ddh/testimonials/'],
        teacher: [`ddh/teacher/${me.id}/`, 'ddh/users/' + me.id + '/'],
        student: ['ddh/users/' + me.id + '/'],
      }
      const list = allowedPrefixes[me.role] || []
      if (!list.some(p => folder.startsWith(p))) return ok({ error: 'مسار غير مسموح', folder, allowed: list }, { status: 400 })
      const timestamp = Math.floor(Date.now() / 1000)
      const params = { timestamp, folder }
      const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET)
      return ok({ signature, timestamp, cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, folder, resource_type: resourceType })
    }
    if (path === 'cloudinary/delete' && method === 'POST') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (!cloudinaryConfigured()) return ok({ error: 'Cloudinary غير مُهيّأ' }, { status: 500 })
      const { public_id, resource_type } = await request.json()
      if (!public_id) return ok({ error: 'public_id مطلوب' }, { status: 400 })
      try {
        const result = await cloudinary.uploader.destroy(public_id, { invalidate: true, resource_type: resource_type || 'image' })
        await logActivity(db, me, 'cloudinary_delete', 'asset', public_id, { resource_type }, ip)
        return ok({ ok: true, result })
      } catch (e) {
        return ok({ error: e.message }, { status: 500 })
      }
    }

    // ===== PUBLIC =====
    if (path === 'courses' && method === 'GET') {
      const items = await db.collection('courses').find({}, { projection: { _id: 0 } }).sort({ level: 1 }).limit(100).toArray()
      return ok({ courses: items })
    }
    if (path === 'telc-exams' && method === 'GET') {
      const items = await db.collection('telc_exams').find({}, { projection: { _id: 0 } }).sort({ date: 1 }).limit(100).toArray()
      return ok({ exams: items })
    }
    if (path === 'vocational/jobs' && method === 'GET') {
      const items = await db.collection('vocational_jobs').find({}, { projection: { _id: 0 } }).limit(100).toArray()
      return ok({ jobs: items })
    }

    // ===== STUDENT =====
    if (path === 'course-registrations' && method === 'POST') {
      // 🌐 PUBLIC endpoint — anyone can submit a course registration request.
      // If logged in, link to user; otherwise store as anonymous lead.
      const me = await getCurrentUser(db, request)
      const body = await request.json()
      const { courseId, name, email, phone, notes } = body
      const course = await db.collection('courses').findOne({ id: courseId })
      if (!course) return ok({ error: 'الكورس غير موجود' }, { status: 404 })
      // Validate required fields for anonymous submissions
      if (!me && (!name || !email || !phone)) {
        return ok({ error: 'الاسم والبريد ورقم الهاتف مطلوبة' }, { status: 400 })
      }
      // Prevent duplicate registrations for logged-in users only
      if (me) {
        const dup = await db.collection('course_registrations').findOne({ userId: me.id, courseId })
        if (dup) return ok({ error: 'أنت مسجّل مسبقاً في هذا الكورس' }, { status: 400 })
      }
      const reg = {
        id: uuidv4(),
        userId: me?.id || null,
        courseId,
        level: course.level,
        courseName: course.title_ar || course.level,
        // public lead fields
        name: name || me?.name || '',
        email: (email || me?.email || '').toLowerCase(),
        phone: phone || me?.phone || '',
        notes: notes || '',
        source: me ? 'authenticated' : 'public_form',
        status: me ? 'pending_payment' : 'new',
        createdAt: new Date().toISOString(),
        price_usd: course.price_usd,
      }
      await db.collection('course_registrations').insertOne(reg)
      await logActivity(db, me, 'register_course', 'course', courseId, { level: course.level, public: !me }, ip)
      await notifyAdminsOfLead(db, 'course_registration', `تسجيل جديد في كورس ${course.level}`, `${reg.name} (${reg.email}) سجل في كورس ${course.title_ar}`, reg.id, reg)
      return ok({ registration: { ...reg, _id: undefined } })
    }
    if (path === 'telc-bookings' && method === 'POST') {
      // 🌐 PUBLIC endpoint — anyone can submit a telc booking request.
      const me = await getCurrentUser(db, request)
      const body = await request.json()
      const { examId, name, email, phone, notes } = body
      const exam = await db.collection('telc_exams').findOne({ id: examId })
      if (!exam) return ok({ error: 'الامتحان غير موجود' }, { status: 404 })
      if (!me && (!name || !email || !phone)) {
        return ok({ error: 'الاسم والبريد ورقم الهاتف مطلوبة' }, { status: 400 })
      }
      if (me) {
        const dup = await db.collection('telc_bookings').findOne({ userId: me.id, examId })
        if (dup) return ok({ error: 'أنت محجوز مسبقاً' }, { status: 400 })
      }
      const bk = {
        id: uuidv4(),
        userId: me?.id || null,
        examId,
        type: exam.type,
        date: exam.date,
        name: name || me?.name || '',
        email: (email || me?.email || '').toLowerCase(),
        phone: phone || me?.phone || '',
        notes: notes || '',
        source: me ? 'authenticated' : 'public_form',
        status: me ? 'reserved' : 'new',
        createdAt: new Date().toISOString(),
        price_usd: exam.price_usd,
      }
      await db.collection('telc_bookings').insertOne(bk)
      await logActivity(db, me, 'book_exam', 'telc_exam', examId, { type: exam.type, public: !me }, ip)
      await notifyAdminsOfLead(db, 'telc_booking', `حجز جديد لامتحان ${exam.type}`, `${bk.name} (${bk.email}) حجز ${exam.type}`, bk.id, bk)
      return ok({ booking: { ...bk, _id: undefined } })
    }
    if (path === 'vocational/applications' && method === 'POST') {
      const me = await getCurrentUser(db, request)
      const body = await request.json()
      if (!me && (!body.name || !body.email || !body.phone)) {
        return ok({ error: 'الاسم والبريد ورقم الهاتف مطلوبة' }, { status: 400 })
      }
      const a = {
        id: uuidv4(),
        userId: me?.id || null,
        ...body,
        email: (body.email || me?.email || '').toLowerCase(),
        source: me ? 'authenticated' : 'public_form',
        status: 'submitted',
        createdAt: new Date().toISOString(),
      }
      await db.collection('vocational_applications').insertOne(a)
      await logActivity(db, me, 'apply_job', 'vocational_application', a.id, { jobTitle: body.jobTitle, public: !me }, ip)
      await notifyAdminsOfLead(db, 'vocational_application', `طلب Ausbildung جديد`, `${a.name || 'مجهول'} (${a.email}) قدّم طلب ${body.jobTitle || 'تدريب مهني'}`, a.id, a)
      return ok({ application: { ...a, _id: undefined } })
    }
    if (path === 'travel/consultations' && method === 'POST') {
      const me = await getCurrentUser(db, request)
      const body = await request.json()
      if (!me && (!body.name || !body.email || !body.phone)) {
        return ok({ error: 'الاسم والبريد ورقم الهاتف مطلوبة' }, { status: 400 })
      }
      const c = {
        id: uuidv4(),
        userId: me?.id || null,
        ...body,
        email: (body.email || me?.email || '').toLowerCase(),
        source: me ? 'authenticated' : 'public_form',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      await db.collection('travel_consultations').insertOne(c)
      await logActivity(db, me, 'request_consultation', 'travel_consultation', c.id, { public: !me }, ip)
      await notifyAdminsOfLead(db, 'travel_consultation', `طلب استشارة سفر`, `${c.name || 'مجهول'} (${c.email}) طلب استشارة`, c.id, c)
      return ok({ consultation: { ...c, _id: undefined } })
    }
    if (path === 'contact' && method === 'POST') {
      const body = await request.json()
      const m = { id: uuidv4(), ...body, replied: false, reply: '', createdAt: new Date().toISOString() }
      await db.collection('contact_messages').insertOne(m)
      return ok({ message: { ...m, _id: undefined } })
    }
    if (path === 'dashboard' && method === 'GET') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      const [regs, books, apps, cons, courses] = await Promise.all([
        db.collection('course_registrations').find({ userId: me.id }, { projection: { _id: 0 } }).toArray(),
        db.collection('telc_bookings').find({ userId: me.id }, { projection: { _id: 0 } }).toArray(),
        db.collection('vocational_applications').find({ userId: me.id }, { projection: { _id: 0 } }).toArray(),
        db.collection('travel_consultations').find({ userId: me.id }, { projection: { _id: 0 } }).toArray(),
        db.collection('courses').find({}, { projection: { _id: 0 } }).toArray(),
      ])
      const cmap = Object.fromEntries(courses.map(c => [c.id, c]))
      const regsEnriched = regs.map(r => ({ ...r, course: cmap[r.courseId] || null }))
      return ok({ user: { id: me.id, name: me.name, email: me.email, phone: me.phone, role: me.role }, registrations: regsEnriched, telc_bookings: books, vocational_applications: apps, travel_consultations: cons })
    }
    // Student access to course materials/grades/announcements/sessions
    if (segs[0] === 'student' && segs[1] === 'courses' && segs[2]) {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      const courseId = segs[2]
      // verify enrolled
      const reg = await db.collection('course_registrations').findOne({ userId: me.id, courseId })
      if (!reg) return forbidden()
      if (segs[3] === 'overview' && method === 'GET') {
        const [course, materials, gradesRaw, anns, sessions] = await Promise.all([
          db.collection('courses').findOne({ id: courseId }, { projection: { _id: 0 } }),
          db.collection('course_materials').find({ courseId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
          db.collection('grades').find({ courseId, studentId: me.id }, { projection: { _id: 0, note: 0 } }).toArray(),
          db.collection('announcements').find({ courseId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
          db.collection('course_sessions').find({ courseId }, { projection: { _id: 0 } }).sort({ date: 1 }).toArray(),
        ])
        return ok({ course, materials, grades: gradesRaw, announcements: anns, sessions })
      }
      if (segs[3] === 'chat' && method === 'GET') {
        // mark teacher->student msgs as read
        await db.collection('chat_messages').updateMany({ courseId, toId: me.id, read: { $ne: true } }, { $set: { read: true } })
        const msgs = await db.collection('chat_messages').find({ courseId, $or: [{ fromId: me.id }, { toId: me.id }] }, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray()
        return ok({ messages: msgs })
      }
      if (segs[3] === 'chat' && method === 'POST') {
        const { text } = await request.json()
        const teacher = await db.collection('users').findOne({ assignedCourseIds: courseId })
        const msg = { id: uuidv4(), courseId, fromId: me.id, fromName: me.name, fromRole: 'student', toId: teacher?.id || null, toName: teacher?.name || 'المعلم', text, read: false, createdAt: new Date().toISOString() }
        await db.collection('chat_messages').insertOne(msg)
        if (teacher?.id) await notify(db, [teacher.id], { type: 'chat', courseId, title: 'رسالة من طالب', text: `${me.name}: ${text.slice(0, 60)}`, link: `course/${courseId}` })
        return ok({ message: { ...msg, _id: undefined } })
      }
    }

    // ===== NOTIFICATIONS (any logged-in user) =====
    if (segs[0] === 'notifications') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (segs.length === 1 && method === 'GET') {
        const items = await db.collection('notifications').find({ userId: me.id }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(50).toArray()
        const unread = await db.collection('notifications').countDocuments({ userId: me.id, read: false })
        return ok({ notifications: items, unread })
      }
      if (segs[1] === 'read-all' && method === 'POST') {
        await db.collection('notifications').updateMany({ userId: me.id, read: false }, { $set: { read: true } })
        return ok({ ok: true })
      }
      if (segs[1] && method === 'POST') {
        await db.collection('notifications').updateOne({ id: segs[1], userId: me.id }, { $set: { read: true } })
        return ok({ ok: true })
      }
    }

    // ===== GERMAN VISITORS — Public Endpoints =====
    if (segs[0] === 'german') {
      // Single bulk-read endpoint for the full /german-visitors page (1 request, 9 collections)
      if (segs[1] === 'page-data' && method === 'GET') {
        const [settings, why, packages, experiences, faq, flashcards, testimonials, gallery, emergency] = await Promise.all([
          db.collection('german_page_settings').findOne({ id: 'german_page_settings' }, { projection: { _id: 0 } }),
          db.collection('german_why_cards').find({}, { projection: { _id: 0 } }).sort({ sortOrder: 1 }).toArray(),
          db.collection('german_packages').find({}, { projection: { _id: 0 } }).sort({ sortOrder: 1 }).toArray(),
          db.collection('german_experiences').find({}, { projection: { _id: 0 } }).sort({ sortOrder: 1 }).toArray(),
          db.collection('german_faq').find({}, { projection: { _id: 0 } }).sort({ sortOrder: 1 }).toArray(),
          db.collection('german_flashcards').find({}, { projection: { _id: 0 } }).sort({ sortOrder: 1 }).toArray(),
          db.collection('german_testimonials').find({ visible: true }, { projection: { _id: 0 } }).sort({ sortOrder: 1 }).toArray(),
          db.collection('german_gallery').find({ visible: true }, { projection: { _id: 0 } }).sort({ sortOrder: 1 }).toArray(),
          db.collection('emergency_contacts').find({ visible: true }, { projection: { _id: 0 } }).sort({ category: 1, sortOrder: 1 }).toArray(),
        ])
        return ok({ settings, why, packages, experiences, faq, flashcards, testimonials, gallery, emergency })
      }

      // POST /api/german/bookings — public booking submission
      if (segs[1] === 'bookings' && method === 'POST') {
        const rl = rateLimit(`german-booking:${ip}`, 5, 60000)
        if (!rl.ok) return ok({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }, { status: 429 })
        const body = await request.json()
        const { name, email, phone, dateFrom, dateTo, travelers, packageId, requests, source } = body || {}
        if (!name || !email || !phone) return ok({ error: 'Bitte füllen Sie alle Pflichtfelder aus' }, { status: 400 })
        const booking = {
          id: uuidv4(), name, email, phone, dateFrom: dateFrom || '', dateTo: dateTo || '',
          travelers: Number(travelers) || 1, packageId: packageId || '', requests: requests || '',
          source: source || '', status: 'New', adminNotes: '',
          createdAt: new Date().toISOString(), ip,
        }
        await db.collection('german_bookings').insertOne(booking)
        // Notify all super admins
        const admins = await db.collection('users').find({ role: { $in: ['super_admin', 'manager'] } }, { projection: { id: 1 } }).toArray()
        await notify(db, admins.map(a => a.id), { type: 'announcement', title: 'Neue Buchungsanfrage', text: `${name} (${email})`, link: 'admin/german/bookings' })
        // Auto-reply email (silent if SendGrid not configured)
        sendEmail({
          to: email,
          subject: 'Vielen Dank für Ihre Anfrage — Das Deutsche Haus',
          html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1A1A1A"><div style="text-align:center;margin-bottom:24px"><div style="height:4px;background:linear-gradient(90deg,#1A1A1A 33%,#CC0000 33%,#CC0000 66%,#FFCE00 66%);border-radius:4px;width:80px;margin:0 auto 16px"></div><h2 style="margin:0;color:#1A1A1A">Willkommen!</h2></div><p>Hallo ${name},</p><p>vielen Dank für Ihre Buchungsanfrage. Wir haben Ihre Anfrage erhalten und melden uns innerhalb von <strong>24 Stunden</strong> bei Ihnen.</p><p style="background:#FFF8E0;border-left:3px solid #FFCE00;padding:12px;border-radius:6px"><strong>Anzahl Reisende:</strong> ${travelers || 1}<br/><strong>Reisedaten:</strong> ${dateFrom || '—'} bis ${dateTo || '—'}</p><p>Bei dringenden Fragen erreichen Sie uns 24/7 per WhatsApp.</p><p style="margin-top:32px;color:#999;font-size:12px">© Das Deutsche Haus · Syria ↔ Germany</p></div>`,
        }).catch(() => {})
        return ok({ ok: true, message: 'Vielen Dank! Wir melden uns innerhalb von 24 Stunden.' })
      }

      // POST /api/german/service-requests — public service request submission
      if (segs[1] === 'service-requests' && method === 'POST') {
        const rl = rateLimit(`german-service:${ip}`, 5, 60000)
        if (!rl.ok) return ok({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }, { status: 429 })
        const body = await request.json()
        const { name, email, whatsapp, location, dateFrom, dateTo, travelers, services, notes } = body || {}
        if (!name || !email || !whatsapp) return ok({ error: 'Bitte füllen Sie alle Pflichtfelder aus' }, { status: 400 })
        const req = {
          id: uuidv4(), name, email, whatsapp, location: location || '',
          dateFrom: dateFrom || '', dateTo: dateTo || '',
          travelers: Number(travelers) || 1, services: Array.isArray(services) ? services : [],
          notes: notes || '', status: 'New', adminNotes: '',
          createdAt: new Date().toISOString(), ip,
        }
        await db.collection('german_service_requests').insertOne(req)
        const admins = await db.collection('users').find({ role: { $in: ['super_admin', 'manager'] } }, { projection: { id: 1 } }).toArray()
        await notify(db, admins.map(a => a.id), { type: 'announcement', title: 'Neue Service-Anfrage', text: `${name} — ${(req.services || []).length} Leistungen`, link: 'admin/german/service-requests' })
        sendEmail({
          to: email,
          subject: 'Vielen Dank — Ihre Service-Anfrage ist bei uns',
          html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1A1A1A"><div style="text-align:center;margin-bottom:24px"><div style="height:4px;background:linear-gradient(90deg,#1A1A1A 33%,#CC0000 33%,#CC0000 66%,#FFCE00 66%);border-radius:4px;width:80px;margin:0 auto 16px"></div><h2 style="margin:0">Vielen Dank, ${name}!</h2></div><p>Wir haben Ihre Service-Anfrage erhalten und melden uns innerhalb von <strong>24 Stunden</strong> bei Ihnen.</p><p style="background:#FFF8E0;border-left:3px solid #FFCE00;padding:12px;border-radius:6px"><strong>Ausgewählte Leistungen:</strong> ${(req.services || []).length}<br/><strong>Aktueller Standort:</strong> ${location || '—'}</p><p>Wir freuen uns darauf, Ihnen Ihre Reise nach Syrien zu erleichtern.</p></div>`,
        }).catch(() => {})
        return ok({ ok: true, message: 'Vielen Dank! Wir melden uns innerhalb von 24 Stunden bei Ihnen.' })
      }
    }

    // ===== BLOG — Public Endpoints =====
    if (segs[0] === 'blog') {
      // GET /api/blog?category=&search=&lang=&page=1&limit=10 — public list (only Published)
      if (segs.length === 1 && method === 'GET') {
        const url = new URL(request.url)
        const category = url.searchParams.get('category')
        const search = url.searchParams.get('search')
        const lang = url.searchParams.get('lang')
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
        const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '10'))
        const filter = { status: 'Published', publishDate: { $lte: new Date().toISOString() } }
        if (category && category !== 'all') filter.category = category
        if (lang && lang !== 'all') filter.language = lang
        if (search) {
          const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
          filter.$or = [{ title: rx }, { content: rx }, { excerpt: rx }]
        }
        const total = await db.collection('blog_posts').countDocuments(filter)
        const items = await db.collection('blog_posts').find(filter, { projection: { _id: 0, content: 0 } }).sort({ publishDate: -1 }).skip((page - 1) * limit).limit(limit).toArray()
        return ok({ items, total, page, totalPages: Math.ceil(total / limit) })
      }
      // GET /api/blog/<slug> — single post + increment view
      if (segs.length === 2 && method === 'GET') {
        const slug = segs[1]
        const post = await db.collection('blog_posts').findOne({ slug, status: 'Published' }, { projection: { _id: 0 } })
        if (!post) return ok({ error: 'المقال غير موجود' }, { status: 404 })
        await db.collection('blog_posts').updateOne({ slug }, { $inc: { views: 1 } })
        // Related posts (same category, exclude current)
        const related = await db.collection('blog_posts').find({ status: 'Published', category: post.category, slug: { $ne: slug } }, { projection: { _id: 0, content: 0 } }).sort({ publishDate: -1 }).limit(3).toArray()
        return ok({ post: { ...post, views: (post.views || 0) + 1 }, related })
      }
    }

    // ===== BLOG — ADMIN Endpoints (super_admin + manager) =====
    if (segs[0] === 'admin' && segs[1] === 'blog') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (!['super_admin', 'manager'].includes(me.role)) return forbidden()

      // GET list with admin filters (all statuses)
      if (segs.length === 2 && method === 'GET') {
        const url = new URL(request.url)
        const category = url.searchParams.get('category')
        const status = url.searchParams.get('status')
        const lang = url.searchParams.get('lang')
        const search = url.searchParams.get('search')
        const filter = {}
        if (category && category !== 'all') filter.category = category
        if (status && status !== 'all') filter.status = status
        if (lang && lang !== 'all') filter.language = lang
        if (search) {
          const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
          filter.$or = [{ title: rx }, { excerpt: rx }]
        }
        const items = await db.collection('blog_posts').find(filter, { projection: { _id: 0, content: 0 } }).sort({ createdAt: -1 }).toArray()
        return ok({ items })
      }
      // POST create
      if (segs.length === 2 && method === 'POST') {
        const body = await request.json()
        const id = uuidv4()
        const baseSlug = body.slug || slugifyTitle(body.title || '')
        // ensure uniqueness
        let slug = baseSlug
        if (await db.collection('blog_posts').findOne({ slug })) slug = `${baseSlug}-${id.slice(0, 6)}`
        const doc = {
          id, slug,
          title: body.title || '',
          category: body.category || 'other',
          language: body.language || 'ar',
          content: body.content || '',
          excerpt: body.excerpt || '',
          coverImage: body.coverImage || '',
          author: body.author || { name: me.name, photo: '' },
          status: body.status || 'Draft',
          publishDate: body.publishDate || new Date().toISOString(),
          metaDescription: body.metaDescription || '',
          views: 0,
          createdAt: new Date().toISOString(),
        }
        await db.collection('blog_posts').insertOne(doc)
        await logActivity(db, me.id, 'blog.create', 'blog_posts', id, ip)
        delete doc._id
        return ok({ item: doc })
      }
      // GET/PATCH/DELETE single by id
      if (segs.length === 3) {
        const id = segs[2]
        if (method === 'GET') {
          const item = await db.collection('blog_posts').findOne({ id }, { projection: { _id: 0 } })
          return ok({ item })
        }
        if (method === 'PATCH') {
          const body = await request.json()
          const update = { ...body }
          delete update.id; delete update._id; delete update.createdAt; delete update.views
          // Re-slug if title changed and slug not provided
          if (body.title && !body.slug) {
            const base = slugifyTitle(body.title)
            const existing = await db.collection('blog_posts').findOne({ slug: base, id: { $ne: id } })
            update.slug = existing ? `${base}-${id.slice(0, 6)}` : base
          }
          await db.collection('blog_posts').updateOne({ id }, { $set: update })
          await logActivity(db, me.id, 'blog.update', 'blog_posts', id, ip)
          const item = await db.collection('blog_posts').findOne({ id }, { projection: { _id: 0 } })
          return ok({ item })
        }
        if (method === 'DELETE') {
          await db.collection('blog_posts').deleteOne({ id })
          await logActivity(db, me.id, 'blog.delete', 'blog_posts', id, ip)
          return ok({ ok: true })
        }
      }
    }

    // ===== ADMIN ROUTES =====
    if (segs[0] === 'admin') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (me.role !== 'super_admin') return forbidden()

      if (segs[1] === 'users') {
        if (segs.length === 2 && method === 'GET') {
          const users = await db.collection('users').find({}, { projection: { _id: 0, password: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray()
          return ok({ users })
        }
        if (segs.length === 2 && method === 'POST') {
          const body = await request.json()
          const { name, email, phone, role } = body
          let { password } = body
          if (!name || !email || !role) return ok({ error: 'الحقول ناقصة (الاسم، البريد، الدور)' }, { status: 400 })
          if (!['super_admin', 'manager', 'teacher', 'student'].includes(role)) return ok({ error: 'دور غير صالح' }, { status: 400 })
          const exists = await db.collection('users').findOne({ email: email.toLowerCase() })
          if (exists) return ok({ error: 'البريد مستخدم' }, { status: 400 })
          // Auto-generate a strong, human-friendly password if none provided
          let generated = false
          if (!password || password.length < 6) {
            const rand = () => Math.random().toString(36).slice(-4)
            password = `DDH-${rand()}${rand()}-${new Date().getFullYear()}`
            generated = true
          }
          const u = {
            id: uuidv4(),
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            password: hashPassword(password),
            createdAt: new Date().toISOString(),
            createdBy: me.id,
            role,
            disabled: false,
            mustChangePassword: generated,
            assignedCourseIds: [],
          }
          await db.collection('users').insertOne(u)
          await logActivity(db, me, 'create_user', 'user', u.id, { email: u.email, role: u.role, generated }, ip)
          // 📧 Best-effort welcome email with credentials (does not block response)
          let emailStatus = { attempted: false }
          try {
            const r = await emailWelcomeUser(db, { name: u.name, email: u.email, password })
            emailStatus = { attempted: true, ok: !!r?.ok, skipped: !!r?.skipped, error: r?.error || null }
          } catch (e) {
            emailStatus = { attempted: true, ok: false, error: e?.message }
          }
          const { password: _p, _id, ...safe } = u
          return ok({
            user: safe,
            createdPassword: generated ? password : null,
            emailStatus,
          })
        }
        const userId = segs[2]
        if (segs.length === 3 && method === 'PATCH') {
          const body = await request.json()
          const update = {}
          if (body.name !== undefined) update.name = body.name
          if (body.phone !== undefined) update.phone = body.phone
          if (body.role !== undefined) {
            if (!['super_admin', 'manager', 'teacher', 'student'].includes(body.role)) return ok({ error: 'دور غير صالح' }, { status: 400 })
            update.role = body.role
          }
          if (body.disabled !== undefined) update.disabled = !!body.disabled
          if (body.password) update.password = hashPassword(body.password)
          await db.collection('users').updateOne({ id: userId }, { $set: update })
          await logActivity(db, me, 'update_user', 'user', userId, update, ip)
          return ok({ ok: true })
        }
        if (segs.length === 3 && method === 'DELETE') {
          if (userId === me.id) return ok({ error: 'لا يمكن حذف حسابك' }, { status: 400 })
          await db.collection('users').deleteOne({ id: userId })
          await logActivity(db, me, 'delete_user', 'user', userId, {}, ip)
          return ok({ ok: true })
        }
        if (segs.length === 4 && segs[3] === 'assign-courses' && method === 'POST') {
          const { courseIds } = await request.json()
          await db.collection('users').updateOne({ id: userId }, { $set: { assignedCourseIds: courseIds || [] } })
          await logActivity(db, me, 'assign_courses', 'user', userId, { courseIds }, ip)
          return ok({ ok: true })
        }
      }
      if (segs[1] === 'activity-logs' && method === 'GET') {
        const logs = await db.collection('activity_logs').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(500).toArray()
        return ok({ logs })
      }
      // ===== EMAIL LOGS — admin monitoring =====
      if (segs[1] === 'email-logs') {
        // GET /api/admin/email-logs[?status=&type=&search=]
        if (segs.length === 2 && method === 'GET') {
          const url = new URL(request.url)
          const status = url.searchParams.get('status')
          const type = url.searchParams.get('type')
          const search = url.searchParams.get('search')
          const query = {}
          if (status) query.status = status
          if (type) query.type = type
          if (search) query.to = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
          const items = await db.collection('email_logs').find(query, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(500).toArray()
          // Get aggregate stats
          const stats = {
            total: await db.collection('email_logs').countDocuments(),
            sent: await db.collection('email_logs').countDocuments({ status: 'sent' }),
            failed: await db.collection('email_logs').countDocuments({ status: 'failed' }),
            skipped: await db.collection('email_logs').countDocuments({ status: 'skipped' }),
          }
          return ok({ items, stats })
        }
        // DELETE /api/admin/email-logs/<id>
        if (segs.length === 3 && method === 'DELETE') {
          await db.collection('email_logs').deleteOne({ id: segs[2] })
          return ok({ ok: true })
        }
        // POST /api/admin/email-logs/clear  → wipe all logs
        if (segs.length === 3 && segs[2] === 'clear' && method === 'POST') {
          const r = await db.collection('email_logs').deleteMany({})
          await logActivity(db, me, 'email_logs.clear', 'email_logs', null, { deleted: r.deletedCount }, ip)
          return ok({ ok: true, deleted: r.deletedCount })
        }
      }
      // ===== UNIFIED INBOX — leads (course_registrations, telc_bookings, vocational, travel) =====
      const LEAD_COLLECTIONS = {
        'course-registrations': { coll: 'course_registrations', label: 'تسجيل كورس' },
        'telc-bookings':        { coll: 'telc_bookings',        label: 'حجز telc' },
        'vocational-applications': { coll: 'vocational_applications', label: 'طلب Ausbildung' },
        'travel-consultations': { coll: 'travel_consultations', label: 'استشارة سفر' },
      }
      if (LEAD_COLLECTIONS[segs[1]]) {
        const { coll } = LEAD_COLLECTIONS[segs[1]]
        // GET /api/admin/<lead-resource>  → list ALL (with optional ?status= filter)
        if (segs.length === 2 && method === 'GET') {
          const url = new URL(request.url)
          const status = url.searchParams.get('status')
          const query = status ? { status } : {}
          const items = await db.collection(coll).find(query, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(500).toArray()
          return ok({ items })
        }
        // PATCH /api/admin/<lead-resource>/<id>  → update status / notes
        if (segs.length === 3 && (method === 'PATCH' || method === 'PUT')) {
          const id = segs[2]
          const body = await request.json()
          const update = { updatedAt: new Date().toISOString() }
          if (body.status !== undefined) update.status = body.status
          if (body.adminNotes !== undefined) update.adminNotes = body.adminNotes
          if (body.assignedUserId !== undefined) update.assignedUserId = body.assignedUserId
          await db.collection(coll).updateOne({ id }, { $set: update })
          await logActivity(db, me, `${segs[1]}.update`, coll, id, Object.keys(update), ip)
          const item = await db.collection(coll).findOne({ id }, { projection: { _id: 0 } })
          return ok({ item })
        }
        // DELETE /api/admin/<lead-resource>/<id>
        if (segs.length === 3 && method === 'DELETE') {
          const id = segs[2]
          await db.collection(coll).deleteOne({ id })
          await logActivity(db, me, `${segs[1]}.delete`, coll, id, {}, ip)
          return ok({ ok: true })
        }
        // POST /api/admin/<lead-resource>/<id>/convert-to-user  → create student account, link lead, return generated password
        if (segs.length === 4 && segs[3] === 'convert-to-user' && method === 'POST') {
          const id = segs[2]
          const lead = await db.collection(coll).findOne({ id })
          if (!lead) return ok({ error: 'الطلب غير موجود' }, { status: 404 })
          if (!lead.email) return ok({ error: 'لا يوجد بريد إلكتروني لهذا الطلب' }, { status: 400 })
          const lower = lead.email.toLowerCase()
          let userId = lead.assignedUserId || null
          let createdPassword = null
          let user = await db.collection('users').findOne({ email: lower })
          if (user) {
            userId = user.id
          } else {
            // Generate a strong, human-friendly temporary password
            const rand = () => Math.random().toString(36).slice(-4)
            const pwd = `DDH-${rand()}${rand()}-${new Date().getFullYear()}`
            createdPassword = pwd
            user = {
              id: uuidv4(),
              name: lead.name || lead.email.split('@')[0],
              email: lower,
              phone: lead.phone || '',
              password: hashPassword(pwd),
              role: 'student',
              disabled: false,
              mustChangePassword: true,
              createdAt: new Date().toISOString(),
              createdBy: me.id,
              source: `lead:${segs[1]}:${id}`,
              assignedCourseIds: lead.courseId ? [lead.courseId] : [],
            }
            await db.collection('users').insertOne(user)
            userId = user.id
            await logActivity(db, me, 'create_user_from_lead', 'user', user.id, { email: lower, leadResource: segs[1], leadId: id }, ip)
          }
          // Link lead to user
          await db.collection(coll).updateOne({ id }, { $set: { assignedUserId: userId, status: 'converted', convertedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } })
          // If course registration → also create a confirmed registration link if it doesn't already exist
          if (segs[1] === 'course-registrations' && lead.courseId) {
            const existingReg = await db.collection('course_registrations').findOne({ userId, courseId: lead.courseId, id: { $ne: id } })
            if (!existingReg) {
              await db.collection('users').updateOne({ id: userId }, { $addToSet: { assignedCourseIds: lead.courseId } })
            }
          }
          // Notify the new user (in-app notification — email will be added later when SendGrid key provided)
          await notify(db, [userId], {
            kind: 'account_created',
            title: 'مرحباً بك في Das Deutsche Haus 🎉',
            message: createdPassword
              ? `تم إنشاء حسابك. كلمة المرور المؤقتة: ${createdPassword} — الرجاء تغييرها بعد أول دخول.`
              : 'تم ربط طلبك بحسابك الحالي.',
            priority: 'high',
          })
          // 📧 Send welcome email with credentials (best-effort, doesn't block response)
          if (createdPassword) {
            emailWelcomeUser(db, { name: user.name, email: user.email, password: createdPassword })
              .catch(e => console.error('[email welcome]', e?.message))
          }
          return ok({
            ok: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            createdPassword, // null if user already existed
            isExisting: !createdPassword,
          })
        }
      }
      if (segs[1] === 'stats' && method === 'GET') {
        // Use projection to fetch only needed fields (price_usd) — reduces memory footprint
        const [users, regs, books, apps, cons, contacts] = await Promise.all([
          db.collection('users').countDocuments(),
          db.collection('course_registrations').find({}, { projection: { _id: 0, price_usd: 1 } }).limit(10000).toArray(),
          db.collection('telc_bookings').find({}, { projection: { _id: 0, price_usd: 1 } }).limit(10000).toArray(),
          db.collection('vocational_applications').countDocuments(),
          db.collection('travel_consultations').countDocuments(),
          db.collection('contact_messages').countDocuments(),
        ])
        const courseRevenue = regs.reduce((s, r) => s + (r.price_usd || 0), 0)
        const examRevenue = books.reduce((s, r) => s + (r.price_usd || 0), 0)
        const byRole = await db.collection('users').aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]).toArray()
        return ok({ users, courseRegistrations: regs.length, telcBookings: books.length, vocationalApps: apps, consultations: cons, contactMessages: contacts, courseRevenue, examRevenue, totalRevenue: courseRevenue + examRevenue, byRole })
      }
    }

    // ===== GERMAN VISITORS — ADMIN ROUTES (super_admin + manager) =====
    if (segs[0] === 'admin' && segs[1] === 'german') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (!['super_admin', 'manager'].includes(me.role)) return forbidden()

      const COLLECTIONS_MAP = {
        bookings: 'german_bookings',
        'service-requests': 'german_service_requests',
        packages: 'german_packages',
        experiences: 'german_experiences',
        testimonials: 'german_testimonials',
        faq: 'german_faq',
        flashcards: 'german_flashcards',
        gallery: 'german_gallery',
        emergency: 'emergency_contacts',
        'why-cards': 'german_why_cards',
      }

      // Page Settings (singleton)
      if (segs[2] === 'page-settings') {
        if (method === 'GET') {
          const s = await db.collection('german_page_settings').findOne({ id: 'german_page_settings' }, { projection: { _id: 0 } })
          return ok({ settings: s })
        }
        if (method === 'PUT') {
          const body = await request.json()
          const allowed = ['hero_title', 'hero_subtitle', 'hero_image', 'cta1_text', 'cta1_link', 'cta2_text', 'cta2_link', 'whatsapp_number', 'whatsapp_message', 'show_packages', 'show_experiences', 'show_faq', 'show_flashcards', 'show_testimonials', 'show_gallery', 'show_booking', 'show_service_request', 'show_emergency', 'seo_title', 'seo_description', 'seo_keywords']
          const update = {}
          for (const k of allowed) if (body[k] !== undefined) update[k] = body[k]
          await db.collection('german_page_settings').updateOne({ id: 'german_page_settings' }, { $set: update }, { upsert: true })
          await logActivity(db, me.id, 'german.settings.update', 'german_page_settings', 'german_page_settings', ip)
          const s = await db.collection('german_page_settings').findOne({ id: 'german_page_settings' }, { projection: { _id: 0 } })
          return ok({ settings: s })
        }
      }

      // Generic CRUD dispatcher for all 10 collections
      const colKey = segs[2]
      const colName = COLLECTIONS_MAP[colKey]
      if (colName) {
        // GET /admin/german/<col> — list with optional filters
        if (segs.length === 3 && method === 'GET') {
          const url = new URL(request.url)
          const status = url.searchParams.get('status')
          const search = url.searchParams.get('search')
          const filter = {}
          if (status) filter.status = status
          if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
            filter.$or = [{ name: rx }, { email: rx }, { whatsapp: rx }, { title: rx }, { question: rx }]
          }
          const items = await db.collection(colName).find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1, sortOrder: 1 }).toArray()
          return ok({ items })
        }
        // POST /admin/german/<col> — create
        if (segs.length === 3 && method === 'POST') {
          const body = await request.json()
          const doc = { ...body, id: body.id || uuidv4(), createdAt: new Date().toISOString() }
          await db.collection(colName).insertOne(doc)
          await logActivity(db, me.id, `german.${colKey}.create`, colName, doc.id, ip)
          delete doc._id
          return ok({ item: doc })
        }
        // PATCH /admin/german/<col>/<id> — update
        if (segs.length === 4 && method === 'PATCH') {
          const id = segs[3]
          const body = await request.json()
          const update = { ...body }
          delete update.id; delete update._id; delete update.createdAt
          await db.collection(colName).updateOne({ id }, { $set: update })
          await logActivity(db, me.id, `german.${colKey}.update`, colName, id, ip)
          const item = await db.collection(colName).findOne({ id }, { projection: { _id: 0 } })
          return ok({ item })
        }
        // DELETE /admin/german/<col>/<id>
        if (segs.length === 4 && method === 'DELETE') {
          const id = segs[3]
          // For gallery items, optionally delete from Cloudinary too
          if (colKey === 'gallery') {
            const item = await db.collection(colName).findOne({ id })
            if (item?.cloudinary_public_id && process.env.CLOUDINARY_API_SECRET) {
              try { await cloudinary.uploader.destroy(item.cloudinary_public_id) } catch {}
            }
          }
          await db.collection(colName).deleteOne({ id })
          await logActivity(db, me.id, `german.${colKey}.delete`, colName, id, ip)
          return ok({ ok: true })
        }
        // POST /admin/german/<col>/reorder — bulk reorder
        if (segs.length === 4 && segs[3] === 'reorder' && method === 'POST') {
          const { order } = await request.json() // [{id, sortOrder}]
          if (Array.isArray(order)) {
            await Promise.all(order.map(o => db.collection(colName).updateOne({ id: o.id }, { $set: { sortOrder: o.sortOrder } })))
            await logActivity(db, me.id, `german.${colKey}.reorder`, colName, '', ip)
          }
          return ok({ ok: true })
        }
      }
    }

    // ===== MANAGER ROUTES =====
    if (segs[0] === 'manager') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (!['super_admin', 'manager'].includes(me.role)) return forbidden()

      const handleCrud = async (col, idField = 'id') => {
        if (segs.length === 2 && method === 'GET') {
          const items = await db.collection(col).find({}, { projection: { _id: 0 } }).toArray()
          return ok({ items })
        }
        if (segs.length === 2 && method === 'POST') {
          const body = await request.json()
          const item = { id: uuidv4(), ...body, createdAt: new Date().toISOString() }
          await db.collection(col).insertOne(item)
          await logActivity(db, me, `create_${col}`, col, item.id, body, ip)
          return ok({ item: { ...item, _id: undefined } })
        }
        const id = segs[2]
        if (segs.length === 3 && method === 'PATCH') {
          const body = await request.json()
          await db.collection(col).updateOne({ [idField]: id }, { $set: body })
          await logActivity(db, me, `update_${col}`, col, id, body, ip)
          return ok({ ok: true })
        }
        if (segs.length === 3 && method === 'DELETE') {
          await db.collection(col).deleteOne({ [idField]: id })
          await logActivity(db, me, `delete_${col}`, col, id, {}, ip)
          return ok({ ok: true })
        }
        return null
      }

      if (segs[1] === 'courses') { const r = await handleCrud('courses'); if (r) return r }
      if (segs[1] === 'telc-exams') { const r = await handleCrud('telc_exams'); if (r) return r }
      if (segs[1] === 'jobs') { const r = await handleCrud('vocational_jobs'); if (r) return r }

      if (segs[1] === 'contact-messages') {
        if (method === 'GET') {
          const items = await db.collection('contact_messages').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
          return ok({ items })
        }
        if (segs[2] && segs[3] === 'reply' && method === 'POST') {
          const { reply } = await request.json()
          await db.collection('contact_messages').updateOne({ id: segs[2] }, { $set: { reply, replied: true, repliedAt: new Date().toISOString(), repliedBy: me.name } })
          await logActivity(db, me, 'reply_contact', 'contact_message', segs[2], {}, ip)
          return ok({ ok: true })
        }
      }
      if (segs[1] === 'applications' && method === 'GET') {
        const items = await db.collection('vocational_applications').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
        return ok({ items })
      }
      if (segs[1] === 'consultations' && method === 'GET') {
        const items = await db.collection('travel_consultations').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
        return ok({ items })
      }
    }

    // ===== TEACHER ROUTES =====
    if (segs[0] === 'teacher') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      const isAdmin = me.role === 'super_admin'
      if (!isAdmin && me.role !== 'teacher') return forbidden()

      if (segs[1] === 'courses' && segs.length === 2 && method === 'GET') {
        const ids = isAdmin ? null : (me.assignedCourseIds || [])
        const filter = ids ? { id: { $in: ids } } : {}
        const courses = await db.collection('courses').find(filter, { projection: { _id: 0 } }).toArray()
        // Enrich with stats per course
        const enriched = await Promise.all(courses.map(async (c) => {
          const [studentCount, sessions, materials, unreadMsgs] = await Promise.all([
            db.collection('course_registrations').countDocuments({ courseId: c.id }),
            db.collection('course_sessions').find({ courseId: c.id, date: { $gte: new Date().toISOString().slice(0, 10) } }, { projection: { _id: 0 } }).sort({ date: 1 }).limit(1).toArray(),
            db.collection('course_materials').countDocuments({ courseId: c.id }),
            db.collection('chat_messages').countDocuments({ courseId: c.id, toId: me.id, read: { $ne: true } }),
          ])
          return { ...c, studentCount, nextSession: sessions[0] || null, fileCount: materials, unreadCount: unreadMsgs }
        }))
        return ok({ courses: enriched })
      }

      if (segs[1] === 'courses' && segs[2]) {
        const courseId = segs[2]
        if (!isAdmin && !(me.assignedCourseIds || []).includes(courseId)) return forbidden()

        if (segs[3] === 'students' && segs.length === 4 && method === 'GET') {
          const regs = await db.collection('course_registrations').find({ courseId }, { projection: { _id: 0 } }).toArray()
          // Support BOTH legacy logged-in registrations (userId) and new public-form leads (assignedUserId after convert)
          const ids = regs.map(r => r.userId || r.assignedUserId).filter(Boolean)
          const users = await db.collection('users').find({ id: { $in: ids } }, { projection: { _id: 0, password: 0 } }).toArray()
          // For unconverted leads (no user yet), expose lead data directly so teacher can see who's pending
          const linkedIds = new Set(users.map(u => u.id))
          const pendingLeads = regs.filter(r => !(r.userId && linkedIds.has(r.userId)) && !(r.assignedUserId && linkedIds.has(r.assignedUserId)))
          const pendingItems = pendingLeads.map(r => ({
            id: `lead-${r.id}`,
            name: r.name || '—',
            email: r.email || '—',
            phone: r.phone || '',
            isLead: true,
            registration: r,
          }))
          return ok({ students: [
            ...users.map(u => ({ ...u, registration: regs.find(r => r.userId === u.id || r.assignedUserId === u.id) })),
            ...pendingItems,
          ]})
        }

        if (segs[3] === 'students' && segs[4] && segs[5] === 'profile' && method === 'GET') {
          const studentId = segs[4]
          const reg = await db.collection('course_registrations').findOne({ courseId, userId: studentId })
          if (!reg) return ok({ error: 'الطالب غير مسجل في هذا الكورس' }, { status: 404 })
          const [student, grades, attendance, sessions, chatMsgs] = await Promise.all([
            db.collection('users').findOne({ id: studentId }, { projection: { _id: 0, password: 0 } }),
            db.collection('grades').find({ courseId, studentId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
            db.collection('attendance').find({ courseId, studentId }, { projection: { _id: 0 } }).toArray(),
            db.collection('course_sessions').find({ courseId }, { projection: { _id: 0 } }).toArray(),
            db.collection('chat_messages').find({ courseId, $or: [{ fromId: me.id, toId: studentId }, { fromId: studentId, toId: me.id }] }, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray(),
          ])
          const sessMap = Object.fromEntries(sessions.map(s => [s.id, s]))
          const attEnriched = attendance.map(a => ({ ...a, session: sessMap[a.sessionId] || null }))
          return ok({ student, registration: reg, grades, attendance: attEnriched, chatHistory: chatMsgs })
        }

        if (segs[3] === 'sessions') {
          if (method === 'GET') {
            const items = await db.collection('course_sessions').find({ courseId }, { projection: { _id: 0 } }).sort({ date: 1 }).toArray()
            return ok({ sessions: items })
          }
          if (method === 'POST') {
            const body = await request.json()
            const s = { id: uuidv4(), courseId, ...body, createdBy: me.id, createdAt: new Date().toISOString() }
            await db.collection('course_sessions').insertOne(s)
            await logActivity(db, me, 'create_session', 'course_session', s.id, { courseId }, ip)
            // Notify all students enrolled
            const studentIds = await getCourseStudentIds(db, courseId)
            await notify(db, studentIds, { type: 'session', courseId, title: 'جلسة جديدة', text: `تم إضافة جلسة: ${body.title}`, link: `course/${courseId}` })
            return ok({ session: { ...s, _id: undefined } })
          }
          if (segs[4] && method === 'DELETE') {
            await db.collection('course_sessions').deleteOne({ id: segs[4] })
            await logActivity(db, me, 'delete_session', 'course_session', segs[4], {}, ip)
            return ok({ ok: true })
          }
        }

        if (segs[3] === 'materials') {
          if (method === 'GET') {
            const items = await db.collection('course_materials').find({ courseId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
            return ok({ materials: items })
          }
          if (method === 'POST') {
            const body = await request.json()
            const m = { id: uuidv4(), courseId, ...body, uploadedBy: me.id, uploadedByName: me.name, createdAt: new Date().toISOString() }
            await db.collection('course_materials').insertOne(m)
            await logActivity(db, me, 'add_material', 'course_material', m.id, { courseId, title: body.title }, ip)
            const studentIds = await getCourseStudentIds(db, courseId)
            await notify(db, studentIds, { type: 'material', courseId, title: 'مادة جديدة', text: `${body.title}`, link: `course/${courseId}` })
            return ok({ material: { ...m, _id: undefined } })
          }
          if (segs[4] && method === 'DELETE') {
            await db.collection('course_materials').deleteOne({ id: segs[4] })
            await logActivity(db, me, 'delete_material', 'course_material', segs[4], {}, ip)
            return ok({ ok: true })
          }
        }

        if (segs[3] === 'grades') {
          if (method === 'GET') {
            const items = await db.collection('grades').find({ courseId }, { projection: { _id: 0 } }).toArray()
            return ok({ grades: items })
          }
          if (method === 'POST') {
            const { studentId, grade, comment, note } = await request.json()
            const g = { id: uuidv4(), courseId, studentId, grade, comment: comment || '', note: note || '', addedBy: me.id, addedByName: me.name, createdAt: new Date().toISOString() }
            await db.collection('grades').insertOne(g)
            await logActivity(db, me, 'add_grade', 'grade', g.id, { courseId, studentId, grade }, ip)
            await notify(db, [studentId], { type: 'grade', courseId, title: 'درجة جديدة', text: `حصلت على درجة: ${grade}`, link: `course/${courseId}` })
            return ok({ grade: { ...g, _id: undefined } })
          }
        }

        if (segs[3] === 'attendance') {
          if (method === 'GET') {
            const items = await db.collection('attendance').find({ courseId }, { projection: { _id: 0 } }).toArray()
            return ok({ attendance: items })
          }
          if (method === 'POST') {
            const { sessionId, records } = await request.json()
            // records: [{studentId, present}]
            await db.collection('attendance').deleteMany({ courseId, sessionId })
            const docs = (records || []).map(r => ({ id: uuidv4(), courseId, sessionId, studentId: r.studentId, present: !!r.present, addedBy: me.id, createdAt: new Date().toISOString() }))
            if (docs.length) await db.collection('attendance').insertMany(docs)
            await logActivity(db, me, 'mark_attendance', 'attendance', sessionId, { courseId, count: docs.length }, ip)
            return ok({ ok: true, count: docs.length })
          }
        }

        if (segs[3] === 'announcements') {
          if (method === 'GET') {
            const items = await db.collection('announcements').find({ courseId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
            return ok({ announcements: items })
          }
          if (method === 'POST') {
            const { text } = await request.json()
            const a = { id: uuidv4(), courseId, fromId: me.id, fromName: me.name, text, createdAt: new Date().toISOString() }
            await db.collection('announcements').insertOne(a)
            await logActivity(db, me, 'add_announcement', 'announcement', a.id, { courseId }, ip)
            const studentIds = await getCourseStudentIds(db, courseId)
            await notify(db, studentIds, { type: 'announcement', courseId, title: 'إعلان جديد', text: text.slice(0, 80), link: `course/${courseId}` })
            return ok({ announcement: { ...a, _id: undefined } })
          }
        }

        if (segs[3] === 'chat') {
          // /teacher/courses/:id/chat?studentId=xxx
          if (method === 'GET') {
            const url = new URL(request.url)
            const studentId = url.searchParams.get('studentId')
            const filter = { courseId, $or: [{ fromId: me.id, toId: studentId }, { fromId: studentId, toId: me.id }] }
            const msgs = await db.collection('chat_messages').find(filter, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray()
            return ok({ messages: msgs })
          }
          if (method === 'POST') {
            const { studentId, text } = await request.json()
            const student = await db.collection('users').findOne({ id: studentId })
            const msg = { id: uuidv4(), courseId, fromId: me.id, fromName: me.name, fromRole: 'teacher', toId: studentId, toName: student?.name || '', text, read: false, createdAt: new Date().toISOString() }
            await db.collection('chat_messages').insertOne(msg)
            await notify(db, [studentId], { type: 'chat', courseId, title: 'رسالة جديدة من المعلم', text: text.slice(0, 80), link: `course/${courseId}` })
            return ok({ message: { ...msg, _id: undefined } })
          }
        }
      }
    }

    // ===== ACTIVITIES — PUBLIC =====
    if (segs[0] === 'activities') {
      // GET /api/activities?type=&status=published&filter=upcoming|free|registration
      if (segs.length === 1 && method === 'GET') {
        const url = new URL(request.url)
        const type = url.searchParams.get('type')
        const filter = url.searchParams.get('filter') || 'all'
        const q = { status: 'Published' }
        if (type && type !== 'all') q.type = type
        if (filter === 'upcoming') q.date = { $gte: new Date().toISOString() }
        if (filter === 'free') q.isFree = true
        if (filter === 'registration') q.requiresRegistration = true
        const items = await db.collection('activities').find(q, { projection: { _id: 0 } }).sort({ date: 1 }).toArray()
        return ok({ items })
      }
      // GET /api/activities/<slug>
      if (segs.length === 2 && method === 'GET') {
        const slug = segs[1]
        const item = await db.collection('activities').findOne({ slug, status: { $in: ['Published', 'Cancelled'] } }, { projection: { _id: 0 } })
        if (!item) return ok({ error: 'not found' }, { status: 404 })
        return ok({ item })
      }
      // POST /api/activities/<slug>/register — public registration
      if (segs.length === 3 && segs[2] === 'register' && method === 'POST') {
        const slug = segs[1]
        const rl = rateLimit(`act_reg:${ip}`, 5, 60000)
        if (!rl.ok) return ok({ error: `محاولات كثيرة. حاول بعد ${rl.retryAfter} ثانية.` }, { status: 429 })
        const body = await request.json()
        const { name, email, phone, attendees, notes } = body
        if (!name || !email || !phone) return ok({ error: 'الاسم والبريد والجوال مطلوبة' }, { status: 400 })
        const att = Math.max(1, Math.min(10, parseInt(attendees) || 1))

        // Anti-oversell: atomic check + increment
        const activity = await db.collection('activities').findOne({ slug })
        if (!activity) return ok({ error: 'النشاط غير موجود' }, { status: 404 })
        if (activity.status !== 'Published') return ok({ error: 'هذا النشاط غير متاح للتسجيل حالياً' }, { status: 400 })
        if (!activity.requiresRegistration) return ok({ error: 'هذا النشاط لا يتطلّب تسجيلاً مسبقاً' }, { status: 400 })
        if (activity.registrationDeadline && new Date(activity.registrationDeadline).getTime() < Date.now()) {
          return ok({ error: 'انتهت فترة التسجيل لهذا النشاط' }, { status: 400 })
        }
        const total = activity.totalSeats || 0
        const taken = activity.registeredCount || 0
        if (total > 0 && taken + att > total) return ok({ error: 'المقاعد المتبقّية لا تكفي', remaining: Math.max(0, total - taken) }, { status: 400 })

        // Atomic increment with upper-bound check
        const updRes = await db.collection('activities').updateOne(
          { id: activity.id, $expr: { $lte: [{ $add: [{ $ifNull: ['$registeredCount', 0] }, att] }, { $ifNull: ['$totalSeats', 0] }] } },
          { $inc: { registeredCount: att } }
        )
        if (updRes.modifiedCount === 0) return ok({ error: 'تم نفاذ المقاعد للتو، حاول لاحقاً' }, { status: 409 })

        const reg = {
          id: uuidv4(),
          activityId: activity.id,
          activitySlug: activity.slug,
          activityTitle: activity.title,
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          attendees: att,
          notes: String(notes || '').trim(),
          status: 'Pending',
          adminNotes: '',
          createdAt: new Date().toISOString(),
        }
        await db.collection('activity_registrations').insertOne(reg)
        await logActivity(db, null, 'activity.register.public', 'activity', activity.id, { regId: reg.id, attendees: att, name: reg.name }, ip)

        // Notify all super_admins + managers
        const admins = await db.collection('users').find({ role: { $in: ['super_admin', 'manager'] }, disabled: { $ne: true } }, { projection: { id: 1 } }).toArray()
        await notify(db, admins.map(a => a.id), { type: 'activity_registration', title: 'تسجيل جديد في نشاط', text: `${reg.name} في "${activity.title}"`, link: `admin/activities/${activity.id}` })

        delete reg._id
        return ok({ ok: true, registration: reg })
      }
    }

    // ===== ACTIVITIES — ADMIN (super_admin + manager) =====
    if (segs[0] === 'admin' && segs[1] === 'activities') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (!['super_admin', 'manager'].includes(me.role)) return forbidden()

      // GET /api/admin/activities?status=&type=&search=
      if (segs.length === 2 && method === 'GET') {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const type = url.searchParams.get('type')
        const search = url.searchParams.get('search')
        const q = {}
        if (status && status !== 'all') q.status = status
        if (type && type !== 'all') q.type = type
        if (search) q.title = { $regex: search, $options: 'i' }
        const items = await db.collection('activities').find(q, { projection: { _id: 0 } }).sort({ date: -1 }).toArray()
        return ok({ items })
      }
      // POST /api/admin/activities — create
      if (segs.length === 2 && method === 'POST') {
        const body = await request.json()
        const id = uuidv4()
        let baseSlug = body.slug || activitySlugify(body.title || `activity-${id.slice(0, 6)}`)
        if (await db.collection('activities').findOne({ slug: baseSlug })) baseSlug = `${baseSlug}-${id.slice(0, 6)}`
        const doc = {
          id,
          slug: baseSlug,
          title: body.title || '',
          type: body.type || 'other',
          description: body.description || '',
          coverImage: body.coverImage || '',
          date: body.date || new Date().toISOString(),
          endTime: body.endTime || '',
          location: body.location || '',
          mapLink: body.mapLink || '',
          price: body.isFree ? 0 : Number(body.price) || 0,
          currency: body.currency || 'USD',
          isFree: !!body.isFree,
          requiresRegistration: !!body.requiresRegistration,
          totalSeats: body.requiresRegistration ? (parseInt(body.totalSeats) || 0) : 0,
          registeredCount: 0,
          registrationDeadline: body.registrationDeadline || '',
          status: body.status || 'Draft',
          createdAt: new Date().toISOString(),
        }
        await db.collection('activities').insertOne(doc)
        await logActivity(db, me, 'activity.create', 'activity', id, { title: doc.title }, ip)
        delete doc._id
        return ok({ item: doc })
      }
      // single activity by id
      if (segs.length === 3) {
        const id = segs[2]
        if (method === 'GET') {
          const item = await db.collection('activities').findOne({ id }, { projection: { _id: 0 } })
          if (!item) return ok({ error: 'not found' }, { status: 404 })
          return ok({ item })
        }
        if (method === 'PATCH') {
          const body = await request.json()
          const update = { ...body }
          delete update.id; delete update._id; delete update.createdAt
          // never trust client for registeredCount unless admin explicitly bumps totalSeats
          delete update.registeredCount
          // Re-slug if title changed and slug not provided
          if (body.title && !body.slug) {
            const base = activitySlugify(body.title)
            const existing = await db.collection('activities').findOne({ slug: base, id: { $ne: id } })
            update.slug = existing ? `${base}-${id.slice(0, 6)}` : base
          }
          // Coerce numeric fields
          if (update.price !== undefined) update.price = update.isFree ? 0 : Number(update.price) || 0
          if (update.totalSeats !== undefined) update.totalSeats = parseInt(update.totalSeats) || 0
          if (update.requiresRegistration === false) update.totalSeats = 0
          await db.collection('activities').updateOne({ id }, { $set: update })
          await logActivity(db, me, 'activity.update', 'activity', id, Object.keys(update), ip)
          const item = await db.collection('activities').findOne({ id }, { projection: { _id: 0 } })
          return ok({ item })
        }
        if (method === 'DELETE') {
          await db.collection('activities').deleteOne({ id })
          await db.collection('activity_registrations').deleteMany({ activityId: id })
          await logActivity(db, me, 'activity.delete', 'activity', id, {}, ip)
          return ok({ ok: true })
        }
      }
      // /api/admin/activities/<id>/registrations
      if (segs.length === 4 && segs[3] === 'registrations') {
        const activityId = segs[2]
        if (method === 'GET') {
          const items = await db.collection('activity_registrations').find({ activityId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
          return ok({ items })
        }
        if (method === 'POST') {
          const body = await request.json()
          const activity = await db.collection('activities').findOne({ id: activityId })
          if (!activity) return ok({ error: 'not found' }, { status: 404 })
          const att = Math.max(1, Math.min(20, parseInt(body.attendees) || 1))
          const total = activity.totalSeats || 0
          const taken = activity.registeredCount || 0
          if (activity.requiresRegistration && total > 0 && taken + att > total) return ok({ error: 'المقاعد لا تكفي', remaining: Math.max(0, total - taken) }, { status: 400 })
          if (activity.requiresRegistration) {
            await db.collection('activities').updateOne({ id: activityId }, { $inc: { registeredCount: att } })
          }
          const reg = {
            id: uuidv4(),
            activityId,
            activitySlug: activity.slug,
            activityTitle: activity.title,
            name: String(body.name || '').trim(),
            email: String(body.email || '').trim().toLowerCase(),
            phone: String(body.phone || '').trim(),
            attendees: att,
            notes: String(body.notes || '').trim(),
            status: body.status || 'Confirmed',
            adminNotes: String(body.adminNotes || '').trim(),
            createdAt: new Date().toISOString(),
            createdByAdmin: me.id,
          }
          await db.collection('activity_registrations').insertOne(reg)
          await logActivity(db, me, 'activity.register.admin', 'activity', activityId, { regId: reg.id, attendees: att }, ip)
          delete reg._id
          return ok({ item: reg })
        }
      }
      // /api/admin/activities/<id>/registrations/<regId>
      if (segs.length === 5 && segs[3] === 'registrations') {
        const activityId = segs[2]
        const regId = segs[4]
        if (method === 'PATCH') {
          const body = await request.json()
          const update = {}
          if (body.status !== undefined) update.status = body.status
          if (body.adminNotes !== undefined) update.adminNotes = String(body.adminNotes).trim()
          if (body.attendees !== undefined) {
            // Adjust seats accordingly
            const reg = await db.collection('activity_registrations').findOne({ id: regId, activityId })
            if (reg) {
              const newAtt = Math.max(1, Math.min(20, parseInt(body.attendees) || 1))
              const diff = newAtt - (reg.attendees || 0)
              if (diff !== 0) {
                const activity = await db.collection('activities').findOne({ id: activityId })
                if (activity?.requiresRegistration) {
                  const total = activity.totalSeats || 0
                  const taken = activity.registeredCount || 0
                  if (diff > 0 && total > 0 && taken + diff > total) return ok({ error: 'لا تكفي المقاعد للزيادة' }, { status: 400 })
                  await db.collection('activities').updateOne({ id: activityId }, { $inc: { registeredCount: diff } })
                }
              }
              update.attendees = newAtt
            }
          }
          await db.collection('activity_registrations').updateOne({ id: regId, activityId }, { $set: update })
          await logActivity(db, me, 'activity.register.update', 'registration', regId, update, ip)
          const item = await db.collection('activity_registrations').findOne({ id: regId }, { projection: { _id: 0 } })
          return ok({ item })
        }
        if (method === 'DELETE') {
          const reg = await db.collection('activity_registrations').findOne({ id: regId, activityId })
          if (reg) {
            const activity = await db.collection('activities').findOne({ id: activityId })
            if (activity?.requiresRegistration && reg.status !== 'Cancelled') {
              await db.collection('activities').updateOne({ id: activityId }, { $inc: { registeredCount: -(reg.attendees || 0) } })
              // ensure not negative
              await db.collection('activities').updateOne({ id: activityId, registeredCount: { $lt: 0 } }, { $set: { registeredCount: 0 } })
            }
            await db.collection('activity_registrations').deleteOne({ id: regId })
            await logActivity(db, me, 'activity.register.delete', 'registration', regId, { activityId, attendees: reg.attendees }, ip)
          }
          return ok({ ok: true })
        }
      }
      // CSV export: /api/admin/activities/<id>/export
      if (segs.length === 4 && segs[3] === 'export' && method === 'GET') {
        const activityId = segs[2]
        const activity = await db.collection('activities').findOne({ id: activityId })
        const items = await db.collection('activity_registrations').find({ activityId }).sort({ createdAt: -1 }).toArray()
        const escape = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`
        const rows = [
          ['Name', 'Email', 'Phone', 'Attendees', 'Status', 'Notes', 'Admin Notes', 'Created At'].map(escape).join(','),
          ...items.map(r => [r.name, r.email, r.phone, r.attendees, r.status, r.notes, r.adminNotes, r.createdAt].map(escape).join(',')),
        ]
        const csv = '\uFEFF' + rows.join('\n')
        return new NextResponse(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="activity-${(activity?.slug || activityId).slice(0, 50)}-registrations.csv"`,
          },
        })
      }
    }

    // ===== SITE CONTENT — PUBLIC =====
    // GET /api/content/<key> — fetch single content section
    if (segs[0] === 'content' && segs.length === 2 && method === 'GET') {
      const key = segs[1]
      if (!CONTENT_KEYS.includes(key)) return ok({ error: 'invalid key' }, { status: 400 })
      const doc = await db.collection('site_content').findOne({ key }, { projection: { _id: 0 } })
      return ok({ key, data: doc?.data || {} })
    }
    // GET /api/content — fetch all sections at once (for prefetch)
    if (path === 'content' && method === 'GET') {
      const docs = await db.collection('site_content').find({}, { projection: { _id: 0 } }).toArray()
      const map = {}
      for (const d of docs) map[d.key] = d.data || {}
      return ok({ content: map })
    }

    // ===== DYNAMIC LISTS — PUBLIC =====
    const PUBLIC_LIST_COLLECTIONS = {
      'team-members': 'team_members',
      'partnerships': 'partnerships',
      'visa-types-list': 'visa_types',
      'visa-faqs': 'visa_faqs',
      'consultation-types': 'consultation_types',
    }
    if (segs.length === 1 && PUBLIC_LIST_COLLECTIONS[segs[0]] && method === 'GET') {
      const coll = PUBLIC_LIST_COLLECTIONS[segs[0]]
      const items = await db.collection(coll).find({ published: { $ne: false } }, { projection: { _id: 0 } }).sort({ order: 1, createdAt: 1 }).toArray()
      return ok({ items })
    }

    // ===== SITE CONTENT — ADMIN (super_admin only) =====
    if (segs[0] === 'admin' && segs[1] === 'content') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (me.role !== 'super_admin') return forbidden()

      // GET /api/admin/content — list all
      if (segs.length === 2 && method === 'GET') {
        const docs = await db.collection('site_content').find({}, { projection: { _id: 0 } }).toArray()
        return ok({ items: docs })
      }
      // GET /api/admin/content/<key>
      if (segs.length === 3 && method === 'GET') {
        const key = segs[2]
        if (!CONTENT_KEYS.includes(key)) return ok({ error: 'invalid key' }, { status: 400 })
        const doc = await db.collection('site_content').findOne({ key }, { projection: { _id: 0 } })
        return ok({ key, data: doc?.data || {} })
      }
      // PUT/PATCH /api/admin/content/<key>
      if (segs.length === 3 && (method === 'PUT' || method === 'PATCH')) {
        const key = segs[2]
        if (!CONTENT_KEYS.includes(key)) return ok({ error: 'invalid key' }, { status: 400 })
        const body = await request.json()
        const data = body.data || {}
        await db.collection('site_content').updateOne(
          { key },
          { $set: { key, data, updatedAt: new Date().toISOString(), updatedBy: me.id } },
          { upsert: true }
        )
        await logActivity(db, me, 'content.update', 'site_content', key, Object.keys(data), ip)
        return ok({ key, data })
      }
    }

    // ===== DYNAMIC LISTS — ADMIN (super_admin only) =====
    const ADMIN_LIST_COLLECTIONS = {
      'team-members': 'team_members',
      'partnerships': 'partnerships',
      'visa-types-list': 'visa_types',
      'visa-faqs': 'visa_faqs',
      'consultation-types': 'consultation_types',
    }
    if (segs[0] === 'admin' && ADMIN_LIST_COLLECTIONS[segs[1]]) {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (me.role !== 'super_admin') return forbidden()
      const coll = ADMIN_LIST_COLLECTIONS[segs[1]]
      const resource = segs[1]

      // GET /api/admin/<resource> — list all (including unpublished)
      if (segs.length === 2 && method === 'GET') {
        const items = await db.collection(coll).find({}, { projection: { _id: 0 } }).sort({ order: 1, createdAt: 1 }).toArray()
        return ok({ items })
      }
      // POST /api/admin/<resource> — create
      if (segs.length === 2 && method === 'POST') {
        const body = await request.json()
        const id = uuidv4()
        const doc = {
          id,
          ...body,
          published: body.published !== false,
          order: typeof body.order === 'number' ? body.order : 999,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await db.collection(coll).insertOne(doc)
        await logActivity(db, me, `${resource}.create`, coll, id, {}, ip)
        const item = await db.collection(coll).findOne({ id }, { projection: { _id: 0 } })
        return ok({ item })
      }
      // GET /api/admin/<resource>/<id>
      if (segs.length === 3 && method === 'GET') {
        const item = await db.collection(coll).findOne({ id: segs[2] }, { projection: { _id: 0 } })
        if (!item) return ok({ error: 'not found' }, { status: 404 })
        return ok({ item })
      }
      // PATCH /api/admin/<resource>/<id>
      if (segs.length === 3 && (method === 'PATCH' || method === 'PUT')) {
        const id = segs[2]
        const body = await request.json()
        const update = { ...body, updatedAt: new Date().toISOString() }
        delete update.id
        delete update.createdAt
        await db.collection(coll).updateOne({ id }, { $set: update })
        await logActivity(db, me, `${resource}.update`, coll, id, Object.keys(update), ip)
        const item = await db.collection(coll).findOne({ id }, { projection: { _id: 0 } })
        return ok({ item })
      }
      // DELETE /api/admin/<resource>/<id>
      if (segs.length === 3 && method === 'DELETE') {
        const id = segs[2]
        await db.collection(coll).deleteOne({ id })
        await logActivity(db, me, `${resource}.delete`, coll, id, {}, ip)
        return ok({ ok: true })
      }
    }

    // ===== LEGAL PAGES — PUBLIC =====
    if (segs[0] === 'legal' && segs.length === 2 && method === 'GET') {
      const slug = segs[1]
      if (!LEGAL_PAGES.includes(slug)) return ok({ error: 'not found' }, { status: 404 })
      const page = await db.collection('legal_pages').findOne({ slug }, { projection: { _id: 0 } })
      if (!page || !page.published) return ok({ error: 'not found or unpublished' }, { status: 404 })
      return ok({ page })
    }

    // ===== LEGAL PAGES — ADMIN (super_admin only) =====
    if (segs[0] === 'admin' && segs[1] === 'legal') {
      const me = await getCurrentUser(db, request)
      if (!me) return unauth()
      if (me.role !== 'super_admin') return forbidden()

      // GET /api/admin/legal — list all
      if (segs.length === 2 && method === 'GET') {
        const items = await db.collection('legal_pages').find({}, { projection: { _id: 0 } }).sort({ slug: 1 }).toArray()
        return ok({ items })
      }
      // GET /api/admin/legal/<slug> — single
      if (segs.length === 3 && method === 'GET') {
        const slug = segs[2]
        const page = await db.collection('legal_pages').findOne({ slug }, { projection: { _id: 0 } })
        if (!page) return ok({ error: 'not found' }, { status: 404 })
        return ok({ page })
      }
      // PUT /api/admin/legal/<slug> — update content
      if (segs.length === 3 && (method === 'PUT' || method === 'PATCH')) {
        const slug = segs[2]
        if (!LEGAL_PAGES.includes(slug)) return ok({ error: 'invalid slug' }, { status: 400 })
        const body = await request.json()
        const update = {}
        const allowedFields = ['title_ar', 'title_de', 'content_ar', 'content_de', 'metaDescription_ar', 'metaDescription_de', 'published']
        for (const f of allowedFields) if (body[f] !== undefined) update[f] = body[f]
        update.updatedAt = new Date().toISOString()
        update.updatedBy = me.id
        await db.collection('legal_pages').updateOne({ slug }, { $set: update })
        await logActivity(db, me, 'legal.update', 'legal_page', slug, Object.keys(update), ip)
        const page = await db.collection('legal_pages').findOne({ slug }, { projection: { _id: 0 } })
        return ok({ page })
      }
    }

    return notFound()
  } catch (e) {
    console.error('API error:', e)
    return NextResponse.json({ error: 'server_error', message: e.message }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
