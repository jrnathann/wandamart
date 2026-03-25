// components/admin/orders/StatusStepper.tsx
import { Check } from "lucide-react";
import type { OrderStatus, TrackingCheckpoint } from "@/types/OrderTracking";

interface StatusStepperProps {
    currentStatus: OrderStatus;
    checkpoints?: TrackingCheckpoint[];
}

export default function StatusStepper({ currentStatus, checkpoints = [] }: StatusStepperProps) {
    const statuses: OrderStatus[] = ["En préparation", "En route", "Livré"];

    // FIX: use currentStatus directly as the source of truth.
    // Previously derived from latest-by-time checkpoint, which could pick an
    // older logical status if a later timestamp existed (e.g. "En route" at
    // 22:59:28 beating a manually-added "Livré" at 22:59:00).
    // currentStatus is always set atomically by OrderDetailsDrawer on every update.
    const currentIndex = statuses.indexOf(currentStatus);

    const stepColors: Record<OrderStatus, { bg: string; ring: string }> = {
        "En préparation": { bg: "bg-orange-500", ring: "ring-orange-200" },
        "En route": { bg: "bg-blue-500", ring: "ring-blue-200" },
        "Livré": { bg: "bg-green-500", ring: "ring-green-200" },
        "Annulé": { bg: "bg-red-400", ring: "ring-red-200" },
    };

    return (
        <div className="bg-white mb-4">
            <h3 className="text-sm font-bold text-shopici-black mb-4">Statut de la commande</h3>

            <div className="relative flex items-center justify-between">
                {/* Connecting line behind the dots */}
                <div className="absolute left-5 right-5 top-5 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

                {statuses.map((status, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;
                    const colors = stepColors[status];

                    return (
                        <div key={status} className="relative z-10 flex flex-col items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white transition-all duration-300 ${isCompleted
                                        ? "bg-green-500 ring-2 ring-green-200"
                                        : isActive
                                            ? `${colors.bg} ring-2 ${colors.ring} shadow-md`
                                            : "bg-slate-200"
                                    }`}
                            >
                                <Check
                                    className={`w-5 h-5 transition-colors ${isCompleted || isActive ? "text-white" : "text-slate-400"
                                        }`}
                                />
                            </div>
                            <p
                                className={`text-xs mt-2 text-center font-medium transition-colors ${isActive
                                        ? "text-shopici-black"
                                        : isCompleted
                                            ? "text-green-600"
                                            : "text-slate-400"
                                    }`}
                            >
                                {status}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Cancelled state warning */}
            {currentStatus === "Annulé" && (
                <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium text-center">
                    Cette commande a été annulée
                </div>
            )}
        </div>
    );
}