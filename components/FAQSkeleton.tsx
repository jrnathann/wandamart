export default function FAQSkeleton() {
  return (
    <section className="w-full py-16 px-4 bg-background animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-2xl mb-4 mx-auto" />
          <div className="h-10 w-72 bg-gray-300 rounded mx-auto mb-4" />
          <div className="h-5 w-full max-w-xl bg-gray-200 rounded mx-auto mb-2" />
          <div className="h-5 w-5/6 max-w-lg bg-gray-200 rounded mx-auto" />
        </div>

        {/* FAQ Items Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-background border border-shopici-gray/30 rounded-xl overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Category badge */}
                  <div className="h-5 w-24 bg-gray-200 rounded-full" />

                  {/* Question */}
                  <div className="h-6 w-full bg-gray-300 rounded" />
                  <div className="h-6 w-5/6 bg-gray-300 rounded" />
                </div>

                {/* Plus icon */}
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Skeleton */}
        <div className="mt-12 text-center space-y-4">
          <div className="h-5 w-80 bg-gray-200 rounded mx-auto" />
          <div className="h-12 w-48 bg-gray-300 rounded-lg mx-auto" />
        </div>
      </div>
    </section>
  );
}
