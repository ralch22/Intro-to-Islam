import Link from "next/link";

// Mock — replace with Moodle REST API + YouTube Data API
const lesson = {
  courseId: "1",
  courseTitle: "Foundation Course",
  lessonId: "1-3",
  title: "1.3 Articles of Faith",
  moduleTitle: "Module 1",
  progress: 75,
  youtubeVideoId: "dQw4w9WgXcQ", // replace with real video ID
  content: {
    heading: "Understanding the Core Beliefs",
    body: "In this lesson, we explore the fundamental articles of faith in Islam, known as Iman. These are the core beliefs that every Muslim must hold true in their heart.",
    points: [
      { label: "Belief in Allah", detail: "The absolute oneness of God." },
      { label: "Belief in the Angels", detail: "Beings created from light to execute God's commands." },
      { label: "Belief in the Divine Books", detail: "The revelations sent to various prophets." },
      { label: "Belief in the Prophets", detail: "The messengers chosen by God to guide humanity." },
      { label: "Belief in the Day of Judgment", detail: "The final assessment of deeds." },
      { label: "Belief in Divine Decree", detail: "Trusting in God's ultimate plan and knowledge." },
    ],
    reflection: "How do these articles of faith provide a comprehensive framework for understanding our purpose and relationship with the Creator?",
  },
  moduleContents: [
    { id: "1-1", title: "1.1 What is Islam?", status: "completed" },
    { id: "1-2", title: "1.2 The Five Pillars", status: "completed" },
    { id: "1-3", title: "1.3 Articles of Faith", status: "active" },
    { id: "1-4", title: "1.4 Quiz: Module 1", status: "locked" },
  ],
  resources: [
    { name: "Articles of Faith Summary", type: "PDF", size: "1.2 MB" },
    { name: "Audio Version", type: "MP3", size: "15 MB" },
  ],
  prevLesson: "1-2",
  nextLesson: "1-4",
};

export default function ActiveLessonPage() {
  return (
    <main className="flex-grow flex flex-col bg-gradient-to-b from-gray-50 to-[#F3F4F6]">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Breadcrumb & Progress */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex text-sm text-gray-500 mb-2">
              <Link href={`/courses/${lesson.courseId}`} className="flex items-center hover:text-[#E81C74] transition-colors">
                ← {lesson.courseTitle}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-gray-400">{lesson.moduleTitle}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lesson.title}</h1>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Course Progress</span>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div className="bg-[#E81C74] h-2.5 rounded-full" style={{ width: `${lesson.progress}%` }} />
            </div>
            <span className="text-sm font-bold text-[#E81C74]">{lesson.progress}%</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: lesson content */}
          <div className="flex-1 space-y-6">

            {/* Video + content card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Video embed */}
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50">
                <div className="video-container shadow-md">
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF]/40 to-[#6B21A8]/40" />
                    <div className="relative text-center text-white">
                      <p className="text-sm text-white/70 mb-4">YouTube video will embed here</p>
                      <p className="text-xs text-white/50 font-mono">Video ID: {lesson.youtubeVideoId}</p>
                      <button className="mt-4 w-16 h-16 bg-[#E81C74] text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-transform transform hover:scale-105 shadow-lg mx-auto">
                        <span className="text-xl ml-1">▶</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson text */}
              <div className="p-6 md:p-8 lg:p-10">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">{lesson.content.heading}</h2>
                <p className="text-gray-600 mb-6">{lesson.content.body}</p>

                <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">The Six Articles of Faith:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {lesson.content.points.map((point) => (
                    <li key={point.label}>
                      <strong>{point.label}:</strong> {point.detail}
                    </li>
                  ))}
                </ul>

                <div className="bg-blue-50 border-l-4 border-[#1E40AF] p-4 mt-6 rounded-r-lg">
                  <p className="text-sm text-[#1E40AF] m-0">
                    <strong>Reflection Point:</strong> {lesson.content.reflection}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <Link
                href={`/courses/${lesson.courseId}/lesson/${lesson.prevLesson}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                ← Previous Lesson
              </Link>

              <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#E81C74] text-white hover:bg-pink-600 font-bold shadow-md transition-colors flex items-center justify-center gap-2">
                ✓ Mark as Complete
              </button>

              <Link
                href={`/courses/${lesson.courseId}/lesson/${lesson.nextLesson}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 font-medium transition-colors flex items-center justify-center gap-2"
              >
                Next Lesson →
              </Link>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📝 My Notes
              </h3>
              <textarea
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E81C74] focus:border-[#E81C74] transition-shadow text-sm resize-none"
                placeholder="Take notes here... These are saved automatically to your profile."
              />
              <div className="mt-4 flex justify-end">
                <button className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-[#E81C74] hover:text-white rounded-full font-bold transition-all flex items-center gap-2">
                  💾 Save Note
                </button>
              </div>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="w-full lg:w-80 space-y-6">

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📥 Lesson Resources</h3>
              <ul className="space-y-3">
                {lesson.resources.map((res) => (
                  <li key={res.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className={res.type === "PDF" ? "text-red-500" : "text-[#6B21A8]"}>
                        {res.type === "PDF" ? "📄" : "🎵"}
                      </span>
                      <div>
                        <span className="block font-medium text-gray-700 text-sm">{res.name}</span>
                        <span className="text-xs text-gray-500">{res.type} • {res.size}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 group-hover:text-[#E81C74] transition-colors">↓</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live class banner */}
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#1E40AF] border-y border-r border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
              <div className="relative z-10">
                <span className="bg-[#1E40AF] text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Live Soon</span>
                <h4 className="font-bold text-gray-900 mt-3 mb-1">Q&amp;A: Understanding Beliefs</h4>
                <p className="text-sm text-gray-600 mb-4">📅 Tomorrow, 7:00 PM AEST</p>
                <Link href="/schedule" className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors text-sm flex justify-center items-center gap-2">
                  📹 Join Session
                </Link>
              </div>
            </div>

            {/* Module contents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">{lesson.moduleTitle} Contents</h3>
                <span className="text-xs font-medium text-gray-500">3/4 Completed</span>
              </div>
              <div className="divide-y divide-gray-100">
                {lesson.moduleContents.map((item) => (
                  item.status === "locked" ? (
                    <div key={item.id} className="block p-4 opacity-75">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center text-xs shrink-0">🔒</div>
                        <span className="text-gray-500 text-sm">{item.title}</span>
                      </div>
                    </div>
                  ) : item.id === lesson.lessonId ? (
                    <div key={item.id} className="block p-4 bg-pink-50/50 border-l-2 border-[#E81C74]">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-[#E81C74] text-[#E81C74] flex items-center justify-center text-xs shrink-0">▶</div>
                        <span className="text-[#E81C74] font-semibold text-sm">{item.title}</span>
                      </div>
                    </div>
                  ) : (
                    <Link key={item.id} href={`/courses/${lesson.courseId}/lesson/${item.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">✓</div>
                        <span className="text-gray-600 text-sm">{item.title}</span>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
