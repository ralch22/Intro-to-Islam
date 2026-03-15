# =============================================================================
# Dockerfile — Next.js PWA Production Container
# intro-to-islam-pwa
# =============================================================================
# Multi-stage build:
#   base    — Node 20 Alpine base image
#   deps    — install only production node_modules
#   builder — full build (includes devDependencies for Next.js compilation)
#   runner  — minimal runtime image (~100 MB) with standalone output
#
# Requires next.config.ts to have: output: 'standalone'
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: base — shared Node.js Alpine image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install libc compatibility shims needed by some native node modules
RUN apk add --no-cache libc6-compat

# ---------------------------------------------------------------------------
# Stage 2: deps — install production dependencies
# ---------------------------------------------------------------------------
FROM base AS deps

WORKDIR /app

# Copy lockfile first for better layer caching
COPY package.json package-lock.json* ./

# Install only production dependencies (devDeps are needed by Next.js builder,
# but this layer is reused as a cache for the runner stage)
RUN npm ci --only=production && npm cache clean --force

# ---------------------------------------------------------------------------
# Stage 3: builder — compile the Next.js application
# ---------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Restore full node_modules (including devDependencies) for the build step
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Copy application source
COPY . .

# Build-time environment variables — set NEXT_TELEMETRY_DISABLED to avoid
# network requests during CI/CD builds
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js — produces .next/standalone and .next/static
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 4: runner — minimal production image
# ---------------------------------------------------------------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user and group for the Next.js process
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy the public directory (static assets, icons, service worker, manifest)
COPY --from=builder /app/public ./public

# Copy the standalone output — a self-contained Node.js server
# Chown to nextjs user so the process can write to /tmp if needed
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the static chunks (CSS, JS bundles) into the expected _next/static path
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# The PORT env var is read by the Next.js standalone server
ENV PORT=3000
# Bind to all interfaces inside the container
ENV HOSTNAME=0.0.0.0

# Start the standalone Next.js server
CMD ["node", "server.js"]
