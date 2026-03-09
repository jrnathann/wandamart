import { X, Shield, CheckCircle, Phone, MessageCircle, MapPin, Lock, AlertCircle, Banknote } from "lucide-react";
import { Product } from "@/types/Product";

interface OrderForm {
    name: string;
    phone: string;
    phoneConfirmed: boolean;
    deliveryZone: string;
    quartier: string;
    callTime: string;
    hasWhatsApp: boolean;
    hasCash: boolean | null;
}

interface OrderModalProps {
    product: Product;
    quantity: number;
    orderForm: OrderForm;
    orderSubmitted: boolean;
    submitting: boolean;
    onClose: () => void;
    onFormChange: (form: OrderForm) => void;
    onSubmit: () => void;
    formatPrice: (price: number) => string;
}

export default function OrderModal({
    product,
    quantity,
    orderForm,
    orderSubmitted,
    submitting,
    onClose,
    onFormChange,
    onSubmit,
    formatPrice,
}: OrderModalProps) {
    const totalPrice = product.price * quantity;

    const isFormValid =
        orderForm.name.trim() !== "" &&
        orderForm.phone.trim() !== "" &&
        orderForm.phoneConfirmed &&
        orderForm.deliveryZone !== "" &&
        orderForm.quartier.trim() !== "" &&
        orderForm.callTime !== "" &&
        orderForm.hasCash === true;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Sheet — slides up on mobile, centered on desktop */}
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

                    {!orderSubmitted ? (
                        <>
                            {/* ── Sticky header ── */}
                            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-shopici-black leading-tight">
                                        Confirmer votre commande
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Un agent vous appellera pour finaliser
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0 ml-3"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            {/* ── Scrollable body ── */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                                {/* Order recap */}
                                <div className="bg-shopici-black rounded-2xl p-4 text-white">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <span className="text-xs text-white/50 flex-shrink-0">Produit</span>
                                        <span className="font-semibold text-sm text-right line-clamp-2 flex-1 ml-2">
                                            {product.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs text-white/50">Quantité</span>
                                        <span className="font-semibold text-sm">{quantity}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                        <span className="text-xs font-semibold text-white/70">À payer à la livraison</span>
                                        <span className="text-xl font-bold text-shopici-coral">
                                            {formatPrice(totalPrice)} XAF
                                        </span>
                                    </div>
                                </div>

                                {/* ── Cash gate ── */}
                                <div className={`rounded-2xl border-2 p-4 transition-all ${
                                    orderForm.hasCash === true
                                        ? "border-green-400 bg-green-50"
                                        : orderForm.hasCash === false
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 bg-gray-50"
                                }`}>
                                    <div className="flex items-start gap-2.5 mb-3">
                                        <Banknote className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                            orderForm.hasCash === true ? "text-green-600" : "text-gray-400"
                                        }`} />
                                        <p className="font-bold text-shopici-black text-sm leading-snug">
                                            Avez-vous déjà{" "}
                                            <span className="text-shopici-coral">{formatPrice(totalPrice)} XAF</span>{" "}
                                            pour payer le livreur ?
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => onFormChange({ ...orderForm, hasCash: true })}
                                            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                                                orderForm.hasCash === true
                                                    ? "bg-green-500 border-green-500 text-white shadow-md"
                                                    : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
                                            }`}
                                        >
                                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                            OUI, j'ai l'argent
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onFormChange({ ...orderForm, hasCash: false })}
                                            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                                orderForm.hasCash === false
                                                    ? "bg-red-400 border-red-400 text-white shadow-md"
                                                    : "bg-white border-gray-200 text-shopici-black hover:border-red-300"
                                            }`}
                                        >
                                            NON, pas encore
                                        </button>
                                    </div>
                                    {orderForm.hasCash === false && (
                                        <div className="mt-3 bg-red-100 rounded-xl p-3 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-700 font-medium leading-relaxed">
                                                Revenez quand vous êtes prêt(e) — on sera toujours là pour vous!
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* ── Rest of form — only shown after cash confirmed ── */}
                                {orderForm.hasCash === true && (
                                    <div className="space-y-4">

                                        {/* Name */}
                                        <FormField step={1} label="Votre nom complet">
                                            <input
                                                type="text"
                                                value={orderForm.name}
                                                onChange={(e) => onFormChange({ ...orderForm, name: e.target.value })}
                                                placeholder="Ex: Jean Dupont"
                                                className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors"
                                            />
                                        </FormField>

                                        {/* Phone */}
                                        <FormField step={2} label="Votre numéro de téléphone">
                                            <input
                                                type="tel"
                                                value={orderForm.phone}
                                                onChange={(e) => onFormChange({ ...orderForm, phone: e.target.value, phoneConfirmed: false })}
                                                placeholder="Ex: 677 123 456"
                                                className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors"
                                            />
                                            {/* Confirmation checkbox — always visible once they start typing */}
                                            <label className={`mt-2 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                                                orderForm.phoneConfirmed
                                                    ? "border-green-400 bg-green-50"
                                                    : "border-orange-200 bg-orange-50"
                                            }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={orderForm.phoneConfirmed}
                                                    onChange={(e) => onFormChange({ ...orderForm, phoneConfirmed: e.target.checked })}
                                                    className="w-5 h-5 accent-green-500 flex-shrink-0"
                                                />
                                                <span className="text-xs font-semibold text-shopici-black leading-relaxed">
                                                    Je confirme que{" "}
                                                    <span className="text-shopici-coral font-bold">
                                                        {orderForm.phone || "mon numéro"}
                                                    </span>{" "}
                                                    est correct
                                                </span>
                                            </label>
                                        </FormField>

                                        {/* WhatsApp */}
                                        <FormField step={3} label="Ce numéro est sur WhatsApp ?">
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => onFormChange({ ...orderForm, hasWhatsApp: true })}
                                                    className={`py-3 px-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                                                        orderForm.hasWhatsApp
                                                            ? "bg-green-500 border-green-500 text-white shadow-md"
                                                            : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
                                                    }`}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    OUI WhatsApp
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onFormChange({ ...orderForm, hasWhatsApp: false })}
                                                    className={`py-3 px-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                                                        !orderForm.hasWhatsApp && orderForm.phone !== ""
                                                            ? "bg-gray-500 border-gray-500 text-white shadow-md"
                                                            : "bg-white border-gray-200 text-shopici-black hover:border-gray-400"
                                                    }`}
                                                >
                                                    <Phone className="w-5 h-5" />
                                                    Appel seulement
                                                </button>
                                            </div>
                                        </FormField>

                                        {/* City */}
                                        <FormField step={4} label="Votre ville">
                                            <select
                                                value={orderForm.deliveryZone}
                                                onChange={(e) => onFormChange({ ...orderForm, deliveryZone: e.target.value })}
                                                className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black transition-colors appearance-none"
                                            >
                                                <option value="">— Choisissez votre ville —</option>
                                                <option value="Yaoundé">Yaoundé</option>
                                                <option value="Douala">Douala</option>
                                                <option value="Bafoussam">Bafoussam</option>
                                                <option value="Garoua">Garoua</option>
                                                <option value="Maroua">Maroua</option>
                                                <option value="Bamenda">Bamenda</option>
                                                <option value="Ngaoundéré">Ngaoundéré</option>
                                                <option value="Bertoua">Bertoua</option>
                                                <option value="Buea">Buea</option>
                                                <option value="Limbe">Limbe</option>
                                                <option value="Autre">Autre ville</option>
                                            </select>
                                        </FormField>

                                        {/* Quartier */}
                                        <FormField step={5} label="Votre quartier exact">
                                            <div className="relative">
                                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-shopici-blue pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={orderForm.quartier}
                                                    onChange={(e) => onFormChange({ ...orderForm, quartier: e.target.value })}
                                                    placeholder="Ex: Bastos, Melen, Biyem-Assi..."
                                                    className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1.5 pl-1">
                                                🚚 Le livreur utilisera cette info pour vous retrouver
                                            </p>
                                        </FormField>

                                        {/* Call time */}
                                        <FormField step={6} label="Quand peut-on vous appeler ?">
                                            <CallTimeSelector
                                                value={orderForm.callTime}
                                                onChange={(val) => onFormChange({ ...orderForm, callTime: val })}
                                            />
                                            <p className="text-xs text-gray-400 mt-1.5 pl-1">
                                                📞 Notre agent appellera pour confirmer et fixer la livraison
                                            </p>
                                        </FormField>

                                    </div>
                                )}
                            </div>

                            {/* ── Sticky footer ── */}
                            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={onSubmit}
                                    disabled={submitting || !isFormValid}
                                    className={`w-full py-4 text-white text-base font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
                                        !isFormValid
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : submitting
                                            ? "bg-shopici-coral opacity-70 cursor-not-allowed animate-pulse"
                                            : "bg-shopici-coral hover:brightness-105 active:scale-[0.98] shadow-lg shadow-shopici-coral/30"
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            JE CONFIRME MA COMMANDE
                                        </>
                                    )}
                                </button>
                                {!isFormValid && (
                                    <p className="text-center text-xs text-gray-400">
                                        Remplissez tous les champs pour continuer
                                    </p>
                                )}
                                <div className="flex items-center justify-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-green-500" />
                                    <p className="text-xs text-gray-400 font-medium">
                                        Paiement à la livraison uniquement — zéro risque
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Success screen ── */
                        <div className="flex flex-col max-h-[92vh] sm:max-h-[88vh]">
                            {/* Close button */}
                            <div className="flex-shrink-0 flex justify-end px-5 pt-5">
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
                                {/* Hero */}
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-200">
                                        <CheckCircle className="w-11 h-11 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-shopici-black">
                                        Commande confirmée 🎉
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Merci{" "}
                                        <span className="font-bold text-shopici-black">{orderForm.name}</span>,
                                        on s'occupe de tout !
                                    </p>
                                </div>

                                {/* Recap pill */}
                                <div className="bg-shopici-black rounded-2xl p-4 mb-5 text-white">
                                    <div className="flex justify-between items-center gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs text-white/50 mb-0.5">Votre commande</p>
                                            <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-white/50 mb-0.5">À payer</p>
                                            <p className="text-xl font-bold text-shopici-coral">
                                                {formatPrice(totalPrice)} XAF
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Next steps */}
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Ce qui se passe maintenant
                                </p>
                                <div className="space-y-2.5 mb-5">
                                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                        <div className="w-9 h-9 bg-shopici-blue rounded-full flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-shopici-black">Appel de confirmation</p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                On vous appelle au{" "}
                                                <span className="font-bold text-shopici-black">{orderForm.phone}</span>{" "}
                                                —{" "}
                                                <span className="font-semibold text-shopici-blue">
                                                    {getCallTimeLabel(orderForm.callTime)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                        <div className="w-9 h-9 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Banknote className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-shopici-black">Préparez l'argent</p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                Ayez{" "}
                                                <span className="font-bold text-shopici-coral">{formatPrice(totalPrice)} XAF</span>{" "}
                                                en espèces prêt pour le livreur
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4">
                                        <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-shopici-black">Restez disponible</p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                À{" "}
                                                <span className="font-bold text-shopici-black">
                                                    {orderForm.quartier}, {orderForm.deliveryZone}
                                                </span>{" "}
                                                pour recevoir votre colis
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-2.5 mb-5">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-600 font-medium leading-relaxed">
                                        Si vous ne répondez pas à notre appel, la commande sera automatiquement annulée.
                                    </p>
                                </div>

                                {/* Close CTA */}
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-shopici-black hover:brightness-110 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Compris, j'attends l'appel !
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function getHour() {
    return new Date().getHours();
}

export function getCallTimeLabel(value: string): string {
    const h = getHour();
    if (value === "now") return "dès maintenant";
    if (value === "morning") return h >= 12 ? "demain matin (8h–12h)" : "ce matin (8h–12h)";
    if (value === "afternoon") return h >= 17 ? "demain après-midi (12h–17h)" : "cet après-midi (12h–17h)";
    if (value === "evening") return h >= 20 ? "demain soir (17h–20h)" : "ce soir (17h–20h)";
    return value;
}

function CallTimeSelector({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const h = getHour();

    const slots: { value: string; emoji: string; label: string; sub: string; highlight?: boolean; tomorrow?: boolean }[] = [
        ...(h >= 8 && h < 20
            ? [{ value: "now", emoji: "📲", label: "MAINTENANT", sub: "Notre agent vous appelle dans les minutes qui suivent", highlight: true }]
            : []),
        { value: "morning",   emoji: "🌅", label: "MATIN",       sub: h >= 12 ? "Demain 8h – 12h"  : "Aujourd'hui 8h – 12h",   tomorrow: h >= 12 },
        { value: "afternoon", emoji: "☀️", label: "APRÈS-MIDI",  sub: h >= 17 ? "Demain 12h – 17h" : "Aujourd'hui 12h – 17h",  tomorrow: h >= 17 },
        { value: "evening",   emoji: "🌙", label: "SOIR",        sub: h >= 20 ? "Demain 17h – 20h" : "Aujourd'hui 17h – 20h",  tomorrow: h >= 20 },
    ];

    return (
        <div className="space-y-2">
            {slots.map((slot) => {
                const isSelected = value === slot.value;
                return (
                    <button
                        key={slot.value}
                        type="button"
                        onClick={() => onChange(slot.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center gap-3 ${
                            isSelected
                                ? slot.highlight
                                    ? "bg-green-500 border-green-500 text-white shadow-md"
                                    : "bg-shopici-blue border-shopici-blue text-white shadow-md"
                                : "bg-white border-gray-200 text-shopici-black hover:border-shopici-blue"
                        }`}
                    >
                        <span className="text-lg flex-shrink-0">{slot.emoji}</span>
                        <span className="flex-1 text-left min-w-0">
                            <span className="block text-sm leading-tight">{slot.label}</span>
                            <span className={`block text-xs font-normal leading-tight mt-0.5 ${isSelected ? "text-white/75" : "text-gray-400"}`}>
                                {slot.sub}
                            </span>
                        </span>
                        {slot.tomorrow && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                                isSelected ? "bg-white/20 text-white" : "bg-orange-100 text-orange-500"
                            }`}>
                                demain
                            </span>
                        )}
                        {slot.highlight && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                                isSelected ? "bg-white/20 text-white" : "bg-green-100 text-green-600"
                            }`}>
                                dispo
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function StepBadge({ step }: { step: number }) {
    return (
        <span className="flex items-center justify-center w-6 h-6 bg-shopici-coral text-white rounded-full text-xs font-bold flex-shrink-0">
            {step}
        </span>
    );
}

function FormField({ step, label, children }: { step: number; label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="flex items-center gap-2 text-sm font-bold text-shopici-black mb-2">
                <StepBadge step={step} />
                <span>{label}</span>
            </label>
            {children}
        </div>
    );
}