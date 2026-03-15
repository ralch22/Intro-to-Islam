# IntroToIslam Student Learning Portal — PWA

> A free, installable Progressive Web App unifying self-paced video courses, live Zoom classes, and private instructor consultations for IntroToIslam.org students.

**Live:** [intro-to-islam-pwa.vercel.app](https://intro-to-islam-pwa.vercel.app) &nbsp;·&nbsp; **Repo:** [github.com/ralch22/Intro-to-Islam](https://github.com/ralch22/Intro-to-Islam)

---

## Overview

The IntroToIslam Student Learning Portal is a **Next.js PWA** built for [introtoislam.org](https://introtoislam.org) — a volunteer-run, donor-sustained da'wah initiative serving students across Sydney, Adelaide, Melbourne, and beyond.

Students previously navigated between YouTube playlists, manually shared Zoom links, and ad hoc email contact for private sessions. This portal unifies all three into one cohesive, branded environment that installs on iOS and Android home screens without any App Store submission.

> **Guiding Principle:** All course content is permanently free. No paywall exists at any point in the student journey.

---

## Sprint Status

| Sprint | Status | Scope |
|--------|--------|-------|
| **Sprint 1 — Foundation** | ✅ Complete | Scaffold, 6 screens, PWA manifest, NextAuth SSO, onboarding carousel, A2HS prompt |
| **Sprint 2 — Learning Core** | ✅ Complete | Moodle REST client, YouTube Player API, lesson completion, Zoom schedule, Zoom webhook, dashboard |
| **Sprint 3 — Engagement** | ✅ Complete | Cal.com booking, Web Push VAPID, Workbox offline caching, Background Sync, activity feed, notes/discussion tabs |
| **Sprint 4 — Polish & Launch** | ✅ Complete | Progress screen, completion badge, student profile, donation nudge, security headers, Navbar profile dropdown, course detail wired, participant polling, community composer |

---

## Features

### All Screens

| Route | Screen |
|-------|--------|
| `/` | **Dashboard** — real course progress ring, next-class countdown + Join, activity feed, module list, donation widget |
| `/courses` | **Course Library** — search, progress bars, real Moodle data |
| `/courses/[id]` | **Course Details** — tabbed overview/curriculum/instructor, accordion modules |
| `/courses/[id]/lesson/[lessonId]` | **Active Lesson** — YouTube Player API embed, Notes/Discussion/About tabs, Prev/Next nav, Mark Complete |
| `/schedule` | **Live Class Schedule** — Zoom meetings, live countdown, cohort badges, 30-min join window |
| `/community` | **Community Hub** — discussion feed, post composer |
| `/booking` | **1:1 Booking** — instructor profiles, Cal.com embed |
| `/profile/bookings` | **My Bookings** — status badges, cancel/reschedule, Google Cal + .ics export |
| `/profile/notifications` | **Notifications** — per-category push preference toggles |
| `/login` | **Login** — WordPress OAuth2 SSO |

### Key Capabilities

| Capability | Implementation |
|------------|---------------|
| PWA Install | `beforeinstallprompt` (Android) + Safari share instructions (iOS) — shown on 2nd visit |
| Onboarding | 3-screen carousel on first launch; `localStorage` flag prevents repeat |
| Video Playback | YouTube IFrame API — `rel=0`, `modestbranding`, resume from saved timestamp |
| Offline Support | Workbox NetworkFirst for API routes; CacheFirst for static assets; Background Sync for lesson completions via IndexedDB |
| Offline Banner | Amber banner within 2s of connectivity loss |
| Push Notifications | VAPID Web Push — class reminders (60 min before), consultation reminders, new content alerts |
| Lesson Completion | POST to Moodle REST write-back; idempotent; queued offline via Background Sync |
| Discussion | Per-lesson Moodle forum thread — load + post replies |
| Zoom Webhook | HMAC-SHA256 verified; `recording.completed` triggers YouTube upload pipeline |
| Cal.com Webhook | `BOOKING_CREATED/CANCELLED/RESCHEDULED` events; auto-creates Zoom meeting |
| YouTube Sync Cron | Vercel cron daily at 02:00 UTC — syncs playlist video IDs to Moodle |

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js WordPress OAuth2 handler |
| `/api/dashboard` | GET | Aggregated progress + next Zoom meeting |
| `/api/dashboard/activity` | GET | Last 5 student activity events (90-day window) |
| `/api/courses` | GET | All Moodle courses |
| `/api/courses/[id]` | GET | Course + lessons + modules |
| `/api/courses/[id]/enrol` | POST | Enrol student in course |
| `/api/lessons/[lessonId]/complete` | POST | Mark lesson complete → Moodle write-back |
| `/api/lessons/[lessonId]/notes` | GET | Lesson instructor notes |
| `/api/lessons/[lessonId]/discussion` | GET/POST | Forum thread posts + post reply |
| `/api/schedule` | GET | Upcoming Zoom meetings |
| `/api/schedule/[id]/participants` | GET | Live participant count |
| `/api/zoom/webhook` | POST | HMAC-verified Zoom webhook (recording.completed) |
| `/api/cal/bookings` | GET | Student Cal.com bookings |
| `/api/cal/webhook` | POST | Cal.com booking events |
| `/api/push/subscribe` | GET/POST | VAPID public key + save subscription |
| `/api/push/send` | POST | Admin push sender |
| `/api/cron/youtube-sync` | GET | Daily YouTube playlist sync |
| `/api/cron/class-reminders` | GET | Class reminder push cron |

All API clients include **mock fallback data** when env vars are absent — the app deploys and runs without any live backend credentials.

---

## Tech Stack

| Concern | Technology |
|---------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS — brand token system |
| PWA | next-pwa + Workbox Service Worker |
| Auth | NextAuth.js v5 → WordPress OAuth2 SSO |
| LMS | Moodle REST API |
| Video | YouTube IFrame API (Player API, `rel=0`, timestamp resume) |
| Live Classes | Zoom API v2 (server-to-server OAuth) |
| Booking | Cal.com embed SDK (`@calcom/embed-react`) |
| Notifications | Web Push API + VAPID (`web-push`) |
| Offline | Workbox NetworkFirst/CacheFirst + Background Sync (IndexedDB) |
| Front-end Hosting | Vercel (crons: YouTube sync daily, class reminders daily) |
| Back-end Hosting | Hetzner CX32 VPS — Docker Compose + Nginx |
| Databases | PostgreSQL 16 (Moodle) · MySQL 8 (WordPress) · Redis 7 |
| CDN / Security | Cloudflare Free — DNS, CDN, DDoS, WAF, SSL |
| Backups | Backblaze B2 (AES-256, 7-day retention) |

---

## Design System

| Token | Value |
|-------|-------|
| Primary — Magenta | `#E81C74` |
| Secondary — Blue | `#1E40AF` |
| Accent — Purple | `#6B21A8` |
| Dark | `#1F2937` |
| Background | `#F3F4F6` |
| Font | Inter (Google Fonts) |
| Gradient Brand | `135deg, #1E40AF → #6B21A8` |
| Gradient Magenta | `135deg, #E81C74 → #BE185D` |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  CLOUDFLARE EDGE                    │
│          CDN · SSL · DDoS · DNS · WAF               │
└──────────────┬───────────────────┬──────────────────┘
               │                   │
     ┌──────────┴──────┐  ┌────────┴──────────┐
     │ WordPress Site  │  │  Next.js PWA       │
     │ Public + Donate │  │  Student Portal    │
     └──────────┬──────┘  └────────┬──────────┘
                │                   │
     ┌──────────┴───────────────────┴──────────┐
     │          Moodle LMS  (lms.*)            │
     │  Courses · Progress · Forums · Auth     │
     └──────────┬──────────┬──────────┬────────┘
                │           │          │
         ┌──────┴──┐  ┌─────┴──┐  ┌───┴──────┐
         │ YouTube │  │  Zoom  │  │ Cal.com  │
         │  Video  │  │  Live  │  │ Booking  │
         └─────────┘  └────────┘  └──────────┘
```

**Single Sign-On:** Students register once on `introtoislam.org` (WordPress). The same credentials work across the PWA, Moodle, and Cal.com via WordPress OAuth2 → NextAuth.js.

**Video at zero cost:** All course content lives on existing YouTube playlists. The PWA embeds via the YouTube IFrame API with related-video suppression (`rel=0`).

| Playlist | ID |
|----------|----|
| Foundation Course | `PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu` |
| Life of the Prophet | `PLVnGeZczzv1B549C1kmtFHOpK194F1CgO` |

---

## Project Structure

```
intro-to-islam-pwa/
├── public/
│   ├── manifest.json                    # PWA manifest
│   ├── sw-custom.js                     # Push handler + Background Sync SW
│   └── icons/                           # 192×192 and 512×512 app icons
├── docs/
│   ├── PRD.md                           # Product Requirements Document
│   ├── SRS.md                           # Software Requirements Specification
│   ├── ARCHITECTURE.md                  # Solution Architecture
│   ├── RTM.md                           # Requirements Traceability Matrix
│   └── SPRINT-SCOPE.md                  # Sprint scope + acceptance criteria
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout — Navbar, Footer, OfflineBanner
│   │   ├── page.tsx                     # Dashboard (real Moodle + Zoom data)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/      # NextAuth route handler
│   │   │   ├── courses/                 # Moodle course proxy
│   │   │   ├── dashboard/               # Aggregated dashboard + activity
│   │   │   ├── lessons/[lessonId]/      # Complete, notes, discussion
│   │   │   ├── schedule/                # Zoom schedule + participants
│   │   │   ├── zoom/webhook/            # Zoom recording webhook
│   │   │   ├── cal/                     # Cal.com bookings + webhook
│   │   │   ├── push/                    # VAPID subscribe + send
│   │   │   └── cron/                    # youtube-sync + class-reminders
│   │   ├── courses/                     # Course library + detail + lesson
│   │   ├── schedule/                    # Live class schedule
│   │   ├── booking/                     # 1:1 instructor booking
│   │   ├── profile/
│   │   │   ├── bookings/                # My bookings
│   │   │   └── notifications/           # Push preferences
│   │   ├── community/                   # Community hub
│   │   └── login/                       # WordPress SSO login
│   ├── components/
│   │   ├── layout/                      # Navbar + Footer
│   │   ├── auth/                        # AuthButton + SessionProviderWrapper
│   │   ├── lesson/                      # YouTubePlayer + LessonView
│   │   ├── booking/                     # CalEmbed
│   │   ├── onboarding/                  # OnboardingCarousel
│   │   └── pwa/                         # A2HSBanner + OfflineBanner
│   ├── hooks/
│   │   ├── useOnboarding.ts             # First-visit carousel flag
│   │   ├── useA2HS.ts                   # beforeinstallprompt handler
│   │   ├── useVideoProgress.ts          # YouTube timestamp persistence
│   │   └── usePushNotifications.ts      # VAPID subscription flow
│   └── lib/
│       ├── auth.ts                      # NextAuth v5 config
│       ├── moodle.ts                    # Moodle REST client (mock fallback)
│       ├── zoom.ts                      # Zoom S2S OAuth client (mock fallback)
│       ├── push.ts                      # web-push VAPID utility
│       └── youtube-upload.ts            # Zoom recording → YouTube pipeline
└── vercel.json                          # Vercel cron schedules
```

---

## User Personas

| Persona | City | Profile | Core Needs |
|---------|------|---------|------------|
| **Amirah, 28** | Sydney | Self-paced learner, mobile commuter | Progress tracking, offline notes, no sign-up friction |
| **Omar, 45** | Adelaide | Weekly live class attendee | Reliable schedule, push reminders, replay access |
| **Yusuf, 22** | Melbourne | Guided seeker, shy in groups | Easy 1:1 booking, automatic Zoom link, no phone calls |

---

## Non-Functional Requirements

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 2.0s on 4G |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| API P95 response time | ≤ 500ms |
| Lighthouse PWA Score | ≥ 90 all categories |
| Accessibility | WCAG 2.1 Level AA |
| Concurrent Users | 500 on Hetzner CX32 |
| Monthly Uptime | ≥ 99.5% |
| Recovery Time Objective | < 4 hours |
| JavaScript Error Rate | < 0.5% of sessions |

---

## Infrastructure & Cost

| Item | Est. (AUD/month) |
|------|-----------------|
| Hetzner CX32 — 4 vCPU, 8 GB RAM | ~$18 |
| Zoom Pro — 2 host licences | ~$42 |
| Backblaze B2 — encrypted DB backups | ~$3 |
| SMTP relay — AWS SES | ~$5–10 |
| YouTube, Cloudflare, Cal.com, Moodle | Free |
| **Total** | **~AUD $68–73** |

> 10 donors at $7/month fully sustains the platform. Donations are voluntary — never a prerequisite for course access.

---

## Domain Structure

| Domain | Service |
|--------|---------|
| `introtoislam.org` | WordPress — public site + donation hub |
| `learn.introtoislam.org` | Next.js PWA — student portal |
| `lms.introtoislam.org` | Moodle LMS — admin + API |
| `book.introtoislam.org` | Cal.com — private consultation booking |

---

## Security

- All Moodle and Zoom API calls are server-side (Next.js API routes) — tokens never exposed to the browser
- OAuth2 state parameter + `SameSite=Strict` cookies prevent CSRF
- JWT access tokens expire in 15 minutes; refresh tokens in 30 days
- Zoom webhook verified via HMAC-SHA256 (`x-zm-signature`)
- Cal.com webhook verified via HMAC-SHA256 (`x-cal-signature-256`)
- Content Security Policy headers set; YouTube iframe explicitly allowlisted
- HTTPS enforced via Cloudflare — HSTS header enabled
- Student PII stored on EU-region Hetzner VPS — compliant with Australian Privacy Act 1988

---

## Local Development

```bash
# Clone
git clone git@github.com:ralch22/Intro-to-Islam.git
cd Intro-to-Islam

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build
```

**Environment variables** — create `.env.local`:

```env
# WordPress OAuth2
WORDPRESS_CLIENT_ID=
WORDPRESS_CLIENT_SECRET=
WORDPRESS_SITE_URL=https://introtoislam.org

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Moodle
MOODLE_URL=https://lms.introtoislam.org
MOODLE_TOKEN=

# YouTube
YOUTUBE_API_KEY=
YOUTUBE_OAUTH_CLIENT_ID=
YOUTUBE_OAUTH_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=

# Zoom (server-to-server OAuth)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET=

# Cal.com
CAL_API_KEY=
CAL_WEBHOOK_SECRET=

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:admin@introtoislam.org

# Admin
ADMIN_SECRET=
CRON_SECRET=
```

> All env vars are optional for local dev — the app uses mock data when they are absent.

---

## Deploy

**Vercel (PWA):**
```bash
vercel --prod
```

**Hetzner VPS (Moodle + Cal.com + Mautic + Nginx):**
```bash
docker compose up -d
```

---

## Success Metrics (90 days post-launch)

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

## Future Phases

| Feature | Phase |
|---------|-------|
| Native iOS / Android apps (React Native shell over same Moodle API) | 2 |
| Arabic RTL interface + multilingual support (Urdu, etc.) | 2–3 |
| PDF completion certificates + Open Badges 2.0 | 2 |
| Moodle quiz integration | 2 |
| Discourse community forum (SSO-linked) | 2 |
| Donation thermometer widget | 2 |
| In-app live streaming (WebRTC, replacing Zoom for large cohorts) | 3 |
| Kubernetes migration (> 5,000 students) | 3 |

---

## Contributing

This is a volunteer-built platform for a community da'wah initiative. All contributions welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Open a pull request against `main`

---

## License

MIT — see `LICENSE` for details.

---

## About

Built by [Emerge Digital](https://emergedigital.com.au) for [IntroToIslam.org](https://introtoislam.org).
Infrastructure supported by 1CYBER. Course content produced by IntroToIslam.org volunteers.
