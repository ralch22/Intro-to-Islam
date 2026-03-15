import Link from "next/link";

const upcomingSessions = [
  {
    id: "s1",
    status: "live-soon",
    label: "Live in 2 hours",
    course: "Foundation Course",
    courseColor: "bg-blue-50 text-[#1E40AF]",
    title: "Module 1 Q&A: Understanding Core Beliefs",
    instructor: "Ustadh Ahmed",
    time: "Today, 7:00 PM – 8:30 PM (AEST)",
    countdown: "01:59:45",
    description: "Bring your questions from Module 1. We will be discussing the six articles of faith in detail and their practical implications in our daily lives.",
    zoomUrl: "#",
  },
  {
    id: "s2",
    status: "upcoming",
    label: "Upcoming",
    course: "Tajweed 101",
    courseColor: "bg-purple-50 text-[#6B21A8]",
    title: "Makharij: Points of Articulation",
    instructor: "Sheikh Bilal",
    time: "Thu, Oct 24 • 6:00 PM (AEST)",
    description: "Interactive practice session focusing on the correct pronunciation of heavy letters. Please ensure your microphone is working.",
    zoomUrl: null,
  },
  {
    id: "s3",
    status: "upcoming",
    label: "Upcoming",
    course: "Foundation Course",
    courseColor: "bg-blue-50 text-[#1E40AF]",
    title: "Module 2 Introduction: The Five Pillars",
    instructor: "Ustadh Ahmed",
    time: "Mon, Oct 28 • 7:00 PM (AEST)",
    description: "",
    zoomUrl: null,
  },
];

const pastSessions = [
  { id: "p1", date: "Oct 15, 2026", title: "Intro to Islamic History", description: "Overview of the prophetic era and early caliphates. Includes student Q&A." },
  { id: "p2", date: "Oct 10, 2026", title: "Foundation: What is Islam?", description: "First module discussion covering the basic definitions and concepts." },
];

const calendarDays = [
  { day: 21, today: true, dot: null },
  { day: 22, today: false, dot: null },
  { day: 23, today: false, dot: null },
  { day: 24, today: false, dot: "purple" },
  { day: 25, today: false, dot: null },
  { day: 26, today: false, dot: null },
  { day: 27, today: false, dot: null },
  { day: 28, today: false, dot: "blue" },
];

export default function SchedulePage() {
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
                <button className="text-sm font-medium text-[#E81C74] hover:text-pink-700">View All</button>
              </div>

              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`bg-white rounded-xl shadow-sm border-y border-r border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                      session.status === "live-soon" ? "border-l-4 border-l-[#E81C74]" : "border"
                    }`}
                  >
                    <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                            session.status === "live-soon" ? "bg-pink-100 text-[#E81C74]" : "bg-gray-100 text-gray-600"
                          }`}>
                            {session.label}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${session.courseColor}`}>
                            {session.course}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{session.title}</h3>
                        <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mb-4">
                          <span>👤 {session.instructor}</span>
                          <span>🕐 {session.time}</span>
                        </div>
                        {session.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">{session.description}</p>
                        )}
                      </div>

                      <div className="flex flex-col justify-center gap-3 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                        {session.status === "live-soon" && (
                          <div className="text-center mb-2">
                            <span className="block text-2xl font-bold text-[#E81C74] font-mono">{session.countdown}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Until Live</span>
                          </div>
                        )}
                        {session.zoomUrl ? (
                          <a href={session.zoomUrl} className="w-full bg-[#E81C74] hover:bg-pink-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex justify-center items-center gap-2 shadow-sm">
                            📹 Join Zoom
                          </a>
                        ) : (
                          <button disabled className="w-full bg-gray-100 text-gray-400 font-medium py-2.5 rounded-lg text-sm flex justify-center items-center gap-2 cursor-not-allowed">
                            📹 Join Zoom
                          </button>
                        )}
                        <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition-colors text-xs flex justify-center items-center gap-2">
                          📅 Add to Calendar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <label className="block text-xs font-medium text-gray-500 mb-2">By Course</label>
                  <div className="space-y-2">
                    {["Foundation Course", "Tajweed 101", "Islamic History"].map((course) => (
                      <label key={course} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked={course !== "Islamic History"} className="rounded h-4 w-4 border-gray-300" style={{ accentColor: "#E81C74" }} />
                        <span className="text-sm text-gray-700">{course}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 mb-2">By Instructor</label>
                  <select className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#E81C74]">
                    <option>All Instructors</option>
                    <option>Ustadh Ahmed</option>
                    <option>Sheikh Bilal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mini calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <button className="text-gray-400 hover:text-gray-600">‹</button>
                <h3 className="font-bold text-gray-900 text-sm">October 2026</h3>
                <button className="text-gray-400 hover:text-gray-600">›</button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                    <div key={d} className="text-xs font-medium text-gray-400">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {calendarDays.map((d) => (
                    <div key={d.day} className={`py-1 relative rounded cursor-pointer ${
                      d.today ? "bg-[#E81C74] text-white font-bold shadow-sm" : "text-gray-700 hover:bg-gray-100"
                    }`}>
                      {d.day}
                      {d.dot && (
                        <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                          d.dot === "blue" ? "bg-[#1E40AF]" : "bg-[#6B21A8]"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E81C74] inline-block" /> Today</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1E40AF] inline-block" /> Foundation</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6B21A8] inline-block" /> Tajweed</span>
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
          </div>
        </div>
      </div>
    </main>
  );
}
