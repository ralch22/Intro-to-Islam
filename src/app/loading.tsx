export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl bg-gray-200 h-28 mb-8" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress ring area */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="flex justify-center py-4">
            <div className="w-28 h-28 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
          </div>
        </div>

        {/* Course cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded w-full mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
