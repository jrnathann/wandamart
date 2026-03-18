import { AlertCircle, CheckCircle, MapPin, MessageCircle, Phone } from "lucide-react";
import { CartOrderForm, formatPrice } from "@/types/Ui";
import { CallTimeSelector } from "./ui";

// ─── Step 1: Cash gate ────────────────────────────────────────────────────────

export function StepCash({
  totalPrice,
  hasCash,
  onChange,
  onClose,
}: {
  totalPrice: number;
  hasCash: boolean | null;
  onChange: (v: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-shopici-black rounded-2xl p-6 text-center text-white">
        <p className="text-xs text-white/50 mb-2">Montant à payer à la livraison</p>
        <p className="text-5xl font-bold text-shopici-coral leading-none">{formatPrice(totalPrice)}</p>
        <p className="text-sm text-white/60 mt-2">XAF en espèces</p>
      </div>

      <p className="text-base font-bold text-shopici-black text-center">
        Avez-vous déjà{" "}
        <span className="text-shopici-coral">{formatPrice(totalPrice)} XAF</span>{" "}
        pour payer le livreur ?
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`w-full py-4 rounded-2xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2 ${
            hasCash === true
              ? "bg-green-500 border-green-500 text-white shadow-lg"
              : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
          }`}
        >
          <CheckCircle className="w-5 h-5" /> OUI, j'ai l'argent prêt
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`w-full py-4 rounded-2xl border-2 font-bold text-base transition-all ${
            hasCash === false
              ? "bg-red-400 border-red-400 text-white shadow-lg"
              : "bg-white border-gray-200 text-shopici-black hover:border-red-300"
          }`}
        >
          NON, pas encore
        </button>
      </div>

      {hasCash === false && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
          <p className="text-sm text-red-700 font-medium">
            Revenez quand vous êtes prêt(e) — on sera toujours là !
          </p>
          <button onClick={onClose} className="text-xs font-bold text-red-500 underline">
            Fermer et revenir plus tard
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Contact ──────────────────────────────────────────────────────────

export function StepContact({
  orderForm,
  onFormChange,
}: {
  orderForm: CartOrderForm;
  onFormChange: (f: CartOrderForm) => void;
}) {
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
        <label className="block text-sm font-bold text-shopici-black mb-2">Votre numéro de téléphone</label>
        <input
          type="tel"
          value={orderForm.phone}
          onChange={(e) => onFormChange({ ...orderForm, phone: e.target.value, phoneConfirmed: false })}
          placeholder="Ex: 677 123 456"
          className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors"
        />
        <label
          className={`mt-2 flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${
            orderForm.phoneConfirmed ? "border-green-400 bg-green-50" : "border-orange-200 bg-orange-50"
          }`}
        >
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
      </div>

      <div>
        <label className="block text-sm font-bold text-shopici-black mb-2">Ce numéro est sur WhatsApp ?</label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onFormChange({ ...orderForm, hasWhatsApp: true })}
            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
              orderForm.hasWhatsApp
                ? "bg-green-500 border-green-500 text-white shadow-md"
                : "bg-white border-gray-200 text-shopici-black hover:border-green-400"
            }`}
          >
            <MessageCircle className="w-5 h-5" /> OUI WhatsApp
          </button>
          <button
            type="button"
            onClick={() => onFormChange({ ...orderForm, hasWhatsApp: false })}
            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
              !orderForm.hasWhatsApp && orderForm.phone !== ""
                ? "bg-gray-500 border-gray-500 text-white shadow-md"
                : "bg-white border-gray-200 text-shopici-black hover:border-gray-400"
            }`}
          >
            <Phone className="w-5 h-5" /> Appel seulement
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Location ─────────────────────────────────────────────────────────

export function StepLocation({
  orderForm,
  onFormChange,
}: {
  orderForm: CartOrderForm;
  onFormChange: (f: CartOrderForm) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold text-shopici-black mb-2">Votre ville</label>
        <select
          value={orderForm.deliveryZone}
          onChange={(e) => onFormChange({ ...orderForm, deliveryZone: e.target.value })}
          className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black transition-colors appearance-none"
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
            className="w-full pl-10 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black placeholder:text-gray-300 transition-colors"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">🚚 Le livreur utilisera cette info pour vous retrouver</p>
      </div>
    </div>
  );
}

// ─── Step 4: Call time + cart recap ──────────────────────────────────────────

export function StepCallAndConfirm({
  orderForm,
  cart,
  totalPrice,
  onFormChange,
}: {
  orderForm: CartOrderForm;
  cart: any[];
  totalPrice: number;
  onFormChange: (f: CartOrderForm) => void;
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

      {/* Cart + customer recap */}
      <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
        {cart.map((item) => (
          <div key={item._id} className="flex justify-between items-center gap-3 px-4 py-2.5">
            <span className="text-xs text-gray-500 flex-1 line-clamp-1">
              {item.name} <span className="text-gray-400">×{item.quantity}</span>
            </span>
            <span className="text-xs font-semibold text-shopici-black flex-shrink-0">
              {formatPrice(item.price * item.quantity)} XAF
            </span>
          </div>
        ))}
        {[
          { label: "Nom",      value: orderForm.name },
          { label: "Téléphone", value: orderForm.phone },
          { label: "Adresse",  value: `${orderForm.quartier}, ${orderForm.deliveryZone}` },
          { label: "À payer",  value: `${formatPrice(totalPrice)} XAF` },
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