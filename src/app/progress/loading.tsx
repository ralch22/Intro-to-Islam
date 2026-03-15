export default function ProgressLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Page header */}
      <div className="mb-8 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>

      {/* Progress rings row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Course progress list */}
      <div className="space-y-4">
        <div className="h-5 bg-gray-200 rounded w-44 mb-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex gap-5 items-center">
            <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-2 bg-gray-200 rounded-full w-full" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
            <div className="w-16 h-8 bg-gray-200 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
