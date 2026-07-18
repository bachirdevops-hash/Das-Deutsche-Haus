# 📡 API Reference

> Base URL: `${NEXT_PUBLIC_BASE_URL}/api` • Auth: JWT cookie `ddh_token`

## Auth Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | `{ email, password }` → sets cookie + returns user |
| POST | `/auth/logout` | — | Clears cookie |
| GET | `/auth/me` | any | Returns current user |
| POST | `/auth/signup` | — | **403 disabled** |
| POST | `/auth/forgot-password` | — | Sends reset email |
| POST | `/auth/reset-password` | — | `{ token, password }` |

## Public (No Auth)
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness probe |
| GET | `/courses` | Course catalog |
| GET | `/telc-exams` | Exam schedule |
| GET | `/blog?lang=ar&limit=5` | Blog posts |
| GET | `/blog/<slug>` | Single post |
| GET | `/activities[?filter=upcoming]` | Activities |
| GET | `/activities/<slug>` | Single activity |
| POST | `/activities/register` | Anti-oversell event signup |
| GET | `/content` | All content keys |
| GET | `/content/<key>` | Single section |
| GET | `/team-members` | Published only |
| GET | `/partnerships` | Published only |
| GET | `/visa-types-list` | Published only |
| GET | `/visa-faqs` | Published only |
| GET | `/consultation-types` | Published only |
| GET | `/legal/<slug>` | Privacy/terms/impressum |
| POST | `/course-registrations` | Anon lead (name+email+phone required) |
| POST | `/telc-bookings` | Anon lead |
| POST | `/vocational/applications` | Anon lead |
| POST | `/travel/consultations` | Anon lead |

## Authenticated
| Method | Path | Description |
|---|---|---|
| GET | `/notifications[?unread=1]` | User notifications |
| PATCH | `/notifications/<id>/read` | Mark read |
| GET | `/student/dashboard` | (🔍 inferred) |
| GET | `/teacher/dashboard` | (🔍 inferred) |

## Admin (super_admin / manager)
| Method | Path | Description |
|---|---|---|
| GET/POST/PATCH/DELETE | `/admin/users[/<id>]` | User CRUD |
| GET/POST/PATCH/DELETE | `/admin/courses[/<id>]` | Course CRUD |
| GET/POST/PATCH/DELETE | `/admin/telc-exams[/<id>]` | telc CRUD |
| GET/POST/PATCH/DELETE | `/admin/blog[/<id>]` | Blog CRUD |
| GET/POST/PATCH/DELETE | `/admin/activities[/<id>]` | Activities CRUD |
| GET | `/admin/stats` | Dashboard counters |
| GET | `/admin/activity-logs` | Audit trail |
| GET/POST/PATCH/DELETE | `/admin/team-members[/<id>]` | Team CRUD |
| GET/POST/PATCH/DELETE | `/admin/partnerships[/<id>]` | Partners CRUD |
| GET/POST/PATCH/DELETE | `/admin/visa-types-list[/<id>]` | Visa types CRUD |
| GET/POST/PATCH/DELETE | `/admin/visa-faqs[/<id>]` | FAQ CRUD |
| GET/POST/PATCH/DELETE | `/admin/consultation-types[/<id>]` | Consult types CRUD |
| GET/PATCH | `/admin/content/<key>` | Editable section |
| GET/PATCH/DELETE | `/admin/course-registrations[/<id>]` | Lead inbox |
| POST | `/admin/course-registrations/<id>/convert-to-user` | ⭐ Convert lead to student |
| GET/PATCH/DELETE | `/admin/telc-bookings[/<id>]` + `convert-to-user` | Same pattern |
| GET/PATCH/DELETE | `/admin/vocational-applications[/<id>]` + `convert-to-user` | Same pattern |
| GET/PATCH/DELETE | `/admin/travel-consultations[/<id>]` + `convert-to-user` | Same pattern |
| GET/PATCH | `/admin/legal/<slug>` | Edit legal page |
| GET/DELETE | `/admin/email-logs[/<id>]` | Email monitoring |
| POST | `/admin/email-logs/clear` | Wipe all logs |

## Sample Request Bodies

### Public Lead
```http
POST /api/course-registrations
Content-Type: application/json

{ "courseId": "uuid", "name": "Ahmad", "email": "a@example.com", "phone": "+963...", "notes": "optional" }
```

### Convert-to-User
```http
POST /api/admin/course-registrations/<lead-id>/convert-to-user
Cookie: ddh_token=...

Response:
{ "ok": true, "user": {...}, "createdPassword": "DDH-xxx-2026", "isExisting": false }
```

### Update Content
```http
PATCH /api/admin/content/home_hero
Cookie: ddh_token=...
Content-Type: application/json

{ "data": { "badge": "...", "cta1Label": "...", ... } }
```
