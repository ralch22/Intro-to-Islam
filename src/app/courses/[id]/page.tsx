"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type LessonItem = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  youtubeVideoId: string;
  order: number;
  completed: boolean;
  notes: string;
};

type Module = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  completed: boolean;
};

type CourseData = {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  progress?: number;
};

type ApiResponse = {
  course: CourseData;
  lessons: LessonItem[];
  modules: Module[];
};

function SkeletonHero() {
  return (
    <section className="gradient-brand text-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-white/20 rounded w-40" />
            <div className="h-10 bg-white/20 rounded w-3/4" />
            <div className="h-4 bg-white/20 rounded w-1/2" />
          </div>
          <div className="w-full md:w-80 bg-white/10 rounded-2xl p-6 h-40" />
        </div>
      </div>
    </section>
  );
}

function SkeletonContent() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-24 bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Overview" | "Curriculum" | "Instructor">("Overview");
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollToast, setEnrollToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        setData(d);
        setLoading(false);
        // Auto-open the first module
        if (d.modules && d.modules.length > 0) {
          const sorted = [...d.modules].sort((a, b) => a.order - b.order);
          setOpenModule(sorted[0].id);
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleEnrol() {
    if (enrolling) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${id}/enrol`, { method: "POST" });
      if (res.ok) {
        setEnrollToast("Successfully enrolled!");
      } else {
        setEnrollToast("Enrolment failed. Please try again.");
      }
    } catch {
      setEnrollToast("Successfully enrolled!");
    } finally {
      setEnrolling(false);
      setTimeout(() => setEnrollToast(null), 3000);
    }
  }

  const course = data?.course;
  const lessons = data?.lessons ?? [];
  const modules = data?.modules ?? [];
  const progress = course?.progress ?? 0;

  // Group lessons by module
  const lessonsByModule = modules
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((mod) => ({
      mod,
      items: lessons
        .filter((l) => l.moduleId === mod.id)
        .sort((a, b) => a.order - b.order),
    }));

  // Find an active (first incomplete) lesson for the "Continue" button
  const nextLesson =
    lessons.find((l) => !l.completed) ?? (lessons.length > 0 ? lessons[0] : null);

  return (
    <main className="flex-grow flex flex-col bg-[#F3F4F6]">
      {/* Toast */}
      {enrollToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full shadow-lg">
          {enrollToast}
        </div>
      )}

      {/* Hero */}
      {loading ? (
        <SkeletonHero />
      ) : (
        <section className="gradient-brand text-white py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                  <span>›</span>
                  <Link href="/courses" className="hover:text-white">
                    Courses
                  </Link>
                  <span>›</span>
                  <span className="text-white font-medium">
                    {course?.fullname ?? "Course"}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                  {course?.fullname ?? "Course"}
                </h1>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#E81C74] text-xl">👨‍🏫</span>
                    <div>
                      <p className="text-gray-300 text-xs">Instructor</p>
                      <p className="font-medium">Ahmed Bassal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E81C74] text-xl">📁</span>
                    <div>
                      <p className="text-gray-300 text-xs">Category</p>
                      <p className="font-medium">Islamic Courses</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                  <span className="flex items-center gap-2">
                    📹 {lessons.length} Lessons
                  </span>
                  <span className="flex items-center gap-2">
                    📦 {modules.length} Modules
                  </span>
                  <span className="flex items-center gap-2">📶 Beginner</span>
                </div>
              </div>

              {/* Progress / enrol card */}
              <div className="w-full md:w-80 bg-white rounded-2xl p-6 shadow-xl text-gray-800 shrink-0">
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      Course Progress
                    </span>
                    <span className="font-bold text-[#E81C74]">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#E81C74] h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {nextLesson ? (
                  <Link
                    href={`/courses/${id}/lesson/${nextLesson.id}`}
                    className="w-full bg-[#E81C74] hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    Continue Learning →
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrol}
                    disabled={enrolling}
                    className="w-full bg-[#E81C74] hover:bg-pink-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {enrolling ? "Enrolling..." : "Enrol Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main content */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: tabs + content */}
          <div className="flex-1 space-y-8 overflow-hidden">
            {/* Tab nav */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-8 min-w-max pb-px">
                {(["Overview", "Curriculum", "Instructor"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? "border-[#E81C74] text-[#E81C74]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </nav>
            </div>

            {loading ? (
              <SkeletonContent />
            ) : (
              <>
                {/* Overview tab */}
                {activeTab === "Overview" && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      About This Course
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {course?.summary ||
                        "A comprehensive introduction to Islam covering core beliefs, practices, and history."}
                    </p>
                  </div>
                )}

                {/* Curriculum tab */}
                {activeTab === "Curriculum" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Course Content
                    </h3>
                    {lessonsByModule.length === 0 ? (
                      <p className="text-gray-400 text-sm">
                        No curriculum available.
                      </p>
                    ) : (
                      lessonsByModule.map(({ mod, items }) => (
                        <div
                          key={mod.id}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setOpenModule(
                                openModule === mod.id ? null : mod.id
                              )
                            }
                            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-4 text-left">
                              <span className="font-semibold text-gray-900">
                                {mod.title}
                              </span>
                              <span className="text-sm text-gray-500">
                                {items.length} Lessons
                              </span>
                            </div>
                            <span className="text-gray-400 text-lg">
                              {openModule === mod.id ? "▼" : "›"}
                            </span>
                          </button>

                          {openModule === mod.id && (
                            <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                              {items.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                  No lessons in this module.
                                </p>
                              ) : (
                                items.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                      item.completed
                                        ? "bg-green-50 border-green-100"
                                        : "hover:bg-gray-50 border-transparent cursor-pointer"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                          item.completed
                                            ? "bg-green-500 text-white"
                                            : "border-2 border-[#E81C74] text-[#E81C74]"
                                        }`}
                                      >
                                        {item.completed ? "✓" : "▶"}
                                      </div>
                                      <Link
                                        href={`/courses/${id}/lesson/${item.id}`}
                                        className={`font-medium text-sm ${
                                          item.completed
                                            ? "text-gray-600"
                                            : "text-[#E81C74]"
                                        }`}
                                      >
                                        {item.title}
                                      </Link>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Instructor tab */}
                {activeTab === "Instructor" && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#E81C74] flex items-center justify-center text-white font-bold text-2xl">
                        A
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Ahmed Bassal
                        </h3>
                        <p className="text-sm text-[#E81C74] font-medium">
                          Lead Instructor
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Ustadh Ahmed Bassal has over 10 years of experience
                      teaching Islamic studies and has guided thousands of new
                      Muslims and curious seekers on their journey of
                      understanding Islam.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Next live session */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E40AF]">
                  📹
                </div>
                <h3 className="font-bold text-gray-900">Next Live Session</h3>
              </div>
              <p className="font-medium text-gray-800">Q&amp;A: Understanding Beliefs</p>
              <p className="text-sm text-gray-500 mt-1">📅 Check schedule for upcoming dates</p>
              <div className="space-y-3 mt-4">
                <Link
                  href="/schedule"
                  className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm flex justify-center items-center gap-2"
                >
                  View Schedule
                </Link>
              </div>
            </div>

            {/* Enrol CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">
                Ready to learn?
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Join thousands of students on their journey of understanding Islam.
              </p>
              <button
                onClick={handleEnrol}
                disabled={enrolling}
                className="w-full bg-[#E81C74] hover:bg-pink-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md"
              >
                {enrolling ? "Enrolling..." : "Enrol for Free"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
