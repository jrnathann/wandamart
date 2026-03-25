// components/admin/orders/shared/StatusBadge.tsx
import type { OrderStatus } from "@/types/OrderTracking";

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Industrial Color Mapping
  const config: Record<OrderStatus, { border: string; text: string; dot: string; bg: string }> = {
    "En préparation": {
      border: "border-orange-500/20",
      text: "text-orange-600",
      dot: "bg-orange-500",
      bg: "bg-orange-50/50",
    },
    "En route": {
      border: "border-shopici-blue/20",
      text: "text-shopici-blue",
      dot: "bg-shopici-blue",
      bg: "bg-shopici-blue/5",
    },
    "Livré": {
      border: "border-green-600/20",
      text: "text-green-700",
      dot: "bg-green-600",
      bg: "bg-green-50/50",
    },
    "Annulé": {
      border: "border-shopici-coral/20",
      text: "text-shopici-coral",
      dot: "bg-shopici-coral",
      bg: "bg-shopici-coral/5",
    },
  };

  const { border, text, dot, bg } = config[status];

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-2.5 py-1 
        rounded-none border-l-2 ${border} ${bg} ${text}
        text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap
        transition-all duration-300
      `}
    >
      {/* Status Light: Pulse effect for active states */}
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === "En route" ? "animate-pulse" : ""}`} />
      
      <span>{status}</span>
    </div>
  );
}