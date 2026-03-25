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
import ActionButton from "./shared/ActionButton";
import { useNotify } from "@/context/NotifyContext";

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderTracking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setExporting] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
    const [zoneFilter, setZoneFilter] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showUnserious, setShowUnserious] = useState(false);
    const { notify } = useNotify();
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
            const matchesSeriousness = showUnserious ? true : order.isSeriousCustomer !== false;

            return matchesDate && matchesStatus && matchesZone && matchesSearch && matchesSeriousness;

        });
    }, [orders, dateRange, statusFilter, zoneFilter, searchQuery, showUnserious]);

    // Stats (based on all orders, not filtered)
    const stats = {
        total: orders.length,
        enPreparation: orders.filter(o => o.status === "En préparation").length,
        enRoute: orders.filter(o => o.status === "En route").length,
        livre: orders.filter(o => o.status === "Livré").length,
    };
const exportOrdersToCSV = () => {
    // 1. START SYSTEM PROCESSING
    setExporting(true);

    // 2. GUARD CLAUSE (Validation)
    if (filteredOrders.length === 0) {
        notify("ALERTE", "Aucune commande détectée pour l'exportation", "warning");
        
        // CRITICAL: Reset the loading state before exiting
        setExporting(false); 
        return;
    }

    try {
        const headers = [
            "ID", "Statut", "Total (XAF)", "Date", "Client", 
            "Téléphone", "Zone de livraison", "Créneau d'appel", 
            "Nombre d'articles", "Articles", "Checkpoints"
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
            order.items.map(i => `${i.productId} x${i.quantity}`).join(" | "),
            order.checkpoints.map(c => `${c.status} @ ${c.location}`).join(" → ")
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        // 3. FILE GENERATION
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.href = url;
        // Clean filename (zero underscores in display, just tech format)
        link.download = `EXTRACT_ORDERS_${new Date().toISOString().slice(0, 10)}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 4. SUCCESS FEEDBACK (Optional: if you added a success state to your notify)
        notify("SYSTÈME", "Extraction du registre terminée","success");

    } catch (error) {
        // Handle unexpected engine failures
        notify("ERREUR", "Une erreur est survenue lors de la génération", "error");
    } finally {
        // 5. END SYSTEM PROCESSING (Always runs)
        setExporting(false);
    }
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
        setShowUnserious(false);
        // Reset date to last 30 days
        setDateRange({
            start: new Date(new Date().setDate(new Date().getDate() - 29)),
            end: new Date(),
        });
    };
    // Inside OrdersPage, add this handler:

    const handleToggleSeriousness = async (orderId: string, value: boolean | null) => {
        try {
            const payload = value === false
                ? { isSeriousCustomer: false, status: "Annulé" }
                : value === true
                    ? { isSeriousCustomer: true, status: "En préparation" } // ✅ restore
                    : { isSeriousCustomer: null }; // null = just remove label, don't touch status

            await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setOrders(prev =>
                prev.map(o => o.id === orderId
                    ? {
                        ...o,
                        isSeriousCustomer: value,
                        ...(value === false && { status: "Annulé" as OrderStatus }),
                        ...(value === true && { status: "En préparation" as OrderStatus }), // ✅
                    }
                    : o
                )
            );

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? {
                    ...prev,
                    isSeriousCustomer: value,
                    ...(value === false && { status: "Annulé" as OrderStatus }),
                    ...(value === true && { status: "En préparation" as OrderStatus }), // ✅
                } : null);
            }
        } catch (err) {
            console.error("Failed to update seriousness:", err);
        }
    };
    if (loading) return <CustomersPageSkeleton />;

    return (
        <div className="min-h-screen">
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

                        <ActionButton
                            label="Exporter CSV"
                            subLabel="Format Tableur"
                            onClick={exportOrdersToCSV}
                            isLoading={isExporting}
                        />
                    </div>

                </div>
                {/* Stats */}
                <OrderStatsCards stats={stats} />

                {/* Filters */}
                <OrderFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    toggleStatusFilter={toggleStatusFilter}
                    showUnserious={showUnserious}
                    toggleShowUnserious={() => setShowUnserious(prev => !prev)}
                    clearFilters={clearFilters}
                />

                {/* Table */}
                <OrdersTable
                    orders={filteredOrders}
                    onSelectOrder={setSelectedOrder}
                    onToggleSeriousness={handleToggleSeriousness}
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