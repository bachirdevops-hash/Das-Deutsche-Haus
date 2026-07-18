# 🗄️ Database Schema

> MongoDB Atlas • Database: `das_deutsche_haus` • 28+ collections

## 🔑 Conventions
- All entities use **UUIDs** (`id` field) — never expose `_id` in JSON
- All timestamps ISO 8601 strings
- Soft-disabled records use `disabled: true` (not deleted)

## 📑 Collections Reference

### Identity & Auth
| Collection | Purpose | Key fields |
|---|---|---|
| `users` | All accounts | id, name, email→unique, phone, password(hash), role, disabled, mustChangePassword, assignedCourseIds[], createdAt, createdBy, source |
| `password_resets` | Reset tokens | id, userId, token→unique, used, expiresAt |
| `activity_logs` | Audit trail | id, userId, action, entityType, entityId, meta, ip, createdAt |
| `notifications` | In-app | id, userId, kind, title, message, link, priority, read, createdAt |

### Educational
| Collection | Purpose | Key fields |
|---|---|---|
| `courses` | A1→C2 catalog | id, level, title_ar, title_de, desc_ar, desc_de, hours, price_usd, seats, start_date, schedule_ar, schedule_de, coverImage, featured |
| `telc_exams` | Exam schedule | id, type, date, time, price_usd, capacity |
| `course_registrations` | Lead/enrolment | id, userId∥null, courseId, level, name, email, phone, notes, source, status, price_usd, assignedUserId, adminNotes, convertedAt |
| `telc_bookings` | Lead/booking | id, userId∥null, examId, type, date, name, email, phone, notes, source, status |
| `vocational_jobs` | Ausbildung listings | id, jobTitle, company, city, requirements, etc. |
| `vocational_applications` | Lead | id, userId∥null, jobId, jobTitle, name, email, phone, notes, source, status |
| `travel_consultations` | Lead | id, userId∥null, visaType, consultationTypeName, durationMinutes, price, name, email, phone, notes, preferredDate, source, status |

### Content
| Collection | Purpose | Key fields |
|---|---|---|
| `site_content` | Editable sections | key (PK), data (free-form), updatedAt, updatedBy |
| `blog_posts` | Articles | id, slug, title, content, excerpt, language, status, publishDate, authorName, coverImage, tags |
| `activities` | Events | id, slug, title, description, type, coverImage, date, location, isFree, price, totalSeats, registeredCount, status |
| `activity_registrations` | Event signups | id, activityId, name, email, phone, attendees, createdAt |
| `legal_pages` | Static pages | slug, title_ar, title_de, content_ar, content_de, isPublished |
| `team_members` | About page | id, name, role, bio, photo, order, published, linkedIn, email |
| `partnerships` | Logos | id, name, logo, link, order, published |
| `visa_types` | Cards | id, title, description, emoji, color, link, order, published |
| `visa_faqs` | FAQ | id, question, answer, order, published |
| `consultation_types` | Booking dropdown | id, name, description, durationMinutes, price, order, published |
| `german_visitors_*` | Multiple DE-only collections | various |

### Operations
| Collection | Purpose | Key fields |
|---|---|---|
| `email_logs` | Resend audit | id, provider, type, from, to, subject, status (sent/failed/skipped), providerMessageId, error, meta, createdAt |

## 📊 Indexes (recommended — ⚠️ some not yet created)

```js
// Critical
db.users.createIndex({ email: 1 }, { unique: true })
db.password_resets.createIndex({ token: 1 }, { unique: true })
db.blog_posts.createIndex({ slug: 1 }, { unique: true })
db.activities.createIndex({ slug: 1 }, { unique: true })
db.site_content.createIndex({ key: 1 }, { unique: true })

// Performance
db.course_registrations.createIndex({ status: 1, createdAt: -1 })
db.telc_bookings.createIndex({ status: 1, createdAt: -1 })
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 })
db.activity_logs.createIndex({ createdAt: -1 })
db.email_logs.createIndex({ createdAt: -1 })
```
