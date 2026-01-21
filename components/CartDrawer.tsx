"use client"

import { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingCart, Package, Shield, MessageCircle, Phone, CheckCircle } from "lucide-react";
import { addOrder } from "@/helper/order";
import { useCart } from "@/context/CartContext";
import { CustomerInfo } from "@/types/OrderTracking";

export default function CartDrawer({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    deliveryZone: "",
    callTime: "",
    hasWhatsApp: false
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
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
  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleOrderSubmit = async () => {
    if (!orderForm.name || !orderForm.phone || !orderForm.deliveryZone || !orderForm.callTime) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setSubmitting(true);
    const customer: CustomerInfo = {
      name: orderForm.name,
      phone: orderForm.phone,
      hasWhatsApp: orderForm.hasWhatsApp,
      deliveryZone: orderForm.deliveryZone,
      callTime: orderForm.callTime as "morning" | "afternoon" | "evening"
    };
    const items = cart.map(item => ({
      product: item,
      quantity: item.quantity,
    }));
    try {
      // Create order
      const newOrder = await addOrder(
        items,
        customer
      );
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_type: "cart",
          value: totalPrice,
          currency: "XAF",
          order_id: newOrder.id,
          num_items: items.length,
          products: items.map(i => ({
            id: i.product._id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
        });
      }
      // console.log("Order created successfully:", newOrder);

      // Store order ID to show to customer
      setCreatedOrderId(newOrder.id);
      setOrderSubmitted(true);
      setOrderSubmitted(true);
      clearCart();

      setTimeout(() => {
        setShowCheckoutModal(false);
        setOrderSubmitted(false);
        setOrderForm({ name: "", phone: "", deliveryZone: "", callTime: "", hasWhatsApp: false });
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setSubmitting(false); // stop animation / enable button
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-shopici-gray/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-shopici-coral/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-shopici-coral" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-shopici-black">Mon Panier</h2>
                <p className="text-xs sm:text-sm text-shopici-charcoal">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-shopici-gray/20 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-shopici-charcoal" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-shopici-gray/20 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-12 h-12 text-shopici-charcoal/40" />
                </div>
                <h3 className="text-lg font-semibold text-shopici-black mb-2">Votre panier est vide</h3>
                <p className="text-sm text-shopici-charcoal mb-6">Ajoutez des produits pour commencer vos achats</p>
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
                    className="bg-white border border-shopici-gray/30 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s backwards`
                    }}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-shopici-gray to-shopici-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-shopici-charcoal/40" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-shopici-black mb-1 line-clamp-1">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-shopici-charcoal mb-2">
                          {formatPrice(item.price)} XAF
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-shopici-gray/20 rounded-lg p-1">
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
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-black"/>
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

                    {/* Item Total */}
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-shopici-gray/30 flex justify-between items-center">
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

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-shopici-gray/30 p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-base sm:text-lg">
                <span className="font-semibold text-shopici-black">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-shopici-black">
                  {formatPrice(totalPrice)} XAF
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 sm:py-4 bg-shopici-coral hover:bg-shopici-coral/90 text-white text-base sm:text-lg font-bold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Commander ({totalItems})
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 bg-shopici-gray/20 hover:bg-shopici-gray/30 text-shopici-black text-sm sm:text-base font-semibold rounded-lg transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
            onClick={() => setShowCheckoutModal(false)}
          />

          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {!orderSubmitted ? (
                <div className="p-4 sm:p-6">
                  {/* Modal Header - Sticky on mobile */}
                  <div className="sticky top-0 bg-white z-10 pb-4 sm:pb-6 border-b sm:border-0 border-shopici-gray/20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl sm:text-2xl font-bold text-shopici-black">Finaliser la commande</h3>
                      <button
                        onClick={() => setShowCheckoutModal(false)}
                        className="w-9 h-9 sm:w-8 sm:h-8 rounded-full hover:bg-shopici-gray/20 flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <X className="w-6 h-6 sm:w-5 sm:h-5 text-shopici-charcoal" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-0">
                    {/* Order Summary */}
                    <div className="bg-shopici-gray/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="space-y-2 mb-3">
                        {cart.map((item) => (
                          <div key={item._id} className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-shopici-charcoal flex-1 line-clamp-1 mr-2">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="font-semibold text-shopici-black whitespace-nowrap">
                              {formatPrice(item.price * item.quantity)} XAF
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-shopici-gray/30">
                        <span className="text-base sm:text-lg font-bold text-shopici-black">Total:</span>
                        <span className="text-xl sm:text-2xl font-bold text-shopici-coral">
                          {formatPrice(totalPrice)} XAF
                        </span>
                      </div>
                    </div>

                    {/* Order Form */}
                    <div className="space-y-4 sm:space-y-5">
                      {/* Step 1: Name */}
                      <div>
                        <label className="block text-sm sm:text-base font-bold text-shopici-black mb-2 sm:mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-shopici-coral text-white rounded-full text-xs sm:text-sm font-bold flex-shrink-0">1</span>
                          <span className="text-sm sm:text-base">Votre nom</span>
                        </label>
                        <input
                          type="text"
                          value={orderForm.name}
                          onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                          placeholder="Exemple: Jean Dupont"
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 text-base sm:text-lg border-2 border-shopici-gray/30 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black"
                        />
                      </div>

                      {/* Step 2: Phone */}
                      <div>
                        <label className="block text-sm sm:text-base font-bold text-shopici-black mb-2 sm:mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-shopici-coral text-white rounded-full text-xs sm:text-sm font-bold flex-shrink-0">2</span>
                          <span className="text-sm sm:text-base">Votre numéro de téléphone</span>
                        </label>
                        <input
                          type="tel"
                          value={orderForm.phone}
                          onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                          placeholder="Exemple: 677 123 456"
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 text-base sm:text-lg border-2 border-shopici-gray/30 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black"
                        />
                      </div>

                      {/* Step 3: WhatsApp */}
                      <div>
                        <label className="block text-sm sm:text-base font-bold text-shopici-black mb-2 sm:mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-shopici-coral text-white rounded-full text-xs sm:text-sm font-bold flex-shrink-0">3</span>
                          <span className="text-sm sm:text-base">Êtes-vous sur WhatsApp?</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => setOrderForm({ ...orderForm, hasWhatsApp: true })}
                            className={`p-3 sm:p-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all ${orderForm.hasWhatsApp
                              ? 'bg-green-500 border-green-500 text-white shadow-lg scale-105'
                              : 'bg-white border-shopici-gray/30 text-shopici-black hover:border-green-500'
                              }`}
                          >
                            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                            OUI
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderForm({ ...orderForm, hasWhatsApp: false })}
                            className={`p-3 sm:p-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all ${!orderForm.hasWhatsApp && orderForm.phone !== ""
                              ? 'bg-gray-500 border-gray-500 text-white shadow-lg scale-105'
                              : 'bg-white border-shopici-gray/30 text-shopici-black hover:border-gray-500'
                              }`}
                          >
                            <Phone className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                            NON
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-shopici-charcoal mt-2 text-center">
                          Choisissez comment vous voulez qu'on vous contacte
                        </p>
                      </div>

                      {/* Step 4: City */}
                      <div>
                        <label className="block text-sm sm:text-base font-bold text-shopici-black mb-2 sm:mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-shopici-coral text-white rounded-full text-xs sm:text-sm font-bold flex-shrink-0">4</span>
                          <span className="text-sm sm:text-base">Votre ville</span>
                        </label>
                        <select
                          value={orderForm.deliveryZone}
                          onChange={(e) => setOrderForm({ ...orderForm, deliveryZone: e.target.value })}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 text-base sm:text-lg border-2 border-shopici-gray/30 rounded-xl focus:outline-none focus:border-shopici-blue bg-white text-shopici-black"
                        >
                          <option value="">-- Choisissez votre ville --</option>
                          <option value="yaounde">Yaoundé</option>
                          <option value="douala">Douala</option>
                          <option value="bafoussam">Bafoussam</option>
                          <option value="garoua">Garoua</option>
                          <option value="maroua">Maroua</option>
                          <option value="bamenda">Bamenda</option>
                          <option value="ngaoundere">Ngaoundéré</option>
                          <option value="bertoua">Bertoua</option>
                          <option value="buea">Buea</option>
                          <option value="limbe">Limbe</option>
                          <option value="other">Autre ville</option>
                        </select>
                      </div>

                      {/* Step 5: When to call */}
                      <div>
                        <label className="block text-sm sm:text-base font-bold text-shopici-black mb-2 sm:mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-shopici-coral text-white rounded-full text-xs sm:text-sm font-bold flex-shrink-0">5</span>
                          <span className="text-sm sm:text-base">Quand peut-on vous appeler?</span>
                        </label>
                        <div className="space-y-2 sm:space-y-3">
                          <button
                            type="button"
                            onClick={() => setOrderForm({ ...orderForm, callTime: 'morning' })}
                            className={`w-full p-3 sm:p-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all ${orderForm.callTime === 'morning'
                              ? 'bg-shopici-blue border-shopici-blue text-white shadow-lg'
                              : 'bg-white border-shopici-gray/30 text-shopici-black hover:border-shopici-blue'
                              }`}
                          >
                            🌅 MATIN (8h - 12h)
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderForm({ ...orderForm, callTime: 'afternoon' })}
                            className={`w-full p-3 sm:p-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all ${orderForm.callTime === 'afternoon'
                              ? 'bg-shopici-blue border-shopici-blue text-white shadow-lg'
                              : 'bg-white border-shopici-gray/30 text-shopici-black hover:border-shopici-blue'
                              }`}
                          >
                            ☀️ APRÈS-MIDI (12h - 17h)
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderForm({ ...orderForm, callTime: 'evening' })}
                            className={`w-full p-3 sm:p-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all ${orderForm.callTime === 'evening'
                              ? 'bg-shopici-blue border-shopici-blue text-white shadow-lg'
                              : 'bg-white border-shopici-gray/30 text-shopici-black hover:border-shopici-blue'
                              }`}
                          >
                            🌙 SOIR (17h - 20h)
                          </button>
                        </div>
                      </div>

                      {/* Submit Button - Sticky on mobile */}
                      <div className="sticky bottom-0 bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 border-t sm:border-0 border-shopici-gray/20">
                        <button
                          onClick={handleOrderSubmit}
                          disabled={submitting}
                          className={`w-full py-4 sm:py-6 bg-shopici-coral text-white text-lg sm:text-xl font-bold rounded-xl transition-all duration-300 transform flex items-center justify-center gap-2 sm:gap-3
        ${submitting ? 'cursor-not-allowed opacity-70 animate-pulse hover:scale-100 hover:shadow-none' : 'hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]'}`}
                        >
                          {submitting ? (
                            <>
                              <svg className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                              </svg>
                              En cours...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
                              COMMANDER
                            </>
                          )}
                        </button>


                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4 text-center mt-3">
                          <p className="text-xs sm:text-sm font-semibold text-green-800 flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                            Vous payez à la livraison - Aucun risque!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-shopici-black mb-2">
                    Commande confirmée!
                  </h3>
                  <p className="text-sm sm:text-base text-shopici-charcoal mb-3 sm:mb-4">
                    Merci {orderForm.name}! Nous vous contacterons très bientôt pour finaliser votre commande.
                  </p>
                  <p className="text-xs sm:text-sm text-shopici-charcoal">
                    Numéro: {orderForm.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}