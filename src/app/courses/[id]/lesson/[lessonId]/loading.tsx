export default function LessonLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex gap-2 items-center mb-5">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-2" />
        <div className="h-3 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-2" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: video + tabs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Video placeholder (16:9) */}
          <div className="w-full rounded-2xl bg-gray-200" style={{ aspectRatio: '16 / 9' }} />

          {/* Lesson title */}
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 border-b border-gray-100 pb-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 bg-gray-200 rounded-t-lg flex-shrink-0"
                style={{ width: `${72 + i * 8}px` }}
              />
            ))}
          </div>

          {/* Tab content area */}
          <div className="space-y-3 pt-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>

        {/* Sidebar: lesson list */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                  <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
