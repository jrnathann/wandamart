"use client"

import { useEffect, useState } from "react";
import { Minus, Package, Plus, ShoppingCart, Smartphone, Trash2, X } from "lucide-react";
import { addOrder } from "@/helper/order";
import { useCart } from "@/context/CartContext";
import { useConfig } from "@/context/ConfigContext";
import { CustomerInfo } from "@/types/OrderTracking";
import { CartOrderForm, EMPTY_FORM, SCROLLBAR_CSS, formatPrice } from "@/types/Ui";
import { CartCheckoutModal } from "./CartDrawerUI/CartCheckoutModal";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2];
}

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const storeConfig = useConfig();

  const [paymentMode, setPaymentMode] = useState<"cod" | "online" | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState<CartOrderForm>(EMPTY_FORM);
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [snapshotCart, setSnapshotCart] = useState<typeof cart>([]);
  const [snapshotTotal, setSnapshotTotal] = useState(0);

  // Sync body scroll with drawer state
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Analytics Tracking
  useEffect(() => {
    if (paymentMode && cart.length > 0) {
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("trackCustom", "FormView", {
          content_type: "cart",
          num_items: cart.length,
          value: totalPrice,
          currency: "XAF",
          payment_mode: paymentMode,
        });
      }
    }
  }, [paymentMode, cart, totalPrice]);

  const handleCloseModal = () => {
    setPaymentMode(null);
    setOrderSubmitted(false);
    setOrderForm(EMPTY_FORM);
    setFailedOrderId(null);
    setPaymentError(null);
    if (orderSubmitted) onClose();
  };

  const handleFormChange = (form: CartOrderForm) => {
    if (paymentError && form.phone !== orderForm.phone) setPaymentError(null);
    setOrderForm(form);
  };

  const handleCodSubmit = async (normalizedPhone: string) => {
    setSnapshotCart([...cart]);
    setSnapshotTotal(totalPrice);
    setSubmitting(true);
    const customer: CustomerInfo = {
      name: orderForm.name,
      phone: normalizedPhone,
      hasWhatsApp: orderForm.hasWhatsApp,
      deliveryZone: `${orderForm.quartier}, ${orderForm.deliveryZone}`,
      callTime: orderForm.callTime as "now" | "morning" | "afternoon" | "evening",
    };
    const items = cart.map((item) => ({ product: item, quantity: item.quantity }));
    try {
      const newOrder = await addOrder(items, customer, {
        _fbp: getCookie("_fbp"),
        _fbc: getCookie("_fbc"),
        _ua: navigator.userAgent,
      });
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_type: "cart",
          value: totalPrice,
          currency: "XAF",
          order_id: newOrder.id,
          num_items: items.length,
          products: items.map((i) => ({ id: i.product._id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
        });
      }
      setOrderSubmitted(true);
      clearCart();
    } catch (error) {
      console.error("COD cart order error:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnlineSubmit = async (normalizedPhone: string) => {
    setSnapshotCart([...cart]);
    setSnapshotTotal(totalPrice);
    setSubmitting(true);
    setPaymentError(null);
    try {
      const customer: CustomerInfo = {
        name: orderForm.name,
        phone: normalizedPhone,
        hasWhatsApp: orderForm.hasWhatsApp,
        deliveryZone: `${orderForm.quartier}, ${orderForm.deliveryZone}`,
        callTime: orderForm.callTime as "now" | "morning" | "afternoon" | "evening",
      };
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item._id, quantity: item.quantity, price: item.price })),
          customer,
          _fbp: getCookie("_fbp"),
          _fbc: getCookie("_fbc"),
          _ua: navigator.userAgent,
          existingOrderId: failedOrderId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.orderId) setFailedOrderId(data.orderId);
        setPaymentError((data.detail as string | undefined) ?? (data.error as string | undefined) ?? "Erreur lors du paiement");
        setSubmitting(false);
        return;
      }
      setFailedOrderId(null);
      setPaymentError(null);
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "InitiateCheckout", {
          content_type: "cart",
          value: totalPrice,
          currency: "XAF",
          num_items: cart.length,
          payment_type: "mobile_money",
        });
      }
      clearCart();
      window.location.href = `/order/${data.orderId}?payment=success`;
    } catch (error: any) {
      console.error("Online cart payment error:", error);
      setPaymentError(error.message ?? "Une erreur s'est produite. Veuillez réessayer.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>

      {/* Overlay with subtle blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer panel with Brand Background */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[var(--shopici-background)] shadow-2xl z-[70] transform transition-transform duration-500 cubic-bezier(0.32,0,0.07,1) ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-shopici-gray/10 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-shopici-coral/5 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-shopici-coral" />
              </div>
              <div>
                <h2 className="text-xl font-black text-shopici-black tracking-tight uppercase">Mon Panier</h2>
                <p className="text-[10px] font-bold text-shopici-blue uppercase tracking-widest">{totalItems} article{totalItems > 1 ? "s" : ""}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-shopici-gray/10 flex items-center justify-center transition-all active:scale-90">
              <X className="w-6 h-6 text-shopici-black" />
            </button>
          </div>

          {/* Cart items list with custom scrollbar */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 shopici-scroll">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 bg-shopici-gray/5 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-shopici-gray/30" />
                </div>
                <h3 className="text-lg font-bold text-shopici-black uppercase tracking-tighter">Votre panier est vide</h3>
                <button onClick={onClose} className="px-8 py-4 bg-shopici-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-shopici-blue transition-all">
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={item._id}
                    className="bg-white border border-shopici-gray/10 p-4 group hover:border-shopici-blue/30 transition-all duration-300"
                    style={{ animation: `slideIn 0.4s ease-out ${index * 0.05}s backwards` }}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-shopici-gray/5 flex-shrink-0 relative overflow-hidden">
                        {item.images?.[0]?.url ? (
                          <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-shopici-gray/20" /></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-shopici-black uppercase tracking-tight line-clamp-1">{item.name}</h3>
                          <p className="text-xs font-bold text-shopici-blue mt-1">{formatPrice(item.price)} XAF</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-shopici-gray/20">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-shopici-gray/5 transition-colors">
                              <Minus className="w-3 h-3 text-shopici-black" />
                            </button>
                            <span className="w-10 text-center text-xs font-black text-shopici-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-shopici-gray/5 transition-colors">
                              <Plus className="w-3 h-3 text-shopici-black" />
                            </button>
                          </div>
                          
                          <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with sticky action buttons */}
          {cart.length > 0 && (
            <div className="bg-white border-t border-shopici-gray/10 p-6 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-shopici-gray uppercase tracking-[0.2em]">Total Panier</span>
                <span className="text-3xl font-black text-shopici-black tracking-tighter">{formatPrice(totalPrice)} <span className="text-sm">XAF</span></span>
              </div>

              <div className="space-y-3 pt-2">
                {/* Main Action: COD */}
                <button onClick={() => setPaymentMode("cod")} className="relative w-full py-5 bg-shopici-coral text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-shopici-coral/20 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    Payer à la livraison
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                </button>

                {/* Secondary Action: Mobile Money */}
                {storeConfig?.features.mobileMoneyPayment && (
                  <button onClick={() => setPaymentMode("online")} className="w-full py-5 border-2 border-shopici-blue text-shopici-blue font-black text-[11px] uppercase tracking-[0.2em] hover:bg-shopici-blue hover:text-white transition-all flex items-center justify-center gap-3">
                    <Smartphone className="w-4 h-4" />
                    Payer par Mobile Money
                  </button>
                )}
                
                <button onClick={onClose} className="w-full text-center text-[10px] font-bold text-shopici-gray hover:text-shopici-black uppercase tracking-widest pt-2 transition-colors">
                  Continuer mes achats
                </button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(15px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* Checkout Modal Overlay */}
      {paymentMode !== null && (
        <CartCheckoutModal
          totalPrice={orderSubmitted ? snapshotTotal : totalPrice}
          cart={orderSubmitted ? snapshotCart : cart}
          orderForm={orderForm}
          orderSubmitted={orderSubmitted}
          submitting={submitting}
          paymentMode={paymentMode}
          paymentError={paymentError}
          onClose={handleCloseModal}
          onFormChange={handleFormChange}
          onSubmit={paymentMode === "cod" ? handleCodSubmit : handleOnlineSubmit}
          onRetry={handleOnlineSubmit}
        />
      )}
    </>
  );
}