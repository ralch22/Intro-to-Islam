"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type ProfileData = {
  name: string;
  email: string;
  image: string | null;
  enrolledCourses: number;
  completedLessons: number;
  totalLessons: number;
  joinDate: string;
  city: string;
};

function SkeletonProfile() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-2xl mb-8" />
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-20 bg-gray-200 rounded-2xl" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setNameInput(data.name);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  async function saveName() {
    if (!profile || !nameInput.trim()) return;
    setSavingName(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      setProfile((prev) => (prev ? { ...prev, name: nameInput.trim() } : prev));
      setEditingName(false);
    } catch {
      // ignore
    } finally {
      setSavingName(false);
    }
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <main className="flex-grow flex flex-col bg-gradient-to-b from-gray-50 to-[#F3F4F6]">
      {/* Hero */}
      <header className="gradient-brand text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white rounded-full" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-[#E81C74] rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-2 text-blue-200 text-sm font-medium">
            <Link href="/" className="hover:text-white">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-4">
            {/* Avatar */}
            {profile?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt={profile.name}
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center font-bold text-2xl shrink-0"
                style={{ backgroundColor: "#E81C74" }}
              >
                {initials}
              </div>
            )}

            <div>
              {/* Editable name */}
              <div className="flex items-center gap-2 mb-1">
                {editingName ? (
                  <>
                    <input
                      ref={nameInputRef}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      className="text-2xl font-bold bg-white/20 rounded-lg px-2 py-1 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                    />
                    <button
                      onClick={saveName}
                      disabled={savingName}
                      className="text-xs bg-white text-[#E81C74] font-bold px-3 py-1 rounded-full disabled:opacity-50"
                    >
                      {savingName ? "..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="text-xs text-white/60 hover:text-white px-2 py-1"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {loading ? "Loading..." : profile?.name ?? "Student"}
                    </h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-white/60 hover:text-white transition-colors p-1"
                      title="Edit name"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              {profile?.email && (
                <p className="text-blue-100 text-sm">{profile.email}</p>
              )}
              <p className="text-blue-200 text-xs mt-1">
                Member since {profile?.joinDate ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        {loading ? (
          <SkeletonProfile />
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Learning Stats
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#E81C74]">
                    {profile?.enrolledCourses ?? 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Enrolled Courses
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#1E40AF]">
                    {profile?.completedLessons ?? 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Lessons Completed
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#6B21A8]">
                    {profile?.city ?? "—"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">City</div>
                </div>
              </div>
            </div>

            {/* My Account */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                My Account
              </h2>
              <div className="space-y-2">
                {[
                  {
                    href: "/progress",
                    icon: "📊",
                    label: "My Progress",
                    desc: "Track your learning journey",
                  },
                  {
                    href: "/profile/bookings",
                    icon: "📅",
                    label: "My Bookings",
                    desc: "View and manage consultations",
                  },
                  {
                    href: "/profile/notifications",
                    icon: "🔔",
                    label: "Notifications",
                    desc: "Manage notification preferences",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                    <span className="text-gray-300 group-hover:text-[#E81C74] transition-colors text-lg">
                      ›
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-medium py-3 rounded-2xl transition-colors text-sm"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </main>
  );
}
