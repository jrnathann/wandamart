"use client"
import { useEffect, useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle, User, Calendar, AlertCircle } from "lucide-react";
// import { getOrderById } from "@/data/orders";
// import { products } from "@/data/products";
import type { OrderTracking, OrderStatus } from "@/types/OrderTracking";
import { getOrderById } from "@/helper/order";
import { Product } from "@/types/Product";

export default function OrderTrackingPage() {
  const [trackingId, setTrackingId] = useState("");
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);

      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

  }, []);
  const handleSearch = async () => {
    setError("");
    setIsSearching(true);

    setTimeout(async () => {
      const foundOrder = await getOrderById(trackingId.trim());

      if (!foundOrder) {
        setOrder(null);
        setError("Commande introuvable. Vérifiez votre numéro de suivi.");
      } else {
        setOrder(foundOrder);
      }
      setIsSearching(false);
    }, 500);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "En préparation": return "bg-yellow-500";
      case "En route": return "bg-blue-500";
      case "Livré": return "bg-green-600";
      default: return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "En préparation": return <Package className="w-5 h-5" />;
      case "En route": return <Truck className="w-5 h-5" />;
      case "Livré": return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCallTime = (callTime: string) => {
    switch (callTime) {
      case "morning": return "Matin (8h - 12h)";
      case "afternoon": return "Après-midi (12h - 17h)";
      case "evening": return "Soir (17h - 20h)";
      default: return callTime;
    }
  };

  // Get product details
  const getProductDetails = (productId: string) => {
    return products.find(p => p._id === productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shopici-gray/10 to-shopici-blue/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-shopici-black to-shopici-charcoal text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <Package className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Suivez votre commande</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Entrez votre numéro de suivi pour voir où se trouve votre colis en temps réel
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-16">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-shopici-charcoal" />
              <input
                type="text"
                placeholder="Entrez votre numéro de suivi (ex: order_001)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-shopici-gray/30 rounded-xl focus:outline-none focus:border-shopici-blue bg-background text-shopici-black"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !trackingId.trim()}
              className="px-8 py-4 bg-shopici-coral hover:bg-shopici-coral/90 text-white text-lg font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Suivre
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Current Status Card */}
            <div className="bg-gradient-to-br from-shopici-blue to-shopici-coral text-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Statut actuel</p>
                  <h2 className="text-3xl font-bold">{order.status}</h2>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  {getStatusIcon(order.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/80 text-sm">Commande passée</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Livraison estimée</p>
                  <p className="font-semibold">
                    {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Info - Multiple Products */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-shopici-black mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-shopici-coral" />
                Produits commandés ({order.items.length})
              </h3>

              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const product = getProductDetails(item.productId);

                  if (!product) {
                    return (
                      <div key={index} className="text-center py-4 text-shopici-charcoal border border-shopici-gray/30 rounded-xl">
                        Produit introuvable (ID: {item.productId})
                      </div>
                    );
                  }

                  return (
                    <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-shopici-gray/5 rounded-xl border border-shopici-gray/20 hover:border-shopici-blue/30 transition-colors">
                      <div className="w-full md:w-24 h-24 bg-shopici-gray/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-10 h-10 text-shopici-charcoal/40" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="text-base font-semibold text-shopici-black">{product.name}</h4>
                        {product.shortDescription && (
                          <p className="text-sm text-shopici-charcoal line-clamp-1">{product.shortDescription}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-shopici-charcoal">Quantité: </span>
                            <span className="font-semibold text-shopici-black">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-shopici-charcoal">Prix unitaire: </span>
                            <span className="font-semibold text-shopici-black">{item.price.toLocaleString()} XAF</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-shopici-gray/20">
                          <span className="text-sm text-shopici-charcoal">Sous-total: </span>
                          <span className="font-bold text-shopici-coral">{(item.price * item.quantity).toLocaleString()} XAF</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Order Total */}
                <div className="flex justify-between items-center p-4 bg-shopici-coral/10 rounded-xl border-2 border-shopici-coral/30">
                  <span className="text-lg font-bold text-shopici-black">Total de la commande</span>
                  <span className="text-2xl font-bold text-shopici-coral">
                    {order.total.toLocaleString()} XAF
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-shopici-black mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-shopici-coral" />
                Suivi de livraison
              </h3>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-shopici-gray/30" />

                {/* Checkpoints */}
                <div className="space-y-8">
                  {order.checkpoints.map((checkpoint, index) => {
                    const isCompleted = index < order.checkpoints.length - 1 || order.status === "Livré";
                    const isCurrent = !isCompleted && index === order.checkpoints.length - 1;

                    return (
                      <div key={index} className="relative pl-16">
                        {/* Status Icon */}
                        <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${isCompleted
                            ? `${getStatusColor(checkpoint.status)} text-white shadow-lg`
                            : 'bg-white border-2 border-shopici-gray/30 text-shopici-charcoal'
                          }`}>
                          {getStatusIcon(checkpoint.status)}
                        </div>

                        {/* Content */}
                        <div className={`pb-2 ${!isCompleted ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-shopici-black text-lg">
                              {checkpoint.status}
                            </h4>
                            {isCurrent && (
                              <span className="px-3 py-1 bg-shopici-coral text-white text-xs font-bold rounded-full">
                                En cours
                              </span>
                            )}
                          </div>
                          <p className="text-shopici-charcoal mb-1">{checkpoint.location}</p>
                          <div className="flex items-center gap-2 text-sm text-shopici-charcoal">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(checkpoint.time)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-shopici-black mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-shopici-coral" />
                Informations de livraison
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-shopici-gray/10 rounded-xl">
                  <p className="text-sm text-shopici-charcoal mb-1">Nom du client</p>
                  <p className="font-semibold text-shopici-black">{order.customer.name}</p>
                </div>

                <div className="p-4 bg-shopici-gray/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-shopici-charcoal" />
                    <p className="text-sm text-shopici-charcoal">Téléphone</p>
                  </div>
                  <p className="font-semibold text-shopici-black">{order.customer.phone}</p>
                </div>

                <div className="p-4 bg-shopici-gray/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-shopici-charcoal" />
                    <p className="text-sm text-shopici-charcoal">Zone de livraison</p>
                  </div>
                  <p className="font-semibold text-shopici-black">{order.customer.deliveryZone}</p>
                </div>

                <div className="p-4 bg-shopici-gray/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-shopici-charcoal" />
                    <p className="text-sm text-shopici-charcoal">Créneau d'appel</p>
                  </div>
                  <p className="font-semibold text-shopici-black">{formatCallTime(order.customer.callTime)}</p>
                </div>
              </div>

              {/* WhatsApp Badge */}
              {order.customer.hasWhatsApp && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">Client disponible sur WhatsApp</p>
                    <p className="text-sm text-green-700">Notre équipe peut le contacter via WhatsApp</p>
                  </div>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-2xl p-6 border-2 border-shopici-blue/20">
              <h3 className="text-lg font-bold text-shopici-black mb-3">Besoin d'aide ?</h3>
              <p className="text-shopici-charcoal mb-4">
                Si vous avez des questions sur votre commande, n'hésitez pas à nous contacter.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+237"
                  className="flex-1 px-4 py-3 bg-shopici-black hover:bg-shopici-charcoal text-white font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Appeler
                </a>
                <a
                  href="https://wa.me/237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* No Search Yet State */}
        {!order && !error && !isSearching && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-shopici-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-shopici-charcoal" />
            </div>
            <h3 className="text-2xl font-bold text-shopici-black mb-3">
              Suivez votre colis en temps réel
            </h3>
            <p className="text-shopici-charcoal mb-6 max-w-md mx-auto">
              Entrez votre numéro de suivi ci-dessus pour voir l'état actuel de votre livraison
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-shopici-charcoal bg-shopici-gray/10 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              Le numéro de suivi vous a été envoyé par SMS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}