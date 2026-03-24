"use client";

import { useState, useEffect } from "react";
import { ArrowUp, Package, ShoppingCart, Smartphone } from "lucide-react";
import { Product } from "@/types/Product";
import { useConfig } from "@/context/ConfigContext";
interface StickyProps {
    product: Product;
    onOrderClick: () => void;
    onMobileMoneyClick: () => void;
    formatPrice: (price: number) => string;
}

export function StickyPurchase({ product, onOrderClick, onMobileMoneyClick, formatPrice }: StickyProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const storeConfig = useConfig()
    // ─── Scroll Visibility ───
    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ─── Body Scroll Lock ───
    useEffect(() => {
        if (showDrawer) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [showDrawer]);
    const handleMainClick = () => {
        // Check if Mobile Money is enabled in the global store config
        const isMoMoEnabled = false;

        if (isMoMoEnabled) {
            setShowDrawer(true); // Open the choice drawer
        } else {
            onOrderClick(); // No choice needed, go straight to COD
        }
    };
    return (
        <>
            {/* ── Sticky Trigger Bar ── */}
            <div className={`fixed bottom-0 left-0 right-0 z-[60] p-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] lg:hidden 
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
            >
                <div className="bg-shopici-black text-white rounded-[2.5rem] p-2 pl-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 italic leading-none mb-1">Total</span>
                        <span className="text-lg font-black italic tracking-tighter leading-none">
                            {formatPrice(product.price)} <span className="text-[10px] not-italic opacity-60">XAF</span>
                        </span>
                    </div>

                    <button
                        onClick={handleMainClick} // <── Integrated Logic
                        className="bg-shopici-coral text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest italic shadow-lg shadow-shopici-coral/30 flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Commander
                    </button>
                </div>
            </div>

            {/* ── Bottom Sheet Drawer ── */}
            {showDrawer && (
                <div className="fixed inset-0 z-[100] lg:hidden flex items-end">
                    {/* High-Contrast Backdrop */}
                    <div
                        className="absolute inset-0 bg-shopici-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowDrawer(false)}
                    />

                    {/* Bottom Sheet: No Radius (Sharp Edges) */}
                    <div className="relative w-full bg-white rounded-none p-6 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-400">

                        {/* ── Compact Header ── */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-shopici-gray/10">
                            <div>
                                <h3 className="text-lg font-black text-shopici-black uppercase tracking-tight leading-none mb-1">
                                    Mode de <span className="text-shopici-coral italic">Paiement</span>
                                </h3>
                                <p className="text-[9px] font-bold text-shopici-gray uppercase tracking-widest opacity-60">
                                    Sélectionnez une option pour continuer
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDrawer(false)}
                                className="w-8 h-8 bg-shopici-gray/5 border border-shopici-gray/10 rounded-none flex items-center justify-center text-shopici-black font-black active:bg-shopici-black active:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {/* ── OPTION 1: CASH (Sharp Tile) ── */}
                            <button
                                onClick={() => { onOrderClick(); setShowDrawer(false); }}
                                className="w-full flex items-center gap-4 p-5 bg-white border-2 border-shopici-black rounded-none active:bg-shopici-black active:text-white transition-all group"
                            >
                                <div className="w-10 h-10 bg-shopici-coral flex items-center justify-center text-white shrink-0">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase italic leading-none mb-1 group-active:text-white">Payer à la livraison</p>
                                    <p className="text-[10px] font-bold text-shopici-gray uppercase tracking-tight group-active:text-white/60">
                                        Réglez en espèces à la réception
                                    </p>
                                </div>
                            </button>

                            {/* ── OPTION 2: MOMO (Sharp Tile) ── */}
                            <button
                                onClick={() => { onMobileMoneyClick(); setShowDrawer(false); }}
                                className="w-full flex items-center gap-4 p-5 bg-white border-2 border-shopici-black rounded-none active:bg-shopici-black active:text-white transition-all group"
                            >
                                <div className="w-10 h-10 bg-shopici-blue flex items-center justify-center text-white shrink-0">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase italic leading-none mb-1 group-active:text-white">Mobile Money</p>
                                    <p className="text-[10px] font-bold text-shopici-gray uppercase tracking-tight group-active:text-white/60">
                                        Orange Money ou MTN Money
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* ── Safety Footer ── */}
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <div className="w-1 h-1 bg-shopici-gray/40 rounded-full" />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-shopici-gray/50">
                                Paiement 100% sécurisé par Shopici
                            </span>
                            <div className="w-1 h-1 bg-shopici-gray/40 rounded-full" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}