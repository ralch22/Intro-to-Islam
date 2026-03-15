# IntroToIslam Student Learning Portal — PWA

> A free, installable Progressive Web App unifying self-paced video courses, live Zoom classes, and private instructor consultations for IntroToIslam.org students.

**Live:** [intro-to-islam-pwa.vercel.app](https://intro-to-islam-pwa.vercel.app) &nbsp;·&nbsp; **Repo:** [github.com/ralch22/Intro-to-Islam](https://github.com/ralch22/Intro-to-Islam)

---

## Overview

The IntroToIslam Student Learning Portal is a **Next.js PWA** built for [introtoislam.org](https://introtoislam.org) — a volunteer-run, donor-sustained da'wah initiative serving students across Sydney, Adelaide, Melbourne, and beyond.

Today, students navigate between YouTube playlists, manually shared Zoom links, and ad hoc email contact for private sessions. This portal unifies all three into one cohesive, branded environment that installs on iOS and Android home screens without any App Store submission.

> **Guiding Principle:** All course content is permanently free. No paywall exists at any point in the student journey.

---

## Features

### Screens (all built)

| Route | Screen |
|-------|--------|
| `/` | **Dashboard** — course progress ring, next-class countdown + Join, module list, donation widget, community feed |
| `/courses` | **Course Library** — search, category filter chips, course cards with progress |
| `/courses/[id]` | **Course Details** — hero, tabbed overview/curriculum/instructor, accordion modules, resources |
| `/courses/[id]/lesson/[lessonId]` | **Active Lesson** — YouTube embed, lesson content, Prev/Next nav, Mark Complete, notes |
| `/schedule` | **Live Class Schedule** — countdown timer, Join Zoom, past recordings archive, mini calendar |
| `/community` | **Community Hub** — discussion feed, post composer, instructor replies, guidelines |

### Integration Roadmap

| Feature | Sprint |
|---------|--------|
| ✅ All 6 screens — fully navigatable | Done |
| ✅ PWA manifest + Workbox service worker | Done |
| ✅ Vercel deployment | Done |
| WordPress OAuth2 SSO login (NextAuth.js) | Sprint 1 |
| Add to Home Screen prompt | Sprint 1 |
| Moodle REST API — real courses & progress | Sprint 2 |
| YouTube iframe API — real video playback | Sprint 2 |
| Mark as Complete → Moodle write-back | Sprint 2 |
| Zoom API — live class schedule + join links | Sprint 3 |
| Zoom recording → YouTube upload pipeline | Sprint 3 |
| Cal.com embed — private 1:1 booking | Sprint 3 |
| Offline caching — course structure + app shell | Sprint 3 |
| Web Push — class & consultation reminders | Sprint 4 |
| Progress screen + completion celebration | Sprint 4 |
| Mobile UAT (20-student beta) + Lighthouse audit | Sprint 4 |

---

## Tech Stack

| Concern | Technology |
|---------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS — brand token system |
| PWA | next-pwa + Workbox Service Worker |
| Auth | NextAuth.js v5 → WordPress OAuth2 SSO |
| State | Zustand (client) + TanStack Query (server) |
| LMS | Moodle REST API |
| Video | YouTube iframe API + YouTube Data API v3 |
| Live Classes | Zoom API v2 (server-to-server OAuth) |
| Booking | Cal.com embed SDK (self-hosted) |
| Notifications | Web Push API + VAPID, triggered by Mautic |
| Front-end Hosting | Vercel |
| Back-end Hosting | Hetzner CX32 VPS — Docker Compose + Nginx |
| Databases | PostgreSQL 16 (Moodle) · MySQL 8 (WordPress) · Redis 7 |
| CDN / Security | Cloudflare Free — DNS, CDN, DDoS, WAF, SSL |
| Backups | Backblaze B2 (AES-256, 7-day retention) |

---

## Design System

Derived from high-fidelity prototypes built in UXPilot.

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

The portal is a cohesive front-end layer over existing infrastructure — nothing is re-hosted or rebuilt unnecessarily.

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

**Video at zero cost:** All course content lives on existing YouTube playlists. The PWA embeds via the YouTube iframe API with related-video suppression (`rel=0`).

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
│   └── icons/                           # 192×192 and 512×512 app icons
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout — Navbar + Footer
│   │   ├── globals.css                  # Brand tokens, gradient utilities
│   │   ├── page.tsx                     # Dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx                 # Course Library
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # Course Details
│   │   │       └── lesson/
│   │   │           └── [lessonId]/
│   │   │               └── page.tsx     # Active Lesson
│   │   ├── schedule/
│   │   │   └── page.tsx                 # Live Class Schedule
│   │   └── community/
│   │       └── page.tsx                 # Community Hub
│   └── components/
│       └── layout/
│           ├── Navbar.tsx               # Sticky nav, active-state routing
│           └── Footer.tsx               # Shared footer
└── next.config.ts                       # next-pwa + Turbopack config
```

---

## User Personas

| Persona | City | Profile | Core Needs |
|---------|------|---------|------------|
| **Amirah, 28** | Sydney | Self-paced learner, mobile commuter | Progress tracking, offline notes, no sign-up friction |
| **Omar, 45** | Adelaide | Weekly live class attendee | Reliable schedule, push reminders, replay access |
| **Yusuf, 22** | Melbourne | Guided seeker, shy in groups | Easy 1:1 booking, automatic Zoom link, no phone calls |

---

## API Integrations

| API | Key Endpoints |
|-----|--------------|
| WordPress OAuth2 | `POST /oauth/token` · `GET /oauth/authorize` |
| Moodle REST | `core_course_get_courses` · `core_enrol_enrol_users` · `core_completion_update_activity_completion_status_manually` · `mod_forum_add_discussion` |
| YouTube Data API v3 | `GET /playlistItems` · `GET /videos` (10,000 units/day free quota) |
| YouTube iframe API | Client-side `YT.Player` — `onStateChange`, `onReady` events |
| Zoom API v2 | `POST /users/{id}/meetings` · `GET /meetings/{id}` · webhook: `recording.completed` |
| Cal.com Embed + API | JS embed SDK · `/api/v2/bookings` · webhooks: `booking.created`, `booking.cancelled` |
| Web Push (VAPID) | `HTTP POST` to browser push endpoint, triggered by Mautic webhooks |

---

## Sprint Roadmap

**8 weeks · 4 × 2-week sprints**

### Sprint 1 — Foundation (Weeks 1–2) ✅
- [x] Next.js 16 + TypeScript + Tailwind scaffold
- [x] All 6 UI screens converted to Next.js pages
- [x] Shared Navbar (active routing) + Footer
- [x] PWA manifest.json + next-pwa + Workbox
- [x] Deployed to Vercel · Pushed to GitHub
- [ ] NextAuth.js v5 + WordPress OAuth2 SSO
- [ ] 3-screen onboarding carousel (first visit)
- [ ] Add to Home Screen prompt (second visit)

### Sprint 2 — Core Learning (Weeks 3–4)
- [ ] Moodle REST API — course list, lesson list, enrolment
- [ ] YouTube iframe API — real video embed, `rel=0`, timestamp restore
- [ ] Mark as Complete → Moodle REST write-back
- [ ] Progress bar from live Moodle completion data
- [ ] Lesson Notes tab (Moodle page resources)
- [ ] Discussion tab per lesson (Moodle forum thread)

### Sprint 3 — Live Classes & Booking (Weeks 5–6)
- [ ] Zoom API — upcoming class schedule, join URLs (active 30 min before)
- [ ] Zoom webhook → YouTube upload → Moodle link (replay pipeline)
- [ ] Cal.com embed — instructor browse + date/time picker + booking confirmation
- [ ] Zoom meeting auto-created on Cal.com booking
- [ ] Workbox Service Worker — offline course structure + app shell

### Sprint 4 — Notifications, Progress & Launch (Weeks 7–8)
- [ ] Web Push — 60-min pre-class and pre-consultation reminders
- [ ] Notification preference screen in student profile
- [ ] Progress screen (per-course lesson count + %)
- [ ] Course completion congratulations + shareable image
- [ ] Mobile UAT with 20-student beta group
- [ ] Lighthouse audit — target ≥ 90 all four categories
- [ ] WCAG 2.1 AA accessibility pass (axe-core scan)
- [ ] Production deployment on Hetzner

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

> 10 donors at $7/month fully sustains the platform. Donations are voluntary and managed via WooCommerce + Stripe — never a prerequisite for course access.

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
- JWT access tokens expire in 15 minutes; refresh tokens in 30 days; compromised tokens revocable via Redis blacklist
- Rate limiting: 10 req/min on auth endpoints, 300 req/min per authenticated user
- Content Security Policy headers set; YouTube iframe explicitly allowlisted
- HTTPS enforced via Cloudflare — HSTS header enabled
- OWASP Top 10 mitigations validated by ZAP scan pre-launch
- Student PII stored on EU-region Hetzner VPS — compliant with Australian Privacy Act 1988

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

# Zoom (server-to-server OAuth)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

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
