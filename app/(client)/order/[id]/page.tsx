/**
 * app/order/[id]/page.tsx
 */
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import {
    CheckCircle, Package, Phone,
    MapPin, CreditCard, Truck, ShieldCheck,
} from "lucide-react";

import { PaymentPoller } from "./PaymentPoller";
import { Types } from "mongoose";
import { ReceiptButton } from "./ReceiptButton";

interface LeanOrder {
    id: string;
    total: number;
    paid?: boolean;
    paidAt?: Date | null;
    paymentMethod?: string;
    status: string;
    createdAt: Date;
    customer: {
        name: string;
        phone: string;
        deliveryZone: string;
        callTime: string;
        hasWhatsApp: boolean;
    };
    items: Array<{
        productId: Types.ObjectId;
        name?: string;
        quantity: number;
        price: number;
    }>;
    _fbp?: string;
    _fbc?: string;
    _ip?: string;
    _ua?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
    return new Intl.NumberFormat("fr-FR").format(n);
}

function formatDate(d: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(d));
}

function callTimeLabel(t: string) {
    const map: Record<string, string> = {
        now: "Dès maintenant",
        morning: "Matin (8h – 12h)",
        afternoon: "Après-midi (12h – 17h)",
        evening: "Soir (17h – 20h)",
    };
    return map[t] ?? t;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrderSuccessPage({
    params,
    searchParams,
}: {
    params: { id: string }; // ✅ FIX
    searchParams: { payment?: string }; // ✅ FIX
}) {
    const { id } = await params;
    const { payment } = await searchParams;
    if (payment !== "success") redirect(`/order/${id}`);

    await connectDB();

    const raw = await Order.findOne({ id }).lean<LeanOrder>(); // ✅ single query
    if (!raw) notFound();

    const o = {
        id: raw.id,
        total: raw.total,
        paid: raw.paid ?? false,
        paidAt: raw.paidAt ? String(raw.paidAt) : null,
        paymentMethod: raw.paymentMethod ?? "online",
        status: raw.status,
        createdAt: String(raw.createdAt),
        customer: {
            name: raw.customer.name,
            phone: raw.customer.phone,
            deliveryZone: raw.customer.deliveryZone,
            callTime: raw.customer.callTime,
            hasWhatsApp: raw.customer.hasWhatsApp,
        },
        items: raw.items.map((item) => ({
            productId: String(item.productId),
            name: item.name ?? "Produit",
            quantity: item.quantity,
            price: item.price,
        })),
    };

    // ── Success UI (shown once paid === true) ─────────────────────────────────
    const successUI = (
        <main className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-lg mx-auto space-y-5">

                {/* Hero */}
                <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-200">
                        <CheckCircle className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Paiement confirmé 🎉</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Merci <span className="font-bold text-gray-900">{o.customer.name}</span> !
                        Votre commande a bien été reçue et payée.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
                        <span className="text-xs text-gray-500">Commande</span>
                        <span className="text-xs font-bold text-gray-800 font-mono">#{o.id}</span>
                    </div>
                </div>

                {/* Payment confirmation */}
                <div className="bg-shopici-black rounded-3xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-4 h-4 text-shopici-coral" />
                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                            Confirmation de paiement
                        </p>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-white/40 mb-1">Montant payé</p>
                            <p className="text-4xl font-bold text-shopici-coral leading-none">
                                {formatPrice(o.total)}
                                <span className="text-lg ml-1 text-white/60">XAF</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-white/40 mb-1">Méthode</p>
                            <p className="text-sm font-bold text-white">Mobile Money</p>
                            {o.paidAt && (
                                <p className="text-xs text-white/40 mt-0.5">
                                    {formatDate(o.paidAt)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <Package className="w-4 h-4 text-shopici-coral" />
                        <p className="text-sm font-bold text-gray-900">Récapitulatif de commande</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {o.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-shopici-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Package className="w-4 h-4 text-shopici-coral" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatPrice(item.price)} XAF × {item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-900 flex-shrink-0 ml-3">
                                    {formatPrice(item.price * item.quantity)} XAF
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center px-5 py-4 bg-gray-50 border-t border-gray-100">
                        <span className="text-sm font-bold text-gray-900">Total payé</span>
                        <span className="text-lg font-bold text-shopici-coral">
                            {formatPrice(o.total)} XAF
                        </span>
                    </div>
                </div>

                {/* Customer info */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <MapPin className="w-4 h-4 text-shopici-coral" />
                        <p className="text-sm font-bold text-gray-900">Informations de livraison</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {[
                            { label: "Nom", value: o.customer.name },
                            { label: "Téléphone", value: o.customer.phone },
                            { label: "Adresse", value: o.customer.deliveryZone },
                            { label: "Appel", value: callTimeLabel(o.customer.callTime) },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between items-center px-5 py-3">
                                <span className="text-xs text-gray-400">{label}</span>
                                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%] line-clamp-1">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next steps */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Ce qui se passe maintenant
                    </p>
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Appel de confirmation</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Notre équipe vous appelera au{" "}
                                <span className="font-bold text-gray-900">{o.customer.phone}</span>{" "}
                                pour confirmer la livraison.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                        <div className="w-9 h-9 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Livraison en cours de préparation</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Votre commande sera livrée à{" "}
                                <span className="font-bold text-gray-900">{o.customer.deliveryZone}</span>.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-2xl p-4">
                        <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Paiement sécurisé confirmé</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Votre paiement de{" "}
                                <span className="font-bold text-shopici-coral">
                                    {formatPrice(o.total)} XAF
                                </span>{" "}
                                a été reçu avec succès.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Download receipt */}
                <ReceiptButton order={o} />

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 pb-4">
                    Conservez ce reçu comme preuve de paiement.
                    <br />
                    Numéro de commande :{" "}
                    <span className="font-mono font-bold text-gray-600">#{o.id}</span>
                </p>

            </div>
        </main>
    );

    // ── Wrap in PaymentPoller ─────────────────────────────────────────────────
    // If already paid on the server render, PaymentPoller skips polling entirely
    // and renders children immediately. Otherwise it polls until confirmed.
    return (
        <PaymentPoller orderId={o.id} initialPaid={o.paid}>
            {successUI}
        </PaymentPoller>
    );
}