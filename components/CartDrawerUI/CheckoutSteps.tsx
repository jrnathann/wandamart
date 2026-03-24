"use client";
import {
  AlertCircle, CheckCircle, MapPin, MessageCircle, Phone, Smartphone,
} from "lucide-react";
import { CartOrderForm, formatPrice } from "@/types/Ui";

// ── Cameroon phone helpers ────────────────────────────────────────────────────

function parseCMPhone(raw: string): string | null {
  const digits = raw.replace(/\s+/g, "").replace(/[^0-9]/g, "");
  if (digits.startsWith("237") && digits.length === 12 && digits[3] === "6") return digits.slice(3);
  if (digits.length === 9 && digits.startsWith("6")) return digits;
  return null;
}

function detectOperator(local9: string): "orange" | "mtn" | null {
  const prefix = parseInt(local9.slice(0, 3), 10);
  const orangePrefixes = [655,656,657,658,659,690,691,692,693,694,695,696,697,698,699];
  const mtnPrefixes    = [650,651,652,653,654,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684];
  if (orangePrefixes.includes(prefix)) return "orange";
  if (mtnPrefixes.includes(prefix))    return "mtn";
  return null;
}

// ── Step 1: Cash gate ─────────────────────────────────────────────────────────

export function StepCash({
  totalPrice, hasCash, onChange, onClose,
}: {
  totalPrice: number; hasCash: boolean | null;
  onChange: (v: boolean) => void; onClose: () => void;
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
            hasCash === true
              ? "bg-green-500 border-green-500 text-white shadow-lg"
              : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
          }`}>
          <CheckCircle className="w-5 h-5" /> OUI, j'ai l'argent prêt
        </button>
        <button type="button" onClick={() => onChange(false)}
          className={`w-full py-4 rounded-2xl border-2 font-bold text-base transition-all ${
            hasCash === false
              ? "bg-red-400 border-red-400 text-white shadow-lg"
              : "bg-white border-gray-200 text-shopici-black hover:border-red-300"
          }`}>
          NON, pas encore
        </button>
      </div>

      {hasCash === false && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
          <p className="text-sm text-red-700 font-medium">Revenez quand vous êtes prêt(e) — on sera toujours là !</p>
          <button onClick={onClose} className="text-xs font-bold text-red-500 underline">
            Fermer et revenir plus tard
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Contact ───────────────────────────────────────────────────────────

export function StepContact({
  orderForm, onFormChange, paymentMode,
}: {
  orderForm: CartOrderForm;
  onFormChange: (f: CartOrderForm) => void;
  paymentMode: "cod" | "online";
}) {
  const local9   = parseCMPhone(orderForm.phone);
  const operator = local9 ? detectOperator(local9) : null;
  const isValid  = local9 !== null;
  const isDirty  = orderForm.phone.trim() !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-bold text-shopici-black mb-2">Votre nom complet</label>
        <input
          type="text"
          value={orderForm.name}
          onChange={(e) => onFormChange({ ...orderForm, name: e.target.value })}
          placeholder="Ex: Jean Dupont"
          className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl
            focus:outline-none focus:border-shopici-blue bg-white text-shopici-black
            placeholder:text-gray-300 transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-bold text-shopici-black mb-2">
          {paymentMode === "online"
            ? "Votre numéro Mobile Money (Orange / MTN)"
            : "Votre numéro de téléphone"}
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
            onChange={(e) => onFormChange({ ...orderForm, phone: e.target.value, phoneConfirmed: false })}
            placeholder="Ex: 677 123 456"
            style={{ paddingLeft: operator ? "3.25rem" : undefined }}
            className={`w-full py-3.5 text-base border-2 rounded-xl focus:outline-none bg-white
              text-shopici-black placeholder:text-gray-300 transition-colors pr-10
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
                : <AlertCircle className="w-5 h-5 text-red-400" />}
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
            🟡 {paymentMode === "online" ? "Numéro MTN MoMo détecté" : "Numéro MTN détecté(paiement à la livraison)"}
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
              Je confirme que{" "}
              <span className="text-shopici-coral font-bold">{orderForm.phone || "mon numéro"}</span>{" "}
              est correct
            </span>
          </label>
        )}
      </div>

      {/* WhatsApp */}
      <div>
        <label className="block text-sm font-bold text-shopici-black mb-2">
          Ce numéro est sur WhatsApp ?
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => onFormChange({ ...orderForm, hasWhatsApp: true })}
            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
              orderForm.hasWhatsApp
                ? "bg-green-500 border-green-500 text-white shadow-md"
                : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
            }`}>
            <MessageCircle className="w-5 h-5" /> OUI WhatsApp
          </button>
          <button type="button" onClick={() => onFormChange({ ...orderForm, hasWhatsApp: false })}
            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
              !orderForm.hasWhatsApp && orderForm.phone !== ""
                ? "bg-gray-500 border-gray-500 text-white shadow-md"
                : "bg-white border-gray-200 text-shopici-black hover:border-gray-400"
            }`}>
            <Phone className="w-5 h-5" /> Appel seulement
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Location ──────────────────────────────────────────────────────────

export function StepLocation({
  orderForm, onFormChange,
}: {
  orderForm: CartOrderForm; onFormChange: (f: CartOrderForm) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold text-shopici-black mb-2">Votre ville</label>
        <select
          value={orderForm.deliveryZone}
          onChange={(e) => onFormChange({ ...orderForm, deliveryZone: e.target.value })}
          className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl
            focus:outline-none focus:border-shopici-blue bg-white text-shopici-black
            transition-colors appearance-none"
        >
          <option value="">— Choisissez votre ville —</option>
          <option>Yaoundé</option>
          <option>Douala</option>
          <option>Bafoussam</option>
          <option>Garoua</option>
          <option>Maroua</option>
          <option>Bamenda</option>
          <option>Ngaoundéré</option>
          <option>Bertoua</option>
          <option>Buea</option>
          <option>Limbe</option>
          <option value="Autre">Autre ville</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-shopici-black mb-2">Votre quartier exact</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-shopici-blue pointer-events-none" />
          <input
            type="text"
            value={orderForm.quartier}
            onChange={(e) => onFormChange({ ...orderForm, quartier: e.target.value })}
            placeholder="Ex: Bastos, Melen, Biyem-Assi..."
            className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl
              focus:outline-none focus:border-shopici-blue bg-white text-shopici-black
              placeholder:text-gray-300 transition-colors"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">🚚 Le livreur utilisera cette info pour vous retrouver</p>
      </div>
    </div>
  );
}

// ── Step 4: Call time + recap ─────────────────────────────────────────────────

export function StepCallAndConfirm({
  orderForm, cart, totalPrice, onFormChange, paymentMode, normalizedPhone,
}: {
  orderForm: CartOrderForm;
  cart: any[];
  totalPrice: number;
  onFormChange: (f: CartOrderForm) => void;
  paymentMode: "cod" | "online";
  normalizedPhone: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-bold text-shopici-black mb-3">Quand peut-on vous appeler ?</p>
        <CallTimeSelector
          value={orderForm.callTime}
          onChange={(val) => onFormChange({ ...orderForm, callTime: val })}
        />
      </div>

      {/* Order recap */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden">
        {/* Cart items */}
        {cart.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 mb-2 font-medium">Articles commandés</p>
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center py-1">
                <span className="text-xs text-shopici-black font-medium line-clamp-1 flex-1 mr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-xs font-semibold text-shopici-black flex-shrink-0 tabular-nums">
                  {formatPrice(item.price * item.quantity)} XAF
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Customer summary */}
        <div className="divide-y divide-gray-100">
          {[
            { label: "Nom",       value: orderForm.name },
            { label: "Téléphone", value: normalizedPhone },
            { label: "Adresse",   value: `${orderForm.quartier}, ${orderForm.deliveryZone}` },
            { label: "À payer",   value: `${formatPrice(totalPrice)} XAF` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-3 px-4 py-2.5">
              <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
              <span className="text-xs font-semibold text-shopici-black text-right line-clamp-1">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode-aware notice */}
      {paymentMode === "online" ? (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Une invite USSD sera envoyée au <span className="font-bold">{normalizedPhone}</span>. Approuvez-la pour finaliser le paiement de{" "}
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
              sel
                ? slot.highlight
                  ? "bg-green-500 border-green-500 text-white shadow-md"
                  : "bg-shopici-blue border-shopici-blue text-white shadow-md"
                : "bg-white border-gray-200 text-shopici-black hover:border-shopici-blue"
            }`}>
            <span className="text-lg flex-shrink-0">{slot.emoji}</span>
            <span className="flex-1 text-left min-w-0">
              <span className="block text-sm leading-tight">{slot.label}</span>
              <span className={`block text-xs font-normal mt-0.5 ${sel ? "text-white/75" : "text-gray-400"}`}>
                {slot.sub}
              </span>
            </span>
            {slot.tomorrow && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                sel ? "bg-white/20 text-white" : "bg-orange-100 text-orange-500"
              }`}>demain</span>
            )}
            {slot.highlight && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                sel ? "bg-white/20 text-white" : "bg-green-100 text-green-600"
              }`}>dispo</span>
            )}
          </button>
        );
      })}
    </div>
  );
}