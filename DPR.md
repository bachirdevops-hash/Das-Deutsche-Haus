# Das Deutsche Haus — تقرير المشروع الكامل (DPR)
> Detailed Project Report — آخر تحديث: أغسطس 2026
> هذا المستند هو المرجع الشامل للمشروع: أي مطوّر أو مالك عمل يقرأه يفهم كل شيء عن الموقع، بنيته، وكيفية تطويره مستقبلاً.

---

## 1. نظرة عامة

**Das Deutsche Haus** موقع ثنائي اللغة (عربي RTL + ألماني LTR) لمؤسسة تعليمية تخدم جمهورين:

1. **الجمهور العربي (الأساسي)**: تعليم اللغة الألمانية أونلاين، فرص التدريب المهني Ausbildung في ألمانيا، استشارات الدراسة والسفر والتأشيرات.
2. **الجمهور الألماني**: صفحة مستقلة `/german-visitors` (Für deutsche Besucher) لخدمات السفر والسياحة إلى سوريا.

- **الدومين الرسمي**: das-deutsche-haus.com
- **البريد الرسمي**: info@das-deutsche-haus.com
- **واتساب/هاتف**: +49 1525 4196668 (بصيغة الأنظمة: 4915254196668)
- **العنوان الظاهر**: دمشق — المزة
- **سنة التأسيس المعلنة**: 2018

### مبادئ حاكمة (لا تُكسر)
- ❌ **ممنوع اختراع معلومات تجارية**: لا شهادات معتمدة، لا معادلة شهادات، لا أرقام طلاب/نجاح غير موثقة، لا شركاء أو شعارات دون إذن، لا بيانات Impressum قانونية مخترعة. أي نقص يصنّف `BUSINESS INFORMATION REQUIRED`.
- ✅ كل المحتوى التسويقي قابل للتحرير من لوحة الأدمن (CMS) — لا نصوص hardcoded لها محرر.
- ✅ التواصل مع المالك بالعربية فقط؛ الكود والتقنيات بالإنجليزية.
- ✅ الحفاظ على الهوية البصرية القائمة (ألوان العلم الألماني: أسود `#1A1A1A`، أحمر `#CC0000`، ذهبي `#FFCE00`، أزرق ثانوي `#2C5F9E`).

---

## 2. التقنيات (Tech Stack)

| الطبقة | التقنية |
|---|---|
| Framework | Next.js 14.2.3 (App Router) — frontend + backend معاً |
| UI | React 18، Tailwind CSS، shadcn/ui، lucide-react icons، sonner (toasts) |
| Database | MongoDB Atlas (عبر `MONGO_URL` + `DB_NAME`) |
| Auth | JWT مخصص (cookie اسمه `ddh_token`) + bcrypt لكلمات المرور |
| Email | **Resend** (الرسمي) — دومين موثّق، sender: `Das Deutsche Haus <noreply@das-deutsche-haus.com>` |
| Files/Images | Cloudinary (رفع صور بتوقيع server-side) |
| Package manager | **yarn فقط** (ممنوع npm) |
| Process manager | supervisor — أمر التشغيل `yarn dev` = `next build && next start` (**production build**، لا يوجد hot reload!) |
| IDs | UUID v4 لكل السجلات (ممنوع Mongo ObjectID في الـ JSON) |

### ⚠️ ملاحظات تشغيلية حرجة
- أي تعديل كود يتطلب: `sudo supervisorctl restart nextjs` ثم انتظار ~60-90 ثانية (build كامل).
- سجل الخادم: `/var/log/supervisor/nextjs.out.log` (لا يوجد `.err.log`).
- **بيئة المعاينة والإنتاج تتشاركان نفس قاعدة البيانات** — أي تعديل بيانات ينعكس على الإنتاج فوراً، بينما تعديلات الكود تتطلب Deploy.
- كل الـ APIs تحت البادئة `/api` (قاعدة توجيه Kubernetes ingress).
- ممنوع تعديل URLs/ports في `.env`.

### متغيرات البيئة (الأسماء فقط — القيم سرية)
`MONGO_URL`, `DB_NAME`, `NEXT_PUBLIC_BASE_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_EMAIL`
- متغيرات `SENDGRID_*` قديمة (legacy) — **غير مستخدمة**؛ كل الإيميلات عبر Resend حصراً.

---

## 3. بنية المشروع

```text
/app
├── app/
│   ├── page.js                  ← SPA الرئيسي (أكبر ملف): الرئيسية + كل الصفحات الداخلية
│   │                              (courses, vocational, travel, about, contact, dashboard,
│   │                               admin panel, teacher panel) عبر state داخلي `page`
│   ├── layout.js                 ← SEO metadata + JSON-LD + خطوط + viewport
│   ├── api/[[...path]]/route.js  ← الـ API monolith الكامل (~2000 سطر، كل الـ endpoints)
│   ├── visa-types/page.js        ← صفحة الاستشارات + نظام حجز المواعيد (#booking)
│   ├── german-visitors/page.js   ← صفحة الزوار الألمان الكاملة (LTR)
│   ├── activities/ + [slug]/     ← النشاطات والفعاليات
│   ├── blog/ + [slug]/           ← المدونة
│   ├── impressum/ privacy/ terms/ ← الصفحات القانونية (من DB عبر LegalPageRenderer)
│   ├── sitemap.js + robots.js    ← SEO
│   └── globals.css               ← ستايلات العلامة (flag-gradient, btn-primary...)
├── components/
│   ├── ddh/
│   │   ├── PhoneInput.jsx        ← حقل هاتف دولي موحّد (رمز دولة + أرقام فقط)
│   │   ├── HeroSlideshow, ErrorBoundary, RichTextEditor, shared.jsx (ConfirmDialog...)
│   │   ├── layout/  (Header, Footer, NotificationBell, WhatsAppFloat)
│   │   ├── auth/    (AuthDialog, ResetPasswordDialog)
│   │   ├── legal/   (LegalPageRenderer)
│   │   └── admin/   (لوحات الأدمن — كل مجلد = تبويب)
│   │       ├── inbox/InboxAdminPanel.jsx        ← صندوق الواردات الموحّد + شارات + طباعة
│   │       ├── consultations/ConsultationSlotsAdminPanel.jsx ← مواعيد الاستشارات
│   │       ├── courses/ jobs/ blog/ activities/ german/ legal/ site/ email/ features/
│   └── ui/                       ← shadcn components
├── lib/
│   ├── email.js                  ← Resend: sendEmail(db, args) + كل القوالب + email_logs
│   ├── translations.js           ← نصوص الواجهة ar/de
│   ├── site_content_seed.js      ← مفاتيح CMS + القيم الافتراضية + seeder
│   ├── german_seed.js, blog_seed.js, activities seeds, legal_seed.js, features.js
│   └── content.js                ← fetchContent/fetchList helpers (client)
├── scripts/                      ← سكربتات صيانة DB سابقة
├── memory/test_credentials.md    ← بيانات دخول الاختبار (للوكلاء)
├── test_result.md                ← سجل الاختبارات وبروتوكول وكلاء الاختبار
└── DPR.md                        ← هذا الملف
```

### ملاحظة معمارية
`app/page.js` هو **SPA بحالة داخلية** — التنقل بين "الصفحات" الداخلية عبر `goto(page)` وليس مسارات URL (باستثناء الصفحات المستقلة: visa-types، german-visitors، blog، activities، القانونية). دالة `doAction` تدعم: `goto:page`، `goto:page#section` (تمرير مباشر للقسم)، `href:/path`، روابط خارجية، `signup/login`.

---

## 4. الأدوار والصلاحيات (Roles)

| الدور | الصلاحيات |
|---|---|
| `super_admin` | كل شيء: لوحة الإدارة العليا كاملة، كل تبويباتها، إدارة المستخدمين |
| `manager` | إدارة كورسات/مهن/طلبات (لوحة مدير مصغّرة) |
| `teacher` | لوحة معلم: طلابه، جلسات، مواد، درجات، حضور، محادثات |
| `student` | Dashboard شخصي: كورساته، طلباته، استشاراته، مواد، درجات، محادثة المعلم |
| زائر | كل الصفحات العامة + كل الاستمارات (بدون حساب) |

- الدخول: `POST /api/auth/login` → cookie `ddh_token` (JWT).
- استعادة كلمة المرور عبر إيميل Resend (`password_resets`).
- **بيانات دخول الاختبار** في `/app/memory/test_credentials.md`.
- الحماية server-side دائماً: أي `/api/admin/*` يتحقق من الدور قبل التنفيذ (401/403).

---

## 5. قاعدة البيانات — Collections (38)

### المستخدمون والتعليم
| Collection | الغرض |
|---|---|
| `users` | كل الحسابات (بالأدوار أعلاه)، bcrypt passwords |
| `courses` | كورسات اللغة A1–C2 (سعر، جدول، مقاعد، تواريخ) |
| `course_registrations` | تسجيلات الكورسات (من استمارة عامة أو حساب) |
| `course_materials` / `course_sessions` | مواد وجلسات لكل كورس |
| `grades` / `attendance` | درجات وحضور الطلاب |
| `chat_messages` | محادثات طالب↔معلم |
| `announcements` | إعلانات |

### Ausbildung (التدريب المهني)
| Collection | الغرض |
|---|---|
| `vocational_jobs` | فرص Ausbildung (title_ar/de، partner، duration، salary، requirements، `is_active`) — تُدار من الأدمن |
| `vocational_applications` | طلبات التقديم: jobId (مرتبط server-side)، name، email، phone، country، germanLevel (A1–C2/Noch nicht gelernt)، education (Hauptschule→Universität)، notes، status، jobTitle+jobTitle_de منسوخة من سجل الفرصة |

### الاستشارات
| Collection | الغرض |
|---|---|
| `consultation_slots` | مواعيد متاحة (date، startTime/endTime، duration، status: available/booked، bookingId) — unique index على (date+startTime)، توقيت Europe/Berlin |
| `consultation_types` | أنواع الاستشارات (اسم، مدة، سعر) |
| `travel_consultations` | الحجوزات + الاستشارات القديمة (slot bookings تأخذ status: confirmed/cancelled؛ القديمة: new) — الإلغاء يحفظ السجل ويحرّر الـ slot |

### التواصل والمحتوى
| Collection | الغرض |
|---|---|
| `contact_messages` | رسائل "تواصل معنا" |
| `site_content` | كل محتوى CMS (hero، خدمات، رحلة، about، صفحة الاستشارات...) — مفاتيح محددة في `CONTENT_KEYS` |
| `team_members` | فريق العمل (**البذرة فارغة عمداً** — المالك يضيف الفريق الحقيقي؛ الأعضاء الوهميون حُذفوا نهائياً) |
| `partnerships` | شعارات/شراكات (يجب التحقق من أذونات الاستخدام) |
| `visa_types` / `visa_faqs` | محتوى صفحة الاستشارات |
| `blog_posts` | المدونة (ar/de) |
| `activities` / `activity_registrations` | نشاطات + تسجيلاتها (status: Pending) |
| `legal_pages` | Impressum/Privacy/Terms (بيانات Impressum الحقيقية **BUSINESS INFORMATION REQUIRED**) |
| `site_features` | Feature flags لتشغيل/إطفاء أقسام |

### الزوار الألمان (german-visitors)
`german_page_settings` (إعدادات + whatsapp_number)، `german_packages`، `german_experiences`، `german_why_cards`، `german_faq`، `german_flashcards`، `german_testimonials`، `german_gallery`، `german_bookings` (status: New)، `german_service_requests` (status: New)، `emergency_contacts` (سفارات + دعم DDH)

### النظام
`notifications` (إشعارات داخلية بالجرس)، `email_logs` (سجل كل إيميل: type، to، status sent/failed)، `activity_logs` (سجل عمليات الأدمن)، `password_resets`

---

## 6. الـ API — الخريطة الكاملة (`/app/app/api/[[...path]]/route.js`)

### عامة (Public)
| Endpoint | الوظيفة |
|---|---|
| `GET /api/health` | فحص صحة |
| `POST /api/auth/signup|login|logout` + `GET/PATCH /api/auth/me` + `forgot/reset-password` | المصادقة |
| `GET /api/courses` | الكورسات |
| `POST /api/course-registrations` | تسجيل كورس (rate-limited، إيميلات للطرفين) |
| `GET /api/vocational/jobs` | فرص Ausbildung **النشطة فقط** (`is_active !== false`) |
| `POST /api/vocational/applications` | تقديم Ausbildung — **مقوّى بالكامل**: whitelist للحقول، تحقق email regex، germanLevel من قائمة مغلقة، تحقق الفرصة server-side (404 لو غير موجودة/معطلة)، منع تكرار (409 نفس email+jobId لطلب مفتوح)، rate limit 8/دقيقة (429)، رسائل خطأ بشرية ar/de حسب `body.lang`، status: `new` |
| `GET /api/consultation-slots` | المواعيد المتاحة للزوار (لا يكشف bookingId) |
| `POST /api/consultation-bookings` | حجز موعد (atomic — سباق التزامن: الأول 200 والثاني 409) |
| `POST /api/travel/consultations` | استشارة عامة (النموذج القديم في صفحة travel) |
| `POST /api/contact` | رسالة تواصل |
| `GET /api/about/page-data` | **bulk**: hero+mission+team+partnerships بطلب واحد (تسريع) |
| `GET /api/content` + `GET /api/content/<key>` | محتوى CMS |
| `GET /api/team-members|partnerships|visa-types-list|visa-faqs|consultation-types` | قوائم عامة (published فقط) |
| `GET /api/blog...` `GET /api/activities...` + `POST` تسجيل نشاط | مدونة ونشاطات |
| `GET /api/legal/<slug>` | الصفحات القانونية |
| `GET /api/german/page-data` | **bulk** لصفحة الزوار الألمان (9 مجموعات بطلب واحد) |
| `POST /api/german/bookings` + `POST /api/german/service-requests` | استمارتا الزوار الألمان — إيميل للإدارة + تأكيد ألماني للزائر (Resend) |
| `GET /api/site-features` | الـ feature flags |
| `POST /api/cloudinary/signature|delete` | رفع/حذف صور موقّع |

### الأدمن (super_admin فقط — `/api/admin/*`)
| Endpoint | الوظيفة |
|---|---|
| `GET /api/admin/inbox-counts` | **عدّادات الشارات**: طلبات جديدة لكل نوع + german + activities + inboxTotal |
| `GET/PATCH/DELETE /api/admin/{course-registrations|vocational-applications|travel-consultations|contact-messages}` | صندوق الواردات الموحّد (تغيير status، adminNotes، حذف) |
| `/api/admin/consultation-slots` + `/generate` + إلغاء حجز | إدارة المواعيد (توليد جماعي بفواصل، منع تداخل، منع حذف/تعطيل slot محجوز، رفض الماضي بتوقيت Berlin) |
| `/api/admin/german/*` | إدارة كل محتوى وطلبات صفحة الزوار الألمان |
| `/api/admin/blog`، `/api/admin/activities` (+CSV export)، `/api/admin/content`، `/api/admin/legal`، `/api/admin/email-logs`، قوائم عامة (team-members...) | بقية الإدارة |
| إدارة المستخدمين (إنشاء/تعديل/تعطيل/كلمات مرور) + `activity_logs` | |

### أدوار أخرى
- `/api/manager/*` (كورسات/مهن/طلبات)، `/api/teacher/*`، `/api/student/*`، `/api/dashboard`، `/api/notifications` (جرس الإشعارات الداخلي)

### حماية عامة في الـ API
- Rate limiting in-memory: تقديم Ausbildung 8/د، تسجيل نشاط 5/د، استمارات german 5/د، الحجوزات...
- كل مدخلات الاستمارات تُنظَّف وتُقصّ (slice) — لا mass-assignment.
- الأخطاء برسائل بشرية (لا stack traces).

---

## 7. نظام الإيميلات (Resend) — `lib/email.js`

- الدالة المركزية: **`sendEmail(db, { to, subject, html, type, meta })`** — توقيعها يبدأ بـ `db` (يسجّل تلقائياً في `email_logs`). ⚠️ خطأ شائع سابق: استدعاؤها بوسيط واحد → فشل صامت (أُصلح نهائياً وحُذف كود SendGrid القديم).
- `ADMIN_EMAIL` = وجهة إشعارات الإدارة (ليس حساب دخول!).
- التدفقات المفعّلة (إيميل للإدارة + تأكيد للعميل):
  - تسجيل كورس، تقديم Ausbildung (مع germanLevel/education/country في جدول الإدارة)، حجز استشارة، رسالة تواصل، استمارتا الزوار الألمان (`admin_german_booking/service` + `confirm_...` بالألمانية)، ترحيب مستخدم جديد، استعادة كلمة مرور.
- كل إرسال يسجَّل في `email_logs` (يظهر في تبويب "سجل الإيميلات").

---

## 8. أنظمة رئيسية — كيف تعمل

### 8.1 نظام حجز الاستشارات (visa-types → #booking)
- فصل معماري: **Slots** (التوفر) عن **Bookings** (السجل).
- الأدمن يولّد مواعيد (تاريخ + من/إلى + مدة + استراحة) → الزائر يرى المتاح فقط → يختار → يعبّي بياناته → حجز atomic → إيميلات + إشعار.
- الإلغاء الإداري يبقي الحجز بحالة `cancelled` ويعيد الموعد متاحاً. لا إلغاء ذاتي للزائر (قرار مقصود).
- CTA "احجز استشارة" في كل الموقع يهبط مباشرة على `#booking` (مع تعويض الهيدر الثابت `scroll-mt`).

### 8.2 تدفق التقديم على Ausbildung (شُحن واختُبر 18/18)
زائر يرى البطاقات → "قدّم الآن" → تمرير مباشر لقسم `#bewerbung` بنفس الصفحة → "التقديم على: {اسم الفرصة}" تلقائياً → استمارة قصيرة (اسم/بريد/هاتف دولي/بلد/مستوى ألماني/مؤهل/رسالة اختيارية) → تحقق فوري برسائل مفهومة → زر بحالات (إرسال/جارٍ/نجاح) → يظهر عند الأدمن مرتبطاً بالفرصة الصحيحة.
- **بدون** رفع CV/ملفات و**بدون** سؤال "متى تبدأ" (قرار مقصود).

### 8.3 صندوق الواردات الموحّد + الإشعارات الرقمية
- 4 تبويبات: تسجيلات الكورسات، طلبات Ausbildung، استشارات سفر، رسائل التواصل — لكل تبويب **شارة حمراء بعدد الجديد**.
- بلاطات لوحة الإدارة نفسها تحمل شارات: **الواردات** (المجموع)، **الزوار الألمان** (حجوزات+خدمات New)، **النشاطات** (Pending) — تحديث تلقائي كل 60 ثانية.
- حالات الطلب: new / pending_payment / contacted / converted / closed.
- **زر طباعة** لكل طلب: يفتح مستند نظيف بترويسة المؤسسة ويطلق نافذة الطباعة (طباعة أو حفظ PDF من المتصفح مباشرة). زر "إنشاء حساب" أُزيل بطلب المالك.

### 8.4 حقل الهاتف الموحّد `PhoneInput`
- أرقام فقط (تنظيف تلقائي) + قائمة 33 رمز دولة (عربية + أوروبية) بأسماء حسب اللغة.
- الافتراضي: +963 للعربية، +49 للألمانية. القيمة المخزنة: `"+49 15254196668"`.
- مطبق على: تقديم Ausbildung، تسجيل كورس، حجز استشارة، استشارة travel، استمارتي german-visitors.

### 8.5 CMS (محتوى الصفحات)
- كل أقسام الرئيسية (hero، شارة، أزرار CTA وأفعالها، الخدمات، خطوات الرحلة، الإحصائيات، عن المعهد) + صفحة الاستشارات تُحرَّر من: لوحة الإدارة → **محتوى الصفحات**.
- الـ fallbacks في الكود مطابقة للمزروع في DB (لا وميض/ازدواجية).
- زر رحلة "ابدأ بالخطوة الأولى" → `goto:contact#contact-form` (يهبط على الاستمارة مباشرة).

### 8.6 البذر (Seeding) — سلوك مهم جداً
- يعمل **مرة واحدة لكل تشغيل خادم** (`global.__ddhSeeded`) ويملأ فقط **الفارغ تماماً**.
- ⚠️ عبرة سابقة: أي defaults في البذرة ستعود بعد الحذف الكامل من الأدمن إذا بقيت في الكود — لذلك حُذف الفريق الوهمي (Klaus Müller/فاطمة عبد الله) **من الكود والقاعدة معاً**. عند حذف بيانات نهائياً: احذفها من البذرة أيضاً.
- بذرة الكورسات والمهن تعمل فقط إذا كانت `courses` فارغة (البيانات الحالية حقيقية من الأدمن: فرصتا تمريض وعلاج طبيعي).

### 8.7 صفحة الزوار الألمان
- بيانات واحدة bulk (`/api/german/page-data`)، أزرار WhatsApp نظيفة (بدون "24/7" وبدون عرض الرقم — الرابط على الرقم الرسمي)، باقات، تجارب، FAQ، بطاقات تعلم، معرض، طوارئ (سفارات)، استمارتا حجز وخدمات بإيميلات مفعّلة.

---

## 9. SEO والأداء والوصول

- Metadata لكل صفحة مستقلة + JSON-LD (EducationalOrganization) + sitemap.js + robots.js + favicon/manifest.
- لا hreflang (اللغتان بنفس الـ URL عبر تبديل حالة — قرار قائم).
- Dynamic imports للوحات الأدمن، lazy images، hero preload، bulk endpoints (about, german).
- **إصلاح ثبات الموبايل**: خط 16px لكل حقول الإدخال على الشاشات ≤767px (يمنع zoom-jump في iOS Safari) — في `globals.css`.
- Skip link، تسميات Labels حقيقية، aria-invalid/aria-describedby على استمارة Ausbildung، أهداف لمس ≥44px.
- **غير مُقاس بعد**: Core Web Vitals ميدانياً، contrast رقمي شامل، `prefers-reduced-motion` غير مطبق.

## 10. الأمان

- JWT + bcrypt، تحقق أدوار server-side على كل `/api/admin|manager|teacher|student`.
- CSP صارم + `X-Frame-Options: SAMEORIGIN` + security headers (لا تُضعف دون موافقة).
- Rate limiting على كل الاستمارات العامة، منع تكرار الطلبات، تعقيم مدخلات + escape في الطباعة والإيميلات.
- لا أسرار في الكود أو الردود؛ Cloudinary برفع موقّع server-side.
- `.env` لا يُضاف إلى `.gitignore` (متطلب منصة Emergent).

## 11. الاختبار (للمطورين القادمين)

- اقرأ `test_result.md` (بروتوكول وكلاء الاختبار — لا تعدّل قسم Testing Protocol) و`memory/test_credentials.md`.
- ⚠️ **اختبر دائماً على `http://localhost:3000`** — `NEXT_PUBLIC_BASE_URL` يشير للإنتاج المنشور (كود قديم حتى الـ Deploy)! هذا سبب فشل اختبارات سابقة.
- بعد أي تعديل كود: restart + انتظار البناء ثم تحقق بطلب واحد قبل تشغيل حزمة اختبارات.
- نظّف بيانات الاختبار دائماً (القاعدة مشتركة مع الإنتاج!) — استخدم إيميلات `@example.com` مميزة واحذفها بعد الانتهاء.
- اختبار rate-limit يُنفَّذ أخيراً.

## 12. الحالة الحالية + BUSINESS INFORMATION REQUIRED

### يعمل ومُختبر
كل ما ورد أعلاه shipped ومُختبر (backend 18/18 + لقطات UI: عربي/ألماني/موبايل 360px). ينتظر **Deploy** من المالك لينعكس على الدومين.

### مطلوب من مالك العمل (لا يُخترع)
1. **فريق العمل الحقيقي** (المؤسس: اسم/صورة/نبذة) — يضاف من لوحة الإدارة (القسم فارغ حالياً بقصد).
2. **بيانات Impressum القانونية**: الكيان القانوني، العنوان، المسؤول، رقم التسجيل.
3. مراجعة أرقام نص "قصتنا" في CMS (4,200 طالب، 94% نجاح، 850 متدرب) — توثيق أو تعديل.
4. التحقق من الشراكات/الشعارات (Goethe-Institut, DAAD, IHK, BAMF, Charité...) وأذونات استخدامها — وكذلك partner في بطاقات Ausbildung.
5. Testimonials حقيقية بموافقات، أسعار/جداول رسمية، روابط سوشيال ميديا لـ `sameAs`.
6. إنشاء مواعيد استشارات حقيقية من لوحة الإدارة عند الحاجة (تُركت فارغة عمداً).

### تكاملات غير مفعّلة (تحتاج مفاتيح وطلب صريح)
Stripe (دفع)، Twilio (SMS)، Google Analytics/Search Console/Business Profile.

## 13. خارطة الطريق المقترحة (Backlog)

1. **Refactor** الـ API monolith (~2000 سطر) إلى وحدات (`routes/auth`, `routes/leads`...) — عند التوسع.
2. تحويل SPA الداخلي إلى مسارات URL حقيقية (تحسين SEO والمشاركة).
3. شارة مجموع الطلبات على زر "لوحة الإدارة" في الهيدر + إشعار صوتي اختياري.
4. تصدير Excel/CSV لكل تبويبات الواردات (موجود حالياً للنشاطات فقط).
5. زر واتساب داخل رسائل نجاح الاستمارات.
6. صفحة تفاصيل لكل فرصة Ausbildung (`/ausbildung/[slug]`) لتحسين الإقناع والـ SEO.
7. بوابة دفع (Stripe) للكورسات والاستشارات المدفوعة.
8. قياس Core Web Vitals ميدانياً بعد النشر + `prefers-reduced-motion`.
9. إلغاء ذاتي للحجوزات من الزائر (إن رغب المالك).
10. i18n بـ hreflang/URLs منفصلة للغتين (قرار استراتيجي لاحق).

## 14. عبَر مسجّلة (لا تكرر الأخطاء)

- `sendEmail` يبدأ بـ `db` — استدعاء خاطئ = فشل صامت.
- لا تختبر على دومين الإنتاج؛ localhost فقط.
- عند حذف بيانات افتراضية نهائياً: احذفها من الـ seed أيضاً.
- `search_replace` يتطلب تطابقاً حرفياً — اقرأ الملف قبل التعديل.
- أرقام الهاتف في DB يجب أن تتضمن رمز الدولة (رابط wa.me بدون رمز دولة = معطوب).
- التمرير لقسم بعد تحميل غير متزامن: أعد المحاولة (interval/retries) حتى يوجد العنصر.
