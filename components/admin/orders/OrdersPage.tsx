// components/admin/orders/OrdersPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Download } from "lucide-react";
import { orders } from "@/data/orders";
import type { OrderTracking, OrderStatus } from "@/types/OrderTracking";
import DateFilter from "@/components/DateFilter";
import OrderStatsCards from "./OrderStatsCards";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import VintageHeader from "@/components/VintageHeader";
import { fetchOrders } from "@/helper/order";
import { CustomersPageSkeleton } from "../CustomerPageSkeleton";

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderTracking[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
    const [zoneFilter, setZoneFilter] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    // Date filter state
    const [dateRange, setDateRange] = useState<{
        start: Date;
        end: Date;
    }>({
        start: new Date(new Date().setDate(new Date().getDate() - 29)), // Last 30 days
        end: new Date(),
    });


    // Fetch orders from API
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
    console.log(orders)
    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Date filter
            const orderDate = new Date(order.createdAt);
            const matchesDate = orderDate >= dateRange.start && orderDate <= dateRange.end;

            // Status filter
            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);

            // Zone filter
            const matchesZone = !zoneFilter || order.customer.deliveryZone.toLowerCase().includes(zoneFilter.toLowerCase());

            // Search filter
            const matchesSearch = !searchQuery ||
                order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.phone.includes(searchQuery) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesDate && matchesStatus && matchesZone && matchesSearch;
        });
    }, [orders, dateRange, statusFilter, zoneFilter, searchQuery]);

    // Stats (based on all orders, not filtered)
    const stats = {
        total: orders.length,
        enPreparation: orders.filter(o => o.status === "En préparation").length,
        enRoute: orders.filter(o => o.status === "En route").length,
        livre: orders.filter(o => o.status === "Livré").length,
    };
    const exportOrdersToCSV = () => {
        if (filteredOrders.length === 0) {
            alert("Aucune commande à exporter");
            return;
        }

        const headers = [
            "ID",
            "Statut",
            "Total (XAF)",
            "Date",
            "Client",
            "Téléphone",
            "Zone de livraison",
            "Créneau d'appel",
            "Nombre d'articles",
            "Articles",
            "Checkpoints"
        ];

        const rows = filteredOrders.map(order => [
            order.id,
            order.status,
            order.total,
            new Date(order.createdAt).toLocaleDateString("fr-FR"),
            order.customer.name,
            order.customer.phone,
            order.customer.deliveryZone,
            order.customer.callTime,
            order.items.length,
            order.items
                .map(i => `${i.productId} x${i.quantity}`)
                .join(" | "),
            order.checkpoints
                .map(c => `${c.status} @ ${c.location}`)
                .join(" → ")
        ]);

        const csvContent =
            [headers, ...rows]
                .map(row =>
                    row
                        .map(value => `"${String(value).replace(/"/g, '""')}"`)
                        .join(",")
                )
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `commandes_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const toggleStatusFilter = (status: OrderStatus) => {
        setStatusFilter(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const clearFilters = () => {
        setStatusFilter([]);
        setSearchQuery("");
        setZoneFilter("");
        // Reset date to last 30 days
        setDateRange({
            start: new Date(new Date().setDate(new Date().getDate() - 29)),
            end: new Date(),
        });
    };
    if (loading) return <CustomersPageSkeleton />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="mx-auto space-y-4">

                {/* Header with Date Filter */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <VintageHeader
                        title="Gestion des commandes"
                        count={filteredOrders.length}
                        pluralLabel="order"
                    />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Date Filter */}
                        <DateFilter
                            start={dateRange.start}
                            end={dateRange.end}
                            onChange={(range) => setDateRange(range)}
                        />

                        {/* Export Button */}
                        <button
                            onClick={exportOrdersToCSV}
                            className="w-full sm:w-auto px-4 py-2 bg-shopici-black hover:bg-shopici-charcoal text-white text-sm font-semibold rounded-lg transition-all shadow-md flex items-center gap-2 justify-center"
                        >
                            <Download className="w-4 h-4" />
                            Exporter
                        </button>
                    </div>

                </div>
                <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />

                {/* Stats */}
                <OrderStatsCards stats={stats} />

                {/* Filters */}
                <OrderFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    toggleStatusFilter={toggleStatusFilter}
                    clearFilters={clearFilters}
                />

                {/* Table */}
                <OrdersTable
                    orders={filteredOrders}
                    onSelectOrder={setSelectedOrder}
                />
            </div>

            {/* Drawer */}
            {selectedOrder && (
                <OrderDetailsDrawer
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onOrderUpdate={(updatedOrder: OrderTracking) => {
                        setOrders(prev =>
                            prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                        );
                        setSelectedOrder(updatedOrder); // update drawer too
                    }}
                />
            )}
        </div>
    );
}