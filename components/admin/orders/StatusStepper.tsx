import { Check } from "lucide-react";
import type { OrderStatus, TrackingCheckpoint } from "@/types/OrderTracking";

interface StatusStepperProps {
  currentStatus: OrderStatus;
  checkpoints?: TrackingCheckpoint[];
}

export default function StatusStepper({ currentStatus, checkpoints = [] }: StatusStepperProps) {
  const statuses: OrderStatus[] = ["En préparation", "En route", "Livré"];

  // Determine the latest status (checkpoint takes priority)
  const latestStatus = checkpoints.length > 0
    ? checkpoints.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()).slice(-1)[0].status
    : currentStatus;

  const currentIndex = statuses.indexOf(latestStatus);

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h3 className="text-sm font-bold text-shopici-black mb-4">Statut de la commande</h3>
      <div className="flex items-center justify-between">
        {statuses.map((status, idx) => {
          const isCompleted = idx < currentIndex; // steps before current
          const isActive = idx === currentIndex;  // current step
          const isDelivered = latestStatus === "Livré"; // special case

          return (
            <div key={status} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDelivered || isCompleted
                  ? 'bg-green-500 text-white'      // completed steps or delivered
                  : isActive
                  ? 'bg-gradient-to-br from-shopici-blue to-shopici-coral text-white shadow-lg' // active
                  : 'bg-slate-200 text-slate-400' // pending
              }`}>
                <Check className="w-5 h-5" />
              </div>
              <p className="text-xs text-shopici-charcoal mt-2 text-center">{status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
