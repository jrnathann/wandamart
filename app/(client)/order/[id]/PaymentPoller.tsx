"use client";

/**
 * app/order/[id]/PaymentPoller.tsx
 *
 * Polls GET /api/payment/status/[id] every 2s.
 * - While paid === false: shows a branded waiting screen
 * - Once paid === true: renders the full success UI passed as children
 *
 * Max wait: 2 minutes (60 attempts × 2s). After that, shows a fallback
 * with a manual refresh button — the webhook may still arrive.
 */

import { useEffect, useState, useCallback } from "react";
import { getOrderById } from "@/helper/order";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS     = 60; // 2 minutes

interface Props {
    orderId:    string;
    initialPaid: boolean;
    children:   React.ReactNode; // the full success UI
}

export function PaymentPoller({ orderId, initialPaid, children }: Props) {
    const [paid,     setPaid]     = useState(initialPaid);
    const [attempts, setAttempts] = useState(0);
    const [timedOut, setTimedOut] = useState(false);

    const poll = useCallback(async () => {
        try {
            const order = await getOrderById(orderId);
            if (order.paid) setPaid(true);
        } catch {
            // network hiccup — keep trying
        }
    }, [orderId]);

    useEffect(() => {
        // Already confirmed on server — no need to poll
        if (paid) return;

        const interval = setInterval(() => {
            setAttempts((prev) => {
                const next = prev + 1;
                if (next >= MAX_ATTEMPTS) {
                    clearInterval(interval);
                    setTimedOut(true);
                }
                return next;
            });
            poll();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [paid, poll]);

    // ── Already paid — show success UI ───────────────────────────────────────
    if (paid) return <>{children}</>;

    // ── Timed out — show fallback ─────────────────────────────────────────────
    if (timedOut) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-sm w-full bg-white rounded-3xl shadow-sm p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Paiement en cours de traitement
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                            Votre paiement a peut-être été effectué mais la confirmation
                            prend plus de temps que prévu. Vérifiez votre solde et
                            actualisez la page.
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400">Commande</p>
                        <p className="text-sm font-bold font-mono text-gray-800">#{orderId}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3.5 bg-shopici-coral hover:brightness-105 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Actualiser la page
                    </button>
                    <p className="text-xs text-gray-400">
                        Si le problème persiste, contactez-nous avec votre numéro de commande.
                    </p>
                </div>
            </div>
        );
    }

    // ── Waiting — spinner screen ──────────────────────────────────────────────
    const elapsed = attempts * 2;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-sm w-full bg-white rounded-3xl shadow-sm p-8 text-center space-y-6">

                {/* Animated ring */}
                <div className="relative w-24 h-24 mx-auto">
                    {/* Outer pulse */}
                    <div className="absolute inset-0 rounded-full bg-shopici-coral/10 animate-ping" />
                    {/* Inner circle */}
                    <div className="relative w-24 h-24 bg-shopici-black rounded-full flex items-center justify-center shadow-xl shadow-shopici-coral/20">
                        <Loader2 className="w-10 h-10 text-shopici-coral animate-spin" />
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Confirmez votre paiement 📲
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        Une demande de paiement a été envoyée sur votre téléphone.
                        Suivez les instructions ci-dessous pour l'approuver.
                    </p>
                </div>

                {/* USSD codes — compact */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
                        <p className="text-xs font-bold text-yellow-800 mb-1">MTN MoMo</p>
                        <p className="text-xl font-black text-yellow-900 tracking-wide">*126#</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
                        <p className="text-xs font-bold text-orange-800 mb-1">Orange Money</p>
                        <p className="text-xl font-black text-orange-900 tracking-wide">#150#</p>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-shopici-coral"
                            style={{
                                animation:      "bounce 1.2s infinite",
                                animationDelay: `${i * 0.15}s`,
                                opacity:        0.4 + i * 0.12,
                            }}
                        />
                    ))}
                </div>

                {/* Order ID */}
                <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">Commande</p>
                    <p className="text-sm font-bold font-mono text-gray-800">#{orderId}</p>
                </div>

                {/* Timer */}
                <p className="text-xs text-gray-400">
                    En attente de confirmation… {elapsed}s
                </p>
            </div>
        </div>
    );
}