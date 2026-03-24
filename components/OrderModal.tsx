/**
 * components/OrderModal.tsx
 *
 * Supports two modes passed via `paymentMode` prop:
 *   "cod"    → cash on delivery — all 4 steps including the cash gate (Step 1)
 *   "online" → mobile money    — Step 1 skipped, starts at Step 2 (contact)
 *              on submit: calls /api/payment/create-order → pushes USSD to phone
 *
 * Payment failure:
 *   When `paymentError` is set, renders <PaymentFailedScreen> instead of the
 *   normal steps. "Réessayer" calls onRetry directly. "Modifier le numéro"
 *   clears the error and jumps back to the contact step.
 *
 * Phone normalization:
 *   The phone is normalized to full 237XXXXXXXXX format synchronously inside
 *   handleSubmit before calling onSubmit(normalizedPhone). This avoids the
 *   React state-update race where onSubmit would fire before onFormChange
 *   had propagated the updated phone value.
 */

import { useState } from "react";
import {
    X, Shield, CheckCircle, Phone, MessageCircle,
    MapPin, Lock, AlertCircle, Banknote, ChevronLeft, Smartphone,
} from "lucide-react";
import { Product } from "@/types/Product";

interface OrderForm {
    name: string; phone: string; phoneConfirmed: boolean;
    deliveryZone: string; quartier: string; callTime: string;
    hasWhatsApp: boolean; hasCash: boolean | null;
}

interface OrderModalProps {
    product:        Product;
    quantity:       number;
    orderForm:      OrderForm;
    orderSubmitted: boolean;
    submitting:     boolean;
    paymentMode:    "cod" | "online";
    paymentError:   string | null;
    onClose:        () => void;
    onFormChange:   (form: OrderForm) => void;
    /** Receives the 237-prefixed normalized phone so no state race occurs */
    onSubmit:       (normalizedPhone: string) => void;
    onRetry:        (normalizedPhone: string) => void;
    formatPrice:    (price: number) => string;
}

const SCROLLBAR_CSS = `
  .shopici-scroll::-webkit-scrollbar { width: 4px; }
  .shopici-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 999px; }
  .shopici-scroll::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 999px; }
  .shopici-scroll { scrollbar-width: thin; scrollbar-color: #FF6B35 #f3f4f6; }
`;

// ── Cameroon phone helpers ────────────────────────────────────────────────────

function parseCMPhone(raw: string): string | null {
    const digits = raw.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    if (digits.startsWith("237") && digits.length === 12 && digits[3] === "6") {
        return digits.slice(3);
    }
    if (digits.length === 9 && digits.startsWith("6")) {
        return digits;
    }
    return null;
}

function detectOperator(local9: string): "orange" | "mtn" | null {
    const prefix = parseInt(local9.slice(0, 3), 10);
    const orangePrefixes = [655, 656, 657, 658, 659, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699];
    const mtnPrefixes    = [650, 651, 652, 653, 654, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684];
    if (orangePrefixes.includes(prefix)) return "orange";
    if (mtnPrefixes.includes(prefix))    return "mtn";
    return null;
}

function toFullCMPhone(local9: string): string {
    return "237" + local9;
}

/** Normalize any CM phone input to the 237XXXXXXXXX format synchronously */
function normalizePhone(raw: string): string {
    const local9 = parseCMPhone(raw);
    return local9 ? toFullCMPhone(local9) : raw;
}

// ── Step navigation ───────────────────────────────────────────────────────────

function useSteps(paymentMode: "cod" | "online") {
    const steps = paymentMode === "cod" ? [1, 2, 3, 4] : [2, 3, 4];
    const TOTAL = steps.length;
    const [idx, setIdx] = useState(0);

    return {
        step:    steps[idx],
        display: idx + 1,
        total:   TOTAL,
        canBack: idx > 0,
        canNext: idx < TOTAL - 1,
        isLast:  idx === TOTAL - 1,
        next:    () => setIdx(i => i + 1),
        back:    () => setIdx(i => i - 1),
        goToStep: (stepValue: number) => {
            const i = steps.indexOf(stepValue);
            if (i !== -1) setIdx(i);
        },
    };
}

function stepLabel(step: number) {
    return ["Êtes-vous prêt(e) ?", "Vos coordonnées", "Votre adresse", "Créneau & confirmation"][step - 1] ?? "";
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function OrderModal({
    product, quantity, orderForm, orderSubmitted,
    submitting, paymentMode, paymentError,
    onClose, onFormChange, onSubmit, onRetry, formatPrice,
}: OrderModalProps) {
    const totalPrice = product.price * quantity;
    const nav        = useSteps(paymentMode);

    const local9 = parseCMPhone(orderForm.phone);

    const stepValid: Record<number, boolean> = {
        1: orderForm.hasCash === true,
        2: orderForm.name.trim() !== "" && local9 !== null && orderForm.phoneConfirmed,
        3: orderForm.deliveryZone !== "" && orderForm.quartier.trim() !== "",
        4: orderForm.callTime !== "",
    };

    // Normalize phone synchronously — no state update needed before calling onSubmit
    const handleSubmit = () => {
        const normalizedPhone = normalizePhone(orderForm.phone);
        onSubmit(normalizedPhone);
    };

    // ── Payment failed screen ─────────────────────────────────────────────────
    if (paymentError) {
        return (
            <PaymentFailedScreen
                error={paymentError}
                phone={orderForm.phone}
                totalPrice={totalPrice}
                formatPrice={formatPrice}
                submitting={submitting}
                onRetry={onRetry}
                onEditPhone={() => {
                    nav.goToStep(2);
                    onFormChange({ ...orderForm, phone: "", phoneConfirmed: false });
                }}
                onClose={onClose}
            />
        );
    }

    // ── Success screen ────────────────────────────────────────────────────────
    if (orderSubmitted) {
        return (
            <SuccessScreen
                orderForm={orderForm}
                product={product}
                totalPrice={totalPrice}
                formatPrice={formatPrice}
                onClose={onClose}
            />
        );
    }

    return (
        <>
            <style>{SCROLLBAR_CSS}</style>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: "92vh" }}>

                    {/* Header */}
                    <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {nav.canBack && (
                                    <button onClick={nav.back} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                                    </button>
                                )}
                                <p className="text-xs font-semibold text-gray-400">{stepLabel(nav.step)}</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Dot progress */}
                        <div className="flex items-center justify-center gap-2">
                            {Array.from({ length: nav.total }).map((_, i) => (
                                <div key={i} className={`rounded-full transition-all duration-300 ${
                                    i + 1 === nav.display ? "w-6 h-2.5 bg-shopici-coral"
                                    : i + 1 < nav.display ? "w-2.5 h-2.5 bg-shopici-coral/40"
                                    : "w-2.5 h-2.5 bg-gray-200"
                                }`} />
                            ))}
                        </div>

                        {paymentMode === "online" && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 bg-blue-50 rounded-xl py-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                                <p className="text-xs font-semibold text-blue-600">Paiement Mobile Money</p>
                            </div>
                        )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 shopici-scroll">
                        {nav.step === 1 && (
                            <StepCash
                                totalPrice={totalPrice}
                                formatPrice={formatPrice}
                                hasCash={orderForm.hasCash}
                                onChange={(v) => onFormChange({ ...orderForm, hasCash: v })}
                                onClose={onClose}
                            />
                        )}
                        {nav.step === 2 && <StepContact orderForm={orderForm} onFormChange={onFormChange} paymentMode={paymentMode} />}
                        {nav.step === 3 && <StepLocation orderForm={orderForm} onFormChange={onFormChange} />}
                        {nav.step === 4 && (
                            <StepCallAndConfirm
                                orderForm={orderForm}
                                product={product}
                                totalPrice={totalPrice}
                                formatPrice={formatPrice}
                                paymentMode={paymentMode}
                                onFormChange={onFormChange}
                            />
                        )}
                    </div>

                    {/* Footer CTA */}
                    <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 space-y-3">
                        {!nav.isLast ? (
                            <button
                                onClick={nav.next}
                                disabled={!stepValid[nav.step]}
                                className={`w-full py-4 text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                                    !stepValid[nav.step]
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-shopici-coral hover:brightness-105 active:scale-[0.98] shadow-lg shadow-shopici-coral/30"
                                }`}
                            >
                                Continuer →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !stepValid[4]}
                                className={`w-full py-4 text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                                    !stepValid[4]
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : submitting
                                        ? "bg-shopici-coral opacity-70 animate-pulse cursor-not-allowed"
                                        : "bg-shopici-coral hover:brightness-105 active:scale-[0.98] shadow-lg shadow-shopici-coral/30"
                                }`}
                            >
                                {submitting ? (
                                    <><Spinner /> {paymentMode === "online" ? "Envoi en cours..." : "Envoi..."}</>
                                ) : paymentMode === "online" ? (
                                    <><Smartphone className="w-4 h-4" /> PAYER PAR MOBILE MONEY</>
                                ) : (
                                    <><Lock className="w-4 h-4" /> JE CONFIRME MA COMMANDE</>
                                )}
                            </button>
                        )}
                        <div className="flex items-center justify-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-green-500" />
                            <p className="text-xs text-gray-400 font-medium">
                                {paymentMode === "online"
                                    ? "Paiement sécurisé via Fapshi"
                                    : "Paiement à la livraison — zéro risque"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Payment failed screen ─────────────────────────────────────────────────────

function PaymentFailedScreen({ error, phone, totalPrice, formatPrice, submitting, onRetry, onEditPhone, onClose }: {
    error: string; phone: string; totalPrice: number;
    formatPrice: (n: number) => string;
    submitting: boolean;
    onRetry: (normalizedPhone: string) => void;
    onEditPhone: () => void;
    onClose: () => void;
}) {
    // Normalize here too so retry always sends 237XXXXXXXXX
    const normalizedPhone = normalizePhone(phone);

    return (
        <>
            <style>{SCROLLBAR_CSS}</style>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl">

                    {/* Header */}
                    <div className="flex justify-end px-5 pt-5 pb-2">
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Icon + message */}
                    <div className="px-5 pb-5 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-shopici-black mb-2">Paiement échoué</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{error}</p>
                    </div>

                    {/* No duplicate reassurance */}
                    <div className="mx-5 mb-4 bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 font-medium leading-relaxed">
                            Votre commande est conservée — aucun doublon ne sera créé si vous réessayez.
                        </p>
                    </div>

                    {/* Recap */}
                    <div className="mx-5 mb-5 bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-2.5">
                            <span className="text-xs text-gray-400">Téléphone</span>
                            <span className="text-xs font-semibold text-shopici-black">{normalizedPhone}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2.5">
                            <span className="text-xs text-gray-400">Montant</span>
                            <span className="text-xs font-semibold text-shopici-coral">{formatPrice(totalPrice)} XAF</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-5 pb-6 space-y-3">
                        <button
                            onClick={() => onRetry(normalizedPhone)}
                            disabled={submitting}
                            className={`w-full py-4 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                                submitting
                                    ? "bg-red-400 opacity-70 animate-pulse cursor-not-allowed"
                                    : "bg-red-500 hover:brightness-105 active:scale-[0.98] shadow-lg shadow-red-200"
                            }`}
                        >
                            {submitting ? (
                                <><Spinner /> Envoi en cours...</>
                            ) : (
                                <><Smartphone className="w-4 h-4" /> Réessayer le paiement</>
                            )}
                        </button>
                        <button
                            onClick={onEditPhone}
                            disabled={submitting}
                            className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Modifier le numéro
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Step 1: Cash gate (COD only) ──────────────────────────────────────────────

function StepCash({ totalPrice, formatPrice, hasCash, onChange, onClose }: {
    totalPrice: number; formatPrice: (n: number) => string;
    hasCash: boolean | null; onChange: (v: boolean) => void; onClose: () => void;
}) {
    return (
        <div className="flex flex-col gap-5">
            <div className="bg-shopici-black rounded-2xl p-6 text-center text-white">
                <p className="text-xs text-white/50 mb-2">Montant à payer à la livraison</p>
                <p className="text-5xl font-bold text-shopici-coral leading-none">{formatPrice(totalPrice)}</p>
                <p className="text-sm text-white/60 mt-2">XAF en espèces</p>
            </div>
            <p className="text-base font-bold text-shopici-black text-center">
                Avez-vous déjà <span className="text-shopici-coral">{formatPrice(totalPrice)} XAF</span> pour payer le livreur ?
            </p>
            <div className="flex flex-col gap-3">
                <button type="button" onClick={() => onChange(true)}
                    className={`w-full py-4 rounded-2xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2 ${
                        hasCash === true ? "bg-green-500 border-green-500 text-white shadow-lg" : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
                    }`}>
                    <CheckCircle className="w-5 h-5" /> OUI, j'ai l'argent prêt
                </button>
                <button type="button" onClick={() => onChange(false)}
                    className={`w-full py-4 rounded-2xl border-2 font-bold text-base transition-all ${
                        hasCash === false ? "bg-red-400 border-red-400 text-white shadow-lg" : "bg-white border-gray-200 text-shopici-black hover:border-red-300"
                    }`}>
                    NON, pas encore
                </button>
            </div>
            {hasCash === false && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                    <p className="text-sm text-red-700 font-medium">Revenez quand vous êtes prêt(e) — on sera toujours là !</p>
                    <button onClick={onClose} className="text-xs font-bold text-red-500 underline">Fermer et revenir plus tard</button>
                </div>
            )}
        </div>
    );
}

// ── Step 2: Contact ───────────────────────────────────────────────────────────

function StepContact({ orderForm, onFormChange, paymentMode }: {
    orderForm: OrderForm; onFormChange: (f: OrderForm) => void; paymentMode: "cod" | "online";
}) {
    const local9   = parseCMPhone(orderForm.phone);
    const operator = local9 ? detectOperator(local9) : null;
    const isValid  = local9 !== null;
    const isDirty  = orderForm.phone.trim() !== "";

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Votre nom complet</label>
                <input
                    type="text"
                    value={orderForm.name}
                    onChange={(e) => onFormChange({ ...orderForm, name: e.target.value })}
                    placeholder="Ex: Jean Dupont"
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">
                    {paymentMode === "online" ? "Votre numéro Mobile Money (Orange / MTN)" : "Votre numéro de téléphone"}
                </label>

                <div className="relative flex items-center">
                    {operator && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full overflow-hidden z-10 pointer-events-none shadow-sm">
                            <img
                                src={operator === "orange" ? "/orange.png" : "/mtn.png"}
                                alt={operator === "orange" ? "Orange Money" : "MTN MoMo"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <input
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => onFormChange({
                            ...orderForm,
                            phone: e.target.value,
                            phoneConfirmed: false,
                        })}
                        placeholder="Ex: 677 123 456"
                        style={{ paddingLeft: operator ? "3.25rem" : undefined }}
                        className={`w-full py-3.5 text-base border-2 rounded-xl focus:outline-none bg-white text-shopici-black placeholder:text-gray-300 transition-colors pr-10
                            ${!operator ? "pl-4" : ""}
                            ${!isDirty
                                ? "border-gray-200 focus:border-shopici-blue"
                                : isValid
                                ? "border-green-400 focus:border-green-500"
                                : "border-red-400 focus:border-red-500"
                            }`}
                    />
                    {isDirty && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {isValid
                                ? <CheckCircle className="w-5 h-5 text-green-500" />
                                : <AlertCircle className="w-5 h-5 text-red-400" />
                            }
                        </div>
                    )}
                </div>

                {isDirty && !isValid && (
                    <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Format invalide — entrez 9 chiffres commençant par 6 (ex: 677 123 456)
                    </p>
                )}
                {isValid && operator === "orange" && (
                    <p className="text-xs text-orange-500 font-semibold mt-1.5">
                        🟠 {paymentMode === "online" ? "Numéro Orange Money détecté" : "Numéro Orange détecté(paiement à la livraison)"}
                    </p>
                )}
                {isValid && operator === "mtn" && (
                    <p className="text-xs text-yellow-600 font-semibold mt-1.5">
                        🟡 {paymentMode === "online" ? "Numéro MTN MoMo détecté" : "Numéro MTN détecté (paiement à la livraison)"}
                    </p>
                )}
                {isValid && !operator && (
                    <p className="text-xs text-gray-400 font-medium mt-1.5">
                        ℹ️ Opérateur non reconnu — vérifiez que ce numéro supporte Mobile Money
                    </p>
                )}

                {isValid && (
                    <label className={`mt-2 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                        orderForm.phoneConfirmed ? "border-green-400 bg-green-50" : "border-orange-200 bg-orange-50"
                    }`}>
                        <input
                            type="checkbox"
                            checked={orderForm.phoneConfirmed}
                            onChange={(e) => onFormChange({ ...orderForm, phoneConfirmed: e.target.checked })}
                            className="w-5 h-5 accent-green-500 flex-shrink-0"
                        />
                        <span className="text-xs font-semibold text-shopici-black">
                            Je confirme que <span className="text-shopici-coral font-bold">{orderForm.phone || "mon numéro"}</span> est correct
                        </span>
                    </label>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Ce numéro est sur WhatsApp ?</label>
                <div className="grid grid-cols-2 gap-2.5">
                    <button type="button" onClick={() => onFormChange({ ...orderForm, hasWhatsApp: true })}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                            orderForm.hasWhatsApp ? "bg-green-500 border-green-500 text-white shadow-md" : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
                        }`}>
                        <MessageCircle className="w-5 h-5" /> OUI WhatsApp
                    </button>
                    <button type="button" onClick={() => onFormChange({ ...orderForm, hasWhatsApp: false })}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                            !orderForm.hasWhatsApp && orderForm.phone !== "" ? "bg-gray-500 border-gray-500 text-white shadow-md" : "bg-white border-gray-200 text-shopici-black hover:border-gray-400"
                        }`}>
                        <Phone className="w-5 h-5" /> Appel seulement
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Step 3: Location ──────────────────────────────────────────────────────────

function StepLocation({ orderForm, onFormChange }: { orderForm: OrderForm; onFormChange: (f: OrderForm) => void }) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Votre ville</label>
                <select value={orderForm.deliveryZone}
                    onChange={(e) => onFormChange({ ...orderForm, deliveryZone: e.target.value })}
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black transition-colors appearance-none">
                    <option value="">— Choisissez votre ville —</option>
                    <option>Yaoundé</option><option>Douala</option><option>Bafoussam</option>
                    <option>Garoua</option><option>Maroua</option><option>Bamenda</option>
                    <option>Ngaoundéré</option><option>Bertoua</option><option>Buea</option>
                    <option>Limbe</option><option value="Autre">Autre ville</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Votre quartier exact</label>
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-shopici-blue pointer-events-none" />
                    <input type="text" value={orderForm.quartier}
                        onChange={(e) => onFormChange({ ...orderForm, quartier: e.target.value })}
                        placeholder="Ex: Bastos, Melen, Biyem-Assi..."
                        className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors" />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">🚚 Le livreur utilisera cette info pour vous retrouver</p>
            </div>
        </div>
    );
}

// ── Step 4: Call time + recap ─────────────────────────────────────────────────

function StepCallAndConfirm({ orderForm, product, totalPrice, formatPrice, paymentMode, onFormChange }: {
    orderForm: OrderForm; product: Product; totalPrice: number;
    formatPrice: (n: number) => string; paymentMode: "cod" | "online";
    onFormChange: (f: OrderForm) => void;
}) {
    // Show normalized phone in the recap so user sees what will actually be sent
    const displayPhone = normalizePhone(orderForm.phone);

    return (
        <div className="flex flex-col gap-5">
            <div>
                <p className="text-sm font-bold text-shopici-black mb-3">Quand peut-on vous appeler ?</p>
                <CallTimeSelector value={orderForm.callTime} onChange={(val) => onFormChange({ ...orderForm, callTime: val })} />
            </div>

            <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                {[
                    { label: "Produit",   value: product.name },
                    { label: "Nom",       value: orderForm.name },
                    { label: "Téléphone", value: displayPhone },
                    { label: "Adresse",   value: `${orderForm.quartier}, ${orderForm.deliveryZone}` },
                    { label: "À payer",   value: `${formatPrice(totalPrice)} XAF` },
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-3 px-4 py-2.5">
                        <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
                        <span className="text-xs font-semibold text-shopici-black text-right line-clamp-1">{value}</span>
                    </div>
                ))}
            </div>

            {paymentMode === "online" ? (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                        Une invite USSD sera envoyée au <span className="font-bold">{displayPhone}</span>. Approuvez-la pour finaliser le paiement de{" "}
                        <span className="font-bold">{formatPrice(totalPrice)} XAF</span>.
                    </p>
                </div>
            ) : (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 font-medium leading-relaxed">
                        En confirmant, vous vous engagez à être disponible et à payer à la livraison.
                    </p>
                </div>
            )}
        </div>
    );
}

// ── Call time selector ────────────────────────────────────────────────────────

function getHour() { return new Date().getHours(); }

function CallTimeSelector({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const h = getHour();
    const slots = [
        ...(h >= 8 && h < 20 ? [{ value: "now", emoji: "📲", label: "MAINTENANT", sub: "On vous appelle dans les minutes qui suivent", highlight: true, tomorrow: false }] : []),
        { value: "morning",   emoji: "🌅", label: "MATIN",      sub: h >= 12 ? "Demain 8h–12h"  : "Aujourd'hui 8h–12h",  highlight: false, tomorrow: h >= 12 },
        { value: "afternoon", emoji: "☀️", label: "APRÈS-MIDI", sub: h >= 17 ? "Demain 12h–17h" : "Aujourd'hui 12h–17h", highlight: false, tomorrow: h >= 17 },
        { value: "evening",   emoji: "🌙", label: "SOIR",       sub: h >= 20 ? "Demain 17h–20h" : "Aujourd'hui 17h–20h", highlight: false, tomorrow: h >= 20 },
    ];
    return (
        <div className="space-y-2">
            {slots.map((slot) => {
                const sel = value === slot.value;
                return (
                    <button key={slot.value} type="button" onClick={() => onChange(slot.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center gap-3 ${
                            sel ? slot.highlight ? "bg-green-500 border-green-500 text-white shadow-md" : "bg-shopici-blue border-shopici-blue text-white shadow-md"
                                : "bg-white border-gray-200 text-shopici-black hover:border-shopici-blue"
                        }`}>
                        <span className="text-lg flex-shrink-0">{slot.emoji}</span>
                        <span className="flex-1 text-left min-w-0">
                            <span className="block text-sm leading-tight">{slot.label}</span>
                            <span className={`block text-xs font-normal mt-0.5 ${sel ? "text-white/75" : "text-gray-400"}`}>{slot.sub}</span>
                        </span>
                        {slot.tomorrow && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${sel ? "bg-white/20 text-white" : "bg-orange-100 text-orange-500"}`}>demain</span>}
                        {slot.highlight && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${sel ? "bg-white/20 text-white" : "bg-green-100 text-green-600"}`}>dispo</span>}
                    </button>
                );
            })}
        </div>
    );
}

// ── Success screen (COD only — online flow gets USSD prompt) ──────────────────

function SuccessScreen({ orderForm, product, totalPrice, formatPrice, onClose }: any) {
    return (
        <>
            <style>{SCROLLBAR_CSS}</style>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: "92vh" }}>
                    <div className="flex-shrink-0 flex justify-end px-5 pt-5">
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 shopici-scroll">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-200">
                                <CheckCircle className="w-11 h-11 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-shopici-black">Commande confirmée 🎉</h3>
                            <p className="text-sm text-gray-500 mt-1">Merci <span className="font-bold text-shopici-black">{orderForm.name}</span>, on s'occupe de tout !</p>
                        </div>
                        <div className="bg-shopici-black rounded-2xl p-4 mb-5 text-white flex justify-between items-center gap-2">
                            <div className="min-w-0">
                                <p className="text-xs text-white/50 mb-0.5">Votre commande</p>
                                <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs text-white/50 mb-0.5">À payer</p>
                                <p className="text-xl font-bold text-shopici-coral">{formatPrice(totalPrice)} XAF</p>
                            </div>
                        </div>
                        <div className="space-y-2.5 mb-5">
                            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                <div className="w-9 h-9 bg-shopici-blue rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-shopici-black">Appel de confirmation</p>
                                    <p className="text-xs text-gray-500 mt-0.5">On vous appelle au <span className="font-bold text-shopici-black">{orderForm.phone}</span></p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                <div className="w-9 h-9 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Banknote className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-shopici-black">Préparez l'argent</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Ayez <span className="font-bold text-shopici-coral">{formatPrice(totalPrice)} XAF</span> en espèces prêt</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4">
                                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-shopici-black">Restez disponible</p>
                                    <p className="text-xs text-gray-500 mt-0.5">À <span className="font-bold text-shopici-black">{orderForm.quartier}, {orderForm.deliveryZone}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-2.5 mb-5">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 font-medium leading-relaxed">Si vous ne répondez pas à notre appel, la commande sera automatiquement annulée.</p>
                        </div>
                        <button onClick={onClose} className="w-full py-4 bg-shopici-black hover:brightness-110 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg">
                            <CheckCircle className="w-5 h-5" /> Compris, j'attends l'appel !
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function Spinner() {
    return <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>;
}