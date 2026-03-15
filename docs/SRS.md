# Software Requirements Specification
**IntroToIslam.org — Student Learning Portal (PWA)**

> **Document:** SRS-ITI-2026-001 · **Version:** 1.0 · **Date:** 11 March 2026
> **Status:** Approved for Development · **Author:** Emerge Digital / IntroToIslam.org Tech Team
> **Based On:** PRD-ITI-2026-001 · **Architecture Ref:** ARCH-ITI-2026-001

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the complete functional and non-functional requirements for the IntroToIslam Student Learning Portal. It is the authoritative reference for all development, testing, and acceptance activities. Every requirement is uniquely identified for traceability.

### 1.2 Scope
**In scope:** Next.js PWA front-end; Moodle REST API integration; WordPress OAuth2 SSO; YouTube Data API v3; Zoom API v2; Cal.com booking; Mautic email automation; Web Push API; Service Worker offline caching.

### 1.3 Priority Legend
- **Must** = Launch blocker (Sprint 1–2)
- **Should** = High value (Sprint 2–3)
- **Could** = Nice-to-have (Sprint 4 / post-launch)

### 1.4 Operating Environment
| Platform | Versions |
|---------|---------|
| Desktop browsers | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Mobile browsers | Chrome for Android 120+, Safari iOS 16.4+ |
| Screen sizes | 320px minimum through 1920px |
| Network | 3G (1 Mbps) through WiFi (50+ Mbps) |
| OS | Android 10+, iOS 16.4+, Windows 10+, macOS 12+ |

---

## 2. Functional Requirements

### 2.1 Authentication & Profile (FR-AUTH)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-AUTH-001 | **Must** | WordPress OAuth2 SSO login — redirect to WordPress, exchange auth code for JWT, create local session | Login completes OAuth flow and lands on Dashboard within 5 seconds |
| FR-AUTH-002 | **Must** | 15-min JWT access token + 30-day refresh token in HttpOnly, Secure, SameSite=Strict cookie; silent refresh | After 15 min idle, next API call silently refreshes; user not redirected to login |
| FR-AUTH-003 | **Must** | Logout: revoke refresh token server-side; clear all cookies, localStorage, and Zustand state | After logout, Back button does not restore session; API calls return 401 |
| FR-AUTH-004 | Should | Student profile page: display name, avatar, enrolled courses, lessons completed, join date; editable name + notification prefs | Profile loads within 2s; edits persist on refresh |
| FR-AUTH-005 | Could | Google OAuth alternative login; links Google account to existing WordPress account by email match | Logs in with Google; if same email in WordPress, accounts merge and session established |

### 2.2 Onboarding (FR-ONBOARD)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-ONBOARD-001 | **Must** | 3-screen onboarding carousel on first launch (before login): value props for Learn, Join Classes, Book 1:1; skippable; never shown again after Login tapped | Carousel shown on first visit; dismissed permanently after Login |
| FR-ONBOARD-002 | **Must** | Web App Manifest-compliant A2HS prompt after student's 2nd authenticated session (Android/Desktop); iOS: Safari share-icon instruction overlay | BeforeInstallPrompt captured and deferred; shown on 2nd session. iOS overlay visible on Safari |

### 2.3 Dashboard (FR-DASH)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-DASH-001 | **Must** | Course progress card per enrolled course: title, current lesson number/title, progress %, Continue button to next incomplete lesson | Dashboard shows accurate progress; Continue navigates to correct lesson |
| FR-DASH-002 | **Must** | Next upcoming Zoom class card: title, cohort city, date/time in local timezone, countdown, Join button active 30 min before start | Countdown accurate to the minute; Join deep-links to Zoom 30 min before class |
| FR-DASH-003 | Should | Recent Activity feed: last 5 learning events (lesson completed, class attended, booking) with relative timestamps | Feed shows up to 5 events; events older than 90 days not displayed |
| FR-DASH-004 | Could | Collapsible Donation nudge card once/week for non-donor students; dismissal persists 7 days via localStorage | Card visible once per 7-day window; dismissing persists for 7 days |

### 2.4 Course Catalogue & Enrolment (FR-CATALOG)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-CATALOG-001 | **Must** | Course catalogue: thumbnail, title, short description, total lessons, estimated hours, enrolment status | All published Moodle courses appear; enrolled courses visually differentiated |
| FR-CATALOG-002 | **Must** | Course detail page: full description, module list with lesson titles, instructor name, Enrol button | Detail page accurate; Enrol triggers Moodle REST enrolment API with success confirmation |
| FR-CATALOG-003 | **Must** | Free zero-cost enrolment via Moodle self-enrol REST endpoint; no payment gateway invoked | Student enrolled in Moodle immediately; enrolled course appears in Dashboard |
| FR-CATALOG-004 | Should | Daily sync of YouTube playlist metadata to Moodle via YouTube Data API v3 cron job | Moodle lesson titles and YouTube video IDs in sync within 24 hours of playlist update |

### 2.5 Course Study Experience (FR-STUDY)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-STUDY-001 | **Must** | YouTube iframe API inline embed; related-videos suppressed (`rel=0`, `modestbranding=1`) | Video plays inline; no external YouTube page opened; related video overlay suppressed |
| FR-STUDY-002 | **Must** | Mark as Complete button: calls Moodle completion API; progress bar updates without full page reload | Completion recorded in Moodle; progress bar updates without full reload |
| FR-STUDY-003 | **Must** | Prev/Next lesson navigation buttons; desktop keyboard ← → navigation | Prev/Next navigate correctly within and across modules; keyboard navigation works on desktop |
| FR-STUDY-004 | Should | Lesson notes tab: instructor-authored Moodle page resources rendered below video | Notes tab visible; content matches Moodle page resource for that lesson |
| FR-STUDY-005 | Should | Discussion tab per lesson: Moodle forum thread; students can post without leaving PWA | Discussion tab loads Moodle forum; post creates reply via Moodle REST API |
| FR-STUDY-006 | Could | Save and restore YouTube video playback position per video ID in localStorage | On returning, video resumes from last saved timestamp (within ±5 seconds) |

### 2.6 Live Class Attendance (FR-LIVE)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-LIVE-001 | **Must** | Upcoming class schedule (30-day window): title, cohort city, instructor, local-timezone time, participant count | Schedule accurate to Zoom API data; times shown in device local timezone |
| FR-LIVE-002 | **Must** | Join Class button: inactive until 30 min before; deep-links to Zoom app or Zoom Web Client | Join button activates exactly 30 min before start; Zoom opens on tap |
| FR-LIVE-003 | **Must** | Class replay recordings via YouTube embed; available within 2 hours of session end (Zoom webhook → YT upload) | Replay visible in Schedule and Course page within 2 hours of class end |
| FR-LIVE-004 | **Must** | Cohort city label (Sydney / Adelaide / Melbourne / Online) on every class card | Cohort label present on all cards; matches Zoom meeting metadata |
| FR-LIVE-005 | Should | Live participant count from Zoom API; refreshes every 60 seconds while card visible | Participant count shown and refreshes every 60 seconds |

### 2.7 Private Consultations (FR-CONSULT)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-CONSULT-001 | **Must** | Instructor listing: name, photo, specialisation, languages, availability status from Cal.com API | Instructor list populated from Cal.com team API; availability reflects real calendar data |
| FR-CONSULT-002 | **Must** | Cal.com booking calendar embedded in-app; no external navigation; slots in student's local timezone | Booking flow completes in-app; no redirect to external Cal.com domain |
| FR-CONSULT-003 | **Must** | On booking: Cal.com auto-creates Zoom meeting; confirmation email with Zoom link within 60 seconds | Confirmation email received within 60 seconds; Zoom link functional |
| FR-CONSULT-004 | Should | Cancel/reschedule accessible from confirmation email and 'My Bookings' in student profile | Cancel/reschedule via Cal.com; Zoom meeting updated or cancelled accordingly |
| FR-CONSULT-005 | Should | Booking confirmation: Google Calendar link + .ics download | Google Calendar link opens pre-populated; .ics imports without errors |

### 2.8 Offline Access & PWA (FR-OFFLINE)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-OFFLINE-001 | **Must** | Service Worker caches course structure (modules, lesson titles, notes) from last visited courses | With network disabled, previously visited course structure loads from cache without error |
| FR-OFFLINE-002 | **Must** | Cache-First strategy for app shell (JS/CSS/fonts/icons); loads < 1s from cache on repeat visit | App shell loads in < 1s on repeat visit in Chrome DevTools offline mode |
| FR-OFFLINE-003 | Should | Offline indicator banner within 2s of connectivity loss; live-requiring buttons disabled with tooltip | Banner appears within 2s; live-requiring buttons disabled with tooltip |
| FR-OFFLINE-004 | Should | Background Sync: lesson completion events queued offline; auto-flush to Moodle on reconnect | Completion syncs to Moodle within 30 seconds of connectivity restoration |

### 2.9 Push Notifications (FR-NOTIF)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-NOTIF-001 | **Must** | Web Push 60 min before live Zoom class; tap opens Schedule at relevant class card | Push received 60 ± 2 minutes before class; tap navigates to correct class card |
| FR-NOTIF-002 | Should | Web Push to enrolled students when new Moodle lesson published (within 5 minutes) | Push received within 5 minutes of new Moodle activity visibility |
| FR-NOTIF-003 | **Must** | Web Push 60 min before booked private consultation; triggered by Cal.com webhook | Push received 60 ± 2 minutes before consultation start; tap navigates to My Bookings |
| FR-NOTIF-004 | Should | Notification Preferences screen in profile: independent toggle per category | Toggling a category off prevents all further pushes of that type within 1 API call cycle |

### 2.10 Progress Tracking & Achievements (FR-PROG)

| Req ID | Priority | Requirement | Acceptance Criteria |
|--------|----------|-------------|---------------------|
| FR-PROG-001 | **Must** | Progress screen: each enrolled course with total/completed lessons, %, last-activity date | Progress data matches Moodle completion API response |
| FR-PROG-002 | Should | Full-screen course completion screen with shareable PNG achievement image | Completion screen shown automatically on last lesson completion; image downloadable |
| FR-PROG-003 | Could | Zoom class attendance history log from Moodle grade book (Zoom attendance webhook data) | Attendance log lists classes attended with date; matches Moodle grade book entries |
| FR-PROG-004 | Could | Downloadable Open Badges 2.0-compatible completion badge PNG on course completion | Badge downloads as PNG; metadata conforms to Open Badges 2.0 spec |

---

## 3. Non-Functional Requirements

### 3.1 Performance (NFR-PERF)

| Req ID | Metric | Target |
|--------|--------|--------|
| NFR-PERF-001 | First Contentful Paint | < 2.0s on simulated 4G (Lighthouse headless Chrome) |
| NFR-PERF-002 | Largest Contentful Paint | < 2.5s; WebP images, lazy-loading below fold |
| NFR-PERF-003 | Time to Interactive | < 3.5s; code splitting + dynamic imports per route |
| NFR-PERF-004 | API P95 response time | ≤ 500ms under normal load |
| NFR-PERF-005 | Concurrent sessions | 500 users: CPU ≤ 80%, no response time degradation > 20% |

### 3.2 Security (NFR-SEC)

| Req ID | Metric | Target |
|--------|--------|--------|
| NFR-SEC-001 | Transport | HTTPS / TLS 1.3 everywhere; no mixed content; HSTS enabled |
| NFR-SEC-002 | Token lifecycle | 15-min access token; 30-day refresh token; Redis blacklist for revocation |
| NFR-SEC-003 | Vulnerabilities | OWASP Top 10 mitigations; zero critical findings in ZAP scan |
| NFR-SEC-004 | CSRF | CSRF token on state-mutating endpoints; SameSite=Strict cookies |
| NFR-SEC-005 | Rate limiting | Auth: 10 req/min/IP; API: 300 req/min/user |
| NFR-SEC-006 | Backups | Daily AES-256 encrypted MySQL backups to Backblaze B2; 7-day retention |

### 3.3 Availability & Reliability (NFR-AVAIL)

| Req ID | Metric | Target |
|--------|--------|--------|
| NFR-AVAIL-001 | Uptime | ≥ 99.5% monthly (≤ 3.6h unplanned downtime/month) |
| NFR-AVAIL-002 | Backups | Automated daily at 02:00 AEST; failures trigger admin email |
| NFR-AVAIL-003 | RTO | < 4 hours (Hetzner snapshot + Backblaze B2 restore) |

### 3.4 Accessibility (NFR-ACCESS)

| Req ID | Metric | Target |
|--------|--------|--------|
| NFR-ACCESS-001 | Standard | WCAG 2.1 Level AA; 4.5:1 colour contrast; focus indicators; no >3Hz flashing |
| NFR-ACCESS-002 | Keyboard | Full keyboard navigation via Tab/Shift-Tab/Enter/Space/arrows; no keyboard traps |
| NFR-ACCESS-003 | Screen reader | ARIA labels on all non-text content; ARIA live regions for dynamic updates |

### 3.5 Progressive Web App (NFR-PWA)

| Req ID | Metric | Target |
|--------|--------|--------|
| NFR-PWA-001 | Lighthouse score | ≥ 90: HTTPS, Service Worker, manifest, offline fallback all pass |
| NFR-PWA-002 | Manifest | Valid `manifest.json`: name, short_name, start_url, display:standalone, 192+512 maskable icons |
| NFR-PWA-003 | Service Worker | Workbox registers on first load; silent background updates; user prompted on major update only |

### 3.6 Scalability (NFR-SCALE)

| Req ID | Metric | Target |
|--------|--------|--------|
| NFR-SCALE-001 | User accounts | Data model supports 5,000 students without structural changes |
| NFR-SCALE-002 | Stateless | Next.js stateless (sessions in Redis + HttpOnly cookies); multiple replicas behind load balancer |

---

## 4. Use Cases

| UC ID | Use Case | Actors | Main Flow |
|-------|---------|--------|-----------|
| UC-001 | Login via SSO | Student, WordPress | Tap Login → OAuth2 redirect → authorise → exchange code → JWT → Dashboard |
| UC-002 | Enrol in Course | Student, Moodle | Browse catalogue → tap Course → read → tap Enrol → Moodle REST → appears in Dashboard |
| UC-003 | Study a Lesson | Student, Moodle, YouTube | Tap Continue → Lesson page → YouTube video plays → Mark Complete → Progress updates |
| UC-004 | Join Live Class | Student, Zoom | See class card → tap Join (30 min before) → Zoom deep-link → attend class |
| UC-005 | Watch Class Replay | Student, YouTube | Open Schedule → past session → tap Watch Replay → YouTube embed loads in-app |
| UC-006 | Book Consultation | Student, Cal.com, Zoom | Tap Book 1:1 → browse instructors → Cal.com embed → select slot → confirmed → Zoom created |
| UC-007 | Study Offline | Student, Service Worker | Lose connectivity → Dashboard loads from cache → course structure loads → mark complete → queued |
| UC-008 | Receive Class Reminder | Student, Push API | Server cron 60 min before class → push sent → notification displayed → tap → PWA opens Schedule |

---

## 5. System Interface Requirements

### External APIs

| API | Endpoints / Method | Used By |
|-----|-------------------|---------|
| WordPress OAuth2 | `POST /oauth/token`, `GET /oauth/authorize` | FR-AUTH-001, FR-AUTH-002 |
| Moodle REST | `core_course_get_courses`, `core_enrol_enrol_users`, `core_completion_update_activity_completion_status_manually`, `mod_forum_add_discussion` | FR-CATALOG-001–003, FR-STUDY-002–005, FR-PROG-001 |
| YouTube Data API v3 | `GET /playlistItems`, `GET /videos` (10,000 units/day) | FR-CATALOG-004, FR-STUDY-001 |
| YouTube iframe API | `YT.Player` — `onStateChange`, `onReady` | FR-STUDY-001, FR-STUDY-006, FR-LIVE-003 |
| Zoom API v2 | `POST /users/{id}/meetings`, `GET /meetings/{id}`, webhook: `recording.completed` | FR-LIVE-001–003, FR-CONSULT-003 |
| Cal.com Embed + API v2 | JS embed SDK, `/api/v2/bookings`, webhooks: `booking.created/cancelled/rescheduled` | FR-CONSULT-001–005 |
| Web Push (VAPID) | `HTTP POST` to browser push endpoint | FR-NOTIF-001–003 |

### Internal Interfaces

| Interface | Description |
|-----------|-------------|
| Next.js API Routes → Moodle | Server-side proxy; Moodle tokens never exposed to client |
| Next.js → Redis | Session store for token blacklist and rate-limit counters (ioredis) |
| Zoom Webhook → Next.js → YouTube | `recording.completed` → validates → downloads → uploads as Unlisted → stores videoId in Moodle |
| Cal.com Webhook → Next.js → Push | `booking.created` → schedules push notification job in Redis queue 60 min before consultation |

---

## 6. Data Dictionary

| Entity | Description |
|--------|-------------|
| Student | WordPress user (id, email, display_name, join_date); mirrored to Moodle via OAuth SSO |
| Course | Moodle course (id, fullname, shortname, summary, visible, timecreated) |
| Lesson/Activity | Moodle course module (cmid, name, completion_state, youtube_video_id) |
| Enrolment | Moodle record (userid, courseid, timestart, timeend, status) |
| Completion | Moodle record (userid, cmid, completionstate, timemodified) |
| Live Class | Zoom Meeting (id, topic, start_time, duration, join_url, cohort_tag) |
| Class Replay | YouTube Video (videoId, title, playlistId, publishedAt, status: 'unlisted') |
| Booking | Cal.com Booking (uid, userId, eventTypeId, startTime, endTime, zoomMeetingUrl) |
| Notification Sub | Push subscription (endpoint, keys.p256dh, keys.auth) + studentId + preference flags |
| Progress Snapshot | Computed view (studentId, courseId, total_lessons, completed, pct_complete, last_active); Redis cache 5 min |

---

## 7. Constraints & Assumptions

| ID | Type | Statement |
|----|------|-----------|
| CON-001 | Budget | Monthly infra spend ≤ AUD $80; all third-party services must be free-tier or zero-cost self-hosted |
| CON-002 | Technology | Next.js 16 App Router; TypeScript mandatory; Tailwind CSS; Zustand; TanStack Query |
| CON-003 | Video | All video via YouTube; no re-encoding or re-hosting |
| CON-004 | Licensing | All components open-source (MIT/GPL/AGPL/Apache 2.0) or free-for-non-commercial |
| CON-005 | Data Residency | Student PII on Hetzner EU VPS; no PII to third-party analytics |
| CON-006 | Accessibility | WCAG 2.1 AA is a hard constraint; zero critical axe-core violations before go-live |
| ASM-001 | Assumption | WordPress remains identity system of record for ≥ 24 months post-launch |
| ASM-002 | Assumption | YouTube iframe API embedding terms continue to permit in-app playback |
| ASM-003 | Assumption | Cal.com v3.x self-hosted retains Zoom integration capability |
| ASM-004 | Assumption | Volunteer instructors hold valid Zoom Pro licences |
| ASM-005 | Assumption | Hetzner CX32 sufficient for 0–500 student scale |

---

## 8. Requirement Count Summary

| Area | Total | Must | Should | Could |
|------|-------|------|--------|-------|
| FR-AUTH | 5 | 3 | 1 | 1 |
| FR-ONBOARD | 2 | 2 | 0 | 0 |
| FR-DASH | 4 | 2 | 1 | 1 |
| FR-CATALOG | 4 | 3 | 1 | 0 |
| FR-STUDY | 6 | 3 | 2 | 1 |
| FR-LIVE | 5 | 4 | 1 | 0 |
| FR-CONSULT | 5 | 3 | 2 | 0 |
| FR-OFFLINE | 4 | 2 | 2 | 0 |
| FR-NOTIF | 4 | 2 | 2 | 0 |
| FR-PROG | 4 | 1 | 1 | 2 |
| **Total FR** | **43** | **25** | **13** | **5** |
| NFR-PERF | 5 | — | — | — |
| NFR-SEC | 6 | — | — | — |
| NFR-AVAIL | 3 | — | — | — |
| NFR-ACCESS | 3 | — | — | — |
| NFR-PWA | 3 | — | — | — |
| NFR-SCALE | 2 | — | — | — |
| **Total NFR** | **22** | — | — | — |
| **Grand Total** | **65** | **25** | **13** | **5** |

> **Go-Live Gate:** All 25 Must FRs + all 22 NFRs = Complete. ≥ 80% of Should FRs = Complete. Could FRs may be Deferred.
