// components/admin/orders/OrderFilters.tsx
import { Search, X } from "lucide-react";
import type { OrderStatus } from "@/types/OrderTracking";
import FilterChip from "./shared/FilterChip";

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: OrderStatus[];
  toggleStatusFilter: (status: OrderStatus) => void;
  showUnserious: boolean;           // ✅ new
  toggleShowUnserious: () => void;  // ✅ new
  clearFilters: () => void;
}

export default function OrderFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  toggleStatusFilter,
  showUnserious,
  toggleShowUnserious,
  clearFilters
}: OrderFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shopici-charcoal" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopici-blue text-sm"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="En préparation"
            active={statusFilter.includes("En préparation")}
            onClick={() => toggleStatusFilter("En préparation")}
            color="bg-orange-100 text-orange-700 border-orange-300"
          />
          <FilterChip
            label="En route"
            active={statusFilter.includes("En route")}
            onClick={() => toggleStatusFilter("En route")}
            color="bg-blue-100 text-blue-700 border-blue-300"
          />
          <FilterChip
            label="Livré"
            active={statusFilter.includes("Livré")}
            onClick={() => toggleStatusFilter("Livré")}
            color="bg-green-100 text-green-700 border-green-300"
          />
          <FilterChip
            label="Annulé"
            active={statusFilter.includes("Annulé")}
            onClick={() => toggleStatusFilter("Annulé")}
            color="bg-red-100 text-red-700 border-red-300"
          />

          {/* ✅ Show unserious toggle — visually distinct */}
          <button
            onClick={toggleShowUnserious}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              showUnserious
                ? "bg-red-100 border-red-400 text-red-700"
                : "bg-white border-shopici-charcoal/20 text-shopici-charcoal/50 hover:border-red-300 hover:text-red-500"
            }`}
          >
            👎 Inclure non-sérieux
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(statusFilter.length > 0 || searchQuery || showUnserious) && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-shopici-charcoal">Filtres actifs:</span>
          {statusFilter.map(status => (
            <button
              key={status}
              onClick={() => toggleStatusFilter(status)}
              className="px-2 py-1 bg-shopici-blue/10 text-shopici-blue text-xs rounded-md flex items-center gap-1 hover:bg-shopici-blue/20"
            >
              {status}
              <X className="w-3 h-3" />
            </button>
          ))}
          {showUnserious && (
            <button
              onClick={toggleShowUnserious}
              className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-md flex items-center gap-1 hover:bg-red-200"
            >
              Non-sérieux inclus
              <X className="w-3 h-3" />
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-2 py-1 bg-shopici-blue/10 text-shopici-blue text-xs rounded-md flex items-center gap-1 hover:bg-shopici-blue/20"
            >
              "{searchQuery}"
              <X className="w-3 h-3" />
            </button>
          )}
          <button onClick={clearFilters} className="text-xs text-shopici-coral hover:underline">
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
}