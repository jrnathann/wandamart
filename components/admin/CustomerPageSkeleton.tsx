"use client";

import { Users, TrendingUp, ShoppingBag, MapPin } from "lucide-react";

export function CustomersPageSkeleton() {
  // Render skeleton stats and table rows
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="min-h-screen animate-pulse space-y-6">
      {/* Skeleton Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-8 bg-gray-200  rounded w-64" />
          <div className="h-1 w-32 bg-gray-200  rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-200  rounded" />
      </div>

      {/* Skeleton Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200  rounded-2xl" />
        ))}
      </div>

      {/* Skeleton Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        <div className="flex-1 h-10 bg-gray-200  rounded-xl" />
        <div className="flex gap-2 sm:gap-3 flex-wrap lg:flex-nowrap">
          <div className="min-w-[140px] h-10 bg-gray-200  rounded-xl" />
          <div className="min-w-[150px] h-10 bg-gray-200  rounded-xl" />
          <div className="h-10 w-20 bg-gray-200  rounded-xl" />
        </div>
      </div>

      {/* Skeleton Table */}
      <div className="overflow-x-auto rounded-2xl border border-shopici-charcoal/10">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-200 ">
            <tr>
              {[...Array(6)].map((_, i) => (
                <th key={i} className="px-3 py-2 text-left text-xs font-bold uppercase">
                  <div className="h-4 bg-gray-300  rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {skeletonRows.map((_, i) => (
              <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-3 py-2">
                    <div className="h-4 bg-gray-300  rounded w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
