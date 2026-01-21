// components/admin/orders/OrderItemsList.tsx
import type { OrderItem } from "@/types/OrderTracking";
import { products } from "@/data/products";

interface OrderItemsListProps {
  items: OrderItem[];
  total: number;
}

export default function OrderItemsList({ items, total }: OrderItemsListProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h3 className="text-sm font-bold text-shopici-black mb-3">Articles commandés</h3>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const product = products.find(p => p._id === item.productId);
          return (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-semibold text-shopici-black">
                  {product?.name || item.productId}
                </p>
                <p className="text-xs text-shopici-charcoal">
                  Qté: {item.quantity} × {item.price.toLocaleString()} XAF
                </p>
              </div>
              <p className="text-sm font-bold text-shopici-black">
                {(item.quantity * item.price).toLocaleString()} XAF
              </p>
            </div>
          );
        })}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-shopici-black">Total</span>
          <span className="text-lg font-bold text-shopici-coral">
            {total.toLocaleString()} XAF
          </span>
        </div>
      </div>
    </div>
  );
}