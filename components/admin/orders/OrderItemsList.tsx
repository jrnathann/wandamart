// components/admin/orders/OrderItemsList.tsx
import type { OrderItem } from "@/types/OrderTracking";
import { Product } from "@/types/Product";
import { useState, useEffect } from "react";
import { Package, Hash } from "lucide-react";

interface OrderItemsListProps {
  items: OrderItem[];
  total: number;
}

export default function OrderItemsList({ items, total }: OrderItemsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center border-2 border-dashed border-shopici-black/10">
        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
          Chargement de l'inventaire...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-shopici-black/10 p-5 md:p-8 rounded-none">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-shopici-black/10">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-shopici-blue" strokeWidth={3} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-shopici-black">
            Articles commandés
          </h3>
        </div>
        <span className="text-[9px] font-bold text-shopici-black/30 uppercase tracking-tighter">
          Total Items: {items.length}
        </span>
      </div>

      {/* ITEMS TABLE HEADER */}
      <div className="hidden md:grid grid-cols-12 gap-4 mb-4 px-2">
        <p className="col-span-7 text-[9px] font-black uppercase tracking-widest text-shopici-black/30">Désignation</p>
        <p className="col-span-2 text-[9px] font-black uppercase tracking-widest text-shopici-black/30 text-center">Qté</p>
        <p className="col-span-3 text-[9px] font-black uppercase tracking-widest text-shopici-black/30 text-right">Montant</p>
      </div>

      {/* ITEMS LIST */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const product = products.find((p) => p._id === item.productId);
          return (
            <div 
              key={idx} 
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-4 px-2 bg-slate-50/50 md:bg-transparent border-l-4 border-shopici-blue md:border-none"
            >
              {/* Product Info */}
              <div className="col-span-7 flex flex-col justify-center">
                <p className="text-sm font-black text-shopici-black uppercase leading-tight">
                  {product?.name || `SKU: ${item.productId.slice(-8)}`}
                </p>
                <p className="text-[10px] font-bold text-shopici-black/40 mt-1">
                  PRIX UNITAIRE: {item.price.toLocaleString()} XAF
                </p>
              </div>

              {/* Quantity */}
              <div className="col-span-2 flex items-center md:justify-center">
                <div className="flex items-center gap-2 md:bg-shopici-black/5 px-3 py-1">
                   <Hash size={10} className="text-shopici-black/30" />
                   <span className="text-sm font-black tabular-nums">{item.quantity}</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="col-span-3 flex items-center justify-end">
                <p className="text-sm font-black text-shopici-black tabular-nums">
                  {(item.quantity * item.price).toLocaleString()} <span className="text-[9px]">XAF</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOTAL SUMMARY */}
      <div className="mt-10 pt-6 border-t-2 border-shopici-black border-double">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-shopici-black/30">Total Général</p>
            <p className="text-[10px] text-shopici-black/40 font-bold uppercase italic">Taxes incluses (HT)</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-shopici-coral tabular-nums tracking-tighter">
              {total.toLocaleString()}
            </span>
            <span className="ml-2 text-xs font-black text-shopici-coral">XAF</span>
          </div>
        </div>
      </div>

      {/* SYSTEM DECORATION */}
      <div className="mt-8 flex gap-1 opacity-10">
         {Array.from({length: 20}).map((_, i) => (
           <div key={i} className="h-1 w-1 bg-shopici-black" />
         ))}
      </div>
    </div>
  );
}