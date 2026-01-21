export default function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Urgency banner skeleton */}
      <div className="h-12 bg-shopici-gray/30" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-shopici-gray/30 rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-shopici-gray/30 rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-shopici-gray/30 rounded" />
              <div className="h-5 w-full bg-shopici-gray/20 rounded" />
              <div className="h-5 w-5/6 bg-shopici-gray/20 rounded" />
            </div>

            {/* Price box */}
            <div className="p-6 rounded-2xl bg-shopici-gray/20">
              <div className="h-10 w-40 bg-shopici-gray/30 rounded mb-3" />
              <div className="h-4 w-64 bg-shopici-gray/20 rounded" />
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <div className="h-5 w-20 bg-shopici-gray/30 rounded" />
              <div className="flex gap-2">
                <div className="h-10 w-10 bg-shopici-gray/30 rounded-lg" />
                <div className="h-10 w-12 bg-shopici-gray/30 rounded-lg" />
                <div className="h-10 w-10 bg-shopici-gray/30 rounded-lg" />
              </div>
            </div>

            {/* CTA button */}
            <div className="h-14 bg-shopici-gray/30 rounded-xl" />

            {/* Trust text */}
            <div className="h-4 w-64 bg-shopici-gray/20 rounded mx-auto" />

            {/* Delivery info */}
            <div className="p-5 border border-shopici-gray/20 rounded-xl space-y-3">
              <div className="h-5 w-48 bg-shopici-gray/30 rounded" />
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-full bg-shopici-gray/20 rounded"
                />
              ))}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-shopici-gray/20 rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-12">
          <div className="h-6 w-64 bg-shopici-gray/30 rounded" />
          <div className="p-6 border border-shopici-gray/20 rounded-xl space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-full bg-shopici-gray/20 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
