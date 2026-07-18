# ⚙️ Backend Architecture

## 1. Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js (Next.js API runtime) |
| API Pattern | Next.js App Router catch-all route |
| Database | MongoDB Atlas (cloud) |
| Auth | JWT (HS256) in HttpOnly cookie (`ddh_token`) |
| Password hashing | bcryptjs |
| Email | Resend (with fallback to skipped logs) |
| File upload | Cloudinary REST API |
| Validation | Inline (no Zod yet) |

## 2. The Monolithic Route

**File:** `/app/app/api/[[...path]]/route.js` (~1,750 LoC)

**Pattern:**
```js
const path = ((await params)?.path || []).join('/')   // e.g. "admin/users/abc"
const segs = path ? path.split('/') : []               // ["admin", "users", "abc"]
const method = request.method                           // GET / POST / PATCH / DELETE

// Massive if/else chain matching path + method
if (path === 'auth/login' && method === 'POST') { ... }
if (segs[0] === 'admin' && segs[1] === 'users') { ... }
```

Exports `GET = POST = PUT = DELETE = PATCH = handle` (one handler for all verbs).

## 3. Cross-Cutting Concerns

### 3.1 Authentication
- `getCurrentUser(db, request)` → reads JWT from cookie, verifies, returns user
- `unauth()` → 401, `forbidden()` → 403
- Token expires in 7 days

### 3.2 Authorization
- Role check: `if (me.role !== 'super_admin') return forbidden()`
- 4 roles: `super_admin`, `manager`, `teacher`, `student`
- Public endpoints (no auth needed) explicitly listed

### 3.3 Activity Logging
- `logActivity(db, user, action, entityType, entityId, meta, ip)`
- Stored in `activity_logs` collection
- Viewable via `/api/admin/activity-logs`

### 3.4 Notifications (in-app)
- `notify(db, userIds, payload)` → inserts in `notifications` collection
- Polled by frontend via `/api/notifications`

### 3.5 Admin Lead Alerts
- `notifyAdminsOfLead(db, kind, title, msg, entityId, leadObj)`
  - Creates in-app notifications for all super_admins + managers
  - Fires Resend emails (admin + auto-reply) — best-effort

### 3.6 Seed System
- All seeds run **once per server boot** (cached via `global.__ddhSeeded`)
- Idempotent — only inserts if collection empty
- Seeds: super_admin, courses, blog, activities, legal pages, site content

## 4. Integration Layer

```
┌─────────────────────────────────────────────────────┐
│  /app/lib/email.js                                  │
│  • sendEmail(db, args) — best-effort                │
│  • 4 RTL templates (admin, welcome, confirm, reset) │
│  • All attempts logged to email_logs                │
│  • Wraps Resend SDK                                 │
├─────────────────────────────────────────────────────┤
│  /app/lib/cloudinary.js (🔍 inferred)               │
│  • Image upload helpers                             │
│  • REST API (no SDK)                                │
├─────────────────────────────────────────────────────┤
│  /app/lib/site_content_seed.js                      │
│  • 12 content keys + 5 list seeds                   │
│  • Default Arabic content                           │
├─────────────────────────────────────────────────────┤
│  /app/lib/legal_seed.js                             │
│  /app/lib/blog_seed.js                              │
│  /app/lib/activities_seed.js                        │
└─────────────────────────────────────────────────────┘
```

## 5. Domain Rules

### 5.1 Lead → User Conversion
- Anonymous form submission creates lead with `userId: null, source: 'public_form'`
- Admin can convert lead → student account (generates secure password)
- Idempotent: same email twice returns existing user
- Always linked back to lead (`assignedUserId`)
- Course ID auto-added to user's `assignedCourseIds`

### 5.2 Activity Anti-Oversell
- `registeredCount` incremented atomically when registration created
- `totalSeats - registeredCount` shown publicly
- Block registration when full

### 5.3 Public Signup Disabled
- `POST /api/auth/signup` returns 403
- Accounts only created via `/api/admin/users` (POST) or convert-to-user

## 6. Error Handling

```js
try {
  // ... endpoint logic
} catch (e) {
  console.error('[api]', e)
  return ok({ error: e.message }, { status: 500 })
}
```

- **No structured error codes** — strings only
- **No stack traces leaked** in prod (Next.js handles)
- **Errors logged to stdout** (captured by supervisor)

## 7. ⚠️ Known Backend Issues

- **Monolithic file** — 1750+ LoC, hard to grep
- **No request validation library** (Zod/yup) — manual checks
- **No rate limiting** — public lead endpoints could be spammed
- **No CSRF protection** for state-changing endpoints (relies on SameSite cookie)
- **No request ID tracing** for debugging
- **No CORS configuration** — relies on same-origin
