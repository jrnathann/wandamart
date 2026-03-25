// components/admin/orders/OrderFilters.tsx
import { Search, X, Activity, Filter } from "lucide-react";
import type { OrderStatus } from "@/types/OrderTracking";
import FilterChip from "./shared/FilterChip";

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: OrderStatus[];
  toggleStatusFilter: (status: OrderStatus) => void;
  showUnserious: boolean;
  toggleShowUnserious: () => void;
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
    <div className="bg-white p-6 rounded-none space-y-6">
      
      {/* 1. PRIMARY CONTROLS */}
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* INDUSTRIAL SEARCH BAR */}
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-shopici-black/10 pr-3">
            <Search className="w-4 h-4 text-shopici-black" />
          </div>
          <input
            type="text"
            placeholder="RECHERCHE SYSTÈME (NOM, ID, TEL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-shopici-black/20 rounded-none 
                               text-[11px] font-black uppercase tracking-[0.1em] placeholder:text-shopici-black/20
                               focus:outline-none focus:bg-shopici-black focus:text-white focus:placeholder:text-white/30
                               transition-all duration-200 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] focus:shadow-none"
          />
        </div>

        {/* STATUS FILTERS CONTAINER */}
        <div className="flex flex-wrap items-center gap-2 bg-shopici-black/[0.02] p-1 border border-shopici-black/5">
          <FilterChip
            label="En préparation"
            active={statusFilter.includes("En préparation")}
            onClick={() => toggleStatusFilter("En préparation")}
          />
          <FilterChip
            label="En route"
            active={statusFilter.includes("En route")}
            onClick={() => toggleStatusFilter("En route")}
          />
          <FilterChip
            label="Livré"
            active={statusFilter.includes("Livré")}
            onClick={() => toggleStatusFilter("Livré")}
          />
          <FilterChip
            label="Annulé"
            active={statusFilter.includes("Annulé")}
            onClick={() => toggleStatusFilter("Annulé")}
          />
        </div>

        {/* SYSTEM TOGGLE: Unserious Filter */}
        <button
          onClick={toggleShowUnserious}
          className={`flex items-center gap-3 px-4 py-3 border transition-all duration-300 rounded-none ${
            showUnserious
              ? "bg-shopici-coral border-shopici-coral text-white shadow-[4px_4px_0px_rgba(240,82,82,0.2)]"
              : "bg-white border-shopici-black/10 text-shopici-black/40 hover:border-shopici-coral hover:text-shopici-coral"
          }`}
        >
          <Activity size={14} strokeWidth={3} className={showUnserious ? "animate-pulse" : ""} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Inclure non-sérieux
          </span>
        </button>
      </div>

      {/* 2. ACTIVE REGISTRY (SUMMARY) */}
      {(statusFilter.length > 0 || searchQuery || showUnserious) && (
        <div className="pt-6 border-t border-shopici-black/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 mr-2">
              <Filter size={12} className="text-shopici-black/20" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/30">
                Filtres Actifs :
              </span>
            </div>

            {statusFilter.map(status => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className="px-3 py-1.5 bg-shopici-black text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-shopici-coral transition-colors"
              >
                {status}
                <X size={10} strokeWidth={4} />
              </button>
            ))}

            {showUnserious && (
              <button
                onClick={toggleShowUnserious}
                className="px-3 py-1.5 border-2 border-shopici-coral text-shopici-coral text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                Mode non-sérieux
                <X size={10} strokeWidth={4} />
              </button>
            )}

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 py-1.5 bg-shopici-black/5 text-shopici-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-shopici-black hover:text-white transition-all"
              >
                "{searchQuery}"
                <X size={10} strokeWidth={4} />
              </button>
            )}
          </div>

          <button 
            onClick={clearFilters} 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-shopici-coral hover:bg-shopici-coral hover:text-white px-3 py-1.5 transition-all"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}