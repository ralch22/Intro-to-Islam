import type { NextConfig } from "next";
// @ts-expect-error - next-pwa types
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://cal.com https://*.cal.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://www.youtube.com https://youtube.com https://cal.com https://*.cal.com",
              "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://storage.googleapis.com https://yt3.ggpht.com",
              "connect-src 'self' https://www.googleapis.com https://api.zoom.us https://zoom.us https://api.cal.com",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  swSrc: "worker/index.ts",
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    {
      urlPattern: /\/api\/courses/,
      handler: "NetworkFirst",
      options: {
        cacheName: "course-data",
        expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\/api\/lessons/,
      handler: "NetworkFirst",
      options: {
        cacheName: "lesson-data",
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\/api\/schedule/,
      handler: "NetworkFirst",
      options: {
        cacheName: "schedule-data",
        expiration: { maxEntries: 20, maxAgeSeconds: 3600 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:js|css|woff2|png|svg|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 200, maxAgeSeconds: 2592000 },
      },
    },
  ],
})(nextConfig);
