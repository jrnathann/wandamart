export default function FAQSkeleton() {
  return (
<section className="bg-white py-24 border-t border-shopici-gray/30 animate-pulse">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Brand Column Skeleton (30%) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-6">
              {/* The Coral Accent Line */}
              <div className="w-12 h-1 bg-shopici-coral/30 mb-6" />
              
              {/* Header Lines */}
              <div className="space-y-3">
                <div className="h-10 w-48 bg-shopici-black/10 rounded" />
                <div className="h-10 w-64 bg-shopici-blue/10 rounded" />
              </div>
              
              {/* Description Paragraph */}
              <div className="space-y-2 mt-6">
                <div className="h-4 w-full bg-shopici-gray/40 rounded" />
                <div className="h-4 w-5/6 bg-shopici-gray/40 rounded" />
              </div>
            </div>
            
            {/* CTA Link Skeleton */}
            <div className="h-6 w-40 bg-shopici-black/5 border-b-2 border-shopici-coral/20 pb-1" />
          </div>

          {/* Accordion Column Skeleton (70%) */}
          <div className="lg:col-span-8 divide-y divide-shopici-gray/40 border-t border-shopici-gray/40">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="py-7 flex items-start justify-between gap-6">
                <div className="flex gap-6 flex-1">
                  {/* ID Number Skeleton */}
                  <div className="h-4 w-6 bg-shopici-blue/10 rounded mt-1" />
                  
                  {/* Question Text Skeleton */}
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 bg-shopici-black/5 rounded" />
                  </div>
                </div>

                {/* Toggle Icon Skeleton */}
                <div className="w-6 h-6 bg-shopici-gray/30 rounded-full" />
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
