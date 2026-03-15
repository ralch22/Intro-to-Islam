export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Profile card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />

          {/* Info */}
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto sm:mx-0" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto sm:mx-0" />
            <div className="flex gap-3 justify-center sm:justify-start pt-1">
              <div className="h-8 bg-gray-200 rounded-full w-28" />
              <div className="h-8 bg-gray-200 rounded-full w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 space-y-2 text-center">
            <div className="h-7 bg-gray-200 rounded w-12 mx-auto" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>

      {/* Form skeleton */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="h-5 bg-gray-200 rounded w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded-xl w-full" />
          </div>
        ))}
        <div className="h-10 bg-gray-200 rounded-full w-32 mt-2" />
      </div>
    </div>
  );
}
