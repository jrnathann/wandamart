// components/admin/customers/CustomersPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Download,
  Search,
  Users,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Filter,
  X
} from "lucide-react";
import VintageHeader from "@/components/VintageHeader";
import { OrderTracking } from "@/types/OrderTracking";
import { fetchOrders } from "@/helper/order";
import { CustomersPageSkeleton } from "@/components/admin/CustomerPageSkeleton";
import CustomersTable from "@/components/admin/CustomerTables";
import ActionButton from "@/components/admin/orders/shared/ActionButton";
import { useNotify } from "@/context/NotifyContext";
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  deliveryZone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function CustomersPage() {
  const [orders, setOrders] = useState<OrderTracking[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"orders" | "spent" | "recent">("orders");
  const [isExporting, setExporting] = useState(false)

  const [loading, setLoading] = useState(true);

  const { notify } = useNotify();

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const exportCustomers = async () => {
    if (filteredCustomers.length === 0 || isExporting) return;

    try {
      setExporting(true);

      const headers = [
        "Nom",
        "Téléphone",
        "Email",
        "Zone",
        "Commandes",
        "Total dépensé (XAF)",
        "Dernière commande"
      ];

      const rows = filteredCustomers.map(c => [
        c.name,
        c.phone,
        c.email ?? "",
        c.deliveryZone,
        c.totalOrders.toString(),
        c.totalSpent.toString(),
        new Date(c.lastOrderDate).toLocaleDateString("fr-FR")
      ]);

      const csvContent =
        "\uFEFF" + // important for Excel accents
        [headers, ...rows]
          .map(row =>
            row
              .map(value => `"${String(value).replace(/"/g, '""')}"`)
              .join(";")
          )
          .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `clients_${new Date().toISOString().slice(0, 10)}.csv`
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify("Exported", "succefully", "success")
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false); // 🔥 always reset
    }
  };

  // Transform orders data into customers
  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    orders.forEach(order => {
      const phone = order.customer.phone;

      if (customerMap.has(phone)) {
        const existing = customerMap.get(phone)!;
        existing.totalOrders += 1;
        existing.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        customerMap.set(phone, {
          id: phone,
          name: order.customer.name,
          phone: order.customer.phone,
          deliveryZone: order.customer.deliveryZone,
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt,
        });
      }
    });

    return Array.from(customerMap.values());
  }, [orders]);

  // Get unique zones
  const zones = useMemo(() => {
    return Array.from(new Set(customers.map(c => c.deliveryZone))).sort();
  }, [customers]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer => {
      const matchesSearch = !searchQuery ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);
      const matchesZone = !zoneFilter || customer.deliveryZone === zoneFilter;

      return matchesSearch && matchesZone;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      if (sortBy === "spent") return b.totalSpent - a.totalSpent;
      return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
    });

    return result;
  }, [customers, searchQuery, zoneFilter, sortBy]);

  // Calculate stats
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.totalOrders > 0).length,
    averageOrderValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0,
    topZone: zones[0] || "N/A",
  };

  const clearFilters = () => {
    setSearchQuery("");
    setZoneFilter("");
  };
  if (loading) return <CustomersPageSkeleton />;

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">

        {/* Vintage Header */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <VintageHeader
              title="Gestion des clients"
              count={filteredCustomers.length}
              pluralLabel="client"
            />
            <ActionButton
              label="Exporter CSV"
              subLabel="Format Tableur"
              onClick={exportCustomers}
              isLoading={isExporting}
            />
          </div>

          {/* Decorative line */}
          <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={stats.totalCustomers.toString()}
            icon={<Users size={18} className="text-white" />}
            percentage={8}
            trend="up"
          />
          <StatCard
            title="Clients Actifs"
            value={stats.activeCustomers.toString()}
            icon={<TrendingUp size={18} className="text-white" />}
            percentage={15}
            trend="up"
          />
          <StatCard
            title="Panier Moyen"
            value={`${Math.round(stats.averageOrderValue).toLocaleString()} XAF`}
            icon={<ShoppingBag size={18} className="text-white" />}
            percentage={5}
            trend="up"
          />
          <StatCard
            title="Zone Populaire"
            value={stats.topZone}
            icon={<MapPin size={18} className="text-white" />}
          />
        </div>

        {/* Filters & Search - Industrial Console Style */}
        <div className="bg-white border border-shopici-black/[0.08] p-3 sm:p-4 transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">

            {/* SEARCH: Terminal Style */}
            <div className="flex-1 relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-shopici-black/10 pr-2 pointer-events-none">
                <Search className="text-shopici-black/40 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="RECHERCHER PAR NOM OU TÉLÉPHONE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-shopici-black/10 rounded-none
                   text-[11px] font-bold uppercase tracking-widest placeholder:text-shopici-black/20
                   focus:outline-none focus:bg-white focus:border-shopici-blue transition-all
                   placeholder:font-medium"
              />
            </div>

            {/* FILTERS: Modular Blocks */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap lg:flex-nowrap">

              {/* ZONE SELECT */}
              <div className="relative flex-1 sm:flex-none">
                <label className="absolute -top-2 left-2 bg-white px-1 text-[8px] font-black uppercase text-shopici-black/30 tracking-tighter z-10">
                  Localisation
                </label>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full sm:min-w-[160px] px-3 py-3 text-[10px] font-black uppercase tracking-widest
                     bg-white border border-shopici-black/10 rounded-none appearance-none
                     focus:outline-none focus:border-shopici-blue cursor-pointer transition-colors"
                >
                  <option value="">Toutes les zones</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              {/* SORT SELECT */}
              <div className="relative flex-1 sm:flex-none">
                <label className="absolute -top-2 left-2 bg-white px-1 text-[8px] font-black uppercase text-shopici-black/30 tracking-tighter z-10">
                  Trier Par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:min-w-[160px] px-3 py-3 text-[10px] font-black uppercase tracking-widest
                     bg-white border border-shopici-black/10 rounded-none appearance-none
                     focus:outline-none focus:border-shopici-blue cursor-pointer transition-colors"
                >
                  <option value="orders">+ Commandes</option>
                  <option value="spent">+ Dépenses</option>
                  <option value="recent">+ Récents</option>
                </select>
              </div>

              {/* CLEAR FILTERS: Action Block */}
              {(searchQuery || zoneFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-3 bg-shopici-coral text-white text-[10px] font-black uppercase tracking-[0.15em]
                     hover:bg-shopici-black transition-colors flex items-center justify-center gap-2 group"
                >
                  <X size={12} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border-shopici-charcoal/10 overflow-hidden">
          <div className="bg-white rounded-2xl border-shopici-charcoal/10 overflow-hidden">
            <CustomersTable customers={filteredCustomers} />
          </div>

          {/* Empty State */}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-shopici-charcoal/30 mb-4" />
              <p className="text-shopici-charcoal dark:text-shopici-gray text-lg font-semibold mb-2">
                Aucun client trouvé
              </p>
              <p className="text-sm text-shopici-charcoal/60">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  percentage?: number;
  trend?: 'up' | 'down';
  accentColor?: "coral" | "blue"; // Strictly Shopici palette
}
function StatCard({
  title,
  value,
  icon,
  percentage,
  trend,
  accentColor = "coral"
}: StatCardProps) {

  const isCoral = accentColor === "coral";
  const bgClass = isCoral ? "bg-shopici-coral" : "bg-shopici-blue";

  return (
    <div className="group relative bg-white border border-shopici-black/[0.08] hover:border-shopici-black/20 transition-all duration-500 rounded-none p-6 flex flex-col justify-between h-full min-h-[190px] overflow-hidden">

      {/* 1. HEADER: Technical Meta-data */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-shopici-black/50 leading-none">
            {title}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${bgClass} animate-pulse`} />
            <span className="text-[9px] font-bold text-shopici-black/20 uppercase tracking-widest italic">
              Live Sync
            </span>
          </div>
        </div>

        {/* 2. ICON: Industrial Block Style */}
        {icon && (
          <div className="bg-shopici-black p-2.5 transition-transform duration-300 group-hover:-translate-y-1">
            <div className="scale-90 text-white">
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* 3. VALUE: High Contrast Data */}
      <div className="mt-8 flex flex-col gap-2.5">
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black tracking-tighter text-shopici-black tabular-nums leading-none">
            {value}
          </p>
          <span className="text-[9px] font-black uppercase text-shopici-black/20 italic tracking-tighter">
            Data Units
          </span>
        </div>

        {/* TREND BADGE */}
        {percentage !== undefined && (
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] ${trend === 'up' ? 'text-emerald-600' : 'text-shopici-coral'
            }`}>
            {trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            <span>{percentage > 0 ? '+' : ''}{percentage}%</span>
            <span className="text-shopici-black/10 font-bold lowercase tracking-tighter ml-1">vs prev</span>
          </div>
        )}
      </div>

      {/* 4. FOOTER: The "Registry" Line */}
      <div className="mt-6 space-y-3">
        <div className="w-full h-[1px] bg-shopici-black/[0.05] relative overflow-hidden">
          <div className={`absolute inset-y-0 left-0 w-1/3 ${bgClass} opacity-40`} />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[8px] font-bold uppercase tracking-widest text-shopici-black/20">
            Archive Consolidée
          </span>
          {/* Blueprint Detail */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-0.5 h-0.5 bg-shopici-black/10" />
            ))}
          </div>
        </div>
      </div>

      {/* Hover Aesthetic: Corner Marker */}
      <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-shopici-black/20" />
      </div>
    </div>
  );
}