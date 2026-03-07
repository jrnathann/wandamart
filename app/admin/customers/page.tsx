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

  const [loading, setLoading] = useState(true);

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

  const exportCustomers = () => {
    if (filteredCustomers.length === 0) return;

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
      "\uFEFF" + // UTF-8 BOM for Excel (VERY important for accents)
      [headers, ...rows]
        .map(row =>
          row
            .map(value =>
              `"${String(value).replace(/"/g, '""')}"`
            )
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
            <button
              onClick={exportCustomers}
              className="px-6 py-3 bg-gradient-to-r from-shopici-coral to-shopici-blue text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2 justify-center border-2 border-white/20"
            >
              <Download className="w-4 h-4" />
              Exporter les clients
            </button>
          </div>

          {/* Decorative line */}
          <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={stats.totalCustomers.toString()}
            gradient="from-shopici-blue via-shopici-blue/90 to-blue-700"
            icon={<Users size={18} className="text-white" />}
            percentage={8}
            trend="up"
          />
          <StatCard
            title="Clients Actifs"
            value={stats.activeCustomers.toString()}
            gradient="from-green-500 via-green-600 to-emerald-700"
            icon={<TrendingUp size={18} className="text-white" />}
            percentage={15}
            trend="up"
          />
          <StatCard
            title="Panier Moyen"
            value={`${Math.round(stats.averageOrderValue).toLocaleString()} XAF`}
            gradient="from-shopici-coral via-shopici-coral/90 to-orange-600"
            icon={<ShoppingBag size={18} className="text-white" />}
            percentage={5}
            trend="up"
          />
          <StatCard
            title="Zone Populaire"
            value={stats.topZone}
            gradient="from-shopici-charcoal via-shopici-charcoal/90 to-shopici-black"
            icon={<MapPin size={18} className="text-white" />}
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white  rounded-2xl border border-shopici-charcoal/10 p-2 sm:p-3 lg:p-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">

            {/* SEARCH */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-shopici-charcoal w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3
                     text-sm sm:text-base
                     border border-shopici-charcoal/10 rounded-xl
                     focus:outline-none focus:border-shopici-blue/50
                     focus:ring-2 focus:ring-shopici-blue/20
                     transition-all bg-shopici-gray/5"
                />
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 sm:gap-3 flex-wrap lg:flex-nowrap">

              {/* ZONE */}
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="min-w-[140px] sm:min-w-[160px]
                   px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3
                   text-sm sm:text-base font-medium
                   border border-shopici-charcoal/10 rounded-xl
                   focus:outline-none focus:border-shopici-blue/50
                   bg-white 
                   text-shopici-black dark:text-shopici-foreground"
              >
                <option value="">Toutes les zones</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>

              {/* SORT */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="min-w-[150px] sm:min-w-[180px]
                   px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3
                   text-sm sm:text-base font-medium
                   border border-shopici-charcoal/10 rounded-xl
                   focus:outline-none focus:border-shopici-blue/50
                   bg-white 
                   text-shopici-black dark:text-shopici-foreground"
              >
                <option value="orders">+ Commandes</option>
                <option value="spent">+ Dépenses</option>
                <option value="recent">+ Récents</option>
              </select>

              {/* CLEAR */}
              {(searchQuery || zoneFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3
                     text-sm sm:text-base
                     bg-shopici-coral/10 text-shopici-coral
                     hover:bg-shopici-coral/20
                     rounded-xl font-semibold
                     transition-all flex items-center gap-1.5
                     border border-shopici-coral/20"
                >
                  <X size={14} className="sm:size-4" />
                  <span className="hidden sm:inline">Effacer</span>
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

// Reuse StatCard component
function StatCard({
  title,
  value,
  gradient,
  icon,
  percentage,
  trend
}: {
  title: string;
  value: string;
  gradient: string;
  icon?: React.ReactNode;
  percentage?: number;
  trend?: 'up' | 'down';
}) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-5 shadow-lg border-2 border-white/20 overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
      {/* Vintage pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:24px_24px]" />

      {/* Decorative corner elements */}
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80 drop-shadow-sm">
            {title}
          </p>
          {icon && (
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-white drop-shadow-md">
            {value}
          </p>

          {/* Percentage badge */}
          {percentage !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${trend === 'up'
              ? 'bg-white/90 text-green-600 border-white/50'
              : trend === 'down'
                ? 'bg-white/90 text-red-600 border-white/50'
                : 'bg-white/90 text-gray-600 border-white/50'
              }`}>
              {trend === 'up' && <TrendingUp size={12} />}
              {trend === 'down' && <TrendingDown size={12} />}
              {percentage > 0 ? '+' : ''}{percentage}%
            </div>
          )}
        </div>

        {/* Decorative line */}
        <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
    </div>
  );
}