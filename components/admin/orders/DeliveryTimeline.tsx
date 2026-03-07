// components/admin/orders/DeliveryTimeline.tsx
import { useState } from "react";
import { Plus, Calendar, Check, Truck, Package as PackageIcon } from "lucide-react";
import type { TrackingCheckpoint, OrderStatus } from "@/types/OrderTracking";
import StatusBadge from "./shared/StatusBadge";

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
    onCheckpointAdd
}: DeliveryTimelineProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCheckpoint, setNewCheckpoint] = useState<Partial<TrackingCheckpoint>>({});
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuickStatusUpdate = async (newStatus: OrderStatus) => {
        if (newStatus === currentStatus) return;

        setIsUpdating(true);

        // Auto-create checkpoint for status change
        const autoCheckpoint: TrackingCheckpoint = {
            location: getDefaultLocation(newStatus),
            time: new Date().toISOString(),
            status: newStatus
        };

        console.log("Quick status update:", { orderId, newStatus, autoCheckpoint });

        // Call parent callbacks
        if (onStatusUpdate) onStatusUpdate(newStatus);
        if (onCheckpointAdd) onCheckpointAdd(autoCheckpoint);

        // Simulate API call
        setTimeout(() => {
            setIsUpdating(false);
        }, 500);
    };

    const handleManualAdd = () => {
        if (currentStatus === "Livré") {
            alert("Impossible d'ajouter un checkpoint, la commande est déjà livrée.");
            return;
        }

        if (!newCheckpoint.location || !newCheckpoint.time || !newCheckpoint.status) {
            alert("Veuillez remplir tous les champs");
            return;
        }

        const checkpoint: TrackingCheckpoint = {
            location: newCheckpoint.location,
            time: newCheckpoint.time,
            status: newCheckpoint.status as OrderStatus
        };

        console.log("Manual checkpoint add:", checkpoint);

        if (onCheckpointAdd) onCheckpointAdd(checkpoint);

        setShowAddForm(false);
        setNewCheckpoint({});
    };

    const getDefaultLocation = (status: OrderStatus): string => {
        const locations: Record<OrderStatus, string> = {
            "En préparation": "Shopici Warehouse",
            "En route": "En transit",
            "Livré": "Livré au client",
            "Annulé": "Commande annulée"
        };
        return locations[status];
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case "En préparation": return <PackageIcon className="w-4 h-4" />;
            case "En route": return <Truck className="w-4 h-4" />;
            case "Livré": return <Check className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-shopici-black">Suivi de livraison</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1 bg-shopici-blue/10 hover:bg-shopici-blue/20 text-shopici-blue text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                    Ajouter
                </button>
            </div>

            {/* Quick Status Update Buttons */}
            <div className="mb-4 p-3 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-shopici-charcoal mb-2">Mise à jour rapide</p>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => handleQuickStatusUpdate("En préparation")}
                        disabled={currentStatus === "Livré" || currentStatus === "En préparation" || isUpdating}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${currentStatus === "En préparation"
                            ? 'bg-orange-100 text-orange-700 border border-orange-300 cursor-not-allowed'
                            : currentStatus === "Livré"
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-white hover:bg-orange-50 text-orange-700 border border-slate-200 hover:border-orange-300'
                            }`}
                    >
                        {getStatusIcon("En préparation")}
                        <span className="hidden sm:inline">Prép.</span>
                    </button>

                    <button
                        onClick={() => handleQuickStatusUpdate("En route")}
                        disabled={currentStatus === "En route" || currentStatus === "Livré" || isUpdating}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${currentStatus === "En route"
                            ? 'bg-blue-100 text-blue-700 border border-blue-300 cursor-not-allowed'
                            : currentStatus === "Livré"
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300'
                            }`}
                    >
                        {getStatusIcon("En route")}
                        <span className="hidden sm:inline">Route</span>
                    </button>

                    <button
                        onClick={() => handleQuickStatusUpdate("Livré")}
                        disabled={currentStatus === "Livré" || isUpdating}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${currentStatus === "Livré"
                            ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                            : 'bg-white hover:bg-green-50 text-green-700 border border-slate-200 hover:border-green-300'
                            }`}
                    >
                        {getStatusIcon("Livré")}
                        <span className="hidden sm:inline">Livré</span>
                    </button>
                </div>
                <p className="text-xs text-shopici-charcoal mt-2 text-center opacity-75">
                    Cliquez pour mettre à jour automatiquement
                </p>
            </div>

            {/* Manual Add Checkpoint Form */}
            {showAddForm && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
                    <p className="text-xs font-semibold text-shopici-charcoal mb-2">Ajouter manuellement</p>
                    <input
                        type="text"
                        placeholder="Localisation (ex: Entrepôt Douala)"
                        value={newCheckpoint.location || ''}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-shopici-blue"
                        onChange={(e) => setNewCheckpoint({ ...newCheckpoint, location: e.target.value })}
                    />
                    <input
                        type="datetime-local"
                        value={newCheckpoint.time || ''}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-shopici-blue"
                        onChange={(e) => setNewCheckpoint({ ...newCheckpoint, time: e.target.value })}
                    />
                    <select
                        value={newCheckpoint.status || ''}
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
                            className="flex-1 px-3 py-2 bg-shopici-blue hover:bg-shopici-blue/90 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                            Enregistrer
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setNewCheckpoint({});
                            }}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-shopici-charcoal text-xs font-medium rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Timeline */}
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
                    checkpoints.map((checkpoint, idx) => (
                        <div key={idx} className="relative pl-10">
                            <div className={`absolute left-2 w-4 h-4 rounded-full ${checkpoint.status === "Livré" ? 'bg-green-500' :
                                checkpoint.status === "En route" ? 'bg-blue-500' :
                                    'bg-yellow-500'
                                } border-2 border-white shadow`} />

                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-semibold text-shopici-black">{checkpoint.location}</p>
                                    <StatusBadge status={checkpoint.status} />
                                </div>
                                <p className="text-xs text-shopici-charcoal flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(checkpoint.time).toLocaleString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}