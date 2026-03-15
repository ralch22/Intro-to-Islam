import Link from "next/link";

// Mock — replace with Moodle REST API
const course = {
  id: "1",
  title: "Foundation Course",
  description: "If you're just starting your journey, this is the first course you should do. For over 10 years, this \"Foundation Course\" is the way we introduce the basic concepts of Islamic teachings to anyone curious about the faith, or anyone who has recently accepted the beliefs. It's a good \"Table of contents\" to the topics we will cover in more detail in future courses and in the textbook \"The New Follower Guide.\" There's no pre-requisite knowledge for this course, get started!",
  instructor: "Ahmed Bassal",
  category: "Islamic Courses",
  hours: "12 Hours",
  level: "Beginner",
  lessons: 24,
  students: 325,
  progress: 75,
  modules: [
    {
      id: "m1",
      title: "Module 1: Introduction to Beliefs",
      lessons: 4,
      hours: "2 Hours",
      open: true,
      items: [
        { id: "1-1", title: "1.1 What is Islam?", duration: "30:00", status: "completed" },
        { id: "1-2", title: "1.2 The Five Pillars", duration: "45:00", status: "completed" },
        { id: "1-3", title: "1.3 Articles of Faith", duration: "40:00", status: "active" },
        { id: "1-4", title: "1.4 Quiz: Module 1", duration: "15:00", status: "locked" },
      ],
    },
    {
      id: "m2",
      title: "Module 2: Daily Practices",
      lessons: 5,
      hours: "3 Hours",
      open: false,
      items: [],
    },
    {
      id: "m3",
      title: "Module 3: Character & Ethics",
      lessons: 3,
      hours: "1.5 Hours",
      open: false,
      items: [],
    },
  ],
};

export default function CourseDetailsPage() {
  return (
    <main className="flex-grow flex flex-col bg-[#F3F4F6]">

      {/* Hero */}
      <section className="gradient-brand text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <Link href="/" className="hover:text-white">Home</Link>
                <span>›</span>
                <Link href="/courses" className="hover:text-white">Courses</Link>
                <span>›</span>
                <span className="text-white font-medium">{course.title}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Your First Course – {course.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E81C74] flex items-center justify-center text-white font-bold text-xs border-2 border-white/20">
                    {course.instructor[0]}
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">Instructor</p>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#E81C74] text-xl">📁</span>
                  <div>
                    <p className="text-gray-300 text-xs">Category</p>
                    <p className="font-medium">{course.category}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                <span className="flex items-center gap-2">🕐 {course.hours}</span>
                <span className="flex items-center gap-2">📶 {course.level}</span>
                <span className="flex items-center gap-2">📹 {course.lessons} Lessons</span>
                <span className="flex items-center gap-2">👥 {course.students} Students</span>
              </div>
            </div>

            {/* Progress / enrol card */}
            <div className="w-full md:w-80 bg-white rounded-2xl p-6 shadow-xl text-gray-800 shrink-0">
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Course Progress</span>
                  <span className="font-bold text-[#E81C74]">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#E81C74] h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
              <Link
                href={`/courses/${course.id}/lesson/1-3`}
                className="w-full bg-[#E81C74] hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Continue Learning →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: tabs + accordion */}
          <div className="flex-1 space-y-8 overflow-hidden">

            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-8 min-w-max pb-px">
                {["Overview", "Curriculum", "Instructor"].map((tab, i) => (
                  <button key={tab} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    i === 0 ? "border-[#E81C74] text-[#E81C74]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview */}
            <p className="text-gray-600 text-base leading-relaxed">{course.description}</p>

            {/* Curriculum */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Course Content</h3>

              {course.modules.map((mod) => (
                <div key={mod.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4 text-left">
                      <span className="font-semibold text-gray-900">{mod.title}</span>
                      <span className="text-sm text-gray-500">{mod.lessons} Lessons • {mod.hours}</span>
                    </div>
                    <span className="text-gray-400">{mod.open ? "▼" : "›"}</span>
                  </button>

                  {mod.open && mod.items.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                      {mod.items.map((item) => (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                          item.status === "completed" ? "bg-green-50 border-green-100"
                          : item.status === "active" ? "hover:bg-gray-50 border-transparent cursor-pointer"
                          : "bg-gray-50 border-transparent opacity-60"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              item.status === "completed" ? "bg-green-500 text-white"
                              : item.status === "active" ? "border-2 border-[#E81C74] text-[#E81C74]"
                              : "border border-gray-300 text-gray-400"
                            }`}>
                              {item.status === "completed" ? "✓" : item.status === "active" ? "▶" : "🔒"}
                            </div>
                            {item.status === "locked" ? (
                              <span className="text-gray-500 font-medium">{item.title}</span>
                            ) : (
                              <Link href={`/courses/${course.id}/lesson/${item.id}`} className={`font-medium ${item.status === "active" ? "text-[#E81C74]" : "text-gray-700"}`}>
                                {item.title}
                              </Link>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{item.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resources */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📥 Downloadable Resources</h3>
              <ul className="space-y-3">
                {["Course Syllabus & Guide", "Reflection Worksheet"].map((res) => (
                  <li key={res} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-red-500">📄</span>
                      <span className="font-medium text-gray-700">{res}</span>
                    </div>
                    <button className="text-gray-500 hover:text-[#E81C74]">↓</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="w-full lg:w-80 space-y-6">

            {/* Next live session */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E40AF]">📹</div>
                <h3 className="font-bold text-gray-900">Next Live Session</h3>
              </div>
              <p className="font-medium text-gray-800">Q&amp;A: Understanding Beliefs</p>
              <p className="text-sm text-gray-500 mt-1">📅 Thursday, Oct 24, 2026</p>
              <p className="text-sm text-gray-500 mt-1">🕐 7:00 PM – 8:30 PM AEST</p>
              <div className="space-y-3 mt-4">
                <Link href="/schedule" className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm flex justify-center items-center gap-2">
                  Join Zoom Session
                </Link>
                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm flex justify-center items-center gap-2">
                  📅 Add to Calendar
                </button>
              </div>
            </div>

            {/* Donation */}
            <div className="gradient-magenta rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">🤲</div>
                <h3 className="font-bold">Support Free Education</h3>
              </div>
              <p className="text-sm text-white/90 mb-6">Your contribution helps us keep these essential courses free and accessible to everyone worldwide.</p>
              <button className="w-full bg-white text-[#E81C74] hover:bg-gray-50 font-bold py-3 px-4 rounded-xl transition-colors text-sm shadow-md">
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
