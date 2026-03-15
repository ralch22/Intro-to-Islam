"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  progress: number;
  visible: number;
};

const GRADIENTS = [
  "linear-gradient(135deg, #1E40AF 0%, #6B21A8 100%)",
  "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)",
  "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)",
];

const categories = ["All Courses", "Foundations", "Advanced Studies", "Daily Practices", "History"];

function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-6 space-y-3 flex-grow">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-2 bg-gray-200 rounded-full mt-4" />
        <div className="h-10 bg-gray-200 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function CourseLibraryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data: Course[]) => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load courses.");
        setLoading(false);
      });
  }, []);

  const filtered = courses.filter((c) =>
    c.fullname.toLowerCase().includes(search.toLowerCase()) ||
    c.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-grow flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Library</h1>
            <p className="text-gray-500 mt-1">Explore and manage your learning journey</p>
          </div>
          <div className="w-full md:w-96 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E81C74] bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                i === 0
                  ? "bg-[#1F2937] text-white shadow-md"
                  : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {loading ? (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : error ? (
            <div className="col-span-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-12">
              No courses found{search ? ` for "${search}"` : ""}.
            </div>
          ) : (
            filtered.map((course, idx) => {
              const gradient = GRADIENTS[idx % GRADIENTS.length];
              const isEnrolled = course.progress > 0;
              const tag = isEnrolled ? "Enrolled" : "Available";

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col"
                >
                  {/* Card header */}
                  <div
                    className="h-48 relative p-6 flex flex-col justify-between"
                    style={{ background: gradient }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="bg-black/40 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                        {tag}
                      </span>
                      <button className="text-white hover:scale-110 transition-transform text-lg">🔖</button>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{course.fullname}</h3>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex-grow flex flex-col">
                    <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">{course.summary}</p>

                    {isEnrolled ? (
                      <>
                        <div className="mb-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Progress</span>
                            <span className="font-bold text-[#E81C74]">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-[#E81C74] h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Link
                            href={`/courses/${course.id}`}
                            className="flex-1 bg-[#1F2937] hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors text-center"
                          >
                            Resume
                          </Link>
                          <button className="px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 transition-colors">
                            ⋯
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                          <span>📹 {course.shortname}</span>
                        </div>
                        <Link
                          href={`/courses/${course.id}`}
                          className="w-full border-2 border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white font-medium py-3 rounded-xl transition-colors text-center block"
                        >
                          View Details
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sticky donation footer */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-[#E81C74] text-lg">🤲</div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Support Free Education</h4>
              <p className="text-xs text-gray-500">Help us keep these courses accessible to everyone.</p>
            </div>
          </div>
          <button className="w-full sm:w-auto bg-[#E81C74] hover:bg-pink-600 text-white font-medium py-2.5 px-6 rounded-full transition-colors text-sm shadow-md">
            Donate Now
          </button>
        </div>
      </div>
    </main>
  );
}
