"use client";

import { ShoppingCart, MapPin, Shield, Package, Star, CheckCircle, TrendingUp, Smartphone, Zap } from "lucide-react";
import { Product } from "@/types/Product";
import { useConfig } from "@/context/ConfigContext";

interface ProductInfoProps {
    product: Product;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    onOrderClick: () => void;
    onMobileMoneyClick: () => void;
    formatPrice: (price: number) => string;
    calculateDiscount: () => number;
}

export default function ProductInfo({
    product,
    quantity,
    onQuantityChange,
    onOrderClick,
    onMobileMoneyClick,
    formatPrice,
    calculateDiscount,
}: ProductInfoProps) {
    const storeConfig = useConfig();
    const discount = calculateDiscount();

    return (
        <div className="space-y-5">

            {/* ── Title & Short Description ── */}
            <div>
                {/* Discount badge */}
                {discount > 0 && (
                    <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                        <Zap className="w-3 h-3" />
                        -{discount}% aujourd'hui
                    </span>
                )}
                <h1 className="text-2xl md:text-4xl font-bold text-shopici-black leading-tight mb-2">
                    {product.name}
                </h1>
                {product.shortDescription && (
                    <p className="text-[#414141] text-base leading-relaxed">{product.shortDescription}</p>
                )}
            </div>

            {/* ── Price Section ── */}
            <div className="relative bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-2xl p-5 border border-shopici-blue/20 overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] bg-[length:20px_20px] pointer-events-none" />
                <div className="relative">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl md:text-4xl font-bold text-shopici-black tabular-nums">
                            {formatPrice(product.price)}
                        </span>
                        <span className="text-lg font-semibold text-shopici-black/70">XAF</span>
                        {product.compareAtPrice && (
                            <span className="text-base text-[#414141]/60 line-through ml-1">
                                {formatPrice(product.compareAtPrice)}
                            </span>
                        )}
                    </div>
                    {product.compareAtPrice && (
                        <p className="text-sm text-green-700 font-semibold flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Économisez {formatPrice(product.compareAtPrice - product.price)} XAF aujourd'hui !
                        </p>
                    )}
                </div>
            </div>

            {/* ── Quantity Selector ── */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-shopici-black text-sm">Quantité :</span>
                <div className="flex items-center gap-1 bg-shopici-gray/20 rounded-xl p-1.5">
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-lg bg-white text-shopici-black hover:bg-shopici-blue hover:text-white
                            flex items-center justify-center font-bold text-lg transition-all active:scale-95 shadow-sm"
                    >
                        −
                    </button>
                    <span className="w-10 text-center font-bold text-base text-shopici-black tabular-nums">
                        {quantity}
                    </span>
                    <button
                        onClick={() => onQuantityChange(Math.min(product.stock, quantity + 1))}
                        className="w-9 h-9 rounded-lg bg-white text-shopici-black hover:bg-shopici-blue hover:text-white
                            flex items-center justify-center font-bold text-lg transition-all active:scale-95 shadow-sm"
                    >
                        +
                    </button>
                </div>
                <span className="text-xs text-[#414141]/60 font-medium">
                    {product.stock} en stock
                </span>
            </div>

            {/* ── CTAs ── */}
            <div className="space-y-3">
                {/* Primary — Cash on delivery */}
                <button
                    onClick={onOrderClick}
                    className="relative w-full px-4 py-4 bg-shopici-coral text-white font-bold rounded-2xl
                        flex items-center justify-center gap-2.5 text-sm leading-tight
                        transition-all active:scale-[0.98] shadow-lg shadow-shopici-coral/30
                        hover:brightness-105 overflow-hidden group"
                >
                    {/* Shine sweep on hover */}
                    <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500
                        bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                    <span>COMMANDER — PAYER À LA LIVRAISON</span>
                </button>

                {/* Secondary — Mobile Money */}
                {storeConfig?.features.mobileMoneyPayment && (
                    <button
                        onClick={onMobileMoneyClick}
                        className="relative w-full px-4 py-4 bg-white border-2 border-shopici-blue text-shopici-blue font-bold rounded-2xl
                            flex items-center justify-center gap-2.5 text-sm leading-tight
                            transition-all active:scale-[0.98] hover:bg-shopici-blue hover:text-white
                            shadow-sm overflow-hidden group"
                    >
                        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500
                            bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                        <Smartphone className="w-5 h-5 flex-shrink-0" />
                        <span>PAYER PAR MOBILE MONEY</span>
                    </button>
                )}

                <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <p className="text-xs font-medium text-[#414141]/70">Paiement 100% sécurisé</p>
                </div>
            </div>

            {/* ── Delivery Info ── */}
            {product.delivery.available && (
                <div className="bg-white border border-shopici-gray/30 rounded-2xl p-4">
                    <h3 className="font-semibold text-shopici-black mb-3 flex items-center gap-2 text-sm">
                        <span className="p-1.5 bg-shopici-blue/10 rounded-lg">
                            <MapPin className="w-4 h-4 text-shopici-blue" />
                        </span>
                        Informations de livraison
                    </h3>
                    <div className="space-y-2">
                        {[
                            `Livraison : ${product.delivery.estimatedDays}`,
                            `Zones : ${product.delivery.areas.join(", ")}`,
                            "Livraison gratuite dans certaines zones de Yaoundé.",
                        ].map((text) => (
                            <p key={text} className="flex items-start gap-2 text-sm text-[#414141]">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                {text}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Trust Badges ── */}
            <div className="grid grid-cols-3 gap-2.5">
                {[
                    { icon: Shield,  label: "Paiement Sécurisé" },
                    { icon: Package, label: "Livraison Rapide" },
                    { icon: Star,    label: "Top Qualité" },
                ].map(({ icon: Icon, label }) => (
                    <div key={label}
                        className="flex flex-col items-center gap-1.5 p-3 bg-shopici-gray/10
                            rounded-xl border border-shopici-gray/20 hover:border-shopici-blue/30
                            hover:bg-shopici-blue/5 transition-colors">
                        <Icon className="w-5 h-5 text-shopici-blue" />
                        <p className="text-[11px] font-semibold text-shopici-black text-center leading-tight">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}