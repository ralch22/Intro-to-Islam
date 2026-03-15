"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type ZoomMeeting = {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  cohort: string;
  participants: number;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

function getCountdown(start: string): { label: string; isLive: boolean; canJoin: boolean } {
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const diffMs = startMs - now;
  const thirtyMin = 30 * 60 * 1000;

  if (diffMs <= 0) {
    return { label: "Live Now", isLive: true, canJoin: true };
  }
  if (diffMs <= thirtyMin) {
    const mins = Math.ceil(diffMs / 60000);
    return { label: `Starting in ${mins} min`, isLive: false, canJoin: true };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return { label: `Starts in ${days}d ${hours}h`, isLive: false, canJoin: false };
  if (hours > 0) return { label: `Starts in ${hours}h ${mins}m`, isLive: false, canJoin: false };
  return { label: `Starts in ${mins} min`, isLive: false, canJoin: false };
}

function cohortColor(cohort: string) {
  switch (cohort) {
    case "Sydney": return "bg-blue-100 text-[#1E40AF]";
    case "Melbourne": return "bg-purple-100 text-purple-800";
    case "Adelaide": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-700";
  }
}

function MeetingCard({ meeting }: { meeting: ZoomMeeting }) {
  const [countdown, setCountdown] = useState(() => getCountdown(meeting.start_time));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(meeting.start_time));
    }, 30000);
    return () => clearInterval(interval);
  }, [meeting.start_time]);

  const day = new Date(meeting.start_time).toLocaleDateString("en-AU", { day: "numeric" });
  const month = new Date(meeting.start_time).toLocaleDateString("en-AU", { month: "short" }).toUpperCase();
  const weekday = new Date(meeting.start_time).toLocaleDateString("en-AU", { weekday: "short" });

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-y border-r border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
        countdown.isLive ? "border-l-4 border-l-[#E81C74]" : "border"
      }`}
    >
      <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6">

        {/* Date block */}
        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:w-20 shrink-0">
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 text-center min-w-[72px]">
            <span className="block text-xs font-semibold text-[#E81C74] uppercase">{month}</span>
            <span className="block text-2xl font-bold text-gray-900">{day}</span>
            <span className="block text-xs text-gray-500">{weekday}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {countdown.isLive && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-pink-100 text-[#E81C74] animate-pulse">
                Live Now
              </span>
            )}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cohortColor(meeting.cohort)}`}>
              {meeting.cohort}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{meeting.topic}</h3>
          <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mb-2">
            <span>🕐 {formatTime(meeting.start_time)}</span>
            <span>⏱ {meeting.duration} min</span>
            <span>👥 {meeting.participants} enrolled</span>
          </div>
          <p className="text-sm text-gray-500">{formatDate(meeting.start_time)}</p>
        </div>

        {/* CTA */}
        <div className="flex flex-col justify-center gap-3 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          <div className="text-center mb-1">
            <span className={`block text-sm font-bold font-mono ${countdown.isLive ? "text-[#E81C74]" : "text-gray-600"}`}>
              {countdown.label}
            </span>
          </div>
          {countdown.canJoin ? (
            <a
              href={meeting.join_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex justify-center items-center gap-2 shadow-sm"
            >
              📹 Join Session
            </a>
          ) : (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 font-medium py-2.5 rounded-lg text-sm flex justify-center items-center gap-2 cursor-not-allowed"
            >
              📹 Join Session
            </button>
          )}
          <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition-colors text-xs flex justify-center items-center gap-2">
            📅 Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 animate-pulse">
      <div className="flex gap-6">
        <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="w-40 space-y-3 hidden md:block">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-9 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const pastSessions = [
  { id: "p1", date: "Oct 15, 2026", title: "Intro to Islamic History", description: "Overview of the prophetic era and early caliphates. Includes student Q&A." },
  { id: "p2", date: "Oct 10, 2026", title: "Foundation: What is Islam?", description: "First module discussion covering the basic definitions and concepts." },
];

export default function SchedulePage() {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data) => {
        setMeetings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load schedule.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex-grow flex flex-col bg-gradient-to-b from-gray-50 to-[#F3F4F6]">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Live Class Schedule</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Join upcoming live Zoom sessions for your enrolled courses.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select className="w-full sm:w-48 appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E81C74] text-sm">
              <option>Local Timezone</option>
              <option>AEST (Sydney)</option>
              <option>EST (New York)</option>
              <option>PST (Los Angeles)</option>
              <option>GMT (London)</option>
              <option>GST (Dubai)</option>
            </select>

            <div className="flex w-full sm:w-auto bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button className="flex-1 sm:flex-none px-6 py-1.5 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
                ☰ List
              </button>
              <button className="flex-1 sm:flex-none px-6 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900">
                📅 Calendar
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: sessions */}
          <div className="flex-1 space-y-8 w-full">

            {/* Upcoming */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
                    {error}
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
                    No upcoming sessions scheduled.
                  </div>
                ) : (
                  meetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))
                )}
              </div>
            </section>

            {/* Past sessions */}
            <section className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-900">Past Sessions Archive</h2>
                <div className="relative w-full sm:w-auto">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input type="text" placeholder="Search recordings..." className="w-full sm:w-64 pl-9 pr-4 py-1.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-[#E81C74]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 mb-1 block">{session.date}</span>
                        <h4 className="font-bold text-gray-900 text-sm">{session.title}</h4>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Recorded</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{session.description}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-1.5 rounded text-xs font-medium flex justify-center items-center gap-1.5 transition-colors">
                        ▶ Watch
                      </button>
                      <button className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-1.5 rounded text-xs font-medium flex justify-center items-center gap-1.5 transition-colors">
                        📄 Notes
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="text-sm font-medium text-gray-600 hover:text-[#E81C74]">Load more recordings ▼</button>
              </div>
            </section>
          </div>

          {/* Right: sidebar */}
          <div className="w-full lg:w-80 space-y-6">

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Filter Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">By Cohort</label>
                  <div className="space-y-2">
                    {["Online", "Sydney", "Melbourne", "Adelaide"].map((cohort) => (
                      <label key={cohort} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded h-4 w-4 border-gray-300" style={{ accentColor: "#E81C74" }} />
                        <span className="text-sm text-gray-700">{cohort}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tech support */}
            <div className="bg-gradient-to-br from-[#1F2937] to-gray-800 rounded-xl p-5 text-white shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">🎧</div>
                <h4 className="font-bold">Need Tech Support?</h4>
              </div>
              <p className="text-sm text-gray-300 mb-4">Having trouble joining a Zoom session or finding your recordings?</p>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 rounded-lg transition-colors text-sm">
                Contact Support
              </button>
            </div>

            {/* Back to dashboard */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:border-[#E81C74] text-gray-700 hover:text-[#E81C74] font-medium py-3 rounded-xl transition-colors text-sm shadow-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
