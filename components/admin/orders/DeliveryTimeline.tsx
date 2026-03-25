// components/admin/orders/DeliveryTimeline.tsx
// Pure presentational component — all state lives in OrderDetailsDrawer.
// On a confirmed API response this component calls onStatusUpdate / onCheckpointAdd
// so the parent can update localOrder, which flows back down as props.
import { useState } from "react";
import { Plus, Calendar, Check, Truck, Package as PackageIcon } from "lucide-react";
import type { TrackingCheckpoint, OrderStatus } from "@/types/OrderTracking";
import StatusBadge from "./shared/StatusBadge";
import StatusStepper from "./StatusStepper";

interface DeliveryTimelineProps {
    checkpoints: TrackingCheckpoint[];
    currentStatus: OrderStatus;
    orderId: string;
    onStatusUpdate?: (newStatus: OrderStatus) => void;
    onCheckpointAdd?: (checkpoint: TrackingCheckpoint) => void;
}

export default function DeliveryTimeline({
    checkpoints,
    currentStatus,
    orderId,
    onStatusUpdate,
    onCheckpointAdd,
}: DeliveryTimelineProps) {
    // UI-only state — nothing that affects the order data model
    const [showAddForm, setShowAddForm]     = useState(false);
    const [newCheckpoint, setNewCheckpoint] = useState<Partial<TrackingCheckpoint>>({});
    const [isUpdating, setIsUpdating]       = useState(false);
    const [error, setError]                 = useState<string | null>(null);

    const handleQuickStatusUpdate = async (newStatus: OrderStatus) => {
        if (newStatus === currentStatus || isUpdating) return;

        setIsUpdating(true);
        setError(null);

        const autoCheckpoint: TrackingCheckpoint = {
            location: getDefaultLocation(newStatus),
            time:     new Date().toISOString(),
            status:   newStatus,
        };

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                // FIX: key must be "newCheckpoint" — that's what the API reads
                body: JSON.stringify({ status: newStatus, newCheckpoint: autoCheckpoint }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({} as { error?: string }));
                throw new Error(data.error ?? "Erreur lors de la mise à jour");
            }

            onStatusUpdate?.(newStatus);
            onCheckpointAdd?.(autoCheckpoint);
        } catch (err: any) {
            console.error("Status update failed:", err);
            setError(err.message ?? "Erreur réseau — veuillez réessayer");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleManualAdd = async () => {
        if (currentStatus === "Livré") {
            setError("Impossible d'ajouter un checkpoint, la commande est déjà livrée.");
            return;
        }
        if (!newCheckpoint.location || !newCheckpoint.time || !newCheckpoint.status) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        setIsUpdating(true);
        setError(null);

        const checkpoint: TrackingCheckpoint = {
            location: newCheckpoint.location,
            time:     newCheckpoint.time,
            status:   newCheckpoint.status as OrderStatus,
        };

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                // FIX: key must be "newCheckpoint" — that's what the API reads
                body: JSON.stringify({ status: checkpoint.status, newCheckpoint: checkpoint }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({} as { error?: string }));
                throw new Error(data.error ?? "Erreur lors de l'ajout");
            }

            // FIX: do NOT call onStatusUpdate here — onCheckpointAdd in the parent
            // already updates both checkpoints AND status atomically.
            onCheckpointAdd?.(checkpoint);

            setShowAddForm(false);
            setNewCheckpoint({});
        } catch (err: any) {
            console.error("Manual checkpoint failed:", err);
            setError(err.message ?? "Erreur réseau — veuillez réessayer");
        } finally {
            setIsUpdating(false);
        }
    };

    const getDefaultLocation = (s: OrderStatus): string => ({
        "En préparation": "Shopici Warehouse",
        "En route":       "En transit",
        "Livré":          "Livré au client",
        "Annulé":         "Commande annulée",
    }[s] ?? s);

    const getStatusIcon = (s: OrderStatus) => {
        switch (s) {
            case "En préparation": return <PackageIcon className="w-4 h-4" />;
            case "En route":       return <Truck className="w-4 h-4" />;
            case "Livré":          return <Check className="w-4 h-4" />;
            default:               return null;
        }
    };

    // FIX: ascending sort (oldest first, newest at bottom) so the timeline reads
    // chronologically top-to-bottom. Descending sort was causing "Livré" to appear
    // in the middle when its timestamp was earlier than a prior "En route" checkpoint.
    const sortedCheckpoints = [...checkpoints].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    return (
        <div className="bg-white p-4 border border-slate-200">
            {/* StatusStepper reads straight from props — always in sync with localOrder */}
            <StatusStepper currentStatus={currentStatus} checkpoints={checkpoints} />

            <div className="flex items-center justify-between mb-4 mt-4">
                <h3 className="text-sm font-bold text-shopici-black">Suivi de livraison</h3>
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setError(null); }}
                    className="px-3 py-1 bg-shopici-blue/10 hover:bg-shopici-blue/20 text-shopici-blue text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                    Ajouter
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
                    {error}
                </div>
            )}

            {/* Quick status buttons */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-shopici-charcoal mb-2">Mise à jour rapide</p>
                <div className="grid grid-cols-3 gap-2">
                    {(["En préparation", "En route", "Livré"] as OrderStatus[]).map((s) => {
                        const isActive = currentStatus === s;
                        const isLocked = currentStatus === "Livré" && s !== "Livré";
                        const disabled = isActive || isLocked || isUpdating;

                        const activeColors: Record<string, string> = {
                            "En préparation": "bg-orange-100 text-orange-700 border-orange-300",
                            "En route":       "bg-blue-100 text-blue-700 border-blue-300",
                            "Livré":          "bg-green-100 text-green-700 border-green-300",
                        };
                        const hoverColors: Record<string, string> = {
                            "En préparation": "hover:bg-orange-50 text-orange-700 hover:border-orange-300",
                            "En route":       "hover:bg-blue-50 text-blue-700 hover:border-blue-300",
                            "Livré":          "hover:bg-green-50 text-green-700 hover:border-green-300",
                        };

                        return (
                            <button
                                key={s}
                                onClick={() => handleQuickStatusUpdate(s)}
                                disabled={disabled}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
                                    isActive
                                        ? `${activeColors[s]} cursor-not-allowed`
                                        : disabled
                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : `bg-white border-slate-200 ${hoverColors[s]}`
                                } ${isUpdating && !isActive ? "opacity-50" : ""}`}
                            >
                                {isUpdating && !isActive ? (
                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                ) : (
                                    getStatusIcon(s)
                                )}
                                <span className="hidden sm:inline">
                                    {s === "En préparation" ? "Prép." : s === "En route" ? "Route" : "Livré"}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-shopici-charcoal mt-2 text-center opacity-75">
                    Cliquez pour mettre à jour automatiquement
                </p>
            </div>

            {/* Manual add form */}
            {showAddForm && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
                    <p className="text-xs font-semibold text-shopici-charcoal mb-2">Ajouter manuellement</p>
                    <input
                        type="text"
                        placeholder="Localisation (ex: Entrepôt Douala)"
                        value={newCheckpoint.location || ""}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-shopici-blue"
                        onChange={(e) => setNewCheckpoint({ ...newCheckpoint, location: e.target.value })}
                    />
                    <input
                        type="datetime-local"
                        value={newCheckpoint.time || ""}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-shopici-blue"
                        onChange={(e) => setNewCheckpoint({ ...newCheckpoint, time: e.target.value })}
                    />
                    <select
                        value={newCheckpoint.status || ""}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-shopici-blue"
                        onChange={(e) => setNewCheckpoint({ ...newCheckpoint, status: e.target.value as OrderStatus })}
                    >
                        <option value="">Choisir un statut</option>
                        <option value="En préparation">En préparation</option>
                        <option value="En route">En route</option>
                        <option value="Livré">Livré</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={handleManualAdd}
                            disabled={isUpdating}
                            className="flex-1 px-3 py-2 bg-shopici-blue hover:bg-shopici-blue/90 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                            onClick={() => { setShowAddForm(false); setNewCheckpoint({}); setError(null); }}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-shopici-charcoal text-xs font-medium rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Timeline — ascending order: oldest at top, newest at bottom */}
            <div className="relative space-y-4">
                {checkpoints.length > 0 && (
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                )}

                {checkpoints.length === 0 ? (
                    <div className="text-center py-8 text-shopici-charcoal">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Aucun point de suivi</p>
                        <p className="text-xs opacity-75">Utilisez la mise à jour rapide ci-dessus</p>
                    </div>
                ) : (
                    sortedCheckpoints.map((checkpoint, idx) => {
                        // The last entry in ascending order is the most recent — highlight it
                        const isLatest = idx === sortedCheckpoints.length - 1;
                        return (
                            <div key={idx} className="relative pl-10">
                                <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white shadow transition-all ${
                                    checkpoint.status === "Livré"      ? "bg-green-500"
                                    : checkpoint.status === "En route" ? "bg-blue-500"
                                    : checkpoint.status === "Annulé"   ? "bg-red-400"
                                    : "bg-yellow-500"
                                } ${isLatest ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : ""}`} />
                                <div className={`rounded-lg p-3 border transition-all ${
                                    isLatest
                                        ? "bg-white border-slate-300 shadow-sm"
                                        : "bg-slate-50 border-slate-100"
                                }`}>
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="text-sm font-semibold text-shopici-black">{checkpoint.location}</p>
                                        <StatusBadge status={checkpoint.status} />
                                    </div>
                                    <p className="text-xs text-shopici-charcoal flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(checkpoint.time).toLocaleString("fr-FR")}
                                    </p>
                                    {isLatest && (
                                        <p className="text-xs text-shopici-blue font-medium mt-1">
                                            ● Statut actuel
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}