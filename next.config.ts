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
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
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
