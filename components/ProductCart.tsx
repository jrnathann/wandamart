import { ShoppingCart, MapPin, Clock } from "lucide-react";
import { Product } from "@/types/Product";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onProductAdded?: (productName: string) => void;
}

export default function ProductCard({ product, onProductAdded }: ProductCardProps) {
    const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const handleCardClick = () => {
    // Navigate to product detail page
    window.location.href = `/product-details/${product.slug}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    // Prevent card click when clicking the button
    e.stopPropagation();
      addToCart(product);

    if (onProductAdded) {
      onProductAdded(product.name);
    } else {
      // Default behavior: add to cart and show feedback
      console.log('Added to cart:', product);
      // You can add toast notification here
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-shopici-gray/30 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-shopici-gray/20">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].url} 
            alt={product.images[0].alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-shopici-gray to-shopici-blue/20 flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-shopici-charcoal/40" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.compareAtPrice && (
            <span className="px-3 py-1 bg-shopici-coral text-white text-xs font-bold rounded-full shadow-lg">
              -{calculateDiscount(product.price, product.compareAtPrice)}%
            </span>
          )}
          {product.stock < 10 && product.isAvailable && (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
              Stock limité
            </span>
          )}
        </div>

        {/* Quick View on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-[#414141] mb-2 line-clamp-2 group-hover:text-shopici-blue transition-colors">
          {product.name}
        </h3>
        
        {product.shortDescription && (
          <p className="text-sm text-[#414141] mb-3 line-clamp-1">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-shopici-black">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm font-medium text-shopici-black">
            {product.currency}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-[#414141] line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Delivery Info */}
        {product.delivery.available && (
          <div className="flex items-center gap-4 text-xs text-[#414141] mb-3 pb-3 border-b border-shopici-gray/50">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{product.delivery.areas[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{product.delivery.estimatedDays}</span>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          className="w-full py-3 bg-shopici-black hover:bg-shopici-blue text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingCart className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}