/**
 * CartDrawerUI/CartCheckoutModal.tsx
 *
 * Full parity with OrderModal:
 *   "cod"    → 4-step flow with cash gate (Step 1)
 *   "online" → Step 1 skipped, starts at Step 2, calls /api/payment/create-order
 *
 * PaymentFailedScreen shown when paymentError is set.
 * Phone normalized to 237XXXXXXXXX synchronously before onSubmit/onRetry.
 */
"use client";
import { useState } from "react";
import {
  AlertCircle, ChevronLeft, Lock, Shield, Smartphone, X,
} from "lucide-react";
import { CartOrderForm, STEPS, stepLabel, formatPrice } from "@/types/Ui";
import { Spinner } from "./ui";
import { StepCash, StepContact, StepLocation, StepCallAndConfirm } from "./CheckoutSteps";
import { CartSuccessScreen } from "./CartSuccessScreen";

// ── Cameroon phone helpers ────────────────────────────────────────────────────

function parseCMPhone(raw: string): string | null {
  const digits = raw.replace(/\s+/g, "").replace(/[^0-9]/g, "");
  if (digits.startsWith("237") && digits.length === 12 && digits[3] === "6") return digits.slice(3);
  if (digits.length === 9 && digits.startsWith("6")) return digits;
  return null;
}

function toFullCMPhone(local9: string): string { return "237" + local9; }

function normalizePhone(raw: string): string {
  const local9 = parseCMPhone(raw);
  return local9 ? toFullCMPhone(local9) : raw;
}

// ─────────────────────────────────────────────────────────────────────────────

const SCROLLBAR_CSS = `
  .shopici-scroll::-webkit-scrollbar { width: 4px; }
  .shopici-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 999px; }
  .shopici-scroll::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 999px; }
  .shopici-scroll { scrollbar-width: thin; scrollbar-color: #FF6B35 #f3f4f6; }
`;

export function CartCheckoutModal({
  totalPrice,
  cart,
  orderForm,
  orderSubmitted,
  submitting,
  paymentMode,
  paymentError,
  onClose,
  onFormChange,
  onSubmit,
  onRetry,
}: {
  totalPrice:     number;
  cart:           any[];
  orderForm:      CartOrderForm;
  orderSubmitted: boolean;
  submitting:     boolean;
  paymentMode:    "cod" | "online";
  paymentError:   string | null;
  onClose:        () => void;
  onFormChange:   (f: CartOrderForm) => void;
  onSubmit:       (normalizedPhone: string) => void;
  onRetry:        (normalizedPhone: string) => void;
}) {
  // "cod" → steps [1,2,3,4]; "online" → steps [2,3,4]
  const steps = paymentMode === "cod" ? [1, 2, 3, 4] : [2, 3, 4];
  const TOTAL = steps.length;
  const [idx, setIdx] = useState(0);

  const step    = steps[idx];
  const display = idx + 1;
  const canBack = idx > 0;
  const isLast  = idx === TOTAL - 1;

  const local9 = parseCMPhone(orderForm.phone);

  const stepValid: Record<number, boolean> = {
    1: orderForm.hasCash === true,
    2: orderForm.name.trim() !== "" && local9 !== null && orderForm.phoneConfirmed,
    3: orderForm.deliveryZone !== "" && orderForm.quartier.trim() !== "",
    4: orderForm.callTime !== "",
  };

  const handleSubmit = () => onSubmit(normalizePhone(orderForm.phone));

  // ── Payment failed screen ─────────────────────────────────────────────────
  if (paymentError) {
    return (
      <PaymentFailedScreen
        error={paymentError}
        phone={orderForm.phone}
        totalPrice={totalPrice}
        submitting={submitting}
        onRetry={onRetry}
        onEditPhone={() => {
          // Jump back to step 2 (contact) and clear phone so user re-enters
          const contactIdx = steps.indexOf(2);
          if (contactIdx !== -1) setIdx(contactIdx);
          onFormChange({ ...orderForm, phone: "", phoneConfirmed: false });
        }}
        onClose={onClose}
      />
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (orderSubmitted) {
    return (
      <CartSuccessScreen
        orderForm={orderForm}
        cart={cart}
        totalPrice={totalPrice}
        onClose={onClose}
      />
    );
  }

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-4">
        <div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: "92vh" }}
        >
          {/* Header + dot progress */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {canBack && (
                  <button
                    onClick={() => setIdx(i => i - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <p className="text-xs font-semibold text-gray-400">{stepLabel(step)}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Dot progress */}
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-300 ${
                  i + 1 === display  ? "w-6 h-2.5 bg-shopici-coral"
                  : i + 1 < display ? "w-2.5 h-2.5 bg-shopici-coral/40"
                  :                   "w-2.5 h-2.5 bg-gray-200"
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
            {step === 1 && (
              <StepCash
                totalPrice={totalPrice}
                hasCash={orderForm.hasCash}
                onChange={(v) => onFormChange({ ...orderForm, hasCash: v })}
                onClose={onClose}
              />
            )}
            {step === 2 && (
              <StepContact
                orderForm={orderForm}
                onFormChange={onFormChange}
                paymentMode={paymentMode}
              />
            )}
            {step === 3 && (
              <StepLocation orderForm={orderForm} onFormChange={onFormChange} />
            )}
            {step === 4 && (
              <StepCallAndConfirm
                orderForm={orderForm}
                cart={cart}
                totalPrice={totalPrice}
                onFormChange={onFormChange}
                paymentMode={paymentMode}
                normalizedPhone={normalizePhone(orderForm.phone)}
              />
            )}
          </div>

          {/* Footer CTA */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 space-y-3">
            {!isLast ? (
              <button
                onClick={() => setIdx(i => i + 1)}
                disabled={!stepValid[step]}
                className={`w-full py-4 text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  !stepValid[step]
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

function PaymentFailedScreen({
  error, phone, totalPrice, submitting, onRetry, onEditPhone, onClose,
}: {
  error: string; phone: string; totalPrice: number;
  submitting: boolean;
  onRetry: (normalizedPhone: string) => void;
  onEditPhone: () => void;
  onClose: () => void;
}) {
  const normalizedPhone = normalizePhone(phone);

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl">

          <div className="flex justify-end px-5 pt-5 pb-2">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="px-5 pb-5 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-shopici-black mb-2">Paiement échoué</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{error}</p>
          </div>

          <div className="mx-5 mb-4 bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium leading-relaxed">
              Votre commande est conservée — aucun doublon ne sera créé si vous réessayez.
            </p>
          </div>

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
              {submitting ? <><Spinner /> Envoi en cours...</> : <><Smartphone className="w-4 h-4" /> Réessayer le paiement</>}
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