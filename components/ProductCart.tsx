import React, { useMemo } from "react";
import { ShoppingCart, MapPin, Clock, Star } from "lucide-react";
import { Product } from "@/types/Product";
import { useCart } from "@/context/CartContext";
import { CldImage } from "next-cloudinary";

export default function ProductCard({ product, onProductAdded }: { product: Product, onProductAdded?: (n: string) => void }) {
  const { addToCart } = useCart();

  const ratingData = useMemo(() => {
    const period = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3));
    const seed = product.name.length;
    const rating = (4.6 + ((period + seed) % 4) / 10).toFixed(1);
    const reviews = 85 + (seed * 4) + (period % 12);
    return { rating: Number(rating), reviews };
  }, [product.name]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    onProductAdded?.(product.name);
  };

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => window.location.href = `/product-details/${product.slug}`}
      /* UPDATED: Uses var(--shopici-background) and theme gray */
      className="group flex flex-col bg-[var(--shopici-background)] border border-shopici-gray/20 hover:border-shopici-blue transition-all duration-500 cursor-pointer overflow-hidden rounded-none"
    >
      {/* 1. Visual Stage */}
      {/* UPDATED: bg-shopici-gray/10 ensures visibility against any background */}
      <div className="relative aspect-square bg-shopici-gray/10 overflow-hidden p-6">
        {product.images?.[0] ? (
          <CldImage
            src={product.images[0].url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain mix-blend-multiply transition-transform duration-1000 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingCart className="text-shopici-gray/30" />
          </div>
        )}

        {/* Discount Badge - Uses shopici-coral */}
        {discountPercent > 0 && (
          <div className="absolute top-0 left-0 bg-shopici-coral text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest">
            -{discountPercent}% OFF
          </div>
        )}
      </div>

      {/* 2. Brand & Content Area */}
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        {/* Star Rating - Uses shopici-black & shopici-gray */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 ${i < Math.floor(ratingData.rating) ? 'fill-shopici-black text-shopici-black' : 'text-shopici-gray/50'}`}
              />
            ))}
          </div>
          <span className="text-[9px] font-bold text-shopici-charcoal uppercase tracking-widest">
            {ratingData.rating} ({ratingData.reviews})
          </span>
        </div>

        {/* Title - Uses shopici-black & shopici-blue on hover */}
        <h3 className="text-[14px] sm:text-[16px] font-bold text-shopici-black uppercase tracking-tight leading-tight mb-4 group-hover:text-shopici-blue transition-colors">
          {product.name}
        </h3>

        {/* Price Block - Uses shopici-coral & shopici-charcoal */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-black text-shopici-coral leading-none tracking-tighter">
            {new Intl.NumberFormat('fr-FR').format(product.price)}
            <span className="text-xs font-bold ml-1 text-shopici-blue uppercase tracking-tighter">FCFA</span>
          </span>
          {product.compareAtPrice && (
            <span className="text-sm font-medium text-shopici-gray line-through decoration-shopici-coral/40">
              {new Intl.NumberFormat('fr-FR').format(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* 3. Delivery Specs Grid - Uses shopici-blue/charcoal/gray */}
        {product.delivery?.available && (
          <div className="mt-auto pt-4 border-t border-shopici-gray/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-shopici-blue" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-shopici-gray tracking-widest">Region</span>
                <span className="text-[10px] font-bold text-shopici-black truncate max-w-[80px] sm:max-w-none">{product.delivery.areas[0]}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-shopici-gray/20 pl-4">
              <Clock className="w-3 h-3 text-shopici-blue" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-shopici-gray tracking-widest">Arrival</span>
                <span className="text-[10px] font-bold text-shopici-black">{product.delivery.estimatedDays}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Action Bar - Uses shopici-black & shopici-blue hover */}
        <div className="mt-6">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-3 bg-shopici-black text-white py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-shopici-blue active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4 text-shopici-coral" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}