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
    // Initialized from prop once on mount. All updates go through setLocalOrder so the
    // drawer always reflects the latest server-confirmed state.
    const [localOrder, setLocalOrder] = useState<OrderTracking>(order);
    const [loading, setLoading] = useState(false);

    // Called by DeliveryTimeline after a quick-status button is confirmed by the API.
    // FIX 1: functional updater (prev =>) so we always spread from the latest localOrder,
    //         not a stale closure snapshot.
    // FIX 2: onOrderUpdate wrapped in setTimeout(0) to push the parent setState call
    //         out of React's render phase, preventing the "setState during render"
    //         violation on OrdersPage.
    const handleStatusUpdate = (newStatus: OrderStatus) => {
        setLocalOrder((prev) => {
            const updatedOrder: OrderTracking = {
                ...prev,
                status: newStatus,
                updatedAt: new Date().toISOString(),
            };
            setTimeout(() => onOrderUpdate?.(updatedOrder), 0);
            return updatedOrder;
        });
    };

    // Called by DeliveryTimeline after any checkpoint (quick or manual) is confirmed.
    // Updates both checkpoints array and status atomically so the stepper stays in sync.
    const handleCheckpointAdd = (checkpoint: TrackingCheckpoint) => {
        setLocalOrder((prev) => {
            const updatedOrder: OrderTracking = {
                ...prev,
                status: checkpoint.status,
                checkpoints: [...prev.checkpoints, checkpoint],
                updatedAt: new Date().toISOString(),
            };
            setTimeout(() => onOrderUpdate?.(updatedOrder), 0);
            return updatedOrder;
        });
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
                {/* 1. SYSTEM MANIFEST: Live Order Data Terminal */}
                <div className="sticky top-0 bg-white border-b-2 border-shopici-black p-6 flex items-center justify-between z-20 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

                    <div className="flex items-center gap-6">
                        {/* Zone Indicator: High-visibility for dispatchers */}


                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black bg-shopici-black text-white px-1.5 py-0.5 tracking-[0.2em]">
                                    {localOrder.status}
                                </span>
                            </div>

                            <h2 className="text-2xl font-black text-shopici-black tracking-tighter leading-none flex items-baseline gap-2">
                                REF_ID:
                                <span className="font-mono text-shopici-blue tabular-nums">
                                    {localOrder.id.toUpperCase()}
                                </span>
                            </h2>

                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-shopici-charcoal/50">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-none border border-shopici-black/20" />
                                    Entrée: {new Date(localOrder.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Exit Module */}
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={onClose}
                            className="group w-12 h-12 flex items-center justify-center border-2 border-shopici-black hover:bg-shopici-coral hover:border-shopici-coral transition-all duration-300"
                        >
                            <X className="w-6 h-6 text-shopici-black group-hover:text-white" strokeWidth={3} />
                        </button>
                        <span className="text-[8px] font-mono text-shopici-charcoal/30 uppercase tracking-tighter">
                            Esc_to_Close
                        </span>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <CustomerInfoCard customer={localOrder.customer} />
                    <OrderItemsList items={localOrder.items} total={localOrder.total} />

                    {/* DeliveryTimeline is a pure presentational component — it receives
                        localOrder's checkpoints and status as props. It owns no order state
                        of its own; it calls back here on success so we stay in sync. */}
                    <DeliveryTimeline
                        checkpoints={localOrder.checkpoints}
                        currentStatus={localOrder.status}
                        orderId={localOrder.id}
                        onStatusUpdate={handleStatusUpdate}
                        onCheckpointAdd={handleCheckpointAdd}
                    />

                    {/* 4. SYSTEM LOG & TELEMETRY: Industrial Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-shopici-black/10">
                        <div className="bg-shopici-gray/5 border-l-4 border-shopici-charcoal/20 p-4 space-y-4">

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Log Entry: Update Status */}
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black text-shopici-charcoal/40 uppercase tracking-[0.2em] block">
                                        Dernier_Sync_Système
                                    </span>
                                    <p className="font-mono text-[10px] text-shopici-black font-bold tabular-nums">
                                        {new Date(localOrder.updatedAt).toLocaleString("fr-FR").replace(/\//g, ".")}
                                    </p>
                                </div>

                                {/* Delivery Estimation Badge */}
                                {localOrder.estimatedDelivery && (
                                    <div className="md:text-right space-y-1">
                                        <span className="text-[8px] font-black text-shopici-blue uppercase tracking-[0.2em] block">
                                            ETA_Livraison_Prévue
                                        </span>
                                        <p className="font-mono text-[10px] text-shopici-blue font-bold tabular-nums">
                                            {new Date(localOrder.estimatedDelivery).toLocaleDateString("fr-FR").replace(/\//g, ".")}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Loading State: Industrial Progress Bar */}
                            {loading && (
                                <div className="space-y-2 pt-2 border-t border-shopici-charcoal/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-shopici-blue animate-pulse uppercase tracking-widest">
                                            Synchronisation_Cloud...
                                        </span>
                                        <span className="text-[8px] font-mono text-shopici-blue/40 font-bold">DATA_PATCH_01</span>
                                    </div>

                                    {/* Striped Progress Bar */}
                                    <div className="h-1.5 w-full bg-shopici-blue/10 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-shopici-blue w-1/3 animate-[loading_1.5s_infinite_linear]"
                                            style={{
                                                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)',
                                                backgroundSize: '12px 12px'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Final System Stamp */}
                            <div className="flex items-center gap-2 opacity-30 pt-1">
                                <div className="w-1.5 h-1.5 bg-shopici-charcoal" />
                                <span className="text-[7px] font-mono text-shopici-black uppercase tracking-tighter">
                                    Terminal_Node: {localOrder.id.slice(0, 8).toUpperCase()} // END_OF_LOG
                                </span>
                            </div>
                        </div>
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
                .animate-fadeIn       { animation: fadeIn 0.2s ease-out; }
                .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
            `}</style>
        </>
    );
}