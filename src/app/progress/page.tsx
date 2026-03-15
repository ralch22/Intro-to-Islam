"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type CourseProgress = {
  courseId: number;
  title: string;
  total: number;
  completed: number;
  pct: number;
  lastActivity: string | null;
};

function ProgressRing({ pct }: { pct: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct) / 100;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          strokeWidth="8"
          cx="50"
          cy="50"
          r={r}
          fill="transparent"
          stroke="#E5E7EB"
        />
        <circle
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={r}
          fill="transparent"
          stroke="#E81C74"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-800">{pct}%</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="w-28 h-10 bg-gray-200 rounded-full hidden sm:block" />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((data: CourseProgress[]) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalCourses = courses.length;
  const totalCompleted = courses.reduce((sum, c) => sum + c.completed, 0);
  const totalLessons = courses.reduce((sum, c) => sum + c.total, 0);
  const overallPct =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <main className="flex-grow flex flex-col bg-gradient-to-b from-gray-50 to-[#F3F4F6]">
      {/* Hero */}
      <header className="gradient-brand text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white rounded-full" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-[#E81C74] rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-2 text-blue-200 text-sm font-medium">
            <Link href="/" className="hover:text-white">
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Your Learning Journey
          </h1>
          <p className="text-blue-100 mb-8 text-base md:text-lg">
            Track your progress across all enrolled courses.
          </p>

          {/* Stats bar */}
          {!loading && (
            <div className="flex flex-wrap gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 w-fit">
              <div className="text-center">
                <div className="text-3xl font-bold">{totalCourses}</div>
                <div className="text-xs text-blue-200 mt-0.5">
                  Courses Enrolled
                </div>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl font-bold">{totalCompleted}</div>
                <div className="text-xs text-blue-200 mt-0.5">
                  Lessons Completed
                </div>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl font-bold">{overallPct}%</div>
                <div className="text-xs text-blue-200 mt-0.5">Overall Progress</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Course cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No courses enrolled yet
            </h2>
            <p className="text-gray-500 mb-6">
              Enrol in a course to start tracking your progress.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-[#E81C74] hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.courseId}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <ProgressRing pct={course.pct} />

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-1">
                    {course.completed} of {course.total} lessons complete
                  </p>
                  {course.lastActivity && (
                    <p className="text-xs text-gray-400">
                      Last activity:{" "}
                      <span className="font-medium text-gray-600">
                        {course.lastActivity}
                      </span>
                    </p>
                  )}
                </div>

                <Link
                  href={`/courses/${course.courseId}`}
                  className="shrink-0 bg-[#E81C74] hover:bg-pink-600 text-white font-semibold py-2.5 px-6 rounded-full transition-colors shadow-sm text-sm"
                >
                  Continue →
                </Link>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-medium text-[#E81C74]">
                    {course.pct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#E81C74] h-2 rounded-full transition-all"
                    style={{ width: `${course.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
