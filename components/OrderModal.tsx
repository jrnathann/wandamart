/**
 * OPTION D — Progress dots at top, each step fills full screen like onboarding.
 * 4 dot steps: 1=Cash, 2=Contact, 3=Location, 4=CallTime+Confirm
 */
import { useState } from "react";
import {
    X, Shield, CheckCircle, Phone, MessageCircle,
    MapPin, Lock, AlertCircle, Banknote, ChevronLeft
} from "lucide-react";
import { Product } from "@/types/Product";

interface OrderForm {
    name: string; phone: string; phoneConfirmed: boolean;
    deliveryZone: string; quartier: string; callTime: string;
    hasWhatsApp: boolean; hasCash: boolean | null;
}
interface OrderModalProps {
    product: Product; quantity: number; orderForm: OrderForm;
    orderSubmitted: boolean; submitting: boolean; onClose: () => void;
    onFormChange: (form: OrderForm) => void; onSubmit: () => void;
    formatPrice: (price: number) => string;
}

const STEPS = 4;

export default function OrderModalD({
    product, quantity, orderForm, orderSubmitted,
    submitting, onClose, onFormChange, onSubmit, formatPrice,
}: OrderModalProps) {
    const [step, setStep] = useState(1);
    const totalPrice = product.price * quantity;

    const stepValid: Record<number, boolean> = {
        1: orderForm.hasCash === true,
        2: orderForm.name.trim() !== "" && orderForm.phone.trim() !== "" && orderForm.phoneConfirmed,
        3: orderForm.deliveryZone !== "" && orderForm.quartier.trim() !== "",
        4: orderForm.callTime !== "",
    };

    if (orderSubmitted) return <SuccessScreen orderForm={orderForm} product={product} totalPrice={totalPrice} formatPrice={formatPrice} onClose={onClose} />;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: "92vh" }}>

                    {/* Header with dot progress */}
                    <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {step > 1 && (
                                    <button onClick={() => setStep(s => s - 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                                    </button>
                                )}
                                <p className="text-xs font-semibold text-gray-400">{stepLabel(step)}</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Dot indicators */}
                        <div className="flex items-center justify-center gap-2">
                            {Array.from({ length: STEPS }).map((_, i) => (
                                <div key={i} className={`rounded-full transition-all duration-300 ${
                                    i + 1 === step ? "w-6 h-2.5 bg-shopici-coral"
                                    : i + 1 < step  ? "w-2.5 h-2.5 bg-shopici-coral/40"
                                    : "w-2.5 h-2.5 bg-gray-200"
                                }`} />
                            ))}
                        </div>
                    </div>

                    {/* Step content */}
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        {step === 1 && <StepCash totalPrice={totalPrice} formatPrice={formatPrice} hasCash={orderForm.hasCash} onChange={(v) => onFormChange({ ...orderForm, hasCash: v })} onClose={onClose} />}
                        {step === 2 && <StepContact orderForm={orderForm} onFormChange={onFormChange} />}
                        {step === 3 && <StepLocation orderForm={orderForm} onFormChange={onFormChange} />}
                        {step === 4 && <StepCallAndConfirm orderForm={orderForm} product={product} totalPrice={totalPrice} formatPrice={formatPrice} onFormChange={onFormChange} />}
                    </div>

                    {/* Footer CTA */}
                    <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 space-y-3">
                        {step < STEPS ? (
                            <button onClick={() => setStep(s => s + 1)} disabled={!stepValid[step]}
                                className={`w-full py-4 text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                                    !stepValid[step] ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-shopici-coral hover:brightness-105 active:scale-[0.98] shadow-lg shadow-shopici-coral/30"
                                }`}>
                                Continuer →
                            </button>
                        ) : (
                            <button onClick={onSubmit} disabled={submitting || !stepValid[4]}
                                className={`w-full py-4 text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                                    !stepValid[4] ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : submitting ? "bg-shopici-coral opacity-70 animate-pulse cursor-not-allowed"
                                    : "bg-shopici-coral hover:brightness-105 active:scale-[0.98] shadow-lg shadow-shopici-coral/30"
                                }`}>
                                {submitting ? <><Spinner /> Envoi...</> : <><Lock className="w-4 h-4" /> JE CONFIRME MA COMMANDE</>}
                            </button>
                        )}
                        <div className="flex items-center justify-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-green-500" />
                            <p className="text-xs text-gray-400 font-medium">Paiement à la livraison — zéro risque</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function stepLabel(step: number) {
    return ["Êtes-vous prêt(e) ?", "Vos coordonnées", "Votre adresse", "Créneau & confirmation"][step - 1] ?? "";
}

function StepCash({ totalPrice, formatPrice, hasCash, onChange, onClose }: { totalPrice: number; formatPrice: (n: number) => string; hasCash: boolean | null; onChange: (v: boolean) => void; onClose: () => void }) {
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
                    className={`w-full py-4 rounded-2xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2 ${hasCash === true ? "bg-green-500 border-green-500 text-white shadow-lg" : "bg-white border-gray-200 text-shopici-black hover:border-green-400"}`}>
                    <CheckCircle className="w-5 h-5" /> OUI, j'ai l'argent prêt
                </button>
                <button type="button" onClick={() => onChange(false)}
                    className={`w-full py-4 rounded-2xl border-2 font-bold text-base transition-all ${hasCash === false ? "bg-red-400 border-red-400 text-white shadow-lg" : "bg-white border-gray-200 text-shopici-black hover:border-red-300"}`}>
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

function StepContact({ orderForm, onFormChange }: { orderForm: OrderForm; onFormChange: (f: OrderForm) => void }) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Votre nom complet</label>
                <input type="text" value={orderForm.name} onChange={(e) => onFormChange({ ...orderForm, name: e.target.value })}
                    placeholder="Ex: Jean Dupont" className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors" />
            </div>
            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Votre numéro de téléphone</label>
                <input type="tel" value={orderForm.phone} onChange={(e) => onFormChange({ ...orderForm, phone: e.target.value, phoneConfirmed: false })}
                    placeholder="Ex: 677 123 456" className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors" />
                <label className={`mt-2 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${orderForm.phoneConfirmed ? "border-green-400 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
                    <input type="checkbox" checked={orderForm.phoneConfirmed} onChange={(e) => onFormChange({ ...orderForm, phoneConfirmed: e.target.checked })} className="w-5 h-5 accent-green-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-shopici-black">Je confirme que <span className="text-shopici-coral font-bold">{orderForm.phone || "mon numéro"}</span> est correct</span>
                </label>
            </div>
            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Ce numéro est sur WhatsApp ?</label>
                <div className="grid grid-cols-2 gap-2.5">
                    <button type="button" onClick={() => onFormChange({ ...orderForm, hasWhatsApp: true })}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${orderForm.hasWhatsApp ? "bg-green-500 border-green-500 text-white shadow-md" : "bg-white border-gray-200 text-shopici-black hover:border-green-400"}`}>
                        <MessageCircle className="w-5 h-5" /> OUI WhatsApp
                    </button>
                    <button type="button" onClick={() => onFormChange({ ...orderForm, hasWhatsApp: false })}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${!orderForm.hasWhatsApp && orderForm.phone !== "" ? "bg-gray-500 border-gray-500 text-white shadow-md" : "bg-white border-gray-200 text-shopici-black hover:border-gray-400"}`}>
                        <Phone className="w-5 h-5" /> Appel seulement
                    </button>
                </div>
            </div>
        </div>
    );
}

function StepLocation({ orderForm, onFormChange }: { orderForm: OrderForm; onFormChange: (f: OrderForm) => void }) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-bold text-shopici-black mb-2">Votre ville</label>
                <select value={orderForm.deliveryZone} onChange={(e) => onFormChange({ ...orderForm, deliveryZone: e.target.value })}
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
                    <input type="text" value={orderForm.quartier} onChange={(e) => onFormChange({ ...orderForm, quartier: e.target.value })}
                        placeholder="Ex: Bastos, Melen, Biyem-Assi..." className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors" />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">🚚 Le livreur utilisera cette info pour vous retrouver</p>
            </div>
        </div>
    );
}

function StepCallAndConfirm({ orderForm, product, totalPrice, formatPrice, onFormChange }: { orderForm: OrderForm; product: Product; totalPrice: number; formatPrice: (n: number) => string; onFormChange: (f: OrderForm) => void }) {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <p className="text-sm font-bold text-shopici-black mb-3">Quand peut-on vous appeler ?</p>
                <CallTimeSelector value={orderForm.callTime} onChange={(val) => onFormChange({ ...orderForm, callTime: val })} />
            </div>
            {/* Mini recap before confirm */}
            <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                {[
                    { label: "Produit", value: product.name },
                    { label: "Nom", value: orderForm.name },
                    { label: "Téléphone", value: orderForm.phone },
                    { label: "Adresse", value: `${orderForm.quartier}, ${orderForm.deliveryZone}` },
                    { label: "À payer", value: `${formatPrice(totalPrice)} XAF` },
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-3 px-4 py-2.5">
                        <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
                        <span className="text-xs font-semibold text-shopici-black text-right line-clamp-1">{value}</span>
                    </div>
                ))}
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 font-medium leading-relaxed">
                    En confirmant, vous vous engagez à être disponible et à payer à la livraison.
                </p>
            </div>
        </div>
    );
}

function getHour() { return new Date().getHours(); }
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
        ...(h >= 8 && h < 20 ? [{ value: "now", emoji: "📲", label: "MAINTENANT", sub: "On vous appelle dans les minutes qui suivent", highlight: true }] : []),
        { value: "morning", emoji: "🌅", label: "MATIN", sub: h >= 12 ? "Demain 8h–12h" : "Aujourd'hui 8h–12h", tomorrow: h >= 12 },
        { value: "afternoon", emoji: "☀️", label: "APRÈS-MIDI", sub: h >= 17 ? "Demain 12h–17h" : "Aujourd'hui 12h–17h", tomorrow: h >= 17 },
        { value: "evening", emoji: "🌙", label: "SOIR", sub: h >= 20 ? "Demain 17h–20h" : "Aujourd'hui 17h–20h", tomorrow: h >= 20 },
    ];
    return (
        <div className="space-y-2">
            {slots.map((slot) => {
                const sel = value === slot.value;
                return (
                    <button key={slot.value} type="button" onClick={() => onChange(slot.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center gap-3 ${sel ? slot.highlight ? "bg-green-500 border-green-500 text-white shadow-md" : "bg-shopici-blue border-shopici-blue text-white shadow-md" : "bg-white border-gray-200 text-shopici-black hover:border-shopici-blue"}`}>
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
function Spinner() {
    return <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>;
}
function SuccessScreen({ orderForm, product, totalPrice, formatPrice, onClose }: any) {
    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: "92vh" }}>
                    <div className="flex-shrink-0 flex justify-end px-5 pt-5">
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-200"><CheckCircle className="w-11 h-11 text-white" /></div>
                            <h3 className="text-2xl font-bold text-shopici-black">Commande confirmée 🎉</h3>
                            <p className="text-sm text-gray-500 mt-1">Merci <span className="font-bold text-shopici-black">{orderForm.name}</span>, on s'occupe de tout !</p>
                        </div>
                        <div className="bg-shopici-black rounded-2xl p-4 mb-5 text-white flex justify-between items-center gap-2">
                            <div className="min-w-0"><p className="text-xs text-white/50 mb-0.5">Votre commande</p><p className="font-semibold text-sm line-clamp-1">{product.name}</p></div>
                            <div className="text-right flex-shrink-0"><p className="text-xs text-white/50 mb-0.5">À payer</p><p className="text-xl font-bold text-shopici-coral">{formatPrice(totalPrice)} XAF</p></div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ce qui se passe maintenant</p>
                        <div className="space-y-2.5 mb-5">
                            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4"><div className="w-9 h-9 bg-shopici-blue rounded-full flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-white" /></div><div className="min-w-0"><p className="text-sm font-bold text-shopici-black">Appel de confirmation</p><p className="text-xs text-gray-500 mt-0.5">On vous appelle au <span className="font-bold text-shopici-black">{orderForm.phone}</span> — <span className="font-semibold text-shopici-blue">{getCallTimeLabel(orderForm.callTime)}</span></p></div></div>
                            <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4"><div className="w-9 h-9 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0"><Banknote className="w-4 h-4 text-white" /></div><div className="min-w-0"><p className="text-sm font-bold text-shopici-black">Préparez l'argent</p><p className="text-xs text-gray-500 mt-0.5">Ayez <span className="font-bold text-shopici-coral">{formatPrice(totalPrice)} XAF</span> en espèces prêt</p></div></div>
                            <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4"><div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-white" /></div><div className="min-w-0"><p className="text-sm font-bold text-shopici-black">Restez disponible</p><p className="text-xs text-gray-500 mt-0.5">À <span className="font-bold text-shopici-black">{orderForm.quartier}, {orderForm.deliveryZone}</span></p></div></div>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-2.5 mb-5"><AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /><p className="text-xs text-red-600 font-medium leading-relaxed">Si vous ne répondez pas à notre appel, la commande sera automatiquement annulée.</p></div>
                        <button onClick={onClose} className="w-full py-4 bg-shopici-black hover:brightness-110 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"><CheckCircle className="w-5 h-5" /> Compris, j'attends l'appel !</button>
                    </div>
                </div>
            </div>
        </>
    );
}