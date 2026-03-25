"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DateFilter from "@/components/DateFilter";
import Link from "next/link";
import VintageHeader from "@/components/VintageHeader";
import { OrderTracking } from "@/types/OrderTracking";
import { Product } from "@/types/Product";
import { fetchOrders } from "@/helper/order";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";
import StatusBadge from "@/components/admin/orders/shared/StatusBadge";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 6)),
    end: new Date(),
  });
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [ordersData, productsData] = await Promise.all([
          fetchOrders(),
          fetch("/api/products").then((res) => {
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json();
          }),
        ]);
        if (!isMounted) return;
        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        console.error(err);
        alert("Impossible de récupérer les données");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // ── Filter by selected date range ─────────────────────────────────────────
  const filteredOrders = useMemo(
    () => orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= dateRange.start && d <= dateRange.end;
    }),
    [orders, dateRange]
  );

  // ── Revenue-qualifying orders ─────────────────────────────────────────────
  // Online  → paid === true  (Fapshi webhook confirmed)
  // Offline → status === "Livré" (admin confirmed delivery)
  const revenueOrders = useMemo(
    () => filteredOrders.filter((o) =>
      o.paymentMethod === "online"
        ? o.paid === true
        : o.status === "Livré"
    ),
    [filteredOrders]
  );

  // ── Physically delivered orders (for top products ranking) ────────────────
  const deliveredOrders = useMemo(
    () =>
      filteredOrders.filter(
        (o) => o.status === "Livré" || o.paid === true
      ),
    [filteredOrders]
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const totalProducts = products.length;
  const totalCustomers = new Set(orders.map((o) => o.customer.phone)).size;

  // ── Revenue per day (chart) ───────────────────────────────────────────────
  // Online  → bucketed by paidAt  (exact moment money landed)
  // Offline → bucketed by createdAt (no separate delivery timestamp)
  const revenueData = useMemo(() => {
    const results: Record<string, number> = {};

    for (
      let d = new Date(dateRange.start);
      d <= dateRange.end;
      d.setDate(d.getDate() + 1)
    ) {
      results[d.toISOString().split("T")[0]] = 0;
    }

    revenueOrders.forEach((o) => {
      const dateKey = new Date(
        o.paymentMethod === "online" && o.paidAt ? o.paidAt : o.createdAt
      ).toISOString().split("T")[0];

      if (results[dateKey] !== undefined) results[dateKey] += o.total;
    });

    return Object.keys(results).map((date) => ({ date, total: results[date] }));
  }, [revenueOrders, dateRange]);

  // ── Top products (by units physically delivered) ──────────────────────────
  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    deliveredOrders.forEach((o) =>
      o.items.forEach((item) => {
        counts[item.productId] = (counts[item.productId] || 0) + item.quantity;
      })
    );

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, qty]) => {
        const product = products.find((p) => p._id === productId);
        return { name: product?.name || "Unknown", qty, product };
      });
  }, [products, deliveredOrders]);

  // ── Recent orders ─────────────────────────────────────────────────────────
  const recentOrders = useMemo(
    () =>
      [...filteredOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [filteredOrders]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <VintageHeader
          title="Dashboard"
          subtitle="Your business overview at a glance"
        />
        <DateFilter
          start={dateRange.start}
          end={dateRange.end}
          onChange={(range) => setDateRange(range)}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Revenue"
          value={`${totalRevenue.toLocaleString()} XAF`}
          icon={<TrendingUp size={20} className="text-shopici-blue" />}
          gradient="from-shopici-blue/10 to-shopici-blue/5"
        />
        <KpiCard
          title="Orders"
          value={totalOrders}
          icon={<ShoppingBag size={20} className="text-shopici-coral" />}
          gradient="from-shopici-coral/10 to-shopici-coral/5"
        />
        <KpiCard
          title="Products"
          value={totalProducts}
          icon={<Package size={20} className="text-shopici-charcoal" />}
          gradient="from-shopici-charcoal/10 to-shopici-charcoal/5"
        />
        <KpiCard
          title="Customers"
          value={totalCustomers}
          icon={<Users size={20} className="text-shopici-blue" />}
          gradient="from-shopici-blue/10 to-shopici-blue/5"
        />
      </div>

      {/* Charts + Top Products */}
      {/* Charts + Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white border border-shopici-black/[0.12] rounded-none overflow-hidden transition-all duration-500 hover:border-shopici-black/20">
          {/* Padding adaptatif : p-5 sur mobile, p-8 sur desktop */}
          <div className="p-5 sm:p-8">

            {/* EN-TÊTE : Responsive (Stack vertical sur mobile) */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-10 sm:mb-12">
              <div className="space-y-1">
                <h3 className="font-bold text-xl sm:text-2xl tracking-tight text-shopici-black leading-none">
                  Analyse des revenus
                </h3>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-shopici-black/30">
                  Flux financier consolidé
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                <div className="px-4 py-2 bg-shopici-black text-white text-[10px] font-bold uppercase tracking-widest border border-shopici-black w-fit">
                  {revenueData.length} jours de données
                </div>
                <span className="text-[9px] font-bold text-shopici-black/20 uppercase tracking-widest">
                  Mise à jour : Temps réel
                </span>
              </div>
            </div>

            {/* ZONE GRAPHIQUE : Hauteur fixe mais responsive via le container */}
            <div className="h-64 sm:h-72 -mx-2">
              <Chart
                options={{
                  chart: {
                    toolbar: { show: false },
                    background: "transparent",
                    // Optimisation du rendu sur mobile
                    sparkline: { enabled: false }
                  },
                  dataLabels: { enabled: false },
                  markers: { size: 0 },
                  xaxis: {
                    categories: revenueData.map((d) => d.date),
                    labels: {
                      // On cache certains labels sur mobile pour éviter la surcharge
                      hideOverlappingLabels: true,
                      style: { colors: "var(--shopici-charcoal)", fontSize: "10px" },
                    },
                  },
                  yaxis: {
                    labels: {
                      formatter: (val: number) => `${val.toLocaleString()}`,
                      style: { colors: "var(--shopici-charcoal)", fontSize: "10px" },
                    },
                  },
                  stroke: { curve: "smooth", width: 1 },
                  fill: {
                    type: "gradient",
                    gradient: {
                      shade: "light",
                      type: "vertical",
                      shadeIntensity: 0.5,
                      gradientToColors: ["var(--shopici-coral)"],
                      inverseColors: false,
                      opacityFrom: 0.7,
                      opacityTo: 0.1,
                    },
                  },
                  tooltip: {
                    y: { formatter: (val: number) => `${val.toLocaleString()} XAF` },
                  },
                  colors: ["var(--shopici-blue)"],
                  grid: { borderColor: "#e5e5e5", strokeDashArray: 1 },
                  theme: { mode: "light" },
                }}
                series={[{ name: "Revenue", data: revenueData.map((d) => d.total) }]}
                type="area"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-shopici-black/[0.12] rounded-none overflow-hidden transition-all duration-500">
          <div className="p-4 sm:p-8">

            {/* EN-TÊTE : RESPONSIVE & SANS UNDERSCORES */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl tracking-tight text-shopici-black leading-none">
                  Performances Produits
                </h3>
                <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-shopici-black/40 mt-1">
                  Analyse des meilleures ventes
                </p>
              </div>
              <div className="flex items-center self-start sm:self-auto gap-2 px-3 py-1.5 bg-shopici-black text-white border border-shopici-black">
                <span className="w-2 h-2 bg-shopici-coral" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Classement</span>
              </div>
            </div>

            {/* LISTE DES PRODUITS */}
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((p, idx) => {
                  const imageUrl = p.product?.images?.[0]?.url || "/placeholder.png";
                  return (
                    <div
                      key={p.name}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 border border-shopici-black/[0.05] hover:border-shopici-black/20 transition-all cursor-default"
                    >
                      {/* INDEX & IMAGE : Toujours groupés */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-none overflow-hidden border border-shopici-black/10 bg-shopici-black/[0.02]">
                            <img
                              src={imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                            />
                          </div>
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-shopici-black text-white text-[10px] font-bold flex items-center justify-center">
                            0{idx + 1}
                          </div>
                        </div>

                        {/* Mobile-only name display (optionnel si on veut forcer le nom à côté de l'image sur petit écran) */}
                        <div className="sm:hidden flex-1 min-w-0">
                          <p className="font-bold text-sm text-shopici-black truncate">
                            {p.name}
                          </p>
                        </div>
                      </div>

                      {/* INFOS PRODUIT : Masqué sur très petit mobile si déjà affiché au-dessus */}
                      <div className="hidden sm:block flex-1 min-w-0">
                        <p className="font-bold text-sm text-shopici-black tracking-tight truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-medium text-shopici-black/40 uppercase tracking-tighter">
                            Volume Mensuel
                          </span>
                          <div className="h-[1px] w-4 bg-shopici-black/10" />
                          <span className="text-[11px] font-bold text-shopici-black/60">
                            {p.qty} UNITÉS
                          </span>
                        </div>
                      </div>

                      {/* SCORE DE PERFORMANCE : Adaptatif */}
                      <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end sm:min-w-[100px] py-2 px-4 bg-shopici-coral/[0.04] border-l-2 border-shopici-coral sm:border-l-2">
                        <div className="sm:hidden text-[10px] font-bold uppercase text-shopici-coral/60 tracking-tighter">
                          Total Ventes
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-bold text-shopici-coral tabular-nums leading-none">
                            {p.qty}
                          </span>
                          <span className="hidden sm:block text-[9px] font-bold uppercase text-shopici-coral/60 mt-1 tracking-tighter">
                            Ventes Net
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-shopici-black/10">
                  <Package size={32} className="mx-auto text-shopici-black/20 mb-3" strokeWidth={1} />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-shopici-black/40">
                    Aucune donnée disponible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-shopici-black/[0.12] rounded-none overflow-hidden transition-all duration-500">
        <div className="p-4 sm:p-8">
          {/* EN-TÊTE : Responsive stack */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl tracking-tight text-shopici-black leading-none">
                Commandes Récentes
              </h3>
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-shopici-black/40 mt-1">
                Flux des dernières transactions
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-shopici-black/50 hover:text-shopici-coral transition-colors group flex items-center gap-2 self-start sm:self-auto"
            >
              Voir tout
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* TABLEAU : Scroll optimisé */}
          <div className="overflow-x-auto -mx-4 px-4 sm:-mx-8 sm:px-8">
            <table className="w-full text-left border-collapse tabular-nums min-w-[600px] sm:min-w-full">
              <thead>
                <tr className="border-b border-shopici-black/[0.1]">
                  <th className="py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-shopici-black/40 whitespace-nowrap">Client</th>
                  <th className="py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-shopici-black/40 whitespace-nowrap">Statut Système</th>
                  <th className="hidden md:table-cell py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-shopici-black/40 whitespace-nowrap">Paiement</th>
                  <th className="hidden sm:table-cell py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-shopici-black/40 whitespace-nowrap">Date</th>
                  <th className="text-right py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-shopici-black/40 whitespace-nowrap">Montant Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-shopici-black/[0.06]">
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="group hover:bg-shopici-black/[0.01] transition-colors cursor-default"
                  >
                    <td className="text-sm font-semibold text-shopici-black whitespace-nowrap">
                      {o.customer.name}
                    </td>
                    <td className="">
                      <span>
                        <StatusBadge status={o.status} />
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <div className={`w-2 h-2 ${o.paid ? 'bg-green-600' : 'bg-shopici-coral'}`} />
                        <span className="text-[11px] font-bold uppercase text-shopici-black/60">
                          {o.paid ? "Réglé" : o.paymentMethod === "online" ? "Attente" : "Livraison"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-[11px] font-bold text-shopici-black/40 uppercase whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="py-6 text-right text-sm sm:text-base font-bold tracking-tight text-shopici-black whitespace-nowrap">
                      {o.total.toLocaleString()} <span className="text-[9px] sm:text-[10px] font-medium text-shopici-black/30 ml-1">XAF</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color = "coral" }: any) {
  // Define a very subtle accent color for the icon background
  const accentColor = color === "coral" ? "bg-shopici-coral/5 text-shopici-coral" : "bg-shopici-blue/5 text-shopici-blue";

  return (
    <div className="group relative bg-white border border-shopici-black/[0.08] hover:border-shopici-black/20 transition-all duration-500 rounded-none p-6 flex flex-col justify-between h-full min-h-[160px]">

      {/* 1. TOP SECTION: THE LABEL */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-shopici-black/50 leading-none">
            {title}
          </p>
          {/* Subtle Activity Dot */}
          <div className="flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full ${color === 'coral' ? 'bg-shopici-coral' : 'bg-shopici-blue'} animate-pulse`} />
            <span className="text-[9px] font-bold text-shopici-black/20 uppercase tracking-tighter italic">Live_Sync</span>
          </div>
        </div>

        {/* 2. THE ICON: Refined & Contained */}
        <div className={`p-2.5 rounded-none border border-shopici-black/[0.03] ${accentColor} transition-colors group-hover:bg-shopici-black group-hover:text-white group-hover:border-shopici-black`}>
          {/* Rendering icon at a smaller, more 'refined' scale */}
          <div className="scale-90">
            {icon}
          </div>
        </div>
      </div>

      {/* 3. THE VALUE: Editorial Weight */}
      <div className="mt-8 flex items-baseline gap-1">
        <span className="text-4xl font-black tracking-tighter text-shopici-black tabular-nums">
          {value}
        </span>
        {/* Apple-style subtle unit or secondary info */}
        <span className="text-[10px] font-black uppercase text-shopici-black/20 mb-1 italic">
          Units
        </span>
      </div>

      {/* 4. THE PROGRESS LINE: Industrial Precision */}
      <div className="mt-4 w-full h-[1px] bg-shopici-black/[0.05] relative overflow-hidden">
        <div className={`absolute inset-y-0 left-0 w-1/3 ${color === 'coral' ? 'bg-shopici-coral/40' : 'bg-shopici-blue/40'}`} />
      </div>

      {/* Subtle corner detail for that 'Blueprint' feel */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-2 right-2 w-1 h-1 bg-shopici-black/10" />
      </div>
    </div>
  );
}

const statusStyle: Record<string, string> = {
  // LIVRÉ: THE "FINALIZED" STATE
  // Bold, green, and marked with a definitive tick. 
  // It stands out as a "Success" entry.
  "Livré": "text-green-600 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-1.5 before:content-['[✓]'] before:font-mono before:text-[11px]",

  // EN ROUTE: THE "ACTIVE" STATE
  // Professional blue with an italic lean to show it is currently "Promising" and moving.
  "En route": "text-yellow-500 font-black uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 before:content-['•'] before:animate-pulse",

  // EN PRÉPARATION: THE "INTERNAL" STATE
  // Standard black but with high letter spacing. 
  // It feels "Uncertain" or light because it hasn't left the warehouse yet.
  "En préparation": "text-shopici-black font-medium uppercase tracking-[0.25em] text-[9px] flex items-center gap-2 before:content-['○'] before:opacity-20",

  // ANNULÉ: THE "VOID" STATE
  // Faded out and struck through. It looks like a cancelled entry in a ledger.
  "Annulé": "text-shopici-black/20 font-bold uppercase tracking-[0.15em] text-[8px] line-through decoration-1",
};