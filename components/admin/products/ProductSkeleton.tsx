export default function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-shopici-gray/20 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-10 w-64 bg-shopici-gray/30 rounded-lg" />
          <div className="h-5 w-80 bg-shopici-gray/30 rounded-lg" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Search bar skeleton */}
        <div className="h-14 w-full bg-shopici-gray/20 rounded-xl" />

        {/* Filters bar skeleton */}
        <div className="flex gap-3">
          <div className="h-12 w-32 bg-shopici-gray/20 rounded-xl" />
          <div className="h-12 w-48 bg-shopici-gray/20 rounded-xl" />
          <div className="h-12 w-24 bg-shopici-gray/20 rounded-xl" />
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border border-shopici-gray/30 rounded-2xl p-4 space-y-4"
            >
              {/* Image */}
              <div className="w-full h-48 bg-shopici-gray/30 rounded-xl" />

              {/* Title */}
              <div className="h-5 w-3/4 bg-shopici-gray/30 rounded" />

              {/* Description */}
              <div className="h-4 w-full bg-shopici-gray/20 rounded" />
              <div className="h-4 w-5/6 bg-shopici-gray/20 rounded" />

              {/* Price + Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-20 bg-shopici-gray/30 rounded" />
                <div className="h-10 w-24 bg-shopici-gray/30 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
