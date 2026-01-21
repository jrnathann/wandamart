export default function HomepageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero Banner Skeleton */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-300">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-80" />

        {/* Text */}
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex items-center">
          <div className="max-w-2xl space-y-4">
            <div className="h-10 md:h-12 lg:h-14 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 md:h-7 w-full bg-gray-200 rounded" />
            <div className="h-6 md:h-7 w-5/6 bg-gray-200 rounded" />
            <div className="h-12 w-40 bg-gray-200 rounded-lg mt-6" />
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
          ))}
        </div>
      </section>

      {/* Products Section Skeleton */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-64 bg-gray-300 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-4 space-y-4"
            >
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="h-5 w-3/4 bg-gray-300 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-300 rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full" />
                <div className="h-5 w-40 mx-auto bg-gray-300 rounded" />
                <div className="h-4 w-56 mx-auto bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
