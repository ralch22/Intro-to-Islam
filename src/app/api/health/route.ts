import { NextResponse } from 'next/server';

// Public endpoint — no auth required (used by uptime monitors and Nginx healthchecks)
export async function GET() {
  const missing: string[] = [];

  // Check required env vars (names only — never expose values)
  const required = [
    'NEXTAUTH_SECRET',
    'WORDPRESS_SITE_URL', 'WORDPRESS_CLIENT_ID', 'WORDPRESS_CLIENT_SECRET',
    'MOODLE_URL', 'MOODLE_TOKEN',
    'ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET', 'ZOOM_WEBHOOK_SECRET',
    'CAL_API_KEY', 'CAL_WEBHOOK_SECRET',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_EMAIL',
    'CRON_SECRET', 'ADMIN_SECRET',
  ];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  // Derive status
  const criticalMissing = ['NEXTAUTH_SECRET', 'MOODLE_URL', 'MOODLE_TOKEN'].filter(k => missing.includes(k));
  const status = criticalMissing.length > 0 ? 'degraded' : missing.length > 0 ? 'degraded' : 'healthy';
  const httpStatus = status === 'healthy' ? 200 : 200; // always 200 — let monitors check the body

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? 'unknown',
      checks: {
        moodle: process.env.MOODLE_URL ? 'configured' : 'misconfigured',
        zoom: process.env.ZOOM_CLIENT_ID ? 'configured' : 'misconfigured',
        push: process.env.VAPID_PRIVATE_KEY ? 'configured' : 'misconfigured',
        auth: process.env.NEXTAUTH_SECRET ? 'configured' : 'misconfigured',
        cal: process.env.CAL_API_KEY ? 'configured' : 'misconfigured',
      },
      env: {
        missing: missing.length > 0 ? missing : undefined,
      },
    },
    { status: httpStatus }
  );
}
