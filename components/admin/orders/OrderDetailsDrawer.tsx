// components/admin/orders/OrderDetailsDrawer.tsx
import { useState } from "react";
import { X } from "lucide-react";
import type { OrderTracking, OrderStatus, TrackingCheckpoint } from "@/types/OrderTracking";
import CustomerInfoCard from "./CustomerInfoCard";
import OrderItemsList from "./OrderItemsList";
import DeliveryTimeline from "./DeliveryTimeline";
import { addOrderCheckpoint, updateOrderStatus } from "@/helper/order";

interface OrderDetailsDrawerProps {
    order: OrderTracking;
    onClose: () => void;
    onOrderUpdate?: (order: OrderTracking) => void;
}

export default function OrderDetailsDrawer({ order, onClose, onOrderUpdate }: OrderDetailsDrawerProps) {
    // localOrder is the single source of truth for everything rendered in this drawer.
    // It is initialized from the prop once on mount. All updates go through setLocalOrder
    // so the drawer always reflects the latest server-confirmed state — even after close/reopen
    // within the same session, as long as the parent also receives the updated order via
    // onOrderUpdate and passes it back down on the next open.
    const [localOrder, setLocalOrder] = useState<OrderTracking>(order);
    const [loading, setLoading] = useState(false);

    // Commit a server-confirmed order update to local state and notify the parent list.
    // The parent must call setOrders (or equivalent) with the returned order so that
    // the next time this drawer opens it receives the fresh order as its prop.
    const commit = (updatedOrder: OrderTracking) => {
        setLocalOrder(updatedOrder);
        onOrderUpdate?.(updatedOrder);
    };

    // Called by DeliveryTimeline after the user picks a quick-status button.
    // DeliveryTimeline has already hit the API and confirmed success — we just
    // update our localOrder so the whole drawer (header, footer timestamps, etc.)
    // reflects the new state. We do NOT re-fetch here; the API response from
    // DeliveryTimeline is the source of truth.
    const handleStatusUpdate = (newStatus: OrderStatus) => {
        // Build an updated order object so the drawer stays consistent without a re-fetch
        const updatedOrder: OrderTracking = {
            ...localOrder,
            status: newStatus,
            updatedAt: new Date().toISOString(),
        };
        commit(updatedOrder);
    };

    const handleCheckpointAdd = (checkpoint: TrackingCheckpoint) => {
        const updatedOrder: OrderTracking = {
            ...localOrder,
            status: checkpoint.status,
            checkpoints: [...localOrder.checkpoints, checkpoint],
            updatedAt: new Date().toISOString(),
        };
        commit(updatedOrder);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideInRight">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-lg font-bold text-shopici-black">
                            Commande {localOrder.id}
                        </h2>
                        <p className="text-xs text-shopici-charcoal">
                            Créée le {new Date(localOrder.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-shopici-charcoal" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <CustomerInfoCard customer={localOrder.customer} />
                    <OrderItemsList items={localOrder.items} total={localOrder.total} />

                    {/* DeliveryTimeline is a pure presentational component — it receives
                        localOrder's checkpoints and status as props. It owns no state of
                        its own; it calls back here on success so we stay in sync. */}
                    <DeliveryTimeline
                        checkpoints={localOrder.checkpoints}
                        currentStatus={localOrder.status}
                        orderId={localOrder.id}
                        onStatusUpdate={handleStatusUpdate}
                        onCheckpointAdd={handleCheckpointAdd}
                    />

                    {/* Footer */}
                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-shopici-charcoal space-y-1">
                        <p>Dernière mise à jour : {new Date(localOrder.updatedAt).toLocaleString("fr-FR")}</p>
                        {localOrder.estimatedDelivery && (
                            <p>Livraison estimée : {new Date(localOrder.estimatedDelivery).toLocaleDateString("fr-FR")}</p>
                        )}
                        {loading && <p className="text-blue-500">Mise à jour en cours...</p>}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to   { transform: translateX(0); }
                }
                .animate-fadeIn      { animation: fadeIn 0.2s ease-out; }
                .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
            `}</style>
        </>
    );
}