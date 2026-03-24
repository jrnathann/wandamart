"use client";
import { useEffect, useState } from "react";
import {
    Search, Package, Truck, CheckCircle, Clock,
    MapPin, Phone, MessageCircle, User, Calendar,
    AlertCircle, ArrowRight, ChevronRight,
} from "lucide-react";
import type { OrderTracking, OrderStatus } from "@/types/OrderTracking";
import { getOrderById } from "@/helper/order";
import { Product } from "@/types/Product";
import { useConfig } from "@/context/ConfigContext";

// ── Skeleton atoms ────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
    );
}

function PageSkeleton() {
    return (
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-16 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
    );
}

function OrderSkeleton() {
    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
    );
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; icon: React.ReactNode; dot: string }> = {
    "En préparation": {
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-200",
        dot: "bg-amber-400",
        icon: <Package className="w-4 h-4" />,
    },
    "En route": {
        color: "text-blue-700",
        bg: "bg-blue-50 border-blue-200",
        dot: "bg-blue-500",
        icon: <Truck className="w-4 h-4" />,
    },
    "Livré": {
        color: "text-green-700",
        bg: "bg-green-50 border-green-200",
        dot: "bg-green-500",
        icon: <CheckCircle className="w-4 h-4" />,
    },
    "Annulé": {
        color: "text-red-700",
        bg: "bg-red-50 border-red-200",
        dot: "bg-red-400",
        icon: <AlertCircle className="w-4 h-4" />,
    },
};

const STEPS: OrderStatus[] = ["En préparation", "En route", "Livré"];

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function formatCallTime(callTime: string) {
    const map: Record<string, string> = {
        now: "Dès maintenant",
        morning: "Matin (8h–12h)",
        afternoon: "Après-midi (12h–17h)",
        evening: "Soir (17h–20h)",
    };
    return map[callTime] ?? callTime;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
    const storeConfig = useConfig();

    const [trackingId, setTrackingId]   = useState("");
    const [order, setOrder]             = useState<OrderTracking | null>(null);
    const [error, setError]             = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [products, setProducts]       = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [orderLoading, setOrderLoading]       = useState(false);

    // Safe phone — only render contact links when config is ready
    const phone = storeConfig?.contact?.phone ?? null;

    useEffect(() => {
        fetch("/api/products")
            .then((r) => r.json())
            .then(setProducts)
            .catch((e) => console.error("Failed to fetch products:", e))
            .finally(() => setProductsLoading(false));
    }, []);

    const handleSearch = async () => {
        if (!trackingId.trim()) return;
        setError("");
        setOrder(null);
        setIsSearching(true);
        setOrderLoading(true);

        // Small UX delay so the loader is visible
        await new Promise((r) => setTimeout(r, 500));

        const foundOrder = await getOrderById(trackingId.trim());
        if (!foundOrder) {
            setError("Commande introuvable. Vérifiez votre numéro de suivi.");
        } else {
            setOrder(foundOrder);
        }

        setIsSearching(false);
        setOrderLoading(false);
    };

    const getProduct = (productId: string) =>
        products.find((p) => p._id === productId);

    const currentStepIndex = order ? STEPS.indexOf(order.status) : -1;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <div className="bg-shopici-black text-white">
                <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-shopici-coral/20 mb-5">
                        <Package className="w-7 h-7 text-shopici-coral" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                        Suivez votre commande
                    </h1>
                    <p className="text-white/50 text-sm sm:text-base">
                        Entrez votre numéro de suivi pour localiser votre colis
                    </p>
                </div>
            </div>

            {/* ── Search bar ─────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 -mt-5 mb-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3 flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Numéro de suivi (ex: ORD-XXXXXXXX)"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full pl-10 pr-4 py-3 text-sm border-0 outline-none bg-gray-50 rounded-xl text-shopici-black placeholder:text-gray-400 focus:bg-white transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !trackingId.trim()}
                        className="px-5 py-3 bg-shopici-coral hover:brightness-105 active:scale-[0.97] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                    >
                        {isSearching ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <ArrowRight className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">
                            {isSearching ? "Recherche..." : "Suivre"}
                        </span>
                    </button>
                </div>
            </div>

            {/* ── Content ────────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 pb-16">

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Order loading skeleton */}
                {orderLoading && <OrderSkeleton />}

                {/* Products still loading but order found — rare, handle gracefully */}
                {order && productsLoading && !orderLoading && <OrderSkeleton />}

                {/* Order results */}
                {order && !orderLoading && !productsLoading && (
                    <div className="space-y-4">

                        {/* ── Status hero card ─────────────────────────────── */}
                        <div className="bg-shopici-black rounded-2xl p-5 text-white">
                            {/* Stepper */}
                            <div className="flex items-center mb-6">
                                {STEPS.map((step, idx) => {
                                    const cfg       = STATUS_CONFIG[step];
                                    const done      = idx < currentStepIndex;
                                    const active    = idx === currentStepIndex;
                                    const cancelled = order.status === "Annulé";

                                    return (
                                        <div key={step} className="flex items-center flex-1 last:flex-none">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                    cancelled          ? "bg-red-500/20 text-red-400"
                                                    : done || active   ? `${cfg.dot} text-white`
                                                    : "bg-white/10 text-white/30"
                                                }`}>
                                                    {cfg.icon}
                                                </div>
                                                <p className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                                                    active ? "text-white" : "text-white/40"
                                                }`}>
                                                    {step === "En préparation" ? "Préparation"
                                                    : step === "En route" ? "En route"
                                                    : "Livré"}
                                                </p>
                                            </div>
                                            {idx < STEPS.length - 1 && (
                                                <div className={`flex-1 h-px mx-2 transition-all ${
                                                    done ? "bg-shopici-coral" : "bg-white/15"
                                                }`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Status label */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white/40 mb-1">Statut actuel</p>
                                    <p className="text-xl font-bold">{order.status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/40 mb-1">Commande passée</p>
                                    <p className="text-sm font-medium text-white/80">
                                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                                    </p>
                                </div>
                            </div>

                            {/* Cancelled banner */}
                            {order.status === "Annulé" && (
                                <div className="mt-4 px-3 py-2 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300 font-medium text-center">
                                    Cette commande a été annulée
                                </div>
                            )}
                        </div>

                        {/* ── Products ─────────────────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-shopici-black flex items-center gap-2">
                                    <Package className="w-4 h-4 text-shopici-coral" />
                                    Produits ({order.items.length})
                                </h3>
                                <span className="text-xs text-gray-400">#{order.id}</span>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {order.items.map((item, idx) => {
                                    const product = getProduct(item.productId);
                                    if (!product) return (
                                        <div key={idx} className="px-5 py-4 text-xs text-gray-400">
                                            Produit introuvable (ID: {item.productId})
                                        </div>
                                    );
                                    return (
                                        <div key={idx} className="flex gap-4 px-5 py-4">
                                            <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                                {product.images?.[0]?.url ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-shopici-black line-clamp-1 mb-1">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-400 mb-2">Qté : {item.quantity}</p>
                                                <p className="text-sm font-bold text-shopici-coral">
                                                    {(item.price * item.quantity).toLocaleString()} XAF
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
                                <p className="text-sm font-semibold text-shopici-black">Total</p>
                                <p className="text-lg font-bold text-shopici-coral">
                                    {order.total.toLocaleString()} XAF
                                </p>
                            </div>
                        </div>

                        {/* ── Tracking timeline ─────────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-shopici-black flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-shopici-coral" />
                                    Historique de livraison
                                </h3>
                            </div>

                            {order.checkpoints.length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-400 text-sm">
                                    Aucun point de suivi pour l'instant
                                </div>
                            ) : (
                                <div className="px-5 py-4 space-y-0">
                                    {[...order.checkpoints]
                                        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                                        .map((checkpoint, idx, arr) => {
                                            const cfg     = STATUS_CONFIG[checkpoint.status] ?? STATUS_CONFIG["En préparation"];
                                            const isFirst = idx === 0;
                                            const isLast  = idx === arr.length - 1;

                                            return (
                                                <div key={idx} className="flex gap-4">
                                                    {/* Line + dot */}
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />
                                                        {!isLast && (
                                                            <div className="w-px flex-1 bg-gray-100 my-1" />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className={`flex-1 pb-5 ${isLast ? "pb-0" : ""}`}>
                                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                            <p className="text-sm font-semibold text-shopici-black">
                                                                {checkpoint.location}
                                                            </p>
                                                            {isFirst && (
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${cfg.bg} ${cfg.color}`}>
                                                                    {checkpoint.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(checkpoint.time)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        {/* ── Customer info ─────────────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-shopici-black flex items-center gap-2">
                                    <User className="w-4 h-4 text-shopici-coral" />
                                    Informations de livraison
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {[
                                    { icon: <User className="w-3.5 h-3.5" />,     label: "Nom",              value: order.customer.name },
                                    { icon: <Phone className="w-3.5 h-3.5" />,    label: "Téléphone",        value: order.customer.phone },
                                    { icon: <MapPin className="w-3.5 h-3.5" />,   label: "Zone de livraison",value: order.customer.deliveryZone },
                                    { icon: <Clock className="w-3.5 h-3.5" />,    label: "Créneau d'appel",  value: formatCallTime(order.customer.callTime) },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-4 px-5 py-3.5">
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                            {icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400">{label}</p>
                                            <p className="text-sm font-semibold text-shopici-black truncate">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {order.customer.hasWhatsApp && (
                                <div className="mx-5 mb-4 mt-1 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                    <MessageCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <p className="text-xs font-medium text-green-700">
                                        Ce client est disponible sur WhatsApp
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Contact card ─────────────────────────────────── */}
                        {/* Only renders when storeConfig is available and phone is set */}
                        {phone && (
                            <div className="bg-shopici-black rounded-2xl p-5">
                                <p className="text-xs text-white/40 mb-1">Besoin d'aide ?</p>
                                <p className="text-sm font-semibold text-white mb-4">
                                    Notre équipe est disponible pour vous aider.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={`tel:${phone}`}
                                        className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-colors"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Appeler
                                    </a>
                                    <a
                                        href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Empty state ───────────────────────────────────────────── */}
                {!order && !error && !isSearching && !orderLoading && (
                    <div className="flex flex-col items-center text-center py-16 px-4">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-5 shadow-sm">
                            <Search className="w-7 h-7 text-gray-300" />
                        </div>
                        <p className="text-base font-bold text-shopici-black mb-2">
                            Entrez votre numéro de suivi
                        </p>
                        <p className="text-sm text-gray-400 max-w-xs mb-6">
                            Localisez votre colis en temps réel grâce à votre numéro de commande.
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Le numéro vous a été envoyé par SMS
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}