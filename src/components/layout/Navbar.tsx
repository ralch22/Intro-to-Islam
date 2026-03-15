"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/courses", label: "Course Library" },
  { href: "/schedule", label: "Live Classes" },
  { href: "/booking", label: "Book 1:1" },
  { href: "/community", label: "Community" },
];

function ProfileDropdown() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="bg-[#E81C74] hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-[#E81C74] flex items-center justify-center text-white font-bold text-sm hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E81C74] focus:ring-offset-2"
        title={session.user.name ?? session.user.email ?? "Profile"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session.user.name ?? "Student"}
            </p>
            {session.user.email && (
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            )}
          </div>

          {[
            { href: "/progress", label: "My Progress", icon: "📊" },
            { href: "/profile/bookings", label: "My Bookings", icon: "📅" },
            { href: "/profile/notifications", label: "Notifications", icon: "🔔" },
            { href: "/profile", label: "Profile", icon: "👤" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-1" />
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-base">🚪</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo + desktop nav */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E81C74] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                ii
              </div>
              <span className="font-bold text-xl text-[#1F2937]">
                Introduction
                <br />
                <span className="text-sm font-normal text-gray-500">to Islam</span>
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "border-[#E81C74] text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Progress link */}
            <Link
              href="/progress"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E81C74] font-medium transition-colors"
              title="My Progress"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="hidden lg:inline">Progress</span>
            </Link>

            {/* Notifications bell */}
            <Link href="/profile/notifications" className="text-gray-400 hover:text-gray-500 relative hidden sm:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Link>

            {/* Profile dropdown */}
            <div className="hidden sm:flex items-center">
              <ProfileDropdown />
            </div>

            {/* Mobile hamburger */}
            <button
              className="flex items-center md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4 px-4 space-y-1">
          {[...navLinks, { href: "/progress", label: "My Progress" }, { href: "/booking", label: "Book 1:1" }]
            // dedupe by href (booking already in navLinks)
            .filter((link, idx, arr) => arr.findIndex((l) => l.href === link.href) === idx)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-4 text-base font-medium rounded-md ${
                  isActive(link.href)
                    ? "text-[#E81C74] bg-pink-50"
                    : "text-gray-600 hover:text-[#E81C74] hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-4 text-base font-medium text-gray-600 hover:text-[#E81C74] hover:bg-gray-50 rounded-md"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
