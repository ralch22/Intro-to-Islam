# IntroToIslam PWA — Deployment & Go-Live Runbook

> **Document:** DEPLOY-ITI-2026-001 v1.0 · **Status:** Production — Use on Go-Live Day
> **Author:** Rami Alcheikh — Emerge Digital · **Date:** March 2026

This runbook takes the platform from production-ready to fully live. Estimated time: **3–4 hours** for a technical operator. Each phase can be paused and resumed.

---

## Architecture at a Glance

Two hosting environments:

| Service | Domain / Port | Container | Expected |
|---------|--------------|-----------|----------|
| Next.js PWA | `learn.introtoislam.org` | Vercel (managed) | Login page loads |
| WordPress | `introtoislam.org` | `wordpress` | Marketing site loads |
| Moodle LMS | `lms.introtoislam.org` | `moodle` | Moodle dashboard |
| Cal.com | `book.introtoislam.org` | `calcom` | Booking page loads |
| Nginx proxy | All domains (80/443) | `nginx` | HTTP 200 / redirect |
| MySQL 8 | Internal port 3306 | `mysql` | `mysqld is alive` |
| PostgreSQL 16 | Internal port 5432 | `postgres` | `accepting connections` |
| Redis 7 | Internal port 6379 | `redis` | `PONG` |
| Mautic | `mail.introtoislam.org` | `mautic` | Mautic login page |
| Prometheus | Internal port 9090 | `prometheus` | Prometheus graph UI |
| Grafana | `monitor.introtoislam.org` | `grafana` | Grafana login page |

> Nginx acts as reverse proxy for all Hetzner-hosted services. HTTPS certificates are issued automatically by Let's Encrypt via Certbot running inside the Nginx container.

---

## Phase 0 — Prerequisites

Gather all accounts and access before starting. Estimated time: 30–60 minutes.

| Requirement | Details |
|-------------|---------|
| **Hetzner account** | hetzner.com — create account, add payment method, create project `IntroToIslam` |
| **Cloudflare account** | cloudflare.com — add `introtoislam.org`, point domain nameservers to Cloudflare |
| **GitHub access** | `github.com/ralch22/Intro-to-Islam` — at least read permission to clone |
| **Vercel account** | vercel.com — create account and connect to the GitHub repository |
| **Zoom Pro licence** | marketplace.zoom.us — create a Server-to-Server OAuth app; note Account ID, Client ID, Client Secret, Webhook Secret |
| **YouTube Data API** | console.cloud.google.com — create project, enable YouTube Data API v3, create API Key (reads) + OAuth 2.0 Client (uploads). Run OAuth consent flow once to get refresh token |
| **Cal.com instance** | Included in Docker Compose — API key generated inside running instance after first login |
| **WordPress OAuth** | Included in Docker Compose — install 'WP OAuth Server' plugin after WordPress is running |
| **Backblaze B2** | backblaze.com — create account, create bucket `iti-backups`, create Application Key with read/write access |
| **SSH key pair** | `ssh-keygen -t ed25519 -C 'iti-deploy'` — public key added to Hetzner during server creation |
| **Domain registrar** | Access to change nameservers for `introtoislam.org` to Cloudflare's nameservers |

> **WARNING:** Do not begin Phase 1 until Cloudflare is managing DNS for `introtoislam.org`. Nginx's Let's Encrypt certificate issuance depends on DNS propagation. Proceeding early will cause SSL failures.

---

## Phase 1 — DNS & Cloudflare Configuration

Add the following records in the Cloudflare dashboard. The Hetzner VPS IP is obtained in Phase 2 — return to fill in A records after provisioning.

| Type | Proxy | Name | Value / Target | Notes |
|------|-------|------|----------------|-------|
| A | Proxied | `introtoislam.org` | `<HETZNER_IP>` | WordPress + Nginx |
| A | Proxied | `learn` | `<HETZNER_IP>` | Leave unproxied — Vercel manages SSL for learn.* |
| CNAME | Proxied | `lms` | `introtoislam.org` | Moodle via Nginx |
| CNAME | Proxied | `book` | `introtoislam.org` | Cal.com via Nginx |
| CNAME | Proxied | `mail` | `introtoislam.org` | Mautic via Nginx |
| CNAME | Proxied | `monitor` | `introtoislam.org` | Grafana via Nginx |
| CNAME | DNS only | `learn` | `cname.vercel-dns.com` | Vercel — grey cloud (DNS only) |
| TXT | — | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@introtoislam.org` | Email security |

> **Cloudflare SSL/TLS settings:** Set encryption mode to **Full (strict)**. Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.

---

## Phase 2 — Hetzner VPS Provisioning

### 2.1 Create the Server

Log in to [console.hetzner.cloud](https://console.hetzner.cloud) → Add Server:

| Setting | Value |
|---------|-------|
| Location | Nuremberg (EU-Central) — closest to Australia with GDPR compliance |
| Image | Ubuntu 24.04 LTS |
| Type | CX32 — 4 vCPU, 8 GB RAM, 80 GB SSD (~AUD $18/month) |
| Networking | IPv4 and IPv6 enabled — no private network needed |
| SSH Keys | Add the public key from Phase 0 |
| Name | `iti-production` |

Once created, copy the public IPv4 address. Return to Cloudflare and replace `<HETZNER_IP>` in all A records.

### 2.2 Initial Server Setup

```bash
# Connect to server
ssh root@<HETZNER_IP>

# Update system packages
apt-get update && apt-get upgrade -y

# Install Docker and Docker Compose plugin
curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin

# Install useful tools
apt-get install -y git curl wget unzip ufw fail2ban

# Configure UFW firewall
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Create deploy user (never run production as root)
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

### 2.3 Clone the Repository

```bash
# Switch to deploy user
su - deploy

# Clone repository
git clone https://github.com/ralch22/Intro-to-Islam.git /home/deploy/iti
cd /home/deploy/iti

# Verify infra directory exists
ls infra/
# Expected: docker-compose.yml  nginx/  prometheus/  scripts/
```

### 2.4 Create the .env File

The `.env` file is not committed to the repository. Create it manually:

```bash
cd /home/deploy/iti/infra
nano .env
# Paste all environment variables from Phase 4 and save (Ctrl+X, Y, Enter)

# Restrict permissions — only deploy user should read this file
chmod 600 .env
```

---

## Phase 3 — Docker Compose — Start All Services

> **WARNING:** Do not run `docker compose up` for all services at once on first boot. Start databases first and verify they are healthy before starting dependent services. This prevents Moodle and WordPress from failing their first-run initialisation.

### Step 1 — Start Databases First

```bash
cd /home/deploy/iti/infra

# Start MySQL and PostgreSQL
docker compose up -d mysql postgres

# Wait 30 seconds for databases to initialise
sleep 30

# Verify MySQL is healthy
docker exec mysql mysqladmin ping -h localhost --silent
# Expected: mysqld is alive

# Verify PostgreSQL is healthy
docker exec postgres pg_isready -U postgres
# Expected: /var/run/postgresql:5432 - accepting connections
```

### Step 2 — Start Redis and Core Services

```bash
docker compose up -d redis wordpress moodle calcom mautic

# Wait 60 seconds for first-run initialisation
sleep 60

# Check all services are running
docker compose ps
# All listed services should show status: running
```

### Step 3 — Start Nginx and Monitoring

```bash
docker compose up -d nginx prometheus grafana

# Verify Nginx started and obtained SSL certificates
docker logs nginx --tail 20
# Look for: Successfully received certificate
# If SSL fails, see Troubleshooting in Phase 9

# Verify all 11 services are running
docker compose ps
```

### Step 4 — Configure Auto-Restart on Boot

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Create systemd service
sudo nano /etc/systemd/system/iti-services.service
```

Paste this content:

```ini
[Unit]
Description=IntroToIslam Docker Compose Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/deploy/iti/infra
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=deploy

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable iti-services
sudo systemctl start iti-services
```

---

## Phase 4 — Environment Variables — Complete Reference

All 23 environment variables are set in **two places**:
- `infra/.env` on the Hetzner VPS (for Docker services)
- Vercel project settings (for the Next.js frontend)

### 4.1 WordPress & NextAuth (Authentication)

| Variable | Req | Description | How to Obtain |
|----------|-----|-------------|---------------|
| `WORDPRESS_CLIENT_ID` | Yes | OAuth2 client ID from WP OAuth Server plugin | WordPress Admin → OAuth Server → Add Client → copy Client ID |
| `WORDPRESS_CLIENT_SECRET` | Yes | OAuth2 client secret | Same screen — copy Client Secret |
| `WORDPRESS_SITE_URL` | Yes | Full URL of the WordPress site | `https://introtoislam.org` |
| `NEXTAUTH_URL` | Yes | Canonical URL of the Next.js PWA | `https://learn.introtoislam.org` |
| `NEXTAUTH_SECRET` | Yes | Random 32-byte secret for JWT signing | `openssl rand -base64 32` |

### 4.2 Moodle LMS

| Variable | Req | Description | How to Obtain |
|----------|-----|-------------|---------------|
| `MOODLE_URL` | Yes | Full URL of the Moodle instance | `https://lms.introtoislam.org` |
| `MOODLE_TOKEN` | Yes | Web service token with read/write access | Moodle Admin → Site Admin → Server → Web Services → Manage Tokens → Create Token for admin user |

> **Required Moodle web service functions:** `core_course_get_courses`, `core_enrol_enrol_users`, `core_completion_mark_course_self_completed`, `mod_forum_add_discussion`, `gradereport_user_get_grades_table`
> Enable at: Site Admin → Server → Web Services → External Services

### 4.3 YouTube Data API

| Variable | Req | Description | How to Obtain |
|----------|-----|-------------|---------------|
| `YOUTUBE_API_KEY` | Yes | API key for read operations (playlist sync, video metadata) | Google Cloud Console → APIs & Services → Credentials → Create API Key → restrict to YouTube Data API v3 |
| `YOUTUBE_OAUTH_CLIENT_ID` | Yes | OAuth 2.0 Client ID for upload service account | Google Cloud Console → Credentials → Create OAuth 2.0 Client ID → Desktop app type |
| `YOUTUBE_OAUTH_CLIENT_SECRET` | Yes | Client secret paired with OAuth client | Same screen — Download JSON and extract `client_secret` |
| `YOUTUBE_REFRESH_TOKEN` | Yes | Refresh token from YouTube OAuth consent flow | Run `node scripts/get-youtube-token.js` or use OAuth Playground with YouTube API scope |

### 4.4 Zoom API

| Variable | Req | Description | How to Obtain |
|----------|-----|-------------|---------------|
| `ZOOM_ACCOUNT_ID` | Yes | Account ID of the Zoom Pro account | marketplace.zoom.us → Develop → Build App → Server-to-Server OAuth → App Credentials → Account ID |
| `ZOOM_CLIENT_ID` | Yes | Client ID of the Server-to-Server OAuth app | Same screen — Client ID field |
| `ZOOM_CLIENT_SECRET` | Yes | Client secret (rotate every 90 days) | Same screen — Client Secret field |
| `ZOOM_WEBHOOK_SECRET` | Yes | Secret token to verify Zoom webhook payloads | Your App → Feature → Event Subscriptions → Secret Token → click Generate |

> **Zoom webhook endpoint URL:** `https://learn.introtoislam.org/api/zoom/webhook`
> Register under Feature → Event Subscriptions → subscribe to `recording.completed`

### 4.5 Cal.com Booking

| Variable | Req | Description | How to Obtain |
|----------|-----|-------------|---------------|
| `CAL_API_KEY` | Yes | API key for Cal.com REST operations | Cal.com Admin Panel → Settings → Developer → API Keys → Add New Key |
| `CAL_WEBHOOK_SECRET` | Yes | Secret to verify Cal.com webhook payloads | Cal.com → Settings → Developer → Webhooks → Add Webhook → set secret → register URL: `https://learn.introtoislam.org/api/cal/webhook` |

### 4.6 Web Push Notifications (VAPID)

Generate VAPID keys once and store permanently:

```bash
cd /home/deploy/iti
npx web-push generate-vapid-keys
# Output:
# Public Key:  B<base64>...=
# Private Key: <base64>...=
```

| Variable | Req | Description | How to Obtain |
|----------|-----|-------------|---------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | VAPID public key (exposed to browser) | Generated above — Public Key value (starts with `B`) |
| `VAPID_PRIVATE_KEY` | Yes | VAPID private key (server-side only) | Generated above — Private Key value |
| `VAPID_EMAIL` | Yes | Contact email in VAPID identification header | `mailto:admin@introtoislam.org` |

### 4.7 Admin & Cron Security Secrets

| Variable | Req | Description | How to Obtain |
|----------|-----|-------------|---------------|
| `ADMIN_SECRET` | Yes | Bearer token for admin-only API endpoints | `openssl rand -hex 32` |
| `CRON_SECRET` | Yes | Bearer token Vercel passes when triggering cron jobs | `openssl rand -hex 32` — also set in Vercel Environment Variables |

### 4.8 Setting Variables in Vercel

```bash
# Via Vercel dashboard: vercel.com → Project → Settings → Environment Variables
# Add each variable with scope: Production

# Or via CLI:
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add NEXTAUTH_URL production
# ... repeat for all variables

# After adding all variables, trigger a redeploy:
npx vercel --prod
```

---

## Phase 5 — Third-Party Service Configuration

### 5.1 WordPress — Install & Configure OAuth Server

1. Go to `https://introtoislam.org/wp-admin` and log in as admin.
2. Plugins → Add New → search for **WP OAuth Server** → Install and Activate.
3. Navigate to OAuth Server → Add New Client.
4. Set Client Name: `IntroToIslam PWA`. Set Redirect URI: `https://learn.introtoislam.org/api/auth/callback/wordpress`
5. Click Save. Copy Client ID and Client Secret into `.env` as `WORDPRESS_CLIENT_ID` and `WORDPRESS_CLIENT_SECRET`.
6. Redeploy Vercel: `npx vercel --prod`

### 5.2 Moodle — Create Web Service Token

7. Go to `https://lms.introtoislam.org` and log in as admin.
8. Site Administration → Server → Web Services → Enable → tick **Enable web services** → Save.
9. Site Administration → Plugins → Web Services → Manage Protocols → Enable **REST** protocol.
10. Site Administration → Server → Web Services → External Services → Add new service → Name: `ITI PWA` → Enable → Add functions (see Phase 4.2).
11. Site Administration → Server → Web Services → Manage Tokens → Add → select admin user → select ITI PWA service → Create token.
12. Copy token into `.env` as `MOODLE_TOKEN` and update Vercel environment variables.

### 5.3 Cal.com — First-Run Setup

13. Go to `https://book.introtoislam.org` and complete the Cal.com onboarding wizard.
14. Create admin account. Set organisation name: `IntroToIslam`.
15. Add instructor accounts (one per volunteer instructor).
16. Settings → Developer → API Keys → Add New Key with all scopes → copy to `.env` as `CAL_API_KEY`.
17. Settings → Developer → Webhooks → Add Webhook → URL: `https://learn.introtoislam.org/api/cal/webhook` → Events: `booking.created`, `booking.cancelled`, `booking.rescheduled` → set a secret → copy to `.env` as `CAL_WEBHOOK_SECRET`.

### 5.4 Zoom — Register Webhook

18. marketplace.zoom.us → Develop → Build App → select your Server-to-Server OAuth app.
19. Click Feature → Event Subscriptions → Add new event subscription.
20. Set notification endpoint URL: `https://learn.introtoislam.org/api/zoom/webhook`
21. Click + Add Events → Meeting → select `recording.completed` → Done.
22. Click Generate on the Secret Token field → copy to `.env` as `ZOOM_WEBHOOK_SECRET`.
23. Click Save. Verify the endpoint by clicking **Validate** — the Next.js app will respond with HTTP 200.

### 5.5 Backup Script — Configure & Schedule

```bash
# Add to /home/deploy/.bashrc or directly into the cron environment
export B2_ACCOUNT_ID='your-backblaze-account-id'
export B2_APPLICATION_KEY='your-backblaze-application-key'
export B2_BUCKET_NAME='iti-backups'

# Install Backblaze B2 CLI
pip3 install b2 --break-system-packages

# Test backup manually first
cd /home/deploy/iti/infra
bash scripts/backup.sh
# Check Backblaze B2 bucket — a new folder should appear with today's date

# Schedule daily backup at 03:00 AEST (17:00 UTC)
crontab -e
# Add this line:
0 17 * * * /bin/bash /home/deploy/iti/infra/scripts/backup.sh >> /var/log/iti-backup.log 2>&1
```

---

## Phase 6 — Vercel Frontend Deployment

> The Next.js frontend is already live at `intro-to-islam-pwa.vercel.app`. This phase connects the custom domain `learn.introtoislam.org` and confirms cron jobs are active.

### 6.1 Connect Custom Domain

24. Vercel dashboard → project → Settings → Domains.
25. Add domain: `learn.introtoislam.org`
26. Vercel shows a CNAME record — this should already be in Cloudflare from Phase 1 (`cname.vercel-dns.com`). If not, add it now.
27. Wait 1–2 minutes for DNS propagation then click **Verify**. Status should show **Valid Configuration**.

### 6.2 Confirm Cron Jobs

Two scheduled jobs are defined in `vercel.json`:

| Path | Schedule | Purpose |
|------|----------|---------|
| `/api/cron/youtube-sync` | `0 2 * * *` (02:00 UTC daily) | Syncs YouTube playlist metadata to Moodle course activities |
| `/api/cron/class-reminders` | `0 8 * * *` (08:00 UTC / 18:00 AEST daily) | Sends push notifications to students 1 hour before scheduled Zoom classes |

To verify: Vercel dashboard → Your Project → **Cron Jobs** tab. Both jobs should be listed. Trigger a manual run by clicking the run button next to each.

> **WARNING:** Vercel cron jobs require `CRON_SECRET` to be set in Vercel project settings. Without it, all cron requests return `401 Unauthorized` and fail silently.

---

## Phase 7 — Go-Live Verification Checklist

Work through each item in order. Do not mark the platform as live until all items pass. Target time: under 30 minutes.

### Infrastructure

- [ ] All 11 Docker services show `Status: running` in `docker compose ps`
- [ ] `docker exec mysql mysqladmin ping` returns `mysqld is alive`
- [ ] `docker exec postgres pg_isready` returns `accepting connections`
- [ ] `docker exec redis redis-cli ping` returns `PONG`
- [ ] `https://introtoislam.org` loads with valid padlock (Let's Encrypt cert)
- [ ] All four domains load without SSL warnings: `introtoislam.org`, `lms.introtoislam.org`, `book.introtoislam.org`, `learn.introtoislam.org`

### Authentication

- [ ] Visit `https://learn.introtoislam.org` — login page renders correctly
- [ ] Click Log In — redirected to `https://introtoislam.org/oauth/authorize` (WordPress)
- [ ] Log in with a test WordPress account — redirected back to PWA Dashboard after OAuth flow
- [ ] Refresh the page — session persists (not logged out)
- [ ] Click Log Out — session cleared, redirected to login page

### Course Learning Flow

- [ ] Dashboard shows enrolled course cards with correct progress percentages from Moodle
- [ ] Navigate to a course — lesson list loads from Moodle REST API
- [ ] Open a lesson — YouTube video embeds and plays inline (not redirecting to YouTube.com)
- [ ] Click Mark as Complete — progress bar updates without page reload, completion recorded in Moodle
- [ ] Previous / Next lesson buttons navigate correctly

### Live Classes

- [ ] Schedule screen shows upcoming Zoom classes from Zoom API
- [ ] Class times display in the device's local timezone
- [ ] Join Class button is inactive more than 30 minutes before a class
- [ ] Join Class button activates and opens Zoom correctly when within 30 minutes of class start
- [ ] Past class replay embedded via YouTube (if a past class exists)

### Consultation Booking

- [ ] Book 1:1 screen shows instructor cards with Cal.com availability
- [ ] Cal.com booking calendar embeds inside the PWA without external redirect
- [ ] Complete a test booking — confirmation email received within 60 seconds with Zoom link
- [ ] Test booking appears in Cal.com admin panel

### Push Notifications

- [ ] Visit Profile → Notifications — push permission prompt appears
- [ ] Accept push permission — subscription saved (check server logs)
- [ ] Trigger a test push: `POST https://learn.introtoislam.org/api/push/test` with `Authorization: Bearer <ADMIN_SECRET>`
- [ ] Push notification received on device within 5 seconds

### PWA & Offline

- [ ] Chrome DevTools → Application → Manifest — shows correct name, icons, and `start_url`
- [ ] Application → Service Workers — shows `Activated and running`
- [ ] Run Lighthouse audit (DevTools → Lighthouse → PWA) — score 90 or above
- [ ] Navigate to a course, then go offline in DevTools — course content still readable from cache

### Backups

- [ ] Run backup script manually: `bash infra/scripts/backup.sh`
- [ ] Check Backblaze B2 bucket — encrypted backup file visible with today's date
- [ ] Confirm cron entry is active: `crontab -l` shows the 03:00 AEST backup job

---

## Phase 8 — Post-Launch: First 48 Hours

Most issues surface within the first day due to real traffic patterns or OAuth session edge cases.

| Task | Action |
|------|--------|
| **Watch server logs** | `docker compose logs -f --tail=100 \| grep -i 'error\|warn'` — check every few hours |
| **Watch Vercel logs** | Vercel dashboard → Deployments → Functions tab — watch for 500 errors on API routes |
| **Verify first student login** | Ask a volunteer to log in from their personal device — confirm OAuth flow completes |
| **Monitor push delivery** | After first cron run, check `/var/log/iti-backup.log` and Vercel function logs for `class-reminders` |
| **Check Moodle sync** | After 02:00 UTC, verify `/api/cron/youtube-sync` logs show courses updated successfully |
| **Uptime monitoring** | Set up UptimeRobot (free) or Uptime Kuma (self-hosted) to ping `https://learn.introtoislam.org/api/health` every 5 minutes |

---

## Phase 9 — Troubleshooting

### 1. Nginx SSL certificate fails on first start

**Cause:** DNS not yet propagated to Hetzner IP, or Cloudflare proxy is intercepting the Let's Encrypt HTTP-01 challenge.

**Fix:**
1. Temporarily set Cloudflare DNS records to DNS only (grey cloud).
2. Restart Nginx: `docker compose restart nginx`
3. Once certificate is issued, re-enable Cloudflare proxying.

### 2. WordPress OAuth redirects to wrong URL

**Cause:** `WORDPRESS_SITE_URL` or `NEXTAUTH_URL` env var has a trailing slash or incorrect protocol.

**Fix:** Ensure exact values with no trailing slash. `NEXTAUTH_URL` must match the exact callback URL registered in WP OAuth Server.

### 3. Moodle REST API returns 403 Forbidden

**Cause:** Web service token is linked to a restricted user, or the required web service functions are not enabled.

**Fix:** Re-check Phase 5.2 — ensure all listed functions are added to the ITI PWA External Service, and the token is for the admin user.

### 4. Zoom webhook returns 400 Bad Request

**Cause:** `ZOOM_WEBHOOK_SECRET` is incorrect or whitespace was included when copying.

**Fix:** Re-copy the secret from Zoom marketplace exactly. Test with: `curl -s https://learn.introtoislam.org/api/zoom/webhook` — if you see `Unauthorized`, the secret is wrong.

### 5. Push notifications not received

**Cause:** VAPID keys mismatch between Vercel env vars and the subscription stored server-side, or push subscriptions were saved before keys were finalised.

**Fix:** Delete all subscriptions in the push store (`infra/data/push-subscriptions.json`), regenerate VAPID keys, redeploy Vercel, and re-subscribe users.

### 6. Cal.com booking calendar not loading

**Cause:** CSP (Content Security Policy) in `next.config.ts` may be blocking the Cal.com embed script from `book.introtoislam.org`.

**Fix:** Verify `next.config.ts` CSP header includes `frame-src book.introtoislam.org` and `script-src book.introtoislam.org`. Rebuild and redeploy.

### 7. Docker service keeps restarting

**Cause:** Missing or incorrect environment variable required at startup.

**Fix:** `docker logs <service_name> --tail 50` — look for the specific error. Most will cite a missing env var or failed database connection.

### 8. Backup script fails silently

**Cause:** B2 CLI not authenticated or bucket name incorrect.

**Fix:** Run `b2 authorize-account` manually with `B2_ACCOUNT_ID` and `B2_APPLICATION_KEY` values, then re-run `backup.sh` with `bash -x` for verbose output.

---

## Phase 10 — Monthly Maintenance Checklist

These five tasks take under 30 minutes per month and can be performed by a non-technical volunteer.

### Task 1 — Verify Backups (5 min)

1. Log in to backblaze.com with the backup account credentials.
2. Open the `iti-backups` bucket. Confirm there is at least one folder created in the last 24 hours.
3. If no recent folder exists, contact the technical administrator — backups have stopped.

### Task 2 — Check Uptime Monitor (2 min)

4. Log in to UptimeRobot.com (or your monitoring tool). All monitors should show green / Up.
5. If any monitor is red, check the Vercel dashboard and the Hetzner server logs.

### Task 3 — Update Docker Images (10 min)

6. SSH into the Hetzner server: `ssh deploy@<HETZNER_IP>`
7. Navigate to: `cd /home/deploy/iti/infra`
8. Pull latest images and restart services:

```bash
docker compose pull
docker compose up -d --remove-orphans
docker system prune -f   # removes unused old images
```

9. Verify all services are still running: `docker compose ps`

### Task 4 — Review Zoom Licence Renewal Date (2 min)

10. Log in to zoom.us → Account Management → Billing.
11. Note the next billing date. If renewal is within 7 days, confirm the payment method is current.

### Task 5 — Check Backblaze B2 Storage Usage (1 min)

12. In Backblaze, check the storage usage for the `iti-backups` bucket.
13. If usage exceeds 5 GB, review the backup retention settings. The backup script retains 30 days of backups — edit the `RETENTION_DAYS` variable in `infra/scripts/backup.sh` if needed.

> After completing the monthly checklist, record the date in a simple spreadsheet or notes file. This builds a maintenance audit trail useful if the platform is ever handed over to a new administrator.
