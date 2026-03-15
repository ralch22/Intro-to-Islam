# Product Requirements Document
**IntroToIslam.org — Student Learning Portal (PWA)**

> **Document:** PRD-ITI-2026-001 · **Version:** 1.0 · **Date:** March 2026
> **Status:** Approved for Development · **Author:** Emerge Digital / IntroToIslam.org Tech Team

---

## 1. Product Overview

The IntroToIslam Student Learning Portal is a **Next.js Progressive Web App (PWA)** serving as the single consolidated destination for three student learning modalities:

1. Self-paced video study (YouTube-hosted playlists)
2. Live group Zoom classes
3. Private one-to-one instructor consultations

> **Guiding Principle:** All course content is permanently free. No paywall exists at any point in the student journey.

The PWA is a **consolidated front-end layer** that connects existing infrastructure:
`YouTube` (video) + `Moodle LMS` (progress) + `Zoom API` (live classes) + `Cal.com` (booking)

---

## 2. Goals & Non-Goals

### Goals
- Unify video learning, live Zoom classes, and private bookings into a single portal
- Deliver a native-quality mobile experience (installable PWA) with no App Store submission
- Enable student progress tracking across the full YouTube course library
- Automate Zoom class scheduling, reminders, and replay access
- Automate private consultation booking with Zoom meeting creation via Cal.com
- Support offline access to course outlines and lesson notes
- Enable push notifications for class reminders and new content
- Surface the voluntary donation model prominently without interrupting the learning flow

### Non-Goals
- Moodle admin, WordPress public site, or WooCommerce donation flows
- Native iOS/Android App Store apps (future phase)
- Live video streaming within the PWA (Zoom handles all live delivery)
- Content authoring or video production tooling
- Paid course tiers, certificates of accreditation, or formal assessments

---

## 3. User Personas

| Persona | Location | Profile | Core Needs |
|---------|----------|---------|------------|
| **Amirah, 28** | Sydney | Self-paced learner, mobile commuter | Self-paced video on mobile, progress saved, offline notes, no account barriers |
| **Omar, 45** | Adelaide | Live class attendee | Clear schedule, timezone display, push reminder, one-tap Zoom join, replay access |
| **Yusuf, 22** | Melbourne | Guided seeker, shy in groups | Friendly instructor profiles, easy booking, auto Zoom link, no phone calls |

---

## 4. Feature Requirements & User Stories

> **Priority tiers:** `Must` = launch blocker · `Should` = high value · `Could` = nice-to-have

### F1 — Authentication & Onboarding

Students authenticate using their existing `introtoislam.org` WordPress account via OAuth2 SSO.

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F1-1 | Log in with existing introtoislam.org account | OAuth2 redirects to WordPress, token returned, session persisted | Must |
| F1-2 | Understand what the app offers before registering | Onboarding carousel shown on first launch (3 screens: Learn, Join Classes, Book 1:1) | Must |
| F1-3 | Install the app on home screen | A2HS prompt after 2nd visit; app icon and splash screen configured | Must |
| F1-4 | Stay logged in for 30 days | Refresh token in secure cookie; re-auth only after 30 days or explicit logout | Should |

### F2 — Dashboard

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F2-1 | See active courses and progress | Course cards show lesson number, progress bar (%), and Continue button | Must |
| F2-2 | See next Zoom class with countdown | Class card with exact time (local timezone), countdown timer, Join button active 30 min before | Must |
| F2-3 | See recent activity | Activity feed shows last 5 events with timestamps | Should |
| F2-4 | See subtle donation prompt | Donation nudge shown once per week in a collapsible card | Could |

### F3 — Course Study with YouTube Integration

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F3-1 | Watch course videos embedded in-app | YouTube iframe API renders video in-app; related-video suppression (`rel=0`) | Must |
| F3-2 | Mark a lesson as complete | Completion writes to Moodle REST API; progress bar updates instantly | Must |
| F3-3 | Navigate with Prev/Next buttons | Buttons at bottom of lesson view; keyboard ← → on desktop | Must |
| F3-4 | See lesson notes below video | Instructor-authored notes in a 'Notes' tab | Should |
| F3-5 | Ask questions on each lesson | Discussion tab per lesson connects to Moodle forum thread | Should |
| F3-6 | Resume playback at last timestamp | YouTube Player API saves/restores position in localStorage per video ID | Could |

### F4 — Live Zoom Classes

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F4-1 | See all upcoming Zoom classes | Weekly calendar view; filterable by course and cohort | Must |
| F4-2 | Join a Zoom class with single tap | Join button active 30 min before; deep-links to Zoom app or Web Client | Must |
| F4-3 | Watch class recording if missed | Replays appear within 2 hours of session end via YouTube iframe | Must |
| F4-4 | See which city cohort a class is for | Cohort label (Sydney / Adelaide / Melbourne / Online) on every class card | Must |
| F4-5 | See participant count | Participant count from Zoom API; shown where host has enabled it | Should |

### F5 — Private Consultation Booking

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F5-1 | Browse instructor profiles | Cards show name, specialisation, languages spoken, availability status | Must |
| F5-2 | Select date/time from calendar | Cal.com embedded; shows only available slots; respects instructor timezone | Must |
| F5-3 | Receive Zoom link immediately after booking | Cal.com + Zoom API auto-creates meeting; email within 60 seconds | Must |
| F5-4 | Cancel or reschedule a booking | Cancel/reschedule link in email and 'My Bookings' section | Should |
| F5-5 | Add consultation to calendar | ics / Google Calendar link in confirmation email | Should |

### F6 — Offline Support

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F6-1 | Access course outline without internet | Service Worker caches course structure, lesson titles, and notes | Must |
| F6-2 | App loads quickly on slow internet | App shell cached via Service Worker; loads < 1s on repeat visit | Must |
| F6-3 | Know when offline | Offline banner within 2s of network loss; live buttons disabled with tooltip | Should |
| F6-4 | Lesson completion syncs on reconnect | Background Sync queues completions offline; flushes to Moodle on reconnect | Should |

### F7 — Push Notifications

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F7-1 | Push 1 hour before Zoom class | Push 60 min before class; tap opens Schedule at relevant class card | Must |
| F7-2 | Push when new lesson published | Push within 5 minutes of new Moodle activity visibility | Should |
| F7-3 | Push 1 hour before consultation | Cal.com webhook triggers push 60 min before consultation | Must |
| F7-4 | Control notification preferences | Toggle each category independently in Profile | Should |

### F8 — Progress Tracking & Certificates

| ID | User Story | Acceptance Criteria | Priority |
|----|-----------|---------------------|----------|
| F8-1 | See progress across all courses | Progress screen with lesson count, %, last-activity date per course | Must |
| F8-2 | Course completion congratulations | Full-screen congratulations on 100% completion; shareable PNG | Should |
| F8-3 | Zoom class attendance history | Attendance log from Moodle grade book (Zoom attendance webhook data) | Could |
| F8-4 | Download completion badge | Open Badges-compatible PNG on course completion | Could |

---

## 5. Screen Wireframes Summary

| Screen | Route | Key Elements |
|--------|-------|-------------|
| Dashboard | `/` | Progress ring, next class countdown + Join, module list, donation widget, activity feed |
| Course Library | `/courses` | Search, category filter chips, course cards with progress |
| Course Details | `/courses/[id]` | Hero, tabbed Overview/Curriculum/Instructor, accordion modules |
| Active Lesson | `/courses/[id]/lesson/[lessonId]` | YouTube embed, lesson content, Prev/Next nav, Mark Complete, notes |
| Live Class Schedule | `/schedule` | Countdown timer, Join Zoom, past recordings archive, mini calendar |
| Community Hub | `/community` | Discussion feed, post composer, instructor replies, guidelines |

### Wireframe Annotations (all screens)

- **① Header** — Brand bar with logo, notification bell (red badge), student avatar
- **② Upcoming Class Card** — Countdown timer + JOIN NOW (active 30 min before)
- **③ Continue Learning** — Course cards with animated progress bar
- **④ Quick Access Row** — 'My Schedule' + 'Book 1:1' shortcuts
- **⑤ Desktop Left Sidebar** — Persistent navigation panel with active state
- **⑥ Desktop Right Panel** — Upcoming class + next-week schedule

---

## 6. Technical Architecture Summary

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| PWA | next-pwa + Workbox Service Worker |
| Auth | NextAuth.js v5 → WordPress OAuth2 SSO |
| LMS | Moodle REST API |
| Video | YouTube iframe API + YouTube Player API |
| Live Classes | Zoom API v2 (server-to-server OAuth) |
| Booking | Cal.com Embed SDK (self-hosted) |
| Push | Web Push API + VAPID, triggered by Mautic webhooks |
| State | Zustand (client) + TanStack Query (server/caching) |
| Styling | Tailwind CSS + brand token system |
| Offline | Workbox Service Worker — cache-first app shell |
| Testing | Vitest + React Testing Library; Playwright E2E |

---

## 7. Non-Functional Requirements

| Category | Metric | Target |
|---------|--------|--------|
| Performance | FCP | < 2.0s on 4G |
| Performance | LCP | < 2.5s |
| Performance | TTI | < 3.5s |
| Performance | API P95 | ≤ 500ms |
| Performance | Concurrent users | 500 on Hetzner CX32 |
| Accessibility | Standard | WCAG 2.1 Level AA |
| PWA | Lighthouse score | ≥ 90 all categories |
| Security | Token expiry | 15-min access / 30-day refresh |
| Security | Standard | OWASP Top 10 + ZAP scan |
| Availability | Uptime | ≥ 99.5% monthly |
| Availability | RTO | < 4 hours |

---

## 8. Success Metrics (90 Days Post-Launch)

| Metric | Target |
|--------|--------|
| PWA Install Rate | > 30% of mobile visitors |
| Return Visit Rate | > 50% in month 2 |
| Lesson Completion Rate | > 40% complete ≥ 3 lessons |
| Zoom No-Show Reduction | > 20% vs pre-PWA baseline |
| Monthly Consultations | > 10 bookings/month |
| Push Notification Opt-In | > 50% of students |
| Donation Conversion | > 2% of active monthly students |
| Lighthouse Score | ≥ 90 all categories (CI/CD enforced) |
| JS Error Rate | < 0.5% of sessions |

---

## 9. Implementation Roadmap

| Sprint | Weeks | Scope |
|--------|-------|-------|
| **Sprint 1** | 1–2 | Scaffold (Next.js + TypeScript + Tailwind), NextAuth + WP OAuth, app shell, nav, PWA manifest, A2HS |
| **Sprint 2** | 3–4 | Dashboard (F2), Course Study + YouTube embed (F3-1 to F3-4), Moodle REST integration, lesson completion |
| **Sprint 3** | 5–6 | Schedule + Zoom join flow (F4-1 to F4-4), Cal.com booking embed (F5-1 to F5-3), Service Worker offline |
| **Sprint 4** | 7–8 | Push notifications (F7), Progress screen (F8), Mobile UAT, Lighthouse audits, accessibility pass, deploy |

---

## 10. Out of Scope — Future Phases

| Feature | Phase |
|---------|-------|
| Native iOS/Android apps (React Native) | 2 |
| Arabic RTL interface + multilingual support | 2–3 |
| PDF completion certificates + Open Badges 2.0 | 2 |
| Moodle quiz integration | 2 |
| Discourse community forum (SSO-linked) | 2 |
| Donation thermometer widget | 2 |
| In-app live streaming (WebRTC, replacing Zoom) | 3 |
| Kubernetes migration (> 5,000 students) | 3 |
