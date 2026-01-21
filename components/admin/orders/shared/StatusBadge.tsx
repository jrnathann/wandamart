// components/admin/orders/shared/StatusBadge.tsx
import type { OrderStatus } from "@/types/OrderTracking";

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<OrderStatus, string> = {
    "En préparation":
      "bg-yellow-100 text-yellow-800 border border-yellow-200",
    "En route":
      "bg-blue-100 text-blue-800 border border-blue-200",
    "Livré":
      "bg-green-100 text-green-800 border border-green-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  );
}
