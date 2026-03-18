import { useState } from "react";
import { ChevronLeft, Lock, Shield, X } from "lucide-react";
import { CartOrderForm, STEPS, stepLabel } from "@/types/Ui";
import { Spinner } from "./ui";
import { StepCash, StepContact, StepLocation, StepCallAndConfirm } from "./CheckoutSteps";
import { CartSuccessScreen } from "./CartSuccessScreen";

export function CartCheckoutModal({
  totalPrice,
  cart,
  orderForm,
  orderSubmitted,
  submitting,
  onClose,
  onFormChange,
  onSubmit,
}: {
  totalPrice: number;
  cart: any[];
  orderForm: CartOrderForm;
  orderSubmitted: boolean;
  submitting: boolean;
  onClose: () => void;
  onFormChange: (f: CartOrderForm) => void;
  onSubmit: () => void;
}) {
  const [step, setStep] = useState(1);

  const stepValid: Record<number, boolean> = {
    1: orderForm.hasCash === true,
    2: orderForm.name.trim() !== "" && orderForm.phone.trim() !== "" && orderForm.phoneConfirmed,
    3: orderForm.deliveryZone !== "" && orderForm.quartier.trim() !== "",
    4: orderForm.callTime !== "",
  };

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
                {step > 1 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
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

            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? "w-6 h-2.5 bg-shopici-coral"
                      : i + 1 < step
                      ? "w-2.5 h-2.5 bg-shopici-coral/40"
                      : "w-2.5 h-2.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>
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
              <StepContact orderForm={orderForm} onFormChange={onFormChange} />
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
              />
            )}
          </div>

          {/* Footer CTA */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 space-y-3">
            {step < STEPS ? (
              <button
                onClick={() => setStep((s) => s + 1)}
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
                onClick={onSubmit}
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
                  <><Spinner /> Envoi...</>
                ) : (
                  <><Lock className="w-4 h-4" /> JE CONFIRME MA COMMANDE</>
                )}
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