"use client";

import { ShoppingCart, MapPin, Shield, Package, Star, CheckCircle, TrendingUp, Smartphone, Zap, Truck, Clock } from "lucide-react";
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
        <div className="space-y-8 lg:sticky lg:top-24">

            {/* ── Title & Short Description ── */}
            <div className="space-y-3">
                {discount > 0 && (
                    <div className="inline-flex items-center gap-1.5 bg-shopici-coral text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                        <Zap className="w-3 h-3 fill-current" />
                        Save -{discount}% Today
                    </div>
                )}
                <h1 className="text-3xl md:text-5xl font-black text-shopici-black leading-[1.1] uppercase tracking-tighter">
                    {product.name}
                </h1>
                {product.shortDescription && (
                    <p className="text-shopici-charcoal text-base leading-relaxed font-medium opacity-80">
                        {product.shortDescription}
                    </p>
                )}
            </div>

            {/* ── Price Section ── */}
            <div className="space-y-3">
                {/* ── The Main Price Line ── */}
                <div className="flex items-center gap-3">
                    {/* Large, Bold Main Price */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-shopici-black tracking-tighter tabular-nums leading-none">
                            {formatPrice(product.price)}
                        </span>
                        <span className="text-sm font-black text-shopici-blue uppercase tracking-widest self-end pb-1">
                            XAF
                        </span>
                    </div>

                    {/* Vertical Separator */}
                    <div className="h-8 w-px bg-shopici-gray/20 rotate-[15deg]" />

                    {/* Savings Badge - Clean & Circular */}
                    {product.compareAtPrice && (() => {
                        const oldPrice = product.compareAtPrice; // TypeScript "narrows" this to just a number here
                        const savings = oldPrice - product.price;

                        return (
                            <span className="text-xs font-black text-green-600">
                                Économisez {formatPrice(savings)} XAF
                            </span>
                        );
                    })()}
                </div>

                {/* ── The "Trust & Value" Ribbon ── */}
                {product.compareAtPrice && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-shopici-coral/5 border border-shopici-coral/10 rounded-xl">
                        <Zap className="w-3.5 h-3.5 text-shopici-coral fill-shopici-coral" />
                        <p className="text-[11px] font-bold text-shopici-coral uppercase tracking-tight">
                            Offre Spéciale : Économisez {formatPrice(product.compareAtPrice - product.price)} XAF
                        </p>
                    </div>
                )}
            </div>

            {/* ── Quantity Selector ── */}
            <div className="flex items-center justify-between bg-white border border-shopici-gray/20 rounded-2xl p-4">
                <span className="font-black text-shopici-black text-xs uppercase tracking-widest">Quantité</span>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl bg-shopici-gray/10 text-shopici-black hover:bg-shopici-coral hover:text-white flex items-center justify-center font-bold transition-all active:scale-90"
                    >
                        −
                    </button>
                    <span className="text-lg font-black text-shopici-black w-6 text-center tabular-nums">
                        {quantity}
                    </span>
                    <button
                        onClick={() => onQuantityChange(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-xl bg-shopici-gray/10 text-shopici-black hover:bg-shopici-blue hover:text-white flex items-center justify-center font-bold transition-all active:scale-90"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* ── CTAs ── */}
            <div className="space-y-4">
                <button
                    onClick={onOrderClick}
                    className="relative w-full py-6 bg-shopici-coral text-white font-black flex items-center justify-center gap-3 text-sm uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-xl shadow-shopici-coral/25 hover:brightness-110 overflow-hidden group"
                >
                    <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                    <ShoppingCart className="w-5 h-5" />
                    <span>Payer à la livraison</span>
                </button>

                {storeConfig?.features.mobileMoneyPayment && (
                    <button
                        onClick={onMobileMoneyClick}
                        className="w-full py-6 bg-white border-2 border-shopici-blue text-shopici-blue font-black flex items-center justify-center gap-3 text-sm uppercase tracking-[0.1em] transition-all active:scale-[0.98] hover:bg-shopici-blue hover:text-white group"
                    >
                        <Smartphone className="w-5 h-5 group-hover:animate-bounce" />
                        <span>Payer par Mobile Money</span>
                    </button>
                )}

                <div className="flex items-center justify-center gap-2 opacity-60">
                    <Shield className="w-4 h-4 text-green-600" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-shopici-black">Transaction 100% Sécurisée</p>
                </div>
            </div>

            <div className="relative group border-l-2 border-shopici-coral pl-6 py-2 space-y-6">
                {/* ── Delivery "Power-Row" ── */}
                {product.delivery.available && (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-shopici-coral italic animate-pulse">
                                Logistique Live
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-shopici-coral/20 to-transparent" />
                        </div>

                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-shopici-black" />
                                <span className="text-xl font-black text-shopici-black tracking-tighter uppercase italic">
                                    {product.delivery.estimatedDays}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-shopici-blue/5 rounded-md border border-shopici-blue/10">
                                <Truck className="w-3 h-3 text-shopici-blue" />
                                <span className="text-[10px] font-black text-shopici-blue uppercase tracking-tight">
                                    Cameroun Entier
                                </span>
                            </div>
                        </div>

                        {/* <p className="text-[10px] font-bold text-shopici-gray uppercase tracking-widest opacity-60 truncate">
                {product.delivery.areas.join(" • ")}
            </p> */}
                    </div>
                )}

                {/* ── Trust "Micro-Grid" ── */}
                <div className="flex items-center gap-6 border-t border-shopici-gray/10 pt-4">
                    {[
                        { icon: Shield, label: "Sécurisé" },
                        { icon: Package, label: "Premium" },
                        { icon: Star, label: "Certifié" },
                    ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 group/badge cursor-default">
                            <div className="p-1.5 rounded-lg bg-shopici-black text-white group-hover/badge:bg-shopici-coral transition-colors">
                                <Icon className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter text-shopici-black group-hover/badge:text-shopici-coral transition-colors">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Decorative Bottom Corner (Optional) */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-shopici-blue/5 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
}