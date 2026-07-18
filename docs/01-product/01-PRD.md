# 📋 Product Requirements Document (PRD)

## 1. Vision
Das Deutsche Haus (DDH) is a **bilingual (Arabic + German) digital bridge between Syria and Germany**, offering:
- 🇩🇪 Certified German-language courses (A1 → C2)
- 🏆 Official telc exam registration center
- 💼 Ausbildung (vocational training) placements with German employers
- ✈️ Visa & travel consultation services
- 📰 Educational content (blog) and cultural events (activities)

## 2. Target Personas

### 2.1 Primary — Syrian Student (age 17–35)
- Wants to study/work/relocate to Germany
- Native Arabic speaker, needs Arabic UI
- Mid-level digital literacy (mobile-first)
- Needs guidance through complex bureaucracy

### 2.2 Secondary — Family/Decision-maker
- Parents researching options for their child
- Cares about credibility, accreditation, cost transparency

### 2.3 Tertiary — German Visitor / Returning Student
- Visits dedicated `/german-visitors` landing page (German UI)
- Looking for cultural immersion programs in Syria

### 2.4 Internal — Admin / Manager / Teacher
- Super Admin: full RBAC, content management
- Manager: lead handling, course creation
- Teacher: assigned to courses, student tracking
- Student: course materials, exam results, dashboard

## 3. Core Features (Implemented)

| Feature | Status | Description |
|--------|--------|-------------|
| Bilingual UI (AR/DE) | ✅ | Full RTL + LTR support |
| RBAC | ✅ | 4 roles (super_admin, manager, teacher, student) |
| Courses CRUD | ✅ | A1-C2 with images, schedules, prices |
| Public Lead Forms | ✅ | Course/telc/Ausbildung/visa registration without account |
| Admin Inbox | ✅ | Unified inbox for all lead types |
| Convert-to-User | ✅ | One-click student account creation from lead |
| Site Content CMS | ✅ | 12 editable content sections + 5 CRUD lists |
| Blog System | ✅ | Multi-language (AR/DE) with slug routing |
| Activities System | ✅ | Events with anti-oversell registration |
| Legal Pages CMS | ✅ | privacy/terms/impressum editable |
| Hero Slideshow | ✅ | 10-image cinematic cross-fade |
| Email Notifications | ✅ | Resend integration (best-effort) |
| Email Logs Panel | ✅ | Admin monitoring of all sent emails |
| Cloudinary Uploads | ✅ | Image management |
| Visa Types Page | ✅ | Dedicated `/visa-types` with FAQ + booking |

## 4. Core Features (Planned)

| Feature | Priority | Notes |
|---------|----------|-------|
| Stripe Payments | High | User-supplied keys required |
| Twilio SMS OTP | Medium | Phone verification |
| Google OAuth | Medium | 1-click login |
| Student LMS (lessons/videos) | Medium | Phase 3 |
| Multi-currency support | Low | EUR/USD/SYP |
| Mobile app (React Native) | Low | Future |

## 5. User Journeys

### 5.1 Public Lead → Student
```
[Visitor]
   │
   ▼
Homepage → Click "سجّل في كورس"
   │
   ▼
Public Form (name, email, phone, notes)
   │
   ▼
POST /api/course-registrations  ──► Admin Email (Resend)
   │                                ──► User Confirmation Email
   │
   ▼
Lead saved as status='new'
   │
   ▼
[Admin Inbox] — Admin reviews, clicks "Convert to User"
   │
   ▼
Student account created + temp password
   │
   ▼
User Welcome Email with credentials
   │
   ▼
Student logs in → Dashboard (course materials, exams, etc.)
```

### 5.2 Content Editing Journey
```
[Super Admin] → /admin → "محتوى الصفحات" tab
   │
   ▼
Select section (Home / About / Visa)
   │
   ▼
Edit fields (Stats, Why, Testimonials, CTA, etc.)
   │
   ▼
PATCH /api/admin/content/<key>
   │
   ▼
Live update on public pages (no rebuild)
```

## 6. Non-Functional Requirements

| Requirement | Target | Current |
|-------------|--------|---------|
| Page Load (LCP) | < 2.5s | ~1.5s after build ✅ |
| Bilingual content | AR + DE | ✅ |
| Mobile responsive | All pages | ✅ |
| Browser support | Chrome/Safari/Edge (latest 2) | ✅ |
| Data residency | Cloud (MongoDB Atlas) | ✅ |
| Uptime target | 99.5% | Depends on host |

## 7. Success Metrics (KPIs)

- **Lead conversion rate**: lead → enrolled student (target ≥ 30%)
- **Public form submissions**: ≥ 50/month within 3 months
- **telc exam bookings**: ≥ 20/exam cycle
- **Email open rate** (admin alerts): 100% (it’s you!)
- **Admin response time**: ≤ 24h to new leads
