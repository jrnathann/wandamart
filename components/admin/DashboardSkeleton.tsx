"use client";

import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-8 bg-shopici-gray/30 dark:bg-shopici-gray/50 rounded w-64 animate-pulse mb-2 sm:mb-0" />
        <div className="h-8 bg-shopici-gray/30 dark:bg-shopici-gray/50 rounded w-40 animate-pulse" />
      </div>
      <div className="mt-6 h-0.5 w-full bg-shopici-gray/20 rounded animate-pulse" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-shopici-charcoal/10 p-5 animate-pulse bg-shopici-gray/10 dark:bg-shopici-gray/20"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-20 bg-shopici-gray/30 rounded" />
              <div className="p-2 bg-shopici-gray/30 rounded">
                {idx === 0 && <TrendingUp size={20} />}
                {idx === 1 && <ShoppingBag size={20} />}
                {idx === 2 && <Package size={20} />}
                {idx === 3 && <Users size={20} />}
              </div>
            </div>
            <div className="h-8 w-32 bg-shopici-gray/30 rounded" />
          </div>
        ))}
      </div>

      {/* Charts + Top Products Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 rounded-2xl border border-shopici-charcoal/10 p-6 animate-pulse bg-shopici-gray/10 h-64" />

        {/* Top Products Skeleton */}
        <div className="rounded-2xl border border-shopici-charcoal/10 p-6 space-y-3">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-shopici-gray/30 rounded-lg" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-shopici-gray/30 rounded w-3/4" />
                <div className="h-3 bg-shopici-gray/30 rounded w-1/2" />
              </div>
              <div className="w-8 h-4 bg-shopici-gray/30 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Skeleton */}
      <div className="rounded-2xl border border-shopici-charcoal/10 p-6 overflow-hidden">
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border-b border-shopici-charcoal/10 py-3 animate-pulse"
          >
            <div className="h-4 w-32 bg-shopici-gray/30 rounded" />
            <div className="h-4 w-24 bg-shopici-gray/30 rounded" />
            <div className="h-4 w-20 bg-shopici-gray/30 rounded hidden sm:block" />
            <div className="h-4 w-16 bg-shopici-gray/30 rounded hidden sm:block text-right" />
          </div>
        ))}
      </div>
    </div>
  );
}
