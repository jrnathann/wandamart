import { ShoppingCart, MapPin, Shield, Package, Star, CheckCircle, TrendingUp } from "lucide-react";
import { Product } from "@/types/Product";

interface ProductInfoProps {
    product: Product;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    onOrderClick: () => void;
    formatPrice: (price: number) => string;
    calculateDiscount: () => number;
}

export default function ProductInfo({
    product,
    quantity,
    onQuantityChange,
    onOrderClick,
    formatPrice,
    calculateDiscount,
}: ProductInfoProps) {
    return (
        <div className="space-y-6">
            {/* Title & Short Description */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-shopici-black mb-3">{product.name}</h1>
                {product.shortDescription && (
                    <p className="text-[#414141] text-lg">{product.shortDescription}</p>
                )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-2xl p-6 border border-shopici-blue/20">
                <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-shopici-black">{formatPrice(product.price)}</span>
                    <span className="text-2xl font-semibold text-shopici-black">XAF</span>
                    {product.compareAtPrice && (
                        <span className="text-xl text-[#414141] line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                </div>
                {product.compareAtPrice && (
                    <p className="text-sm text-[#414141] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Économisez {formatPrice(product.compareAtPrice - product.price)} XAF aujourd'hui!
                    </p>
                )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-shopici-black">Quantité:</span>
                <div className="flex items-center gap-3 bg-shopici-gray/20 rounded-lg p-2">
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-white text-black hover:bg-shopici-blue hover:text-white flex items-center justify-center font-bold transition-colors"
                    >
                        -
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-shopici-black">{quantity}</span>
                    <button
                        onClick={() => onQuantityChange(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-lg bg-white text-black hover:bg-shopici-blue hover:text-white flex items-center justify-center font-bold transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
                <button
                    onClick={onOrderClick}
                    className="w-full py-5 bg-shopici-coral hover:bg-shopici-coral/90 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <ShoppingCart className="w-6 h-6" />
                    COMMANDER MAINTENANT
                </button>
                <div className="text-center text-sm text-[#414141]">
                    <p className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        Paiement 100% sécurisé à la livraison
                    </p>
                </div>
            </div>

            {/* Delivery Info */}
            {product.delivery.available && (
                <div className="bg-white border border-shopici-gray/30 rounded-xl p-5">
                    <h3 className="font-semibold text-shopici-black mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-shopici-blue" />
                        Informations de livraison
                    </h3>
                    <div className="space-y-2 text-sm text-[#414141]">
                        <p className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Livraison: {product.delivery.estimatedDays}
                        </p>
                        <p className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Zones: {product.delivery.areas.join(", ")}
                        </p>
                        <p className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            La livraison est gratuite dans certaines zones de Yaoundé.
                        </p>
                    </div>
                </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-shopici-gray/10 rounded-lg">
                    <Shield className="w-6 h-6 mx-auto mb-1 text-shopici-blue" />
                    <p className="text-xs font-semibold text-shopici-black">Paiement Sécurisé</p>
                </div>
                <div className="text-center p-3 bg-shopici-gray/10 rounded-lg">
                    <Package className="w-6 h-6 mx-auto mb-1 text-shopici-blue" />
                    <p className="text-xs font-semibold text-shopici-black">Livraison Rapide</p>
                </div>
                <div className="text-center p-3 bg-shopici-gray/10 rounded-lg">
                    <Star className="w-6 h-6 mx-auto mb-1 text-shopici-blue" />
                    <p className="text-xs font-semibold text-shopici-black">Top Qualité</p>
                </div>
            </div>
        </div>
    );
}