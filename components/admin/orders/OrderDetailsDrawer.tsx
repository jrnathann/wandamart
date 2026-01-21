// components/admin/orders/OrderDetailsDrawer.tsx
import { useState } from "react";
import { X } from "lucide-react";
import type { OrderTracking, OrderStatus, TrackingCheckpoint } from "@/types/OrderTracking";
import CustomerInfoCard from "./CustomerInfoCard";
import OrderItemsList from "./OrderItemsList";
import StatusStepper from "./StatusStepper";
import DeliveryTimeline from "./DeliveryTimeline";
import { addOrderCheckpoint, updateOrderStatus } from "@/helper/order";

interface OrderDetailsDrawerProps {
  order: OrderTracking;
  onClose: () => void;
  onOrderUpdate?: (order: OrderTracking) => void;
}

export default function OrderDetailsDrawer({ order, onClose, onOrderUpdate }: OrderDetailsDrawerProps) {
  const [localOrder, setLocalOrder] = useState(order);
  const [loading, setLoading] = useState(false);

const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (newStatus === localOrder.status) return;

    setLoading(true);
    try {
        const updatedOrder = await updateOrderStatus(localOrder.id, newStatus);
        setLocalOrder(updatedOrder);
        if (onOrderUpdate) onOrderUpdate(updatedOrder); // <-- propagate change
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la mise à jour du statut");
    } finally {
        setLoading(false);
    }
};

const handleCheckpointAdd = async (checkpoint: TrackingCheckpoint) => {
    setLoading(true);
    try {
        const updatedOrder = await addOrderCheckpoint(localOrder.id, checkpoint);
        setLocalOrder(updatedOrder);
        if (onOrderUpdate) onOrderUpdate(updatedOrder); // <-- propagate change
    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'ajout du checkpoint");
    } finally {
        setLoading(false);
    }
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
            <h2 className="text-lg font-bold text-shopici-black">Commande {localOrder.id}</h2>
            <p className="text-xs text-shopici-charcoal">
              Créée le {new Date(localOrder.createdAt).toLocaleDateString('fr-FR')}
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
          <StatusStepper currentStatus={localOrder.status} checkpoints={localOrder.checkpoints}/>
          <DeliveryTimeline 
            checkpoints={localOrder.checkpoints} 
            currentStatus={localOrder.status}
            orderId={localOrder.id}
            onStatusUpdate={handleStatusUpdate}
            onCheckpointAdd={handleCheckpointAdd}
          />

          {/* Footer Info */}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-shopici-charcoal">
            <p>Dernière mise à jour: {new Date(localOrder.updatedAt).toLocaleString('fr-FR')}</p>
            {localOrder.estimatedDelivery && (
              <p>Livraison estimée: {new Date(localOrder.estimatedDelivery).toLocaleDateString('fr-FR')}</p>
            )}
            {loading && <p className="text-xs text-blue-500 mt-1">Mise à jour en cours...</p>}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}