import { AlertCircle, Banknote, CheckCircle, MapPin, Phone, X } from "lucide-react";
import { CartOrderForm, formatPrice, getCallTimeLabel } from "@/types/Ui";

export function CartSuccessScreen({
  orderForm,
  cart,
  totalPrice,
  onClose,
}: {
  orderForm: CartOrderForm;
  cart: any[];
  totalPrice: number;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-4">
        <div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: "92vh" }}
        >
          {/* Close button */}
          <div className="flex-shrink-0 flex justify-end px-5 pt-5">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 shopici-scroll">
            {/* Hero */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-200">
                <CheckCircle className="w-11 h-11 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-shopici-black">Commande confirmée 🎉</h3>
              <p className="text-sm text-gray-500 mt-1">
                Merci <span className="font-bold text-shopici-black">{orderForm.name}</span>, on s'occupe de tout !
              </p>
            </div>

            {/* Order summary card */}
            <div className="bg-shopici-black rounded-2xl p-4 mb-5 text-white">
              <p className="text-xs text-white/50 mb-2">Votre commande</p>
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm py-1">
                  <span className="text-white/70 line-clamp-1 flex-1 mr-2">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="font-semibold text-white flex-shrink-0">
                    {formatPrice(item.price * item.quantity)} XAF
                  </span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-white/50">Total à payer</span>
                <span className="text-xl font-bold text-shopici-coral">{formatPrice(totalPrice)} XAF</span>
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
                  <p className="text-xs text-gray-500 mt-0.5">
                    On vous appelle au{" "}
                    <span className="font-bold text-shopici-black">{orderForm.phone}</span>{" "}
                    — <span className="font-semibold text-shopici-blue">{getCallTimeLabel(orderForm.callTime)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <div className="w-9 h-9 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-shopici-black">Préparez l'argent</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ayez <span className="font-bold text-shopici-coral">{formatPrice(totalPrice)} XAF</span> en espèces prêt
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4">
                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-shopici-black">Restez disponible</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    À{" "}
                    <span className="font-bold text-shopici-black">
                      {orderForm.quartier}, {orderForm.deliveryZone}
                    </span>
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

            <button
              onClick={onClose}
              className="w-full py-4 bg-shopici-black hover:brightness-110 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" /> Compris, j'attends l'appel !
            </button>
          </div>
        </div>
      </div>
    </>
  );
}