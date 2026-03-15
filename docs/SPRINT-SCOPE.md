# Sprint Scope & Implementation Skills
**IntroToIslam.org PWA — Full Delivery Plan**

> This document maps every requirement from SRS-ITI-2026-001 (65 total: 43 FR + 22 NFR) to concrete implementation tasks, files to create/modify, APIs to integrate, and acceptance criteria to verify. Use this as the authoritative guide for building each sprint.

---

## Current Status

| Sprint | Status | Completed |
|--------|--------|----------|
| Sprint 1 (Foundation) | ✅ Complete | Scaffold, all 6 UI screens, PWA manifest, Vercel deploy, GitHub push, README |
| Sprint 1 (Remaining) | ✅ Complete | NextAuth.js v5 SSO, onboarding carousel, A2HS prompt, session provider, login page |
| Sprint 2 (Learning Core) | ⏳ Pending | Moodle REST, YouTube iframe, Mark Complete |
| Sprint 3 (Engagement) | ⏳ Pending | Cal.com, Web Push, Service Worker offline |
| Sprint 4 (Polish) | ⏳ Pending | Progress screen, NFR validation, handover docs |

---

## Sprint 1 — Foundation (Weeks 1–2)
**Requirements:** FR-AUTH-001–003, FR-ONBOARD-001–002, FR-DASH-001–002 (static), FR-CATALOG-001–002 (static)
**Budget:** 60 hours

### ✅ Already Done
- [x] Next.js 16 + TypeScript + Tailwind scaffold (`create-next-app`)
- [x] All 6 UI screens converted to Next.js pages (static/mock data)
- [x] Shared Navbar (active routing via `usePathname`) + Footer
- [x] PWA manifest (`public/manifest.json`) + next-pwa + Workbox
- [x] Deployed to Vercel (`intro-to-islam-pwa.vercel.app`)
- [x] Pushed to GitHub (`ralch22/Intro-to-Islam`)
- [x] Comprehensive README.md

### ✅ Remaining Sprint 1 Tasks — COMPLETE

#### S1-1: NextAuth.js v5 + WordPress OAuth2 SSO (FR-AUTH-001, FR-AUTH-002, FR-AUTH-003)

**Files to create/modify:**
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth.js route handler
- `src/lib/auth.ts` — NextAuth config with WordPress OAuth2 provider
- `src/middleware.ts` — protect routes requiring authentication
- `src/components/auth/LoginButton.tsx` — login/logout button
- `.env.local` — add `NEXTAUTH_SECRET`, `WORDPRESS_CLIENT_ID`, `WORDPRESS_CLIENT_SECRET`, `NEXTAUTH_URL`

**Implementation:**
```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [{
    id: "wordpress",
    name: "WordPress",
    type: "oauth",
    authorization: `${process.env.WORDPRESS_SITE_URL}/oauth/authorize`,
    token: `${process.env.WORDPRESS_SITE_URL}/oauth/token`,
    userinfo: `${process.env.WORDPRESS_SITE_URL}/oauth/me`,
    clientId: process.env.WORDPRESS_CLIENT_ID,
    clientSecret: process.env.WORDPRESS_CLIENT_SECRET,
    profile(profile) {
      return { id: profile.ID, name: profile.display_name, email: profile.user_email };
    },
  }],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  callbacks: {
    async jwt({ token, account }) {
      if (account) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
```

**Acceptance criteria (TC-AUTH-001, TC-AUTH-002, TC-AUTH-003):**
- [x] Login completes OAuth flow and lands on Dashboard within 5 seconds
- [x] After 15 min idle, next API call silently refreshes token (no login redirect)
- [x] After logout, Back button does not restore session; API calls return 401

**Files created:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/proxy.ts` (middleware), `src/app/login/page.tsx`, `src/components/auth/AuthButton.tsx`, `src/components/auth/SessionProviderWrapper.tsx`

---

#### S1-2: 3-Screen Onboarding Carousel (FR-ONBOARD-001)

**Files to create:**
- `src/components/onboarding/OnboardingCarousel.tsx` — 3-slide carousel
- `src/hooks/useOnboarding.ts` — localStorage flag to show only once

**Slides:**
1. **Learn** — "Watch structured video lessons at your own pace"
2. **Join Classes** — "Join live weekly Zoom classes with instructors"
3. **Book 1:1** — "Book a private consultation, instantly"

**Acceptance criteria (TC-ONBOARD-001):**
- [x] Carousel shown on first visit (before login); skippable
- [x] Never shown again after Login is tapped
- [x] `localStorage.setItem('iti_onboarding_done', 'true')` persists flag

**Files created:** `src/components/onboarding/OnboardingCarousel.tsx`, `src/hooks/useOnboarding.ts`

---

#### S1-3: Add to Home Screen Prompt (FR-ONBOARD-002)

**Files to create:**
- `src/hooks/useA2HS.ts` — capture `beforeinstallprompt`, defer, show on 2nd session
- `src/components/pwa/A2HSBanner.tsx` — install prompt UI
- iOS: `src/components/pwa/IOSInstallOverlay.tsx` — Safari share-icon instruction

**Acceptance criteria (TC-ONBOARD-002):**
- [x] `beforeinstallprompt` captured and deferred on first visit
- [x] Prompt shown on 2nd authenticated session (Android/Desktop)
- [x] iOS overlay shows Safari share icon instruction

**Files created:** `src/hooks/useA2HS.ts`, `src/components/pwa/A2HSBanner.tsx`

---

## Sprint 2 — Learning Core (Weeks 3–4)
**Requirements:** FR-DASH-001–002 (real data), FR-CATALOG-001–004, FR-STUDY-001–006, FR-LIVE-001–003
**Budget:** 50 hours

### S2-1: Moodle REST API Client (FR-CATALOG-001, FR-CATALOG-002, FR-CATALOG-003)

**Files to create:**
- `src/lib/moodle.ts` — typed Moodle REST client
- `src/app/api/courses/route.ts` — server-side API route (proxies Moodle, hides token)
- `src/app/api/courses/[id]/route.ts` — single course detail
- `src/app/api/courses/[id]/enrol/route.ts` — enrolment endpoint

**Implementation:**
```typescript
// src/lib/moodle.ts
const MOODLE_URL = process.env.MOODLE_URL!;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN!;

export async function moodleRequest(wsfunction: string, params: Record<string, string> = {}) {
  const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
  url.searchParams.set("wstoken", MOODLE_TOKEN);
  url.searchParams.set("wsfunction", wsfunction);
  url.searchParams.set("moodlewsrestformat", "json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  return res.json();
}

export const getCourses = () => moodleRequest("core_course_get_courses");
export const enrollUser = (userId: string, courseId: string) =>
  moodleRequest("core_enrol_enrol_users", { "enrolments[0][roleid]": "5", "enrolments[0][userid]": userId, "enrolments[0][courseid]": courseId });
```

**Acceptance criteria (TC-CATALOG-001, TC-CATALOG-002, TC-CATALOG-003):**
- [ ] All published Moodle courses appear in `/courses`; enrolled courses visually differentiated
- [ ] Course detail page accurate with real Moodle data
- [ ] Enrol button triggers Moodle REST with success confirmation; no payment gateway invoked

---

### S2-2: YouTube Playlist Sync Cron (FR-CATALOG-004)

**Files to create:**
- `src/app/api/cron/youtube-sync/route.ts` — server-side cron endpoint
- Vercel cron job config in `vercel.json`: runs daily at 02:00 UTC

```json
// vercel.json
{
  "crons": [{ "path": "/api/cron/youtube-sync", "schedule": "0 2 * * *" }]
}
```

**Acceptance criteria (TC-CATALOG-004):**
- [ ] Moodle lesson titles and YouTube video IDs in sync within 24 hours of playlist update

---

### S2-3: YouTube iframe API — Real Video Embed (FR-STUDY-001, FR-STUDY-006)

**Files to create:**
- `src/components/lesson/YouTubePlayer.tsx` — YouTube iframe embed with `rel=0`, `modestbranding=1`
- `src/hooks/useVideoProgress.ts` — save/restore timestamp in localStorage

**Implementation:**
```typescript
// src/components/lesson/YouTubePlayer.tsx
"use client";
export function YouTubePlayer({ videoId, lessonId }: { videoId: string; lessonId: string }) {
  const savedTime = typeof window !== "undefined"
    ? Number(localStorage.getItem(`yt_progress_${videoId}`)) || 0
    : 0;

  return (
    <div className="video-container">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&start=${savedTime}&enablejsapi=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-xl"
      />
    </div>
  );
}
```

**Acceptance criteria (TC-STUDY-001, TC-STUDY-006):**
- [ ] Video plays inline; no external YouTube page; related video overlay suppressed
- [ ] On returning, video resumes from last saved timestamp (within ±5 seconds)

---

### S2-4: Mark as Complete → Moodle Write-back (FR-STUDY-002)

**Files to create:**
- `src/app/api/lessons/[lessonId]/complete/route.ts` — POST endpoint calling Moodle completion API
- Update `src/app/courses/[id]/lesson/[lessonId]/page.tsx` — wire "Mark as Complete" button

**Acceptance criteria (TC-STUDY-002):**
- [ ] Completion recorded in Moodle; progress bar updates without full page reload
- [ ] Calling the endpoint twice is idempotent

---

### S2-5: Prev/Next Lesson Navigation (FR-STUDY-003)

**Files to modify:**
- `src/app/courses/[id]/lesson/[lessonId]/page.tsx` — wire Prev/Next with real Moodle lesson order
- Add `onKeyDown` handler for ← → on desktop

**Acceptance criteria (TC-STUDY-003):**
- [ ] Prev/Next navigate correctly within and across modules
- [ ] Keyboard ← → navigation works on desktop

---

### S2-6: Zoom API — Live Class Schedule (FR-LIVE-001, FR-LIVE-002, FR-LIVE-004)

**Files to create:**
- `src/lib/zoom.ts` — Zoom server-to-server OAuth client
- `src/app/api/schedule/route.ts` — fetches upcoming meetings from Zoom API
- Update `src/app/schedule/page.tsx` — replace mock data with real Zoom API data

**Implementation:**
```typescript
// src/lib/zoom.ts
async function getZoomToken() {
  const credentials = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json();
  return data.access_token;
}

export async function getUpcomingMeetings() {
  const token = await getZoomToken();
  const res = await fetch(`https://api.zoom.us/v2/users/me/meetings?type=scheduled&page_size=30`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });
  return res.json();
}
```

**Acceptance criteria (TC-LIVE-001, TC-LIVE-002, TC-LIVE-004):**
- [ ] Schedule shows all classes in next 30 days with local timezone times
- [ ] Join button activates exactly 30 min before start; Zoom deep-link works
- [ ] Cohort label (Sydney / Adelaide / Melbourne / Online) on every card

---

### S2-7: Zoom Recording → YouTube Upload Pipeline (FR-LIVE-003)

**Files to create:**
- `src/app/api/zoom/webhook/route.ts` — receives `recording.completed` webhook, validates signature
- `src/lib/youtube-upload.ts` — downloads Zoom recording, uploads to YouTube as Unlisted
- `src/lib/moodle.ts` — `linkVideoToLesson()` function to store YouTube video ID in Moodle

**Acceptance criteria (TC-LIVE-003):**
- [ ] Replay visible in Schedule and Course page within 2 hours of class end
- [ ] Zoom recording deleted from Zoom cloud after successful YouTube upload

---

### S2-8: Real Dashboard Data (FR-DASH-001, FR-DASH-002)

**Files to modify:**
- `src/app/page.tsx` — replace mock data with real Moodle progress + Zoom next class
- `src/app/api/dashboard/route.ts` — aggregate endpoint (progress + next class)

**Acceptance criteria (TC-DASH-001, TC-DASH-002):**
- [ ] Dashboard shows accurate progress; Continue navigates to correct lesson
- [ ] Countdown accurate to the minute; Join Class button deep-links 30 min before class

---

## Sprint 3 — Engagement (Weeks 5–6)
**Requirements:** FR-CONSULT-001–005, FR-NOTIF-001–004, FR-OFFLINE-001–004, FR-LIVE-005
**Budget:** 55 hours

### S3-1: Cal.com Booking Embed (FR-CONSULT-001, FR-CONSULT-002, FR-CONSULT-003)

**Files to create:**
- `src/app/booking/page.tsx` — instructor listing page (from Cal.com API)
- `src/components/booking/CalEmbed.tsx` — Cal.com embed script component
- `src/app/api/cal/webhook/route.ts` — receives `booking.created`/`cancelled`/`rescheduled`

**Implementation:**
```typescript
// src/components/booking/CalEmbed.tsx
"use client";
import { useEffect } from "react";

export function CalEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    (async function() {
      const { getCalApi } = await import("@calcom/embed-react");
      const cal = await getCalApi();
      cal("ui", { styles: { branding: { brandColor: "#E81C74" } } });
    })();
  }, []);

  return (
    <button
      data-cal-link={calLink}
      className="w-full bg-[#E81C74] text-white py-3 rounded-lg font-bold"
    >
      Book a Session
    </button>
  );
}
```

**Acceptance criteria (TC-CONSULT-001, TC-CONSULT-002, TC-CONSULT-003):**
- [ ] Instructor list populated from Cal.com API; availability reflects real calendar data
- [ ] Booking flow completes in-app; no redirect to external Cal.com domain
- [ ] Confirmation email with Zoom link received within 60 seconds of booking

---

### S3-2: Cancel/Reschedule + Calendar Export (FR-CONSULT-004, FR-CONSULT-005)

**Files to modify:**
- `src/app/profile/bookings/page.tsx` — My Bookings section with cancel/reschedule links
- `src/app/api/cal/bookings/route.ts` — fetch bookings from Cal.com API

**Acceptance criteria (TC-CONSULT-004, TC-CONSULT-005):**
- [ ] Cancel/reschedule via Cal.com; Zoom meeting updated or cancelled accordingly
- [ ] Google Calendar link opens pre-populated; .ics imports without errors

---

### S3-3: Web Push Notifications (FR-NOTIF-001, FR-NOTIF-002, FR-NOTIF-003, FR-NOTIF-004)

**Files to create:**
- `src/app/api/push/subscribe/route.ts` — store VAPID push subscription
- `src/app/api/push/send/route.ts` — server-side push sender (admin/cron use)
- `src/lib/push.ts` — VAPID push utility using `web-push` npm package
- `src/app/api/cron/class-reminders/route.ts` — cron: 60 min before each class
- `public/sw-custom.js` — Service Worker push event handler
- `src/app/profile/notifications/page.tsx` — notification preferences toggles
- Vercel cron: `/api/cron/class-reminders` every minute (checks upcoming classes)

**Acceptance criteria (TC-NOTIF-001, TC-NOTIF-002, TC-NOTIF-003, TC-NOTIF-004):**
- [ ] Push received 60 ± 2 minutes before class; tap navigates to correct class card
- [ ] Push received within 5 minutes of new Moodle lesson visibility
- [ ] Push received 60 ± 2 minutes before consultation; tap navigates to My Bookings
- [ ] Toggling a notification category off stops all further pushes of that type

---

### S3-4: Workbox Service Worker — Offline Caching (FR-OFFLINE-001, FR-OFFLINE-002, FR-OFFLINE-003, FR-OFFLINE-004)

**Files to modify:**
- `next.config.ts` — extend Workbox runtime caching config
- `src/components/pwa/OfflineBanner.tsx` — online/offline status banner
- `public/sw-custom.js` — Background Sync queue for lesson completion events

**Workbox cache strategies:**
```javascript
// Workbox runtime caching (in next.config.ts withPWA config)
runtimeCaching: [
  {
    urlPattern: /^https:\/\/.*\/api\/courses/,
    handler: "NetworkFirst",
    options: { cacheName: "course-data", expiration: { maxAgeSeconds: 86400 } },
  },
  {
    urlPattern: /^https:\/\/.*\/api\/lessons/,
    handler: "NetworkFirst",
    options: { cacheName: "lesson-data", expiration: { maxAgeSeconds: 86400 } },
  },
  {
    urlPattern: /\.(?:js|css|woff2|png|svg|ico)$/,
    handler: "CacheFirst",
    options: { cacheName: "static-assets", expiration: { maxAgeSeconds: 2592000 } },
  },
]
```

**Acceptance criteria (TC-OFFLINE-001, TC-OFFLINE-002, TC-OFFLINE-003, TC-OFFLINE-004):**
- [ ] Previously visited course structure loads from cache with network disabled
- [ ] App shell loads < 1s on repeat visit in Chrome DevTools offline mode
- [ ] Offline banner appears within 2s of connectivity loss; live buttons disabled with tooltip
- [ ] Lesson completion syncs to Moodle within 30 seconds of reconnect

---

### S3-5: Live Participant Count (FR-LIVE-005)

**Files to modify:**
- `src/app/schedule/page.tsx` — add participant count polling (60s interval)
- `src/app/api/schedule/[id]/participants/route.ts` — Zoom API participant count

**Acceptance criteria (TC-LIVE-005):**
- [ ] Participant count shown on class cards; refreshes every 60 seconds while visible

---

### S3-6: Recent Activity Feed (FR-DASH-003)

**Files to create:**
- `src/app/api/dashboard/activity/route.ts` — last 5 events from Moodle grade book
- Update `src/app/page.tsx` — render activity feed

**Acceptance criteria (TC-DASH-003):**
- [ ] Feed shows up to 5 events; events older than 90 days not displayed

---

### S3-7: Lesson Notes Tab (FR-STUDY-004) + Discussion Tab (FR-STUDY-005)

**Files to create:**
- `src/components/lesson/NotesTab.tsx` — fetches Moodle page resource for lesson
- `src/components/lesson/DiscussionTab.tsx` — Moodle forum thread; post new reply
- `src/app/api/lessons/[lessonId]/notes/route.ts` — proxy Moodle page resource
- `src/app/api/lessons/[lessonId]/discussion/route.ts` — proxy Moodle forum thread

**Acceptance criteria (TC-STUDY-004, TC-STUDY-005):**
- [ ] Notes tab content matches Moodle page resource for that lesson
- [ ] Discussion tab loads Moodle forum thread; posting creates new reply via Moodle REST

---

## Sprint 4 — Polish & Handover (Weeks 7–8)
**Requirements:** FR-PROG-001–004, FR-AUTH-004–005, FR-DASH-004, all 22 NFRs
**Budget:** 45 hours

### S4-1: Progress Screen (FR-PROG-001)

**Files to create:**
- `src/app/progress/page.tsx` — enrolled courses with total/completed lessons, %, last activity
- `src/app/api/progress/route.ts` — aggregate from Moodle completion API; cache in Redis 5 min

**Acceptance criteria (TC-PROG-001):**
- [ ] Progress data matches Moodle completion API response
- [ ] Updates within 5 minutes of a new lesson completion

---

### S4-2: Course Completion Screen + Shareable PNG (FR-PROG-002)

**Files to create:**
- `src/components/course/CompletionScreen.tsx` — full-screen congratulations modal
- `src/app/api/completion/badge/[courseId]/route.ts` — generate PNG badge via canvas API

**Acceptance criteria (TC-PROG-002):**
- [ ] Completion screen shown automatically on last lesson completion
- [ ] PNG achievement image downloadable

---

### S4-3: Student Profile Page (FR-AUTH-004)

**Files to create:**
- `src/app/profile/page.tsx` — display name, avatar, enrolled count, lessons completed, join date
- `src/app/api/profile/route.ts` — GET/PATCH student profile (name, notification prefs)

**Acceptance criteria (TC-AUTH-004):**
- [ ] Profile loads within 2s; edits (display name, notification prefs) persist on refresh

---

### S4-4: Donation Nudge Card (FR-DASH-004)

**Files to create:**
- `src/components/dashboard/DonationNudge.tsx` — collapsible card; once/week via localStorage

**Acceptance criteria (TC-DASH-004):**
- [ ] Card visible once per 7-day window; dismissing persists 7 days via localStorage

---

### S4-5: NFR Validation & Testing

#### Performance (TC-PERF-001–005)
- [ ] Run `npx lighthouse https://learn.introtoislam.org --output json` — FCP < 2.0s, LCP < 2.5s, TTI < 3.5s
- [ ] Add `next/image` with WebP + `loading="lazy"` for all below-fold images
- [ ] Add `dynamic(() => import(...), { ssr: false })` for heavy client components
- [ ] Run k6 load test: 500 VUs, 5 min — P95 API response ≤ 500ms

#### Security (TC-SEC-001–006)
- [ ] Verify all API routes use server-side Moodle/Zoom tokens (never exposed to client)
- [ ] Add `next-safe-headers` or manual CSP headers in `next.config.ts`
- [ ] Implement rate limiting via Redis middleware (auth: 10 req/min/IP; API: 300 req/min/user)
- [ ] Run OWASP ZAP scan against staging URL
- [ ] Verify `SameSite=Strict` on all auth cookies
- [ ] Confirm daily B2 backup cron is running and logged

#### Accessibility (TC-ACCESS-001–003)
- [ ] Run `npx axe-core` or Playwright + axe — zero critical violations
- [ ] Manual keyboard test: Tab, Shift-Tab, Enter, Space, ← → on all interactive elements
- [ ] Test with NVDA (Windows) + VoiceOver (iOS) — all ARIA labels announced correctly

#### PWA (TC-PWA-001–003)
- [ ] Lighthouse PWA audit ≥ 90 on all four categories
- [ ] Verify `manifest.json` has 192×192 and 512×512 maskable icons
- [ ] Verify Service Worker registers, caches, and updates silently

#### Availability (TC-AVAIL-001–003)
- [ ] Set up UptimeRobot monitoring for `learn.introtoislam.org`
- [ ] Verify backup cron runs at 02:00 AEST and logs success
- [ ] Document and test DR procedure (Hetzner snapshot + B2 restore; target RTO < 4h)

#### Scalability (TC-SCALE-001–002)
- [ ] Verify Moodle configured for 5,000 student accounts (check max_allowed_packet, pool size)
- [ ] Verify Next.js API routes are stateless (no in-memory state; session in Redis)

---

## API Environment Variables Reference

```env
# WordPress OAuth2
WORDPRESS_CLIENT_ID=
WORDPRESS_CLIENT_SECRET=
WORDPRESS_SITE_URL=https://introtoislam.org

# NextAuth.js
NEXTAUTH_URL=https://learn.introtoislam.org
NEXTAUTH_SECRET=

# Moodle REST API
MOODLE_URL=https://lms.introtoislam.org
MOODLE_TOKEN=

# YouTube Data API v3
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=

# Zoom (server-to-server OAuth)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET_TOKEN=

# Cal.com
CALCOM_API_KEY=
CALCOM_API_URL=https://book.introtoislam.org

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@introtoislam.org

# Redis
REDIS_URL=redis://localhost:6379

# Database (if PWA needs direct DB access for push subs)
DATABASE_URL=
```

---

## File Structure — Sprint 2–4 Additions

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts       # S1-1
│   │   ├── courses/
│   │   │   ├── route.ts                       # S2-1
│   │   │   └── [id]/
│   │   │       ├── route.ts                   # S2-1
│   │   │       └── enrol/route.ts             # S2-1
│   │   ├── lessons/
│   │   │   └── [lessonId]/
│   │   │       ├── complete/route.ts          # S2-4
│   │   │       ├── notes/route.ts             # S3-7
│   │   │       └── discussion/route.ts        # S3-7
│   │   ├── schedule/
│   │   │   ├── route.ts                       # S2-6
│   │   │   └── [id]/participants/route.ts     # S3-5
│   │   ├── zoom/
│   │   │   └── webhook/route.ts               # S2-7
│   │   ├── cal/
│   │   │   ├── webhook/route.ts               # S3-1
│   │   │   └── bookings/route.ts              # S3-2
│   │   ├── push/
│   │   │   ├── subscribe/route.ts             # S3-3
│   │   │   └── send/route.ts                  # S3-3
│   │   ├── dashboard/
│   │   │   ├── route.ts                       # S2-8
│   │   │   └── activity/route.ts              # S3-6
│   │   ├── progress/route.ts                  # S4-1
│   │   ├── profile/route.ts                   # S4-3
│   │   ├── completion/badge/[courseId]/route.ts # S4-2
│   │   └── cron/
│   │       ├── youtube-sync/route.ts          # S2-2
│   │       └── class-reminders/route.ts       # S3-3
│   ├── booking/page.tsx                       # S3-1
│   ├── progress/page.tsx                      # S4-1
│   └── profile/
│       ├── page.tsx                           # S4-3
│       ├── bookings/page.tsx                  # S3-2
│       └── notifications/page.tsx             # S3-3
├── components/
│   ├── auth/
│   │   └── LoginButton.tsx                    # S1-1
│   ├── onboarding/
│   │   └── OnboardingCarousel.tsx             # S1-2
│   ├── pwa/
│   │   ├── A2HSBanner.tsx                     # S1-3
│   │   ├── IOSInstallOverlay.tsx              # S1-3
│   │   └── OfflineBanner.tsx                  # S3-4
│   ├── lesson/
│   │   ├── YouTubePlayer.tsx                  # S2-3
│   │   ├── NotesTab.tsx                       # S3-7
│   │   └── DiscussionTab.tsx                  # S3-7
│   ├── booking/
│   │   └── CalEmbed.tsx                       # S3-1
│   ├── course/
│   │   └── CompletionScreen.tsx               # S4-2
│   └── dashboard/
│       └── DonationNudge.tsx                  # S4-4
├── lib/
│   ├── auth.ts                                # S1-1
│   ├── moodle.ts                              # S2-1
│   ├── zoom.ts                                # S2-6
│   ├── youtube-upload.ts                      # S2-7
│   └── push.ts                                # S3-3
├── hooks/
│   ├── useOnboarding.ts                       # S1-2
│   ├── useA2HS.ts                             # S1-3
│   └── useVideoProgress.ts                    # S2-3
└── middleware.ts                              # S1-1
```

---

## Go-Live Checklist

Before deploying to `learn.introtoislam.org`:

### Must (25 FRs) — All required
- [ ] FR-AUTH-001: WordPress OAuth2 SSO working end-to-end
- [ ] FR-AUTH-002: Silent token refresh
- [ ] FR-AUTH-003: Logout clears all session state
- [ ] FR-ONBOARD-001: 3-screen onboarding carousel
- [ ] FR-ONBOARD-002: A2HS prompt (Android + iOS)
- [ ] FR-DASH-001: Course progress cards with real Moodle data
- [ ] FR-DASH-002: Next class countdown + Join button active 30 min before
- [ ] FR-CATALOG-001: Course catalogue from Moodle
- [ ] FR-CATALOG-002: Course detail page from Moodle
- [ ] FR-CATALOG-003: Free enrolment via Moodle REST
- [ ] FR-STUDY-001: YouTube iframe embed with `rel=0`
- [ ] FR-STUDY-002: Mark as Complete → Moodle write-back
- [ ] FR-STUDY-003: Prev/Next navigation + keyboard support
- [ ] FR-LIVE-001: Upcoming class schedule from Zoom API
- [ ] FR-LIVE-002: Join button active 30 min before
- [ ] FR-LIVE-003: Class replay via YouTube embed
- [ ] FR-LIVE-004: Cohort city labels on all class cards
- [ ] FR-CONSULT-001: Instructor listing from Cal.com
- [ ] FR-CONSULT-002: Cal.com booking embed in-app
- [ ] FR-CONSULT-003: Zoom meeting created on booking; email within 60s
- [ ] FR-OFFLINE-001: Service Worker caches course structure
- [ ] FR-OFFLINE-002: App shell Cache-First < 1s
- [ ] FR-NOTIF-001: Push 60 min before live class
- [ ] FR-NOTIF-003: Push 60 min before consultation
- [ ] FR-PROG-001: Progress screen with real Moodle data

### All 22 NFRs — All required
- [ ] NFR-PERF-001: FCP < 2.0s (Lighthouse)
- [ ] NFR-PERF-002: LCP < 2.5s (Lighthouse)
- [ ] NFR-PERF-003: TTI < 3.5s (Lighthouse)
- [ ] NFR-PERF-004: API P95 ≤ 500ms (k6)
- [ ] NFR-PERF-005: 500 concurrent users (k6)
- [ ] NFR-SEC-001: HTTPS / TLS 1.3 everywhere
- [ ] NFR-SEC-002: Token lifecycle correct
- [ ] NFR-SEC-003: OWASP Top 10 (ZAP scan)
- [ ] NFR-SEC-004: CSRF protection
- [ ] NFR-SEC-005: Rate limiting active
- [ ] NFR-SEC-006: Daily encrypted backups
- [ ] NFR-AVAIL-001: 99.5% uptime monitoring configured
- [ ] NFR-AVAIL-002: Automated daily backup cron
- [ ] NFR-AVAIL-003: DR procedure documented + tested
- [ ] NFR-ACCESS-001: WCAG 2.1 AA (axe-core)
- [ ] NFR-ACCESS-002: Full keyboard navigation
- [ ] NFR-ACCESS-003: Screen reader (NVDA/VoiceOver)
- [ ] NFR-PWA-001: Lighthouse PWA ≥ 90
- [ ] NFR-PWA-002: Valid manifest.json
- [ ] NFR-PWA-003: Service Worker silent updates
- [ ] NFR-SCALE-001: Moodle configured for 5,000 students
- [ ] NFR-SCALE-002: Next.js stateless (Redis sessions)
