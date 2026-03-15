import Link from "next/link";

const currentCourse = {
  id: "1",
  title: "Foundation Course",
  module: "Module 2: Core Beliefs",
  progress: 75,
  nextLesson: "Understanding Tawheed",
  nextLessonId: "2-1",
  estTime: "15 mins",
};

const modules = [
  { id: "1", title: "Module 1: Introduction", status: "completed", note: "Completed on Oct 15" },
  { id: "2", title: "Module 2: Core Beliefs", status: "active", note: "In Progress • 75%" },
  { id: "3", title: "Module 3: Daily Practices", status: "locked", note: "Complete Module 2 to unlock" },
];

const communityActivity = [
  { user: "Sarah M.", action: "asked a question in", channel: "Foundation Course Q&A", ago: "2 hours ago" },
  { user: "Omar K.", action: "shared a resource in", channel: "General Discussion", ago: "5 hours ago" },
];

export default function DashboardPage() {
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
                Welcome back, Ahmed!
              </h1>
              <p className="text-base md:text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0">
                You&apos;re making great progress on your journey. Ready to continue learning?
              </p>
            </div>

            {/* Course progress card */}
            <div className="w-full max-w-md lg:max-w-[450px] glass-card rounded-2xl p-5 md:p-8 text-gray-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-semibold text-[#E81C74] uppercase tracking-wider mb-1 block">
                    Current Course
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{currentCourse.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{currentCourse.module}</p>
                </div>
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="stroke-gray-200" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" />
                    <circle
                      strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
                      stroke="#E81C74"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * currentCourse.progress) / 100}
                      style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.35s" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-800">{currentCourse.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-[#1E40AF]">▶</span>
                  <span>Next: <strong className="text-gray-900">{currentCourse.nextLesson}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-[#1E40AF]">🕐</span>
                  <span>Est. time: {currentCourse.estTime}</span>
                </div>
              </div>

              <Link
                href={`/courses/${currentCourse.id}/lesson/${currentCourse.nextLessonId}`}
                className="w-full bg-[#E81C74] hover:bg-pink-600 text-white font-medium py-4 px-4 rounded-full transition-colors flex justify-center items-center gap-2 shadow-lg"
              >
                Continue Lesson →
              </Link>
            </div>
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

              <div className="flex flex-col md:flex-row items-center gap-6 bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <div className="bg-white p-4 rounded-xl shadow-sm text-center min-w-[100px] border border-gray-100">
                  <span className="block text-sm font-semibold text-[#E81C74] uppercase">Oct</span>
                  <span className="block text-3xl font-bold text-gray-900">24</span>
                  <span className="block text-xs text-gray-500 mt-1">Thursday</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#1E40AF] text-xs font-semibold mb-2">
                    📹 Live Zoom
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Weekly Q&amp;A with Sheikh Ahmed</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Join us for an interactive session where we discuss this week&apos;s topics and answer your questions live.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                    <span>🕐 7:00 PM AEST</span>
                    <span>👥 45 Enrolled</span>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <Link
                    href="/schedule"
                    className="block w-full md:w-auto text-center bg-[#1E40AF] hover:bg-blue-800 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-lg"
                  >
                    Join Session
                  </Link>
                </div>
              </div>
            </section>

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
                      <Link href={`/courses/${currentCourse.id}`} className="text-gray-400 hover:text-[#E81C74] p-2 text-lg">
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
