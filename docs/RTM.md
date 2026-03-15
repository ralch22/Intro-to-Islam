# Requirements Traceability Matrix
**IntroToIslam.org — Student Learning Portal (PWA)**

> **Document:** RTM-ITI-2026-001 · **Version:** 1.0 · **Date:** 11 March 2026
> **Status:** Baselined — Approved for Development
> **SRS Ref:** SRS-ITI-2026-001 · **PRD Ref:** PRD-ITI-2026-001 · **Arch Ref:** ARCH-ITI-2026-001

---

## Purpose

This RTM establishes bidirectional traceability between all 65 requirements (43 FR + 22 NFR) and their:
- **PRD Source** — user story ID from PRD
- **Architecture Component** — primary system component responsible
- **Test Case ID** — unique test identifier (TC-{AREA}-{NNN})
- **Verification Method** — how the requirement is confirmed
- **Priority** — Must / Should / Could / N/A
- **Status** — Not Started / In Progress / Complete / Deferred

### Verification Methods
| Method | Description |
|--------|-------------|
| Functional Test | Unit/component-level test via Playwright E2E |
| Integration Test | End-to-end test across two or more systems |
| Lighthouse Audit | Automated Lighthouse CLI in headless Chrome against staging |
| Load Test (k6) | Grafana k6 script simulating concurrent users |
| Security Audit (ZAP) | OWASP ZAP automated + manual scan; zero critical findings required |
| Penetration Test | Manual white-box token manipulation and session fixation tests |
| axe-core Audit | Automated axe-core scan in Playwright test suite |
| Manual Keyboard Test | Human tester — keyboard only, no mouse, in Chrome + Firefox |
| Screen Reader Test | NVDA (Windows) + VoiceOver (iOS/macOS) |
| Manual Inspection | Human reviewer verifies config, backup logs, or docs |
| Uptime Monitoring | UptimeRobot or Uptime Kuma over 30-day window |
| DR Drill | Simulated disaster recovery — restore from B2 backup, RTO timed |
| Architecture Review | Peer review of Docker Compose config against statelessness requirement |

---

## Coverage Summary

| Feature Area | Total | Must | Should | Could | Test Cases | Status |
|-------------|-------|------|--------|-------|-----------|--------|
| Authentication & Profile (FR-AUTH) | 5 | 3 | 1 | 1 | TC-AUTH-001–005 | Not Started |
| Onboarding (FR-ONBOARD) | 2 | 2 | 0 | 0 | TC-ONBOARD-001–002 | Not Started |
| Dashboard (FR-DASH) | 4 | 2 | 1 | 1 | TC-DASH-001–004 | Not Started |
| Course Catalogue (FR-CATALOG) | 4 | 3 | 1 | 0 | TC-CATALOG-001–004 | Not Started |
| Course Study (FR-STUDY) | 6 | 3 | 2 | 1 | TC-STUDY-001–006 | Not Started |
| Live Classes (FR-LIVE) | 5 | 4 | 1 | 0 | TC-LIVE-001–005 | Not Started |
| Consultations (FR-CONSULT) | 5 | 3 | 2 | 0 | TC-CONSULT-001–005 | Not Started |
| Offline & PWA (FR-OFFLINE) | 4 | 2 | 2 | 0 | TC-OFFLINE-001–004 | Not Started |
| Push Notifications (FR-NOTIF) | 4 | 2 | 2 | 0 | TC-NOTIF-001–004 | Not Started |
| Progress & Achievements (FR-PROG) | 4 | 1 | 1 | 2 | TC-PROG-001–004 | Not Started |
| Performance (NFR-PERF) | 5 | — | — | — | TC-PERF-001–005 | Not Started |
| Security (NFR-SEC) | 6 | — | — | — | TC-SEC-001–006 | Not Started |
| Availability (NFR-AVAIL) | 3 | — | — | — | TC-AVAIL-001–003 | Not Started |
| Accessibility (NFR-ACCESS) | 3 | — | — | — | TC-ACCESS-001–003 | Not Started |
| PWA Compliance (NFR-PWA) | 3 | — | — | — | TC-PWA-001–003 | Not Started |
| Scalability (NFR-SCALE) | 2 | — | — | — | TC-SCALE-001–002 | Not Started |
| **TOTAL** | **65** | **25** | **13** | **5** | **65 Test Cases** | **Not Started** |

---

## Full Traceability Matrix

### Authentication & Profile (FR-AUTH)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-AUTH-001 | WordPress OAuth2 SSO — redirect, code exchange, JWT session | F1-1 | WordPress + WP OAuth Server | TC-AUTH-001 | Integration Test | Must | Not Started |
| FR-AUTH-002 | 15-min JWT + 30-day refresh in HttpOnly cookie; silent refresh | F1-4 | Next.js PWA + Redis | TC-AUTH-002 | Functional Test | Must | Not Started |
| FR-AUTH-003 | Logout: revoke refresh token, clear cookies + Zustand state | F1-4 | Next.js PWA + Redis | TC-AUTH-003 | Functional Test | Must | Not Started |
| FR-AUTH-004 | Profile page: display name, avatar, enrolled count, lessons, join date | F1-1 | Next.js PWA + Moodle LMS | TC-AUTH-004 | Functional Test | Should | Not Started |
| FR-AUTH-005 | Google OAuth alternative login; merge by email match | PRD F1 | WordPress + Google OAuth | TC-AUTH-005 | Integration Test | Could | Not Started |

### Onboarding (FR-ONBOARD)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-ONBOARD-001 | 3-screen value-prop carousel on first launch; dismissed after Login | F1-2 | Next.js PWA | TC-ONBOARD-001 | Functional Test | Must | Not Started |
| FR-ONBOARD-002 | A2HS prompt on 2nd authenticated session (Android/Desktop); iOS overlay | F1-3 | Service Worker + Web App Manifest | TC-ONBOARD-002 | Manual Inspection | Must | Not Started |

### Dashboard (FR-DASH)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-DASH-001 | Course progress cards: title, lesson, %, Continue button | F2-1 | Next.js PWA + Moodle LMS | TC-DASH-001 | Functional Test | Must | Not Started |
| FR-DASH-002 | Next live class: title, cohort, local time, countdown, Join (active 30 min before) | F2-2 | Next.js PWA + Zoom API v2 | TC-DASH-002 | Functional Test | Must | Not Started |
| FR-DASH-003 | Recent activity feed: last 5 events with relative timestamps | F2-3 | Next.js PWA + Moodle LMS | TC-DASH-003 | Functional Test | Should | Not Started |
| FR-DASH-004 | Collapsible donation nudge once/week; dismissal persists 7 days | F2-4 | Next.js PWA + WooCommerce | TC-DASH-004 | Functional Test | Could | Not Started |

### Course Catalogue & Enrolment (FR-CATALOG)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-CATALOG-001 | Course catalogue: thumbnail, title, description, lessons, hours, enrolment status | F2-1 | Next.js PWA + Moodle LMS | TC-CATALOG-001 | Functional Test | Must | Not Started |
| FR-CATALOG-002 | Course detail: full description, module/lesson list, instructor, Enrol button | F2-1 | Next.js PWA + Moodle LMS | TC-CATALOG-002 | Functional Test | Must | Not Started |
| FR-CATALOG-003 | Free zero-cost enrolment via Moodle self-enrol REST; no payment gateway | F2-1 | Next.js PWA + Moodle LMS | TC-CATALOG-003 | Integration Test | Must | Not Started |
| FR-CATALOG-004 | Daily sync of YouTube playlist metadata to Moodle via cron + YouTube Data API | PRD F3 | YouTube Data API v3 + Moodle | TC-CATALOG-004 | Integration Test | Should | Not Started |

### Course Study Experience (FR-STUDY)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-STUDY-001 | YouTube iframe API: inline playback, `rel=0`, `modestbranding=1` | F3-1 | Next.js PWA + YouTube iframe API | TC-STUDY-001 | Functional Test | Must | Not Started |
| FR-STUDY-002 | Mark as Complete: calls Moodle completion API; progress bar updates without reload | F3-2 | Next.js PWA + Moodle LMS | TC-STUDY-002 | Functional Test | Must | Not Started |
| FR-STUDY-003 | Prev/Next buttons + desktop keyboard ← → navigation | F3-3 | Next.js PWA + Moodle LMS | TC-STUDY-003 | Functional Test | Must | Not Started |
| FR-STUDY-004 | Lesson notes tab: instructor-authored Moodle page resource | F3-4 | Next.js PWA + Moodle LMS | TC-STUDY-004 | Functional Test | Should | Not Started |
| FR-STUDY-005 | Discussion tab per lesson: Moodle forum thread; student can post in-app | F3-5 | Next.js PWA + Moodle LMS | TC-STUDY-005 | Integration Test | Should | Not Started |
| FR-STUDY-006 | Playback resume: YouTube Player API saves/restores position in localStorage | F3-6 | Next.js PWA + YouTube iframe API | TC-STUDY-006 | Functional Test | Could | Not Started |

### Live Class Attendance (FR-LIVE)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-LIVE-001 | Upcoming schedule (30-day): title, cohort, instructor, local time, participant count | F4-1 | Next.js PWA + Zoom API v2 | TC-LIVE-001 | Functional Test | Must | Not Started |
| FR-LIVE-002 | Join button: inactive until 30 min before; deep-links to Zoom app or Web Client | F4-2 | Next.js PWA + Zoom API v2 | TC-LIVE-002 | Functional Test | Must | Not Started |
| FR-LIVE-003 | Class replay via YouTube embed within 2 hours (Zoom webhook → YT upload pipeline) | F4-3 | Next.js PWA + Zoom Webhook + YouTube | TC-LIVE-003 | Integration Test | Must | Not Started |
| FR-LIVE-004 | Cohort city label (Sydney / Adelaide / Melbourne / Online) on every class card | F4-4 | Next.js PWA + Zoom API v2 | TC-LIVE-004 | Functional Test | Must | Not Started |
| FR-LIVE-005 | Live participant count from Zoom API; refreshes every 60 seconds | F4-5 | Next.js PWA + Zoom API v2 | TC-LIVE-005 | Functional Test | Should | Not Started |

### Private Consultations (FR-CONSULT)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-CONSULT-001 | Instructor listing: name, photo, specialisation, languages, availability from Cal.com | F5-1 | Next.js PWA + Cal.com API v2 | TC-CONSULT-001 | Functional Test | Must | Not Started |
| FR-CONSULT-002 | Cal.com booking calendar embedded in-app; slots in student's local timezone | F5-2 | Next.js PWA + Cal.com Embed | TC-CONSULT-002 | Functional Test | Must | Not Started |
| FR-CONSULT-003 | On booking: Cal.com creates Zoom meeting; confirmation email within 60 seconds | F5-3 | Cal.com + Zoom API v2 + Mautic | TC-CONSULT-003 | Integration Test | Must | Not Started |
| FR-CONSULT-004 | Cancel/reschedule from confirmation email and My Bookings in profile | F5-4 | Next.js PWA + Cal.com API v2 | TC-CONSULT-004 | Functional Test | Should | Not Started |
| FR-CONSULT-005 | Booking confirmation: Google Calendar link + .ics download | F5-5 | Next.js PWA + Cal.com | TC-CONSULT-005 | Functional Test | Should | Not Started |

### Offline Access & PWA (FR-OFFLINE)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-OFFLINE-001 | Service Worker caches course structure (modules, lesson titles, notes) from last visit | F6-1 | Service Worker + Workbox | TC-OFFLINE-001 | Functional Test | Must | Not Started |
| FR-OFFLINE-002 | Cache-First app shell: loads < 1s from cache on repeat visit | F6-2 | Service Worker + Workbox | TC-OFFLINE-002 | Functional Test | Must | Not Started |
| FR-OFFLINE-003 | Offline banner within 2s of connectivity loss; live buttons disabled with tooltip | F6-3 | Next.js PWA + Service Worker | TC-OFFLINE-003 | Functional Test | Should | Not Started |
| FR-OFFLINE-004 | Background Sync: completions queued offline; auto-flush to Moodle on reconnect | F6-4 | Service Worker + Background Sync API | TC-OFFLINE-004 | Functional Test | Should | Not Started |

### Push Notifications (FR-NOTIF)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-NOTIF-001 | Web Push 60 min before live class; tap opens Schedule at relevant card | F7-1 | Web Push VAPID + Next.js API | TC-NOTIF-001 | Integration Test | Must | Not Started |
| FR-NOTIF-002 | Web Push to enrolled students within 5 min of new Moodle lesson published | F7-2 | Web Push VAPID + Moodle Webhook | TC-NOTIF-002 | Integration Test | Should | Not Started |
| FR-NOTIF-003 | Web Push 60 min before consultation; triggered by Cal.com webhook | F7-3 | Web Push VAPID + Cal.com Webhook | TC-NOTIF-003 | Integration Test | Must | Not Started |
| FR-NOTIF-004 | Notification preferences: independent toggle per category in profile | F7-4 | Next.js PWA + MySQL | TC-NOTIF-004 | Functional Test | Should | Not Started |

### Progress Tracking & Achievements (FR-PROG)

| Req ID | Requirement (Brief) | PRD Ref | Architecture Component | Test Case | Verification | Priority | Status |
|--------|--------------------|---------|-----------------------|-----------|-------------|---------|--------|
| FR-PROG-001 | Progress screen: enrolled courses with total/completed lessons, %, last activity | F8-1 | Next.js PWA + Moodle LMS | TC-PROG-001 | Functional Test | Must | Not Started |
| FR-PROG-002 | Full-screen completion screen; shareable PNG achievement image downloadable | F8-2 | Next.js PWA + Moodle LMS | TC-PROG-002 | Functional Test | Should | Not Started |
| FR-PROG-003 | Zoom attendance history log from Moodle grade book (Zoom attendance webhook) | F8-3 | Next.js PWA + Moodle + Zoom Webhook | TC-PROG-003 | Integration Test | Could | Not Started |
| FR-PROG-004 | Downloadable Open Badges 2.0-compatible completion badge PNG | F8-4 | Next.js PWA | TC-PROG-004 | Functional Test | Could | Not Started |

---

### Performance (NFR-PERF)

| Req ID | Metric / Target | Architecture Component | Test Case | Verification | Status |
|--------|----------------|----------------------|-----------|-------------|--------|
| NFR-PERF-001 | FCP < 2.0s on simulated 4G | Next.js PWA + Cloudflare CDN | TC-PERF-001 | Lighthouse Audit | Not Started |
| NFR-PERF-002 | LCP < 2.5s; WebP images, lazy-loading below fold | Next.js PWA + Cloudflare CDN | TC-PERF-002 | Lighthouse Audit | Not Started |
| NFR-PERF-003 | TTI < 3.5s; code splitting + dynamic imports per route | Next.js PWA | TC-PERF-003 | Lighthouse Audit | Not Started |
| NFR-PERF-004 | API P95 ≤ 500ms under normal load | Next.js PWA + Moodle LMS + Redis | TC-PERF-004 | Load Test (k6) | Not Started |
| NFR-PERF-005 | 500 concurrent sessions: CPU ≤ 80%, no response time degradation > 20% | Hetzner CX32 + Docker | TC-PERF-005 | Load Test (k6) | Not Started |

### Security (NFR-SEC)

| Req ID | Metric / Target | Architecture Component | Test Case | Verification | Status |
|--------|----------------|----------------------|-----------|-------------|--------|
| NFR-SEC-001 | HTTPS / TLS 1.3 everywhere; no mixed content; HSTS | Cloudflare CDN + SSL | TC-SEC-001 | Security Audit (ZAP) | Not Started |
| NFR-SEC-002 | 15-min access token; 30-day refresh; Redis blacklist revocation | Next.js PWA + Redis | TC-SEC-002 | Penetration Test | Not Started |
| NFR-SEC-003 | OWASP Top 10 mitigations; zero critical ZAP findings | Next.js PWA + Moodle LMS | TC-SEC-003 | Security Audit (ZAP) | Not Started |
| NFR-SEC-004 | CSRF token on state-mutating endpoints; SameSite=Strict cookies | Next.js PWA | TC-SEC-004 | Security Audit (ZAP) | Not Started |
| NFR-SEC-005 | Rate limiting: auth 10 req/min/IP; API 300 req/min/user | Next.js PWA + Redis | TC-SEC-005 | Automated Test | Not Started |
| NFR-SEC-006 | Daily AES-256 encrypted MySQL backups to Backblaze B2; 7-day retention | Hetzner CX32 + Backblaze B2 | TC-SEC-006 | Manual Inspection | Not Started |

### Availability (NFR-AVAIL)

| Req ID | Metric / Target | Architecture Component | Test Case | Verification | Status |
|--------|----------------|----------------------|-----------|-------------|--------|
| NFR-AVAIL-001 | 99.5% monthly uptime; ≤ 3.6h unplanned downtime; 48h maintenance notice | Hetzner CX32 + Cloudflare | TC-AVAIL-001 | Uptime Monitoring | Not Started |
| NFR-AVAIL-002 | Automated daily backups at 02:00 AEST via cron; failures trigger admin email | Hetzner CX32 + Backblaze B2 | TC-AVAIL-002 | Manual Inspection | Not Started |
| NFR-AVAIL-003 | RTO < 4 hours: Hetzner snapshot + B2 DB restore | Hetzner CX32 + Backblaze B2 | TC-AVAIL-003 | DR Drill (manual) | Not Started |

### Accessibility (NFR-ACCESS)

| Req ID | Metric / Target | Architecture Component | Test Case | Verification | Status |
|--------|----------------|----------------------|-----------|-------------|--------|
| NFR-ACCESS-001 | WCAG 2.1 Level AA; 4.5:1 contrast; focus indicators; no >3Hz flashing | Next.js PWA | TC-ACCESS-001 | axe-core Audit | Not Started |
| NFR-ACCESS-002 | Full keyboard navigation; no keyboard traps | Next.js PWA | TC-ACCESS-002 | Manual Keyboard Test | Not Started |
| NFR-ACCESS-003 | ARIA labels on non-text content; ARIA live regions for dynamic updates | Next.js PWA | TC-ACCESS-003 | Screen Reader Test (NVDA) | Not Started |

### PWA Compliance (NFR-PWA)

| Req ID | Metric / Target | Architecture Component | Test Case | Verification | Status |
|--------|----------------|----------------------|-----------|-------------|--------|
| NFR-PWA-001 | Lighthouse PWA score ≥ 90: HTTPS, Service Worker, manifest, offline fallback | Service Worker + Workbox | TC-PWA-001 | Lighthouse Audit | Not Started |
| NFR-PWA-002 | Valid `manifest.json`: name, short_name, start_url, standalone, 192+512 maskable icons | Web App Manifest | TC-PWA-002 | Lighthouse Audit | Not Started |
| NFR-PWA-003 | Workbox registers on first load; silent updates; user prompted on major update | Service Worker + Workbox | TC-PWA-003 | Functional Test | Not Started |

### Scalability (NFR-SCALE)

| Req ID | Metric / Target | Architecture Component | Test Case | Verification | Status |
|--------|----------------|----------------------|-----------|-------------|--------|
| NFR-SCALE-001 | Data model + Moodle supports 5,000 students without structural changes | Moodle LMS + MySQL | TC-SCALE-001 | Load Test (k6) | Not Started |
| NFR-SCALE-002 | Stateless Next.js (sessions in Redis + HttpOnly cookies); multiple replicas ready | Next.js PWA + Redis + Docker | TC-SCALE-002 | Architecture Review | Not Started |

---

## Verification Status Dashboard

| Area | Total TCs | Not Started | In Progress | Complete | Deferred |
|------|----------|-------------|-------------|---------|---------|
| FR-AUTH | 5 | 5 | 0 | 0 | 0 |
| FR-ONBOARD | 2 | 2 | 0 | 0 | 0 |
| FR-DASH | 4 | 4 | 0 | 0 | 0 |
| FR-CATALOG | 4 | 4 | 0 | 0 | 0 |
| FR-STUDY | 6 | 6 | 0 | 0 | 0 |
| FR-LIVE | 5 | 5 | 0 | 0 | 0 |
| FR-CONSULT | 5 | 5 | 0 | 0 | 0 |
| FR-OFFLINE | 4 | 4 | 0 | 0 | 0 |
| FR-NOTIF | 4 | 4 | 0 | 0 | 0 |
| FR-PROG | 4 | 4 | 0 | 0 | 0 |
| NFR-PERF | 5 | 5 | 0 | 0 | 0 |
| NFR-SEC | 6 | 6 | 0 | 0 | 0 |
| NFR-AVAIL | 3 | 3 | 0 | 0 | 0 |
| NFR-ACCESS | 3 | 3 | 0 | 0 | 0 |
| NFR-PWA | 3 | 3 | 0 | 0 | 0 |
| NFR-SCALE | 2 | 2 | 0 | 0 | 0 |
| **TOTALS** | **65** | **65** | **0** | **0** | **0** |

---

## Go-Live Criteria

> **Gate:** All 25 'Must' FRs + all 22 NFRs must show **Status = Complete** before production deployment.
> Minimum **80% of 'Should'** requirements must be Complete.
> All 'Could' requirements may be Deferred without blocking go-live.

## RTM Maintenance Protocol

| Trigger | Action |
|---------|--------|
| Sprint Planning | Add/modify requirements; set status to 'Not Started' |
| Sprint Review | Update executed test cases to 'In Progress' or 'Complete' |
| Change Request | Update RTM within 24 hours of approved change |
| Go-Live Gate | Verify 100% of Must requirements = Complete |
| Post-Launch | Could requirements may be moved to 'Deferred' if not prioritised within 90 days |
