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
      <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales chart */}
        <Card className="lg:col-span-2 rounded-2xl border border-shopici-charcoal/10 overflow-hidden">
          <div className="bg-gradient-to-br from-shopici-blue/5 via-transparent to-shopici-coral/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg text-shopici-black dark:text-shopici-foreground">
                  Sales Overview
                </h3>
                <p className="text-xs text-shopici-charcoal mt-1">
                  Confirmed revenue over time
                </p>
              </div>
              <div className="px-3 py-1.5 bg-shopici-blue/10 rounded-full">
                <span className="text-xs font-semibold text-shopici-blue">
                  {revenueData.length} days
                </span>
              </div>
            </div>
            <div className="h-56 -mx-2">
              <Chart
                options={{
                  chart: { toolbar: { show: false }, background: "transparent" },
                  dataLabels: { enabled: false },
                  markers: { size: 0 },
                  xaxis: {
                    categories: revenueData.map((d) => d.date),
                    labels: {
                      style: { colors: "var(--shopici-charcoal)", fontSize: "11px" },
                    },
                  },
                  yaxis: {
                    labels: {
                      formatter: (val: number) => `${val.toLocaleString()}`,
                      style: { colors: "var(--shopici-charcoal)", fontSize: "11px" },
                    },
                  },
                  stroke: { curve: "smooth", width: 3 },
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
                  grid: { borderColor: "#e5e5e5", strokeDashArray: 4 },
                  theme: { mode: "light" },
                }}
                series={[{ name: "Revenue", data: revenueData.map((d) => d.total) }]}
                type="area"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="rounded-2xl border border-shopici-charcoal/10 overflow-hidden">
          <div className="bg-gradient-to-br from-shopici-coral/5 via-transparent to-shopici-blue/5 p-6">
            <div className="mb-5">
              <h3 className="font-bold text-lg text-shopici-black dark:text-shopici-foreground">
                Top Sellers
              </h3>
              <p className="text-xs text-shopici-charcoal mt-1">
                Best performing products
              </p>
            </div>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((p, idx) => {
                  const imageUrl = p.product?.images?.[0]?.url || "/placeholder.png";
                  return (
                    <div
                      key={p.name}
                      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-shopici-charcoal/5 transition-all duration-200"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 border-shopici-charcoal/10 group-hover:border-shopici-blue/30 transition-colors">
                          <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-shopici-coral text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-shopici-black dark:text-shopici-foreground truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-shopici-charcoal">{p.qty} sold</p>
                      </div>
                      <div className="flex-shrink-0 px-2.5 py-1 bg-shopici-coral/10 rounded-full">
                        <span className="font-bold text-sm text-shopici-coral">{p.qty}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Package size={32} className="mx-auto text-shopici-charcoal/30 mb-2" />
                  <p className="text-shopici-charcoal text-sm">No sales data yet</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="rounded-2xl border border-shopici-charcoal/10 overflow-hidden">
        <div className="bg-gradient-to-br from-shopici-blue/5 via-transparent to-shopici-coral/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg text-shopici-black dark:text-shopici-foreground">
                Recent Orders
              </h3>
              <p className="text-xs text-shopici-charcoal mt-1">
                Latest transactions from your store
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm flex items-center gap-1.5 text-shopici-blue hover:text-shopici-coral transition-colors font-medium group"
            >
              View all
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead className="text-left text-shopici-charcoal">
                <tr className="border-b-2 border-shopici-charcoal/10">
                  <th className="py-3 font-semibold">Customer</th>
                  <th className="font-semibold">Status</th>
                  <th className="font-semibold">Payment</th>
                  <th className="font-semibold">Date</th>
                  <th className="hidden sm:table-cell text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-shopici-charcoal/5 last:border-none hover:bg-white/50 dark:hover:bg-shopici-charcoal/5 transition-colors"
                  >
                    <td className="py-4 font-semibold text-shopici-black dark:text-shopici-foreground">
                      {o.customer.name}
                    </td>
                    <td>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {o.paymentMethod === "online" ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${o.paid
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}>
                          {o.paid ? "Payé ✓" : "En attente"}
                        </span>
                      ) : (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${o.paid
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}>
                          {o.paid ? "Payé ✓" : "À la livraison"}
                        </span>
                      )}
                    </td>
                    <td className="text-shopici-charcoal">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="hidden sm:table-cell text-right font-bold text-shopici-black dark:text-shopici-foreground">
                      {o.total.toLocaleString()} XAF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, gradient }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border border-shopici-charcoal/10 overflow-hidden hover:shadow-sm transition-all duration-300 hover:-translate-y-1">
      <div className={`bg-gradient-to-br ${gradient} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-shopici-charcoal">
            {title}
          </span>
          <div className="p-2 bg-white/50 dark:bg-shopici-charcoal/10 rounded-lg">
            {icon}
          </div>
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold text-shopici-black dark:text-shopici-foreground">
            {value}
          </span>
        </div>
      </div>
    </Card>
  );
}

const statusStyle: Record<string, string> = {
  "Livré": "bg-green-100 text-green-700 border border-green-200",
  "En route": "bg-shopici-blue/20 text-shopici-blue border border-shopici-blue/30",
  "En préparation": "bg-shopici-coral/20 text-shopici-coral border border-shopici-coral/30",
  "Annulé": "bg-red-100 text-red-600 border border-red-200",
};