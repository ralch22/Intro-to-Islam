# Sprint 5 — Pre-Hetzner Hardening
**IntroToIslam PWA — Production Readiness Sprint**

> This sprint addresses every critical and high-severity finding from the 8-agent codebase audit conducted on 2026-03-16. It must be completed before Hetzner VPS deployment (Pending Item 1). No real user traffic should be accepted until all Week 1 and Week 2 items are resolved.

**Audit date:** 2026-03-16
**Auditors:** Frontend Developer · Software Architect · Security Engineer · DevOps Automator · Mobile App Builder · Database Optimizer · Technical Writer · SRE
**Total findings:** 11 Critical · 22 High · 20 Medium
**Sprint goal:** Resolve all Critical and High findings; scaffold DevOps foundation for Hetzner deployment

---

## Sprint Status

| Week | Focus | Status |
|------|-------|--------|
| Week 1 | Security & Auth hardening | 🔄 In Progress |
| Week 2 | PWA & Push infrastructure | ⏳ Pending |
| Week 3 | Error handling & data layer | ⏳ Pending |
| Week 4 | DevOps foundations | ⏳ Pending |

---

## Week 1 — Security & Auth Hardening

**Requirements addressed:** C2, C7, C8, C9, C10, H1, H2, H3, H4, H17 (from audit)
**Budget:** ~16 hours

---

### S5-1: Generate PWA Icons (C1, H17)

**Problem:** `public/icons/` is empty. PWA cannot be installed. Lighthouse installability fails. Push notification icons 404.

**Files to create:**
- `public/icons/icon-72.png`
- `public/icons/icon-96.png`
- `public/icons/icon-128.png`
- `public/icons/icon-144.png`
- `public/icons/icon-152.png`
- `public/icons/icon-192.png`
- `public/icons/icon-384.png`
- `public/icons/icon-512.png`
- `public/icons/apple-touch-icon.png` (180×180)

**Files to modify:**
- `public/manifest.json` — add all sizes, split `any` and `maskable` purpose, add `id`, `shortcuts`, `screenshots`
- `public/sw-custom.js` — fix icon path from `icon-192x192.png` → `icon-192.png`

**Acceptance criteria:**
- [ ] `public/icons/icon-192.png` and `icon-512.png` exist and are valid PNGs
- [ ] Manifest passes `web-app-manifest` Lighthouse check
- [ ] Each icon size has separate `any` and `maskable` entries in manifest
- [ ] Push notification displays correct icon in notification tray
- [ ] `manifest.json` has `id: "/"`, `scope: "/"`, `lang: "en"`, `dir: "ltr"`

---

### S5-2: Fix All Webhook & Endpoint Auth Guards (C7, C8, C9, H3, H4)

**Problem:** Five security guards either invert their logic (allow when secret absent) or are missing entirely.

**Files to modify:**
- `src/app/api/zoom/webhook/route.ts` — `verifyZoomWebhook`: change `if (!secret) return true` → `if (!secret) return false`
- `src/app/api/cal/webhook/route.ts` — require signature header when secret is configured; reject 401 if header absent
- `src/app/api/push/send/route.ts` — invert guard: deny (503) when `ADMIN_SECRET` not configured, not allow
- `src/app/api/cron/class-reminders/route.ts` — add `CRON_SECRET` bearer token check (same pattern as `youtube-sync`)
- `src/app/api/zoom/webhook/route.ts` — URL validation challenge must not be processed before signature verification

**Acceptance criteria:**
- [ ] POST to `/api/zoom/webhook` with no `ZOOM_WEBHOOK_SECRET` configured returns 401
- [ ] POST to `/api/cal/webhook` with secret set but no `x-cal-signature-256` header returns 401
- [ ] POST to `/api/push/send` with no `ADMIN_SECRET` configured returns 503
- [ ] GET to `/api/cron/class-reminders` without valid `Authorization: Bearer <CRON_SECRET>` returns 401
- [ ] Zoom URL validation challenge is only processed after signature verification passes

---

### S5-3: Add auth() Guards to All Unprotected API Routes (H1, H13, H14)

**Problem:** 11 API routes have no authentication check. Unauthenticated actors can read progress data, post discussion content, enrol in courses, and generate completion certificates.

**Files to modify:**
- `src/app/api/progress/route.ts` — capture `auth()` return value and check `if (!session?.user) return 401`
- `src/app/api/lessons/[lessonId]/discussion/route.ts` — add `auth()` check to both GET and POST handlers
- `src/app/api/lessons/[lessonId]/notes/route.ts` — add `auth()` check
- `src/app/api/schedule/route.ts` — add `auth()` check (or explicitly mark as intentionally public)
- `src/app/api/schedule/[id]/participants/route.ts` — add `auth()` check
- `src/app/api/dashboard/activity/route.ts` — add `auth()` check
- `src/app/api/completion/badge/[courseId]/route.ts` — add `auth()` check + sanitize SVG title field
- `src/app/api/cal/bookings/route.ts` — add `auth()` check + filter bookings by session user email
- `src/app/api/profile/route.ts` — add `auth()` check to PATCH handler
- `src/app/api/courses/route.ts` — deliberate: mark as public (courses are free/open)
- `src/app/api/courses/[id]/route.ts` — deliberate: mark as public

**SVG XSS fix (H2):**
- `src/app/api/completion/badge/[courseId]/route.ts` — XML-escape `title` before injecting into SVG template; validate `courseId` is numeric

**Acceptance criteria:**
- [ ] GET `/api/progress` without session returns 401
- [ ] POST `/api/lessons/x/discussion` without session returns 401
- [ ] GET `/api/completion/badge/1` with `title` containing `<script>` renders escaped, not executed
- [ ] GET `/api/cal/bookings` without session returns 401
- [ ] PATCH `/api/profile` without session returns 401
- [ ] All 9 routes that should require auth return 401 when called without a session cookie

---

### S5-4: Add Error Boundaries and 404 Handler (C10)

**Problem:** No `error.tsx`, no `global-error.tsx`, no `not-found.tsx`. Any render crash produces a white screen. Invalid lesson/course URLs silently show mock data.

**Files to create:**
- `src/app/error.tsx` — root error boundary (caught client errors)
- `src/app/global-error.tsx` — global error boundary (catches root layout errors)
- `src/app/not-found.tsx` — branded 404 page
- `src/app/courses/[id]/error.tsx` — course-level error boundary
- `src/app/courses/[id]/lesson/[lessonId]/error.tsx` — lesson-level error boundary
- `src/app/loading.tsx` — root loading state (Suspense streaming)
- `src/app/courses/loading.tsx`
- `src/app/courses/[id]/loading.tsx`
- `src/app/courses/[id]/lesson/[lessonId]/loading.tsx`
- `src/app/progress/loading.tsx`
- `src/app/profile/loading.tsx`
- `src/app/schedule/loading.tsx`

**Acceptance criteria:**
- [ ] Navigating to `/courses/99999` shows branded 404 page (not mock content)
- [ ] If course API throws, `courses/[id]/error.tsx` renders with "Something went wrong" + retry button
- [ ] All data-fetching routes show a skeleton while loading (not a blank white page)
- [ ] Global error boundary catches root layout crashes without showing browser default error

---

## Week 2 — PWA & Push Infrastructure

**Requirements addressed:** C3, C4, C5, C6, H18, H19
**Budget:** ~20 hours

---

### S5-5: Fix Service Worker Integration (C4)

**Problem:** `sw-custom.js` is in `public/` — served as a static file but never executed as a service worker. Push handler, notification click handler, and Background Sync are all dead code.

**Files to create:**
- `worker/index.ts` — consolidate all custom SW logic (push handler, notification click, background sync) into next-pwa's `worker/` directory

**Files to modify:**
- `next.config.ts` — add `swSrc: 'worker/index.ts'` to next-pwa config; add `fallbacks: { document: '/offline' }` for offline document fallback
- `public/sw-custom.js` — retain as reference but note it is superseded by `worker/index.ts`

**Files to create:**
- `src/app/offline/page.tsx` — branded offline fallback page shown when navigation fails offline

**Acceptance criteria:**
- [ ] Service worker registered in production build executes push handler on `push` event
- [ ] Notification click navigates to the correct page (lesson or schedule)
- [ ] `sync` event fires `flushLessonCompletions` when connectivity resumes
- [ ] Offline navigation shows branded `/offline` page instead of browser error screen
- [ ] `next build` produces `public/sw.js` that includes the worker/ content

---

### S5-6: Persist Push Subscriptions (C3)

**Problem:** `const subscriptions = new Map()` in `api/push/subscribe/route.ts` is in-memory and lost on every cold start. All push notifications are broken in production.

**Solution:** Use a JSON file store in `/tmp` for Vercel (acceptable until Redis/DB is provisioned on Hetzner). Add a clear TODO for migration to persistent store.

**Files to modify:**
- `src/app/api/push/subscribe/route.ts` — replace in-memory Map with file-based JSON store (`/tmp/push-subscriptions.json`) with graceful fallback; add user ID association from session
- `src/app/api/push/send/route.ts` — read from same persistent store
- `src/app/api/cron/class-reminders/route.ts` — read subscriptions from store and call `sendPushNotification` for each matched subscriber

**Note:** `/tmp` on Vercel persists within a single function instance lifecycle and is shared across warm instances in the same region. This is not durable across deploys — a proper Redis or Postgres store is required for Hetzner. A `// TODO(sprint-6): migrate to Redis/Postgres` comment is mandatory.

**Acceptance criteria:**
- [ ] Student subscribes to push; subscription is written to `/tmp/push-subscriptions.json`
- [ ] POST to `/api/push/send` (with `ADMIN_SECRET`) sends notification to all stored subscriptions
- [ ] Class-reminders cron reads subscribers and calls `sendPushNotification` for each
- [ ] Cron logs number of notifications sent (not just `console.log` of meetings)
- [ ] `TODO(sprint-6)` comment present explaining Redis migration requirement

---

### S5-7: Background Sync Client-Side Registration (C5)

**Problem:** `LessonView.tsx` never writes to IndexedDB and never registers the sync tag. Both ends of the Background Sync pipeline are missing client-side.

**Files to modify:**
- `src/components/lesson/LessonView.tsx` — in `handleMarkComplete`: (1) write pending completion to IndexedDB `pending-completions` store, (2) call `registration.sync.register('lesson-completion-sync')`, (3) fall back to direct fetch if Background Sync API unavailable (Safari/Firefox)
- `src/hooks/useOfflineSync.ts` (new) — custom hook wrapping IndexedDB read/write and sync registration

**Acceptance criteria:**
- [ ] Completing a lesson offline writes to `iti-offline` IndexedDB store
- [ ] On reconnect, `sync` event fires and POSTs to `/api/lessons/[id]/complete`
- [ ] `credentials: 'include'` is set on the Background Sync fetch
- [ ] On browsers without Background Sync API (Safari), falls back to direct fetch with retry
- [ ] Duplicate completions are idempotent (same lesson ID sent twice only marks once)

---

### S5-8: iOS PWA Meta Tags & Safe Areas (H18, H19)

**Problem:** No `apple-touch-icon`, no `viewport-fit=cover`, no splash screen images. iOS home screen shows screenshot thumbnail; safe area insets are always zero on notched iPhones.

**Files to modify:**
- `src/app/layout.tsx` — add `viewport: { viewportFit: 'cover' }` to viewport export; add apple-touch-icon link tags to metadata; change `statusBarStyle` from `"default"` to `"black-translucent"`
- `public/icons/apple-touch-icon.png` — 180×180 non-transparent PNG (created in S5-1)
- `src/app/globals.css` — add `env(safe-area-inset-*)` padding to Navbar, Footer, and OfflineBanner

**Files to create:**
- `public/splash/` directory with Apple splash screen images for major iPhone/iPad viewport sizes (generated via script)

**Acceptance criteria:**
- [ ] Installing PWA on iOS shows correct app icon (not screenshot thumbnail)
- [ ] Status bar is legible against `#E81C74` theme colour in standalone mode
- [ ] Content does not extend under the notch or home indicator on iPhone 14/15
- [ ] Cold launch on iOS shows splash screen instead of white flash

---

## Week 3 — Error Handling & Data Layer

**Requirements addressed:** H5, H6, H7, H8, H9, H10, H15
**Budget:** ~20 hours

---

### S5-9: Fix moodleRequest Error Handling (H6)

**Problem:** `moodleRequest` has no `res.ok` check, no timeout, no try/catch. A Moodle 500 is silently treated as valid course data, crashing callers that try to iterate the response.

**Files to modify:**
- `src/lib/moodle.ts` — wrap `fetch` in try/catch; check `res.ok`; handle Moodle's JSON error format `{ exception, message }`; add `AbortController` timeout (8s); log errors with structured context
- All callers that currently have no error handling (`getCourses`, `getCourseLessons`, `markLessonComplete`, `enrollUser`) — ensure they propagate or gracefully handle null/error returns

**Acceptance criteria:**
- [ ] `moodleRequest` returns `null` on HTTP error (not throws unhandled)
- [ ] Moodle `{ exception: "...", message: "..." }` response is caught and logged, not returned as data
- [ ] Requests that hang beyond 8s are aborted with an `AbortController` signal
- [ ] Error is logged with `{ wsfunction, url, status, message }` structured context

---

### S5-10: Fix getModulesByCourse — Add Live Moodle Path (H7)

**Problem:** `getModulesByCourse` always returns `MOCK_MODULES` regardless of whether Moodle is configured. When Moodle goes live, module structure will always be fake.

**Files to modify:**
- `src/lib/moodle.ts` — implement live `getModulesByCourse` using `core_course_get_contents`; parse sections from the real Moodle response; fall back to `MOCK_MODULES` only when Moodle is not configured

**Acceptance criteria:**
- [ ] When `MOODLE_URL` is set, `getModulesByCourse` calls `core_course_get_contents` and parses sections
- [ ] Section → Module mapping matches the `MoodleModule` type shape
- [ ] Falls back to `MOCK_MODULES` only when `MOODLE_URL` is absent (same pattern as other functions)

---

### S5-11: Fix linkVideoToLesson Moodle REST Function (H8)

**Problem:** `linkVideoToLesson` calls `core_course_add_content_item_to_user_favourites` — this is a favourites API, not a URL resource creation API. The Zoom→YouTube replay link will silently fail to appear in courses.

**Files to modify:**
- `src/lib/moodle.ts` — replace `core_course_add_content_item_to_user_favourites` with correct approach: use `mod_url_get_url_by_cmid` check + `core_course_add_module` (or equivalent); add clear comment explaining the Moodle module creation API path; add TODO if admin-level token is required

**Acceptance criteria:**
- [ ] `linkVideoToLesson` calls a Moodle function capable of adding a URL resource to a course section
- [ ] Function is annotated with the required Moodle capability/token permission needed
- [ ] Mock path still works when Moodle is not configured

---

### S5-12: Fix YouTube Upload — Streaming Instead of Memory Buffer (H10)

**Problem:** `uploadRecordingToYouTube` downloads entire Zoom recording into a `Buffer` in memory. A 300 MB recording OOMs the Vercel serverless function.

**Files to modify:**
- `src/lib/youtube-upload.ts` — replace `Buffer.from(await recordingRes.arrayBuffer())` with YouTube's resumable upload API using `pipe()` streaming; use `node-fetch` or native fetch streaming; add error handling for expired/revoked `YOUTUBE_REFRESH_TOKEN`

**Files to modify:**
- `src/app/api/zoom/webhook/route.ts` — wire in the `uploadRecordingToYouTube` call (currently a `TODO`); validate `YOUTUBE_OAUTH_CLIENT_ID` and `YOUTUBE_OAUTH_CLIENT_SECRET` are present before calling; add 200 response before upload starts (Zoom requires fast webhook acknowledgement)

**Acceptance criteria:**
- [ ] Zoom `recording.completed` webhook responds 200 within 3s; upload runs asynchronously
- [ ] Recording is streamed to YouTube (no full in-memory buffer)
- [ ] If `YOUTUBE_*` env vars are absent, webhook logs a warning and returns 200 (no crash)
- [ ] Expired `YOUTUBE_REFRESH_TOKEN` is caught and logged; does not crash the webhook handler

---

### S5-13: Cache Zoom S2S Token (H5)

**Problem:** `getZoomToken()` fetches a new OAuth token on every API call. The S2S token is valid for 1 hour. This doubles the Zoom API call count and will trigger rate limiting.

**Files to modify:**
- `src/lib/zoom.ts` — add module-level token cache `{ token: string; expiresAt: number } | null`; check expiry before fetching; only fetch when cache is null or within 60s of expiry; add error handling for failed token fetch (return null, don't send `Authorization: Bearer undefined`)

**Acceptance criteria:**
- [ ] Two consecutive calls to `getUpcomingMeetings` in the same process result in one token fetch, not two
- [ ] Token is refreshed automatically when within 60s of expiry
- [ ] A failed token fetch returns null from `getZoomToken` (not throws); callers handle null by returning mock fallback or error

---

### S5-14: Fix Dashboard Hardcoded Content (H15)

**Problem:** "Continue Lesson" always links to hardcoded `2-1`; module list is static array; progress % fallback is `75`.

**Files to modify:**
- `src/app/page.tsx` — compute `nextLesson` from real dashboard API response; derive module list from `data.courses`; remove hardcoded `NEXT_LESSON_ID`, `FALLBACK_MODULE_TITLE`, and static modules array; replace `?? 75` fallback with `?? 0`

**Acceptance criteria:**
- [ ] "Continue Lesson" button links to the first incomplete lesson from the API response
- [ ] Module list renders from real course data
- [ ] Progress percentage shows `0` for new users (not `75`)

---

## Week 4 — DevOps Foundations

**Requirements addressed:** C11, H16, H21, H22, M13, M14
**Budget:** ~24 hours

---

### S5-15: Create .env.example (H21)

**Problem:** Zero environment variable documentation. 16 required variables. A developer cloning the repo has no setup guidance.

**Files to create:**
- `.env.example` — all 16 variables with descriptions, example values, and links to where credentials are obtained

```
# === NextAuth ===
NEXTAUTH_SECRET=           # Required. Generate: openssl rand -base64 32
NEXTAUTH_URL=              # e.g. https://learn.introtoislam.org

# === WordPress OAuth2 (SSO) ===
WORDPRESS_SITE_URL=        # e.g. https://introtoislam.org
WORDPRESS_CLIENT_ID=       # From WP OAuth Server plugin → Applications
WORDPRESS_CLIENT_SECRET=   # From WP OAuth Server plugin → Applications

# === Moodle REST API ===
MOODLE_URL=                # e.g. https://lms.introtoislam.org
MOODLE_TOKEN=              # From Moodle → Site Admin → Web Services → Manage Tokens

# === Zoom Server-to-Server OAuth ===
ZOOM_ACCOUNT_ID=           # From Zoom Marketplace → App → App Credentials
ZOOM_CLIENT_ID=            # From Zoom Marketplace → App → App Credentials
ZOOM_CLIENT_SECRET=        # From Zoom Marketplace → App → App Credentials
ZOOM_WEBHOOK_SECRET=       # From Zoom Marketplace → App → Feature → Webhooks

# === Cal.com ===
CAL_API_KEY=               # From Cal.com → Settings → Developer → API Keys
CAL_WEBHOOK_SECRET=        # From Cal.com → Settings → Developer → Webhooks

# === YouTube Data API + Upload OAuth ===
YOUTUBE_API_KEY=           # From Google Cloud Console → APIs → YouTube Data API v3
YOUTUBE_OAUTH_CLIENT_ID=   # From Google Cloud Console → OAuth 2.0 Client IDs
YOUTUBE_OAUTH_CLIENT_SECRET= # From Google Cloud Console → OAuth 2.0 Client IDs
YOUTUBE_REFRESH_TOKEN=     # Generate via: npx ts-node scripts/get-youtube-token.ts

# === Web Push VAPID ===
NEXT_PUBLIC_VAPID_PUBLIC_KEY=  # Generate: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=             # Generate: npx web-push generate-vapid-keys
VAPID_EMAIL=                   # e.g. mailto:admin@introtoislam.org

# === Cron & Admin ===
CRON_SECRET=               # Generate: openssl rand -base64 32
ADMIN_SECRET=              # Generate: openssl rand -base64 32
```

**Acceptance criteria:**
- [ ] `.env.example` exists at project root
- [ ] All 16 variables are present with description comments
- [ ] `.env.example` is committed to git (not in `.gitignore`)
- [ ] README updated to reference `.env.example` in setup instructions

---

### S5-16: Scaffold docker-compose.yml for Hetzner Stack (C11)

**Problem:** No Docker Compose configuration exists. Hetzner deployment has no foundation.

**Files to create:**
- `infra/docker-compose.yml` — full Hetzner stack
- `infra/docker-compose.override.yml` — local development overrides
- `infra/nginx/nginx.conf` — reverse proxy virtual hosts
- `infra/nginx/conf.d/learn.conf` — `learn.introtoislam.org` → Next.js
- `infra/nginx/conf.d/lms.conf` — `lms.introtoislam.org` → Moodle
- `infra/nginx/conf.d/book.conf` — `book.introtoislam.org` → Cal.com
- `infra/nginx/conf.d/wp.conf` — `introtoislam.org` → WordPress
- `infra/.env.hetzner.example` — VPS-specific environment variables
- `infra/scripts/backup.sh` — daily DB dump to Backblaze B2
- `infra/scripts/restore.sh` — restore from B2 backup

**Services in Compose:**
- `nextjs-pwa` — Next.js container (built from `Dockerfile`)
- `wordpress` — WordPress PHP-FPM
- `moodle` — Moodle PHP-FPM
- `postgres` — PostgreSQL 16 (Moodle DB)
- `mysql` — MySQL 8 (WordPress DB)
- `redis` — Redis 7 (sessions, rate limiting)
- `calcom` — Cal.com self-hosted
- `mautic` — Mautic email automation
- `nginx` — Nginx reverse proxy
- `certbot` — Let's Encrypt SSL
- `prometheus` — metrics scraping
- `grafana` — dashboards

**Files to create:**
- `Dockerfile` — Next.js production container

**Acceptance criteria:**
- [ ] `docker compose up -d` in `infra/` starts all 12 services without error
- [ ] Nginx routes all 4 subdomains correctly
- [ ] `infra/scripts/backup.sh` dumps all databases to Backblaze B2
- [ ] `docker compose ps` shows all services healthy
- [ ] `README.md` updated with `infra/` deployment instructions

---

### S5-17: Add /api/health Endpoint (H16)

**Problem:** No health check endpoint. Nginx cannot probe readiness. Uptime monitors have no lightweight target.

**Files to create:**
- `src/app/api/health/route.ts` — returns JSON status for all external dependencies

```typescript
// Response shape:
{
  status: "healthy" | "degraded" | "unhealthy",
  timestamp: string,
  checks: {
    moodle: "ok" | "misconfigured" | "unreachable",
    zoom: "ok" | "misconfigured" | "unreachable",
    push: "ok" | "misconfigured",
    env: { missing: string[] }
  }
}
```

**Acceptance criteria:**
- [ ] GET `/api/health` returns 200 with `status: "healthy"` when all env vars are configured
- [ ] Returns 200 with `status: "degraded"` when some optional services are unavailable
- [ ] Returns 503 when critical services (auth, Moodle) are unreachable
- [ ] Lists missing env vars in `env.missing` array
- [ ] Does not expose secret values — only key names

---

### S5-18: Create GitHub Actions CI/CD Pipeline

**Problem:** No CI/CD. No automated deployment. No build verification.

**Files to create:**
- `.github/workflows/ci.yml` — lint + type-check on every PR
- `.github/workflows/deploy-vercel.yml` — deploy to Vercel on push to `main`
- `.github/workflows/security-scan.yml` — `npm audit` weekly

**`ci.yml` steps:**
1. `npm ci`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `next build` (verifies no build errors)

**`deploy-vercel.yml` steps:**
1. `npm ci`
2. `next build`
3. `vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}`

**Acceptance criteria:**
- [ ] PRs to `main` run lint + type-check automatically
- [ ] Push to `main` deploys to Vercel automatically
- [ ] Build failures block deploy
- [ ] `VERCEL_TOKEN` stored as GitHub secret (not in code)

---

### S5-19: Update Documentation

**Problem:** ARCHITECTURE.md is outdated. RTM shows 0% test completion. AGENT-TASK-LOG.md needs Sprint 5 entries.

**Files to modify:**
- `docs/ARCHITECTURE.md` — correct deployment host (Next.js on Vercel, not Hetzner), correct data access model (REST only, not direct DB), add three-tier fallback description, update file structure to match actual `src/` layout, fix `src/proxy.ts` filename reference
- `docs/RTM.md` — update Verification Status Dashboard; mark implemented requirements as "Complete"; mark deferred items as "Deferred (Sprint 5)"
- `docs/AGENT-TASK-LOG.md` — add Sprint 5 section with all task entries
- `README.md` — update Sprint Status table to include Sprint 5; update deploy instructions with `infra/` path; add environment setup section referencing `.env.example`

**Acceptance criteria:**
- [ ] ARCHITECTURE.md correctly states Next.js PWA runs on Vercel (Hetzner is for backend services)
- [ ] ARCHITECTURE.md describes three-tier data fallback: Moodle REST → YouTube API → static mock
- [ ] RTM dashboard reflects actual implementation state
- [ ] AGENT-TASK-LOG.md has entries for all Sprint 5 tasks
- [ ] README `## Deploy` section includes `infra/` Docker Compose instructions

---

## Go-Live Checklist (Sprint 5 Exit Criteria)

These must all be ✅ before Hetzner VPS deployment begins:

### Security
- [ ] All webhook endpoints deny requests when secrets are absent
- [ ] All 9 write/sensitive API routes require authentication
- [ ] SVG badge XSS vulnerability patched
- [ ] `ADMIN_SECRET` guard inverted (deny when absent)
- [ ] `CRON_SECRET` on class-reminders endpoint

### PWA
- [ ] `public/icons/` contains all required PNG sizes
- [ ] Service worker executes push/sync handlers (in `worker/`)
- [ ] Background Sync client-side registration present in `LessonView`
- [ ] iOS apple-touch-icon and viewport-fit=cover configured
- [ ] Offline fallback page exists and is served by SW

### Infrastructure
- [ ] `.env.example` committed with all 16 variables
- [ ] `docker-compose.yml` scaffolded in `infra/`
- [ ] `/api/health` endpoint returns dependency status
- [ ] GitHub Actions CI runs on PR + deploy on push to main
- [ ] Nginx virtual host configs for all 4 subdomains

### Data Layer
- [ ] `moodleRequest` has `res.ok` check, timeout, and error handling
- [ ] `getModulesByCourse` has a live Moodle path
- [ ] `linkVideoToLesson` calls a valid Moodle REST function
- [ ] YouTube upload uses streaming (no full memory buffer)
- [ ] Zoom S2S token is cached with expiry
- [ ] Push subscriptions written to persistent store (not in-memory Map)

### Error Handling
- [ ] `error.tsx` exists at root and course/lesson level
- [ ] `not-found.tsx` shows branded 404
- [ ] `loading.tsx` shows skeletons on all data-fetching routes

### Documentation
- [ ] ARCHITECTURE.md accurate
- [ ] RTM updated
- [ ] AGENT-TASK-LOG.md has Sprint 5 entries

---

## Files Created / Modified in Sprint 5

### New files
```
src/app/error.tsx
src/app/global-error.tsx
src/app/not-found.tsx
src/app/offline/page.tsx
src/app/loading.tsx
src/app/courses/loading.tsx
src/app/courses/[id]/loading.tsx
src/app/courses/[id]/error.tsx
src/app/courses/[id]/lesson/[lessonId]/loading.tsx
src/app/courses/[id]/lesson/[lessonId]/error.tsx
src/app/progress/loading.tsx
src/app/profile/loading.tsx
src/app/schedule/loading.tsx
src/app/api/health/route.ts
src/hooks/useOfflineSync.ts
worker/index.ts
public/icons/icon-72.png
public/icons/icon-96.png
public/icons/icon-128.png
public/icons/icon-144.png
public/icons/icon-152.png
public/icons/icon-192.png
public/icons/icon-384.png
public/icons/icon-512.png
public/icons/apple-touch-icon.png
infra/docker-compose.yml
infra/docker-compose.override.yml
infra/nginx/nginx.conf
infra/nginx/conf.d/learn.conf
infra/nginx/conf.d/lms.conf
infra/nginx/conf.d/book.conf
infra/nginx/conf.d/wp.conf
infra/.env.hetzner.example
infra/scripts/backup.sh
infra/scripts/restore.sh
Dockerfile
.env.example
.github/workflows/ci.yml
.github/workflows/deploy-vercel.yml
.github/workflows/security-scan.yml
docs/SPRINT-5-SCOPE.md
```

### Modified files
```
src/app/api/zoom/webhook/route.ts
src/app/api/cal/webhook/route.ts
src/app/api/push/send/route.ts
src/app/api/push/subscribe/route.ts
src/app/api/cron/class-reminders/route.ts
src/app/api/progress/route.ts
src/app/api/lessons/[lessonId]/discussion/route.ts
src/app/api/lessons/[lessonId]/notes/route.ts
src/app/api/schedule/route.ts
src/app/api/schedule/[id]/participants/route.ts
src/app/api/dashboard/activity/route.ts
src/app/api/completion/badge/[courseId]/route.ts
src/app/api/cal/bookings/route.ts
src/app/api/profile/route.ts
src/components/lesson/LessonView.tsx
src/lib/moodle.ts
src/lib/zoom.ts
src/lib/youtube-upload.ts
src/app/page.tsx
src/app/layout.tsx
next.config.ts
public/manifest.json
public/sw-custom.js
docs/ARCHITECTURE.md
docs/RTM.md
docs/AGENT-TASK-LOG.md
README.md
```
