"use client";

/**
 * app/order/[id]/PaymentPoller.tsx
 *
 * Polls GET /api/payment/status/[id] every 2s.
 *
 * Screens:
 *   CREATED / PENDING / null  → spinner (waiting for customer to confirm)
 *   SUCCESSFUL / paid: true   → success UI (children)
 *   FAILED                    → payment failed screen
 *   EXPIRED                   → session expired screen
 *   timeout (2 min)           → manual refresh fallback
 */

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, AlertCircle, XCircle, Clock } from "lucide-react";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS     = 60; // 2 minutes

type FapshiStatus = "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED" | null;

interface Props {
    orderId:     string;
    initialPaid: boolean;
    children:    React.ReactNode;
}

export function PaymentPoller({ orderId, initialPaid, children }: Props) {
    const [paid,          setPaid]          = useState(initialPaid);
    const [fapshiStatus,  setFapshiStatus]  = useState<FapshiStatus>(null);
    const [attempts,      setAttempts]      = useState(0);
    const [timedOut,      setTimedOut]      = useState(false);

    const poll = useCallback(async () => {
        try {
            const res  = await fetch(`/api/payment/status/${orderId}`);
            const data = await res.json();

            setFapshiStatus(data.fapshiStatus ?? null);
            if (data.paid) setPaid(true);
        } catch {
            // network hiccup — keep trying
        }
    }, [orderId]);

    useEffect(() => {
        if (paid) return;

        // Stop polling on terminal statuses — no point continuing
        if (fapshiStatus === "FAILED" || fapshiStatus === "EXPIRED") return;

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
    }, [paid, fapshiStatus, poll]);

    // ── SUCCESSFUL ────────────────────────────────────────────────────────────
    if (paid) return <>{children}</>;

    // ── FAILED ────────────────────────────────────────────────────────────────
    if (fapshiStatus === "FAILED") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-sm w-full bg-white rounded-3xl shadow-sm p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Paiement échoué
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                            Votre paiement n'a pas abouti. Cela peut être dû à un code PIN
                            incorrect, un solde insuffisant ou un refus de votre part.
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
                        <RefreshCw className="w-4 h-4" /> Réessayer le paiement
                    </button>
                    <p className="text-xs text-gray-400">
                        Contactez-nous si le montant a été débité par erreur.
                    </p>
                </div>
            </div>
        );
    }

    // ── EXPIRED ───────────────────────────────────────────────────────────────
    if (fapshiStatus === "EXPIRED") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-sm w-full bg-white rounded-3xl shadow-sm p-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Session expirée
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                            Le délai de paiement est dépassé. Aucun montant n'a été débité.
                            Retournez au panier pour relancer une nouvelle session de paiement.
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400">Commande</p>
                        <p className="text-sm font-bold font-mono text-gray-800">#{orderId}</p>
                    </div>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="w-full py-3.5 bg-shopici-coral hover:brightness-105 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Retour à l'accueil
                    </button>
                    <p className="text-xs text-gray-400">
                        Contactez-nous avec votre numéro de commande si vous avez besoin d'aide.
                    </p>
                </div>
            </div>
        );
    }

    // ── TIMED OUT (2 min, still no terminal status) ───────────────────────────
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

    // ── CREATED / PENDING / null — spinner ────────────────────────────────────
    const elapsed = attempts * 2;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-sm w-full bg-white rounded-3xl shadow-sm p-8 text-center space-y-6">

                {/* Animated ring */}
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-shopici-coral/10 animate-ping" />
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

                {/* USSD codes */}
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

                <p className="text-xs text-gray-400">
                    En attente de confirmation… {elapsed}s
                </p>
            </div>
        </div>
    );
}