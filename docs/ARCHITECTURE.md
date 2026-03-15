# Solution Architecture
**IntroToIslam.org — Web + Mobile Ecosystem**

> **Document:** ARCH-ITI-2026-001 · **Version:** 1.0 · **Date:** March 2026
> **Approach:** Hybrid Platform · **Scale:** 500–5,000 Students · **Access:** Free — Donor Sustained

---

## 1. Executive Summary

The platform serves 500–5,000 students across three delivery modes:
1. Self-paced video study (YouTube-hosted playlists — zero hosting cost)
2. Live group Zoom classes
3. Private instructor consultations

**Key Design Decisions:**
- All course content is permanently **FREE** — no course fees, ever
- Video hosted on **YouTube** at zero cost — no video CDN required
- Infrastructure is **donor-sustained**; WooCommerce repurposed for voluntary donations
- Zoom Pro API required — USD $13.33/host/month (billed annually)
- Full stack on **Hetzner VPS** in Docker at ~AUD $65–75/month total
- **Progressive Web App** gives students iOS/Android home-screen experience without App Store overhead

---

## 2. Current State Assessment

| Component | Current State |
|-----------|--------------|
| CMS | WordPress (hello-theme-child) |
| LMS Plugin | LearnPress v4.3.2.2 |
| Commerce | WooCommerce (repurposed for donations) |
| Video Hosting | YouTube — public playlists |
| Live Classes | Zoom — weekly group sessions + in-person |
| Mobile | No dedicated experience — responsive WordPress theme only |

### Identified Gaps
- No dedicated mobile app or PWA — students cannot install on device
- No integrated booking for private consultations — ad hoc via contact forms
- Zoom classes promoted manually — no automated scheduling, reminders, or attendance tracking
- LearnPress degrades WordPress performance at 1,000+ students
- No structured donor contribution pathway
- No student progress tracking or completion acknowledgements
- Single-server dependency — no redundancy

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                            │
│          CDN · SSL · DDoS · DNS · WAF  (Free)                │
└──────────────────────┬───────────────────────────────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
┌────┴────────┐  ┌─────┴──────────┐  ┌──┴──────────────┐
│  WordPress  │  │  Moodle LMS    │  │  Next.js PWA    │
│  Public +   │  │  Learning +    │  │  Student Portal │
│  Donations  │  │  Admin         │  │  (installable)  │
└────┬────────┘  └─────┬──────────┘  └──┬──────────────┘
     │                 │                 │
     └─────────────────┼─────────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
┌────┴────────┐  ┌─────┴──────┐  ┌──────┴─────┐
│  YouTube    │  │  Zoom API  │  │  Cal.com   │
│  Video      │  │  Live      │  │  Booking   │
│  (FREE)     │  │  Classes   │  │  (Self-    │
│             │  │            │  │  hosted)   │
└─────────────┘  └────────────┘  └────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│              DATA LAYER  (Hetzner VPS · Docker)              │
│   PostgreSQL (Moodle)  ·  MySQL (WordPress)  ·  Redis        │
└─────────────────────────────────────────────────────────────┘
```

**Five horizontal layers:**

| Layer | Components |
|-------|-----------|
| 1 Presentation | WordPress (public site) + Next.js PWA (student portal) |
| 2 Application | Moodle LMS · Zoom API · Cal.com Booking · Mautic Email |
| 3 Media | YouTube Data API v3 — existing playlists — ZERO video hosting cost |
| 4 Data | PostgreSQL 16 (Moodle) · MySQL 8 (WordPress) · Redis 7 |
| 5 Infrastructure | Hetzner VPS · Docker Compose · Nginx · Cloudflare |

---

## 4. Component Architecture

### 4.1 WordPress — Public Site + Donation Hub

| Function | Detail |
|---------|--------|
| Marketing & Info | Course catalogue, about pages, instructor profiles |
| Student Signup | Free account registration — no payment required |
| SSO Provider | WP OAuth Server plugin — issues tokens for Moodle and Cal.com |
| Donation Gateway | WooCommerce + Stripe/PayPal — voluntary one-off and recurring donations |
| Webhooks | On new registration: fires to Moodle REST API to auto-enrol student |

### 4.2 Next.js PWA — Student Learning Portal

| Feature | Implementation |
|---------|---------------|
| Framework | Next.js 16 (App Router) — TypeScript throughout |
| PWA Shell | next-pwa + Workbox — service worker, offline caching, home screen install |
| Auth | NextAuth.js v5 — OAuth2 login via WordPress |
| Course UI | Moodle REST API — courses, modules, progress via JSON |
| Video Player | YouTube iframe API — playlist videos with chapter navigation |
| Notifications | Web Push API — class reminders, new content alerts |
| Offline | Service Worker caches course outlines, lesson notes, module structure |
| Hosting | Docker container on Hetzner VPS (same server as Moodle) |

### 4.3 Moodle LMS

**Free Enrolment Model:** Students register on WordPress → auto-mirrored in Moodle → self-enrol instantly. No payment required.

Core capabilities used:
- Course management — YouTube embeds, PDFs, quizzes, SCORM content
- Student progress tracking — completion checkboxes, quiz scores, certificates
- Discussion forums per course — structured Q&A per lesson
- **Zoom plugin** — group class scheduling + attendance recording
- **YouTube activity module** — embeds YouTube videos and playlists in course pages
- **Cohort enrolment** — group students by city for Zoom scheduling
- **REST API** — consumed by Next.js PWA for all course data + progress
- **Self-enrolment plugin** — instant free course access, no admin approval

### 4.4 Video Platform — YouTube (Zero Cost)

> **AD-FREE REQUIREMENT:** Ensure YouTube channel monetisation is **disabled** (YouTube Studio → Monetisation → Disable). Prevents ads on course content.

| Aspect | Detail |
|--------|--------|
| Video Storage | FREE — unlimited on YouTube |
| CDN / Delivery | FREE — YouTube's global edge network |
| Transcoding | FREE — auto-transcodes to all resolutions |
| Captions | FREE — YouTube auto-generates captions |
| Moodle Integration | YouTube Activity Module |
| PWA Integration | YouTube iframe API + YouTube Player API |
| Playlist Sync | YouTube Data API v3 (10,000 units/day free quota) |
| Class Replays | After Zoom session → uploaded as 'Unlisted' → linked in Moodle |

**Existing playlists:**
- Foundation Course: `PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu`
- Life of the Prophet: `PLVnGeZczzv1B549C1kmtFHOpK194F1CgO`

### 4.5 Live Learning — Zoom API

| Item | Detail |
|------|--------|
| Required Plan | Zoom Workplace Pro (minimum with API access + cloud recording) |
| Cost | USD $13.33/host/month (annual) ≈ AUD $21/month |
| Hosts Required | 1 Pro licence per active instructor |
| Recommended | Start with 2 Pro licences = ~AUD $42/month |
| Meeting Limit | 100 participants per session |
| Duration | Unlimited on Pro plan |
| Cloud Recording | 5 GB per licence — transferred to YouTube after class |

**Zoom Integration Points:**
- **Moodle Zoom Plugin** — instructors schedule recurring classes inside Moodle
- **Cal.com Zoom Integration** — auto-creates unique meeting per private consultation
- **Recording Webhook** — `recording.completed` → downloads → uploads to YouTube (unlisted) → links in Moodle
- **Attendance Webhook** — attendance report written to Moodle grade book

### 4.6 Authentication — Single Sign-On

| Component | Detail |
|-----------|--------|
| Identity Provider | WordPress + WP OAuth Server plugin |
| Moodle Auth | OAuth2 SSO plugin — maps WordPress user to Moodle on first login |
| PWA Auth | NextAuth.js v5 OAuth2 flow — session token stored in browser |
| Cal.com Auth | OAuth2 or email magic link |
| Student Journey | Register free on WordPress → auto-enrolled in Moodle → same credentials everywhere |

### 4.7 Communication — Mautic

Mautic (open-source, self-hosted) handles all outbound communications:
- Welcome email sequence for new students
- Zoom class reminder emails (24h + 1h before)
- Course completion acknowledgement
- Re-engagement nudge (inactive > 14 days)
- New content announcement emails
- Private consultation confirmation + reminder emails
- Donor thank-you sequence + monthly infrastructure newsletter

SMTP relay: AWS SES (~AUD $5–10/month)

### 4.8 Donor Sustainability Model

> **Principle:** Courses are, and will always remain, completely free. Donations sustain the infrastructure.

| Component | Detail |
|-----------|--------|
| Platform | WooCommerce 'Donations' product + Stripe/PayPal |
| One-off | Simple donation form on 'Support Us' page |
| Recurring | WooCommerce Subscriptions or Stripe recurring |
| Transparency | Public 'Infrastructure Budget' page with cost breakdown + % funded |
| Reporting | Monthly donor newsletter via Mautic |

> At AUD $72/month total: **10 donors at $7/month** fully sustains the platform.

---

## 5. PWA Mobile Strategy

Rather than native iOS/Android apps (typically AUD $40,000–80,000), the architecture uses a Progressive Web App.

**Student Install Flow:**
1. Visit `learn.introtoislam.org` on mobile browser
2. Browser shows 'Add to Home Screen' prompt after repeat visit
3. App installs onto home screen — full-screen, branded icon, no browser chrome
4. Works on iOS 16.4+ (Safari) and Android (Chrome, Samsung Internet, Firefox)
5. App updates pushed silently — always latest version

**PWA Capabilities:**

| Feature | Implementation |
|---------|---------------|
| Offline Browsing | Service Worker caches course outlines, lesson notes, module structure |
| Push Notifications | Class reminders, new video alerts, consultation confirmations |
| Video Playback | YouTube iframe API — adaptive streaming |
| Home Screen Install | iOS and Android — no App Store submission |
| Background Sync | Progress syncs to Moodle when connection restored |

**Important Limitations:**
- iOS push notifications require **iOS 16.4+** (Safari 16.4+). Older iOS → email notifications via Mautic
- Zoom via browser (Zoom Web Client) is less feature-rich than native Zoom app — students encouraged to install Zoom app for live sessions

---

## 6. Infrastructure Design

### Server Specification

| Component | Specification |
|-----------|--------------|
| VPS Provider | Hetzner Cloud CX32 (4 vCPU, 8 GB RAM, 80 GB SSD) — ~AUD $18/month |
| Container Runtime | Docker Compose — all services in single `docker-compose.yml` |
| Reverse Proxy | Nginx — SSL termination, routing to Moodle / Next.js / Cal.com |
| SSL Certificates | Let's Encrypt via Certbot — free, auto-renewed |
| CDN / Edge | Cloudflare Free — DNS, CDN, DDoS, WAF |
| Database | PostgreSQL 16 (Moodle) + MySQL 8 (WordPress) |
| Cache | Redis 7 — sessions, query cache, rate limiting |
| Backups | Daily encrypted DB dumps to Backblaze B2 (~AUD $3/month) |
| Monitoring | Uptime Robot (free) + Grafana + Prometheus (self-hosted) |

### Domain Structure

| Domain | Service |
|--------|---------|
| `introtoislam.org` | WordPress — public site + donation hub |
| `learn.introtoislam.org` | Next.js PWA — student portal |
| `lms.introtoislam.org` | Moodle LMS — admin interface |
| `book.introtoislam.org` | Cal.com — private consultation booking |

### Monthly Infrastructure Cost

| Item | AUD/month | Note |
|------|----------|------|
| Hetzner CX32 VPS | ~$18 | 4 vCPU, 8 GB RAM |
| Cloudflare | Free | CDN, DDoS, SSL, WAF |
| YouTube (video + delivery) | Free | Existing playlists |
| YouTube Data API v3 | Free | 10,000 units/day |
| Zoom Pro (2 licences) | ~$42 | USD $13.33/host annual |
| Backblaze B2 | ~$3 | Encrypted DB backups |
| SMTP Relay (AWS SES) | ~$5–10 | Transactional email |
| **TOTAL** | **~$68–73** | Per month |

---

## 7. Key Data Flows

### Free Enrolment Flow
1. Student registers free on `introtoislam.org` (WordPress)
2. WordPress fires webhook to Moodle REST API on new user creation
3. Moodle creates matching account + auto-enrols student
4. Mautic triggers welcome email sequence
5. Student logs in via SSO → lands on Moodle PWA course page

### Zoom Class Replay → YouTube Flow
1. Zoom class ends → cloud recording processed (15–60 min)
2. Zoom fires `recording.completed` webhook to Node.js handler on VPS
3. Handler downloads recording from Zoom cloud storage
4. Handler uploads to YouTube as 'Unlisted' via YouTube Data API v3
5. Handler calls Moodle REST API to add video link to course section
6. Mautic sends enrolled students a 'Class replay available' notification

### Private Consultation Flow
1. Student visits `book.introtoislam.org`, selects instructor + slot
2. Cal.com calls Zoom API to create unique meeting
3. Confirmation emails with Zoom join link sent to student + instructor
4. Reminder emails fire 24h and 1h before session
5. After session, instructor optionally marks completion in Moodle

---

## 8. Full Technology Stack

| Layer | Technology | Licence | Hosting |
|-------|-----------|---------|---------|
| Public Site | WordPress + WooCommerce | GPL / Free | Same VPS |
| LMS | Moodle 4.3 | GPL / Free | Same VPS |
| Student Portal | Next.js 16 PWA | MIT / Free | Same VPS |
| Video Platform | YouTube + Data API v3 | Free | YouTube Cloud |
| Live Classes | Zoom Pro | USD $13.33/host/mo | Zoom Cloud |
| Booking | Cal.com | AGPL / Free | Same VPS |
| Email Automation | Mautic | GPL / Free | Same VPS |
| Donations | WooCommerce + Stripe | GPL / % fee | Same VPS |
| Auth / SSO | WP OAuth Server | GPL / Free | Same VPS |
| DB — LMS | PostgreSQL 16 | PostgreSQL / Free | Same VPS |
| DB — CMS | MySQL 8 | GPL / Free | Same VPS |
| Cache | Redis 7 | BSD / Free | Same VPS |
| Reverse Proxy | Nginx | BSD / Free | Same VPS |
| CDN / Edge | Cloudflare | Free tier | Cloudflare |
| Containers | Docker Compose | Apache 2 / Free | Self-hosted |
| Backups | Backblaze B2 | SaaS / ~$3/mo | Cloud |
| Monitoring | Grafana + Prometheus | AGPL / Free | Same VPS |

---

## 9. Migration Path

| Phase | Weeks | Activities |
|-------|-------|-----------|
| **Phase 1 — Infrastructure** | 1–3 | Provision Hetzner CX32; deploy Docker Compose (Moodle, Next.js, PostgreSQL, Redis, Nginx); configure Cloudflare DNS for new subdomains; deploy Cal.com; configure Mautic + AWS SES |
| **Phase 2 — Integration** | 4–6 | WP OAuth Server → Moodle SSO; WordPress webhook → Moodle auto-enrolment; Zoom plugin in Moodle; YouTube Data API v3 sync; Zoom recording webhook handler; WooCommerce donation product + Stripe |
| **Phase 3 — Content Migration** | 7–9 | Re-create Foundation Course + Prophet Muhammad Course in Moodle; import student data from LearnPress; configure city cohorts; create 'Support Us' page; end-to-end test |
| **Phase 4 — PWA Launch** | 10–12 | Complete Next.js PWA (Moodle REST + YouTube Player API); iOS/Android install testing; Web Push notifications; 20–30 student UAT; go-live |

---

## 10. Security & Compliance

- All traffic over HTTPS via Cloudflare SSL + Let's Encrypt
- Cloudflare WAF blocks common attack vectors (SQLi, XSS, bot scraping)
- Moodle + WordPress admin panels restricted to VPN or IP allowlist
- Daily encrypted database backups to Backblaze B2
- YouTube class replays as 'Unlisted' — not searchable, direct-link only
- Stripe processes all donation card data off-platform — no financial credentials on VPS
- Student PII on Hetzner EU VPS — compliant with Australian Privacy Act 1988
- ACSC Essential Eight: monthly Docker image updates via Watchtower automation
- Zoom recordings auto-deleted from Zoom cloud after YouTube transfer

---

## 11. Future Extensibility

| Capability | Approach |
|-----------|---------|
| Additional Languages | Moodle supports RTL + Arabic locale natively; YouTube has multilingual captions |
| Native Mobile Apps | React Native wrapper using same Moodle REST API |
| Completion Certificates | Moodle certificate plugin + Open Badges |
| Community Forum | Discourse (open source, self-hosted) with SSO |
| Student Analytics | Metabase queries Moodle PostgreSQL directly |
| Kubernetes Migration | Docker Compose lifts into K3s when students exceed 5,000 |
