export default function CoursesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Page header */}
      <div className="mb-8 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-80" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 bg-gray-200 rounded-full flex-shrink-0" style={{ width: `${64 + i * 16}px` }} />
        ))}
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Thumbnail */}
            <div className="h-44 bg-gray-200" />
            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-4/5" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full w-full mt-2" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded-full w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
