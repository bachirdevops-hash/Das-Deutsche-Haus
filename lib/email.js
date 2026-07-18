// 📧 Resend email integration — best-effort, never blocks API responses
// - If RESEND_API_KEY is missing → silently logs to email_logs as "skipped"
// - Every attempt (success/fail) is logged to MongoDB email_logs collection
// - Built-in Arabic RTL templates with DDH brand colors

import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

const BRAND = {
  red: '#CC0000',
  gold: '#FFCE00',
  black: '#1A1A1A',
  bg: '#FAFAF8',
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Das Deutsche Haus <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bachir.devops@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

let _resend = null
function getResend() {
  if (_resend) return _resend
  if (!process.env.RESEND_API_KEY) return null
  _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

// ===== Email logger =====
async function logEmail(db, doc) {
  try {
    await db.collection('email_logs').insertOne({
      id: uuidv4(),
      ...doc,
      createdAt: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[email_log] error:', e?.message)
  }
}

/**
 * Send an email — best-effort, never throws, always logs.
 * @param {object} db - MongoDB db instance
 * @param {object} args - { type, to, subject, html, replyTo, idempotencyKey, meta }
 */
export async function sendEmail(db, args) {
  const { type, to, subject, html, text, replyTo, cc, idempotencyKey, meta } = args
  const base = {
    provider: 'resend',
    type,
    from: FROM_EMAIL,
    to,
    subject,
    meta: meta || {},
  }

  const resend = getResend()
  if (!resend) {
    await logEmail(db, { ...base, status: 'skipped', error: 'RESEND_API_KEY missing' })
    return { ok: false, skipped: true }
  }

  try {
    const payload = { from: FROM_EMAIL, to, subject, html, text, replyTo, cc }
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])
    const options = idempotencyKey ? { idempotencyKey } : undefined
    const { data, error } = await resend.emails.send(payload, options)
    if (error) {
      await logEmail(db, { ...base, status: 'failed', error: error?.message || JSON.stringify(error) })
      return { ok: false, error }
    }
    await logEmail(db, { ...base, status: 'sent', providerMessageId: data?.id || null })
    return { ok: true, id: data?.id }
  } catch (e) {
    await logEmail(db, { ...base, status: 'failed', error: String(e?.message || e) })
    return { ok: false, error: e }
  }
}

// ===== Base RTL Arabic email layout =====
function layout({ title, body, footerNote }) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:${BRAND.black};direction:rtl;text-align:right;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;background:${BRAND.bg};">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="height:6px;background:linear-gradient(90deg,${BRAND.black} 0%,${BRAND.red} 50%,${BRAND.gold} 100%);"></td></tr>
        <tr><td style="padding:32px 36px 12px;text-align:center;">
          <div style="display:inline-block;background:${BRAND.black};color:${BRAND.gold};padding:8px 16px;border-radius:50px;font-size:11px;font-weight:bold;letter-spacing:1px;">DAS DEUTSCHE HAUS · معهد ألماني</div>
        </td></tr>
        <tr><td style="padding:12px 36px 8px;text-align:right;">
          <h1 style="margin:0 0 8px;color:${BRAND.red};font-size:22px;line-height:1.4;font-weight:900;">${title}</h1>
        </td></tr>
        <tr><td style="padding:8px 36px 32px;text-align:right;color:${BRAND.black};font-size:14.5px;line-height:1.9;">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 36px;background:#fafafa;border-top:1px solid #eee;text-align:center;color:#888;font-size:11.5px;line-height:1.7;">
          ${footerNote || ''}
          <div style="margin-top:8px;color:#aaa;">© ${new Date().getFullYear()} Das Deutsche Haus — جسر بين سوريا وألمانيا 🇸🇾 🇩🇪</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function btn(href, label, color = BRAND.red, textColor = '#fff') {
  return `<a href="${href}" target="_blank" style="display:inline-block;background:${color};color:${textColor};padding:13px 26px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px;margin:4px 4px 4px 0;">${label}</a>`
}

function infoRow(label, value) {
  if (!value) return ''
  return `<tr><td style="padding:6px 0;color:#666;font-size:12px;width:35%;">${label}</td><td style="padding:6px 0;font-weight:bold;font-size:13px;" dir="ltr">${value}</td></tr>`
}

// ===== Email Templates =====

// 1. Admin notification: new lead from public form
export function tmplAdminNewLead({ leadType, lead }) {
  const labels = {
    course_registration: { ar: 'تسجيل جديد في كورس', emoji: '🎓' },
    telc_booking: { ar: 'حجز جديد لامتحان telc', emoji: '🏆' },
    vocational_application: { ar: 'طلب Ausbildung جديد', emoji: '💼' },
    travel_consultation: { ar: 'طلب استشارة تأشيرة', emoji: '✈️' },
  }
  const l = labels[leadType] || { ar: 'طلب جديد', emoji: '📩' }
  const subject = `${l.emoji} [DDH] ${l.ar} — ${lead.name || lead.email}`

  const detailsTable = `<table cellpadding="0" cellspacing="0" style="width:100%;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px 16px;margin:12px 0;">
    ${infoRow('الاسم', lead.name)}
    ${infoRow('البريد', lead.email)}
    ${infoRow('الهاتف', lead.phone)}
    ${infoRow('الكورس', lead.courseName || lead.level)}
    ${infoRow('الامتحان', lead.type)}
    ${infoRow('الوظيفة', lead.jobTitle)}
    ${infoRow('نوع الاستشارة', lead.consultationTypeName || lead.visaType)}
    ${infoRow('السعر', lead.price_usd ? `$${lead.price_usd}` : (lead.price ? `$${lead.price}` : null))}
    ${infoRow('التاريخ المفضّل', lead.preferredDate)}
    ${infoRow('ملاحظات', lead.notes)}
  </table>`

  const body = `
    <p style="margin:0 0 8px;">وصل طلب جديد عبر نموذج الموقع. التفاصيل أدناه:</p>
    ${detailsTable}
    <p style="margin:20px 0 8px;">
      ${btn(`${APP_URL}/?page=admin#inbox`, 'افتح في لوحة الإدارة', BRAND.red)}
      ${lead.email ? btn(`mailto:${lead.email}`, 'الرد على العميل', '#fff', BRAND.black) : ''}
    </p>
    <p style="color:#999;font-size:12px;margin-top:24px;">يمكنك من لوحة الإدارة اعتماد الطلب وإنشاء حساب طالب تلقائياً بنقرة واحدة.</p>
  `
  return { subject, html: layout({ title: `${l.emoji} ${l.ar}`, body, footerNote: 'إشعار إداري — Das Deutsche Haus' }) }
}

// 2. User welcome — credentials after admin converts lead to user
export function tmplUserWelcome({ name, email, password, loginUrl }) {
  const subject = `🎉 مرحباً بك في Das Deutsche Haus — بيانات الدخول`
  const credsBox = password ? `<div style="background:${BRAND.gold}15;border:2px dashed ${BRAND.gold};border-radius:12px;padding:18px;margin:18px 0;text-align:right;">
    <div style="font-size:12px;color:#666;margin-bottom:4px;">📧 البريد الإلكتروني</div>
    <div style="font-family:monospace;font-size:14px;font-weight:bold;margin-bottom:14px;direction:ltr;text-align:left;background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #eee;">${email}</div>
    <div style="font-size:12px;color:#666;margin-bottom:4px;">🔑 كلمة المرور المؤقتة</div>
    <div style="font-family:monospace;font-size:16px;font-weight:bold;color:${BRAND.red};direction:ltr;text-align:left;background:#fff;padding:10px 12px;border-radius:6px;border:2px solid ${BRAND.gold};">${password}</div>
    <p style="margin:14px 0 0;font-size:12px;color:${BRAND.red};">⚠️ يُرجى تغيير كلمة المرور بعد أول دخول لحسابك.</p>
  </div>` : ''
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">مرحباً <strong>${name}</strong> 👋</p>
    <p style="margin:0 0 12px;">يسعدنا انضمامك إلى عائلة <strong>Das Deutsche Haus</strong>. تم اعتماد طلبك من قبل المستشار، وأنشأنا لك حساباً طلابياً.</p>
    ${credsBox}
    <p style="margin:8px 0;">${btn(loginUrl || APP_URL, '🚀 تسجيل الدخول الآن', BRAND.red)}</p>
    <p style="margin:24px 0 8px;font-weight:bold;">داخل حسابك يمكنك:</p>
    <ul style="margin:0 0 16px;padding-right:20px;line-height:2;">
      <li>متابعة الكورسات والحضور</li>
      <li>الوصول لمواد الدراسة والواجبات</li>
      <li>التواصل مع المدرّسين</li>
      <li>حجز امتحانات telc وطلب استشارات</li>
    </ul>
    <p style="color:#666;font-size:13px;margin-top:24px;">إذا واجهت أي مشكلة، تواصل معنا على WhatsApp أو ردّ على هذا الإيميل.</p>
  `
  return { subject, html: layout({ title: '🎉 أهلاً بك في رحلتك إلى ألمانيا!', body }) }
}

// 3. Public form confirmation — sent to the lead submitter
export function tmplLeadConfirmation({ leadType, name }) {
  const labels = {
    course_registration: 'طلب التسجيل في الكورس',
    telc_booking: 'حجز امتحان telc',
    vocational_application: 'طلب التدريب المهني',
    travel_consultation: 'طلب الاستشارة',
  }
  const what = labels[leadType] || 'طلبك'
  const subject = `✅ تم استلام ${what} — Das Deutsche Haus`
  const body = `
    <p style="margin:0 0 12px;font-size:15px;">مرحباً <strong>${name || 'عزيزنا الطالب'}</strong> 👋</p>
    <p style="margin:0 0 12px;">شكراً لاهتمامك بـ <strong>Das Deutsche Haus</strong>. تم استلام ${what} بنجاح.</p>
    <div style="background:#f0f9ff;border-right:4px solid ${BRAND.red};padding:14px 18px;margin:16px 0;border-radius:8px;">
      <p style="margin:0;font-weight:bold;color:${BRAND.red};">⏱ ماذا يحدث بعد ذلك؟</p>
      <p style="margin:6px 0 0;font-size:13px;color:#555;">سيتواصل معك مستشارنا خلال <strong>24 ساعة عمل</strong> لتأكيد التفاصيل وإرشادك للخطوة التالية.</p>
    </div>
    <p style="margin:16px 0 8px;font-weight:bold;">للتواصل المباشر:</p>
    <p style="margin:0 0 16px;line-height:2;">
      ${btn('https://wa.me/963000000000', 'WhatsApp', '#25D366')}
      ${btn(APP_URL, 'زيارة الموقع', BRAND.black, BRAND.gold)}
    </p>
    <p style="color:#999;font-size:12px;margin-top:24px;">هذا إيميل تلقائي — يمكنك الرد عليه مباشرة وسنصلك.</p>
  `
  return { subject, html: layout({ title: `✅ تم استلام ${what}!`, body }) }
}

// 4. Password reset
export function tmplPasswordReset({ name, resetUrl }) {
  const subject = `🔐 إعادة تعيين كلمة المرور — Das Deutsche Haus`
  const body = `
    <p style="margin:0 0 12px;">مرحباً <strong>${name || 'عزيزنا'}</strong>،</p>
    <p style="margin:0 0 12px;">طلبت إعادة تعيين كلمة المرور لحسابك. اضغط على الزر التالي خلال ساعة من الآن:</p>
    <p style="margin:20px 0;">${btn(resetUrl, 'إعادة تعيين كلمة المرور', BRAND.red)}</p>
    <p style="color:#666;font-size:13px;">إذا لم تطلب هذا، يمكنك تجاهل الإيميل بأمان — كلمة مرورك ستبقى كما هي.</p>
    <p style="background:#fef9e7;padding:12px;border-radius:8px;color:#7a6f00;font-size:12px;margin-top:20px;">🔒 لا تشارك هذا الرابط مع أي شخص. فريقنا لن يطلب منك كلمة مرورك أبداً.</p>
  `
  return { subject, html: layout({ title: '🔐 إعادة تعيين كلمة المرور', body }) }
}

// ===== Convenience wrappers used by API =====

export async function emailNewLeadToAdmin(db, leadType, lead) {
  const tmpl = tmplAdminNewLead({ leadType, lead })
  return sendEmail(db, {
    type: `admin_${leadType}`,
    to: ADMIN_EMAIL,
    subject: tmpl.subject,
    html: tmpl.html,
    replyTo: lead.email,
    idempotencyKey: `admin-${leadType}-${lead.id || Date.now()}`,
    meta: { leadId: lead.id, leadType },
  })
}

export async function emailConfirmationToLead(db, leadType, lead) {
  if (!lead.email) return { ok: false, skipped: true }
  const tmpl = tmplLeadConfirmation({ leadType, name: lead.name })
  return sendEmail(db, {
    type: `confirm_${leadType}`,
    to: lead.email,
    subject: tmpl.subject,
    html: tmpl.html,
    idempotencyKey: `confirm-${leadType}-${lead.id || Date.now()}`,
    meta: { leadId: lead.id, leadType },
  })
}

export async function emailWelcomeUser(db, { name, email, password }) {
  const tmpl = tmplUserWelcome({ name, email, password, loginUrl: APP_URL })
  return sendEmail(db, {
    type: 'user_welcome',
    to: email,
    subject: tmpl.subject,
    html: tmpl.html,
    idempotencyKey: `welcome-${email}-${Date.now()}`,
    meta: { email },
  })
}

export async function emailPasswordReset(db, { name, email, resetUrl }) {
  const tmpl = tmplPasswordReset({ name, resetUrl })
  return sendEmail(db, {
    type: 'password_reset',
    to: email,
    subject: tmpl.subject,
    html: tmpl.html,
    idempotencyKey: `reset-${email}-${Date.now()}`,
    meta: { email },
  })
}

export { ADMIN_EMAIL, FROM_EMAIL }
