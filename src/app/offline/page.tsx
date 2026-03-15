// src/app/offline/page.tsx
// Static offline fallback served by the service worker when the user is
// offline and no cached version of the requested document is available.
// Must remain a server component with no client-only dependencies so that
// next-pwa can cache it as a plain static HTML document.

import Link from "next/link";

export const metadata = {
  title: "You're Offline — IntroToIslam",
  description: "No internet connection. Some content is available from cache.",
};

export default function OfflinePage() {
  return (
    <main
      style={{ backgroundColor: "#1F2937" }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-white"
    >
      {/* WiFi-off icon (inline SVG — no external dependency) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#E81C74"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-20 h-20 mb-6"
        aria-hidden="true"
      >
        {/* Slash through wifi signal */}
        <line x1="1" y1="1" x2="23" y2="23" />
        {/* Wifi arcs (clipped by slash visually) */}
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="#E81C74" stroke="none" />
      </svg>

      <h1 className="text-3xl font-bold mb-3 text-center">You&apos;re offline</h1>

      <p className="text-gray-300 text-center max-w-sm mb-2">
        It looks like you&apos;ve lost your internet connection.
      </p>
      <p className="text-gray-400 text-center max-w-sm mb-8 text-sm">
        Pages and lessons you&apos;ve already visited may still be available from
        the local cache. Try navigating to a page you&apos;ve opened before, or
        reconnect and refresh.
      </p>

      <Link
        href="/"
        style={{ backgroundColor: "#E81C74" }}
        className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Go to home page
      </Link>
    </main>
  );
}
