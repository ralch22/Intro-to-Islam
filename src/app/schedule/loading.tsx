export default function ScheduleLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Page header */}
      <div className="mb-8 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-72" />
      </div>

      {/* Month nav + calendar header */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden mb-6">
        {/* Calendar nav bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="h-5 bg-gray-200 rounded w-36" />
          <div className="w-8 h-8 rounded-full bg-gray-200" />
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 px-4 py-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded mx-auto w-6" />
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 p-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Upcoming sessions */}
      <div className="space-y-4">
        <div className="h-5 bg-gray-200 rounded w-44 mb-2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex gap-4 items-start">
            {/* Date badge */}
            <div className="w-12 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="w-24 h-9 bg-gray-200 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
