"use client"

import { useEffect, useState } from "react";
import { Minus, Package, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { addOrder } from "@/helper/order";
import { useCart } from "@/context/CartContext";
import { CustomerInfo } from "@/types/OrderTracking";
import { CartOrderForm, EMPTY_FORM, SCROLLBAR_CSS, formatPrice } from "@/types/Ui";
import { CartCheckoutModal } from "./CartDrawerUI/CartCheckoutModal";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSubmitted, setOrderSubmitted]       = useState(false);
  const [submitting, setSubmitting]               = useState(false);
  const [orderForm, setOrderForm]                 = useState<CartOrderForm>(EMPTY_FORM);

  // Snapshots captured at submit time so success screen isn't affected by clearCart()
  const [snapshotCart,  setSnapshotCart]  = useState<typeof cart>([]);
  const [snapshotTotal, setSnapshotTotal] = useState(0);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // FB pixel: form view
  useEffect(() => {
    if (showCheckoutModal && cart.length > 0) {
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("trackCustom", "FormView", {
          content_type: "cart",
          num_items: cart.length,
          value: totalPrice,
          currency: "XAF",
        });
      }
    }
  }, [showCheckoutModal, cart, totalPrice]);

  const handleOrderSubmit = async () => {
    // Snapshot before clearCart wipes the context
    setSnapshotCart([...cart]);
    setSnapshotTotal(totalPrice);
    setSubmitting(true);

    const customer: CustomerInfo = {
      name: orderForm.name,
      phone: orderForm.phone,
      hasWhatsApp: orderForm.hasWhatsApp,
      deliveryZone: `${orderForm.quartier}, ${orderForm.deliveryZone}`,
      callTime: orderForm.callTime as "now" | "morning" | "afternoon" | "evening",
    };
    const items = cart.map((item) => ({ product: item, quantity: item.quantity }));

    try {
      const newOrder = await addOrder(items, customer);

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_type: "cart",
          value: totalPrice,
          currency: "XAF",
          order_id: newOrder.id,
          num_items: items.length,
          products: items.map((i) => ({
            id: i.product._id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
        });
      }

      setOrderSubmitted(true);
      clearCart();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
    setOrderSubmitted(false);
    setOrderForm(EMPTY_FORM);
    if (orderSubmitted) onClose();
  };

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* ── Header ── */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-shopici-coral/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-shopici-coral" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-shopici-black">Mon Panier</h2>
                <p className="text-xs sm:text-sm text-shopici-charcoal">
                  {totalItems} article{totalItems > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-shopici-charcoal" />
            </button>
          </div>

          {/* ── Cart items ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 shopici-scroll">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-12 h-12 text-shopici-charcoal/40" />
                </div>
                <h3 className="text-lg font-semibold text-shopici-black mb-2">Votre panier est vide</h3>
                <p className="text-sm text-shopici-charcoal mb-6">
                  Ajoutez des produits pour commencer vos achats
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-shopici-black hover:bg-shopici-blue text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={item._id}
                    className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300"
                    style={{ animation: `slideIn 0.3s ease-out ${index * 0.1}s backwards` }}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-shopici-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-shopici-charcoal/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-shopici-black mb-1 line-clamp-1">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-shopici-charcoal mb-2">{formatPrice(item.price)} XAF</p>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white hover:bg-shopici-blue hover:text-white flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                            </button>
                            <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-semibold text-shopici-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white hover:bg-shopici-blue hover:text-white flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="ml-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-shopici-charcoal">Sous-total</span>
                      <span className="text-sm sm:text-base font-bold text-shopici-black">
                        {formatPrice(item.price * item.quantity)} XAF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-base sm:text-lg">
                <span className="font-semibold text-shopici-black">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-shopici-black">
                  {formatPrice(totalPrice)} XAF
                </span>
              </div>
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-3 sm:py-4 bg-shopici-coral hover:brightness-105 text-white text-base sm:text-lg font-bold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Commander ({totalItems})
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-shopici-black text-sm sm:text-base font-semibold rounded-lg transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>

      {/* 4-step checkout modal */}
      {showCheckoutModal && (
        <CartCheckoutModal
          totalPrice={orderSubmitted ? snapshotTotal : totalPrice}
          cart={orderSubmitted ? snapshotCart : cart}
          orderForm={orderForm}
          orderSubmitted={orderSubmitted}
          submitting={submitting}
          onClose={handleCloseCheckout}
          onFormChange={setOrderForm}
          onSubmit={handleOrderSubmit}
        />
      )}
    </>
  );
}