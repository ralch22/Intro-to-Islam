"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DonationNudge } from "@/components/dashboard/DonationNudge";

type Course = {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  progress: number;
};

type Meeting = {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  cohort: string;
  participants: number;
};

type DashboardData = {
  courses: Course[];
  nextMeeting: Meeting | null;
};

type ActivityItem = {
  id: string;
  type: string;
  description: string;
  courseId?: string;
  timestamp: string;
};

const communityActivity = [
  { user: "Sarah M.", action: "asked a question in", channel: "Foundation Course Q&A", ago: "2 hours ago" },
  { user: "Omar K.", action: "shared a resource in", channel: "General Discussion", ago: "5 hours ago" },
];

const FALLBACK_MODULE_TITLE = "Module 2: Core Beliefs";
const NEXT_LESSON_ID = "2-1";

function formatMeetingDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-AU", { day: "numeric" }),
    month: d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString("en-AU", { weekday: "long" }),
    time: d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }),
  };
}

function ProgressRing({ progress }: { progress: number }) {
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="stroke-gray-200" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" />
        <circle
          strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
          stroke="#E81C74"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (251.2 * progress) / 100}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.35s" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-800">{progress}%</span>
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="w-full max-w-md lg:max-w-[450px] glass-card rounded-2xl p-5 md:p-8 text-gray-800 animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
      </div>
      <div className="h-11 bg-gray-200 rounded-full mt-6" />
    </div>
  );
}

function MeetingCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-blue-50/50 rounded-xl p-6 border border-blue-100 animate-pulse">
      <div className="bg-white p-4 rounded-xl shadow-sm text-center min-w-[100px] border border-gray-100 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-8 mx-auto" />
        <div className="h-8 bg-gray-200 rounded w-10 mx-auto" />
        <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return "Just now";
}

const ACTIVITY_ICONS: Record<string, string> = {
  lesson_complete: "✓",
  class_attended: "📹",
  enrolled: "🎓",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/dashboard/activity")
      .then((r) => r.json())
      .then((items: ActivityItem[]) => setActivity(items))
      .catch(() => {});
  }, []);

  const currentCourse = data?.courses?.[0];
  const nextMeeting = data?.nextMeeting;
  const meetingDate = nextMeeting ? formatMeetingDate(nextMeeting.start_time) : null;

  // Static modules list (uses real course id from API when available)
  const courseIdStr = currentCourse ? String(currentCourse.id) : "2";
  const modules = [
    { id: "1", title: "Module 1: Introduction", status: "completed", note: "Completed" },
    { id: "2", title: "Module 2: Core Beliefs", status: "active", note: `In Progress • ${currentCourse?.progress ?? 75}%` },
    { id: "3", title: "Module 3: Daily Practices", status: "locked", note: "Complete Module 2 to unlock" },
  ];

  return (
    <main>
      {/* Hero */}
      <header className="gradient-brand text-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white rounded-full" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-[#E81C74] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                Welcome back!
              </h1>
              <p className="text-base md:text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0">
                You&apos;re making great progress on your journey. Ready to continue learning?
              </p>
            </div>

            {/* Course progress card */}
            {loading ? (
              <CourseCardSkeleton />
            ) : currentCourse ? (
              <div className="w-full max-w-md lg:max-w-[450px] glass-card rounded-2xl p-5 md:p-8 text-gray-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-semibold text-[#E81C74] uppercase tracking-wider mb-1 block">
                      Current Course
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{currentCourse.fullname}</h3>
                    <p className="text-sm text-gray-500 mt-1">{FALLBACK_MODULE_TITLE}</p>
                  </div>
                  <ProgressRing progress={currentCourse.progress} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-[#1E40AF]">▶</span>
                    <span>Next: <strong className="text-gray-900">Understanding Tawheed</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-[#1E40AF]">🕐</span>
                    <span>Est. time: 15 mins</span>
                  </div>
                </div>

                <Link
                  href={`/courses/${currentCourse.id}/lesson/${NEXT_LESSON_ID}`}
                  className="w-full bg-[#E81C74] hover:bg-pink-600 text-white font-medium py-4 px-4 rounded-full transition-colors flex justify-center items-center gap-2 shadow-lg"
                >
                  Continue Lesson →
                </Link>
              </div>
            ) : (
              <div className="w-full max-w-md lg:max-w-[450px] glass-card rounded-2xl p-5 md:p-8 text-gray-800">
                <p className="text-gray-600 text-center">No courses enrolled yet.</p>
                <Link href="/courses" className="mt-4 w-full bg-[#E81C74] text-white font-medium py-4 rounded-full flex justify-center">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Upcoming class */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Live Session</h2>
                <Link href="/schedule" className="text-[#1E40AF] hover:text-blue-800 text-sm font-medium">
                  View Schedule →
                </Link>
              </div>

              {loading ? (
                <MeetingCardSkeleton />
              ) : nextMeeting && meetingDate ? (
                <div className="flex flex-col md:flex-row items-center gap-6 bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                  <div className="bg-white p-4 rounded-xl shadow-sm text-center min-w-[100px] border border-gray-100">
                    <span className="block text-sm font-semibold text-[#E81C74] uppercase">{meetingDate.month}</span>
                    <span className="block text-3xl font-bold text-gray-900">{meetingDate.day}</span>
                    <span className="block text-xs text-gray-500 mt-1">{meetingDate.weekday}</span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#1E40AF] text-xs font-semibold">
                        📹 Live Zoom
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        {nextMeeting.cohort}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{nextMeeting.topic}</h3>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                      <span>🕐 {meetingDate.time}</span>
                      <span>👥 {nextMeeting.participants} Enrolled</span>
                      <span>⏱ {nextMeeting.duration} min</span>
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    <a
                      href={nextMeeting.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full md:w-auto text-center bg-[#1E40AF] hover:bg-blue-800 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-lg"
                    >
                      Join Session
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 text-center text-gray-500">
                  No upcoming sessions scheduled. <Link href="/schedule" className="text-[#1E40AF] hover:underline">Check back soon.</Link>
                </div>
              )}
            </section>

            {/* Recent Activity Feed */}
            {activity.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${
                        item.type === "lesson_complete"
                          ? "bg-green-100 text-green-600"
                          : item.type === "class_attended"
                          ? "bg-blue-100 text-[#1E40AF]"
                          : "bg-pink-100 text-[#E81C74]"
                      }`}>
                        {ACTIVITY_ICONS[item.type] ?? "•"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Modules */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Modules</h2>
              <div className="space-y-4">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      mod.status === "active"
                        ? "border-2 border-[#E81C74]/20 bg-pink-50/30 shadow-sm"
                        : mod.status === "completed"
                        ? "border border-gray-100 hover:border-[#E81C74]/30 hover:shadow-md bg-gray-50/50"
                        : "border border-gray-100 bg-gray-50 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                        mod.status === "completed" ? "bg-green-100 text-green-600"
                        : mod.status === "active" ? "bg-[#E81C74] text-white"
                        : "bg-gray-200 text-gray-400"
                      }`}>
                        {mod.status === "completed" ? "✓" : mod.status === "active" ? "▶" : "🔒"}
                      </div>
                      <div>
                        <h4 className={`font-bold ${mod.status === "locked" ? "text-gray-500" : "text-gray-900"}`}>
                          {mod.title}
                        </h4>
                        <p className={`text-sm ${
                          mod.status === "completed" ? "text-gray-500"
                          : mod.status === "active" ? "text-[#E81C74] font-medium"
                          : "text-gray-400"
                        }`}>{mod.note}</p>
                      </div>
                    </div>
                    {mod.status !== "locked" && (
                      <Link href={`/courses/${courseIdStr}`} className="text-gray-400 hover:text-[#E81C74] p-2 text-lg">
                        →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:space-y-8">

            {/* Donation nudge (dismissible) */}
            <DonationNudge />

            {/* Donation card */}
            <section className="rounded-2xl p-[2px]" style={{ background: "linear-gradient(135deg, #1E40AF 0%, #6B21A8 100%)" }}>
              <div className="bg-white rounded-xl p-5 md:p-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">🤲</div>
                  <h3 className="text-xl font-bold text-gray-900">Support Our Mission</h3>
                  <p className="text-sm text-gray-500 mt-2">Help us keep these courses free and accessible to everyone.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["$10", "$25", "$50"].map((amt, i) => (
                    <button key={amt} className={`py-2 px-1 border rounded-lg text-sm font-medium transition-colors ${
                      i === 1 ? "border-2 border-[#E81C74] bg-pink-50 text-[#E81C74] font-bold" : "border-gray-200 text-gray-700 hover:border-[#E81C74]"
                    }`}>{amt}</button>
                  ))}
                </div>
                <div className="relative mb-6">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">$</span>
                  <input type="number" className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E81C74]" placeholder="Custom Amount" />
                </div>
                <button className="w-full bg-[#E81C74] hover:bg-pink-600 text-white font-bold py-3 rounded-full transition-colors shadow-md">
                  Donate Now
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">Secure payment via Stripe</p>
              </div>
            </section>

            {/* Community snippet */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Community Hub</h3>
                <Link href="/community" className="text-[#1E40AF] text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {communityActivity.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600 shrink-0">
                      {item.user[0]}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{item.user}</span> {item.action}{" "}
                        <Link href="/community" className="text-[#1E40AF] hover:underline">{item.channel}</Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.ago}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
