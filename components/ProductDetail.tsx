import { useState, useEffect } from "react";
import { ShoppingCart, Clock, MapPin, Phone, User, CheckCircle, Star, TrendingUp, Shield, Package, X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { getProductBySlug } from "@/data/products";
import { addOrder } from "@/helper/order";
import type { CustomerInfo } from "@/types/OrderTracking";
import { Product } from "@/types/Product";
import ProductDetailsSkeleton from "./admin/products/ProductDetailSkeleton";
import { storeConfig } from "@/data/configData";

interface ProductDetailsPageProps {
    slug: string;
}

export default function ProductDetailsPage({ slug }: ProductDetailsPageProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderForm, setOrderForm] = useState({
        name: "",
        phone: "",
        deliveryZone: "",
        callTime: "",
        hasWhatsApp: false
    });
    const [orderSubmitted, setOrderSubmitted] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [createdOrderId, setCreatedOrderId] = useState("");
    // Get product from data

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/product-details/${slug}`);
                if (!res.ok) throw new Error("Produit non trouvé");
                const data = await res.json();
                setProduct(data);
            } catch (err) {
                console.error(err);
                alert("Produit non trouvé");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);
    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (showOrderModal && product) {
            if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq('trackCustom', 'FormView', {
                    productName: product.name,
                    productId: product._id
                });
            }
        }
    }, [showOrderModal, product]);
    // Early returns for UI — NO hooks after this
    if (loading) {
        return <ProductDetailsSkeleton />;
    }
    // If product not found, show error
    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-24 h-24 mx-auto mb-4 text-[#414141]/40" />
                    <h1 className="text-2xl font-bold text-shopici-black mb-2">Produit non trouvé</h1>
                    <p className="text-[#414141] mb-6">Le produit que vous recherchez n'existe pas.</p>
                    <a
                        href="/products"
                        className="inline-block px-6 py-3 bg-shopici-black hover:bg-shopici-blue text-white font-semibold rounded-lg transition-colors"
                    >
                        Retour aux produits
                    </a>
                </div>
            </div>
        );
    }


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR').format(price);
    };

    const calculateDiscount = () => {
        if (!product.compareAtPrice) return 0;
        return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
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

        try {
            // Create order
            const newOrder = await addOrder([{ product, quantity }], customer);


            console.log("Order created successfully:", newOrder);

            // Store order ID to show to customer
            setCreatedOrderId(newOrder.id);
            setOrderSubmitted(true);
            // FB Pixel Lead event for completed order
            if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq('track', 'Lead', {
                    content_name: product.name,
                    content_category: product.category,
                    value: product.price * quantity,
                    currency: 'XAF',
                    order_id: newOrder.id
                });
            }
            // Reset form after 5 seconds
            setTimeout(() => {
                setShowOrderModal(false);
                setOrderSubmitted(false);
                setCreatedOrderId("");
                setOrderForm({ name: "", phone: "", deliveryZone: "", callTime: "", hasWhatsApp: false });
            }, 5000); // Increased to 5 seconds so customer can see order ID

        } catch (error) {
            console.error("Error creating order:", error);
            alert("Une erreur s'est produite. Veuillez réessayer.");
        } finally {
            setSubmitting(false); // stop animation / enable button
        }
    };

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    };


    return (
        <div className="min-h-screen bg-white">
            {/* Urgency Banner */}
            <div className="bg-gradient-to-r from-shopici-coral to-orange-600 text-white py-3 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm md:text-base font-semibold">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span>OFFRE LIMITÉE - Prix spécial expire dans: {formatTime(timeLeft)}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-shopici-gray/20 rounded-2xl overflow-hidden group">
                            {product.images.length > 0 ? (
                                <>
                                    <img
                                        src={product.images[selectedImage].url}
                                        alt={product.images[selectedImage].alt || product.name}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Navigation Arrows */}
                                    {product.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronLeft className="w-6 h-6 text-shopici-black" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronRight className="w-6 h-6 text-shopici-black" />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-shopici-gray to-shopici-blue/20 flex items-center justify-center">
                                    <Package className="w-24 h-24 text-[#414141]/40" />
                                </div>
                            )}

                            {/* Discount Badge */}
                            {product.compareAtPrice && (
                                <div className="absolute top-4 left-4 px-4 py-2 bg-shopici-coral text-white font-bold text-lg rounded-full shadow-lg">
                                    -{calculateDiscount()}%
                                </div>
                            )}

                            {/* Stock Badge */}
                            {product.stock < 10 && (
                                <div className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white font-semibold text-sm rounded-full shadow-lg animate-pulse">
                                    Plus que {product.stock} en stock!
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                            ? 'border-shopici-blue ring-2 ring-shopici-blue/30'
                                            : 'border-shopici-gray/30 hover:border-shopici-blue/50'
                                            }`}
                                    >
                                        <img src={img.url} alt={img.alt || `Vue ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-shopici-black mb-3">
                                {product.name}
                            </h1>
                            {product.shortDescription && (
                                <p className="text-[#414141] text-lg">
                                    {product.shortDescription}
                                </p>
                            )}
                        </div>

                        {/* Price Section */}
                        <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-2xl p-6 border border-shopici-blue/20">
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-4xl font-bold text-shopici-black">
                                    {formatPrice(product.price)}
                                </span>
                                <span className="text-2xl font-semibold text-shopici-black">XAF</span>
                                {product.compareAtPrice && (
                                    <span className="text-xl text-[#414141] line-through">
                                        {formatPrice(product.compareAtPrice)}
                                    </span>
                                )}
                            </div>
                            {product.compareAtPrice && (
                                <p className="text-sm text-[#414141] flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    Économisez {formatPrice(product.compareAtPrice - product.price)} XAF aujourd'hui!
                                </p>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-shopici-black">Quantité:</span>
                            <div className="flex items-center gap-3 bg-shopici-gray/20 rounded-lg p-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-white text-black hover:bg-shopici-blue hover:text-white flex items-center justify-center font-bold transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-bold text-lg text-shopici-black">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="w-10 h-10 rounded-lg bg-white text-black hover:bg-shopici-blue hover:text-white flex items-center justify-center font-bold transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowOrderModal(true)}
                                className="w-full py-5 bg-shopici-coral hover:bg-shopici-coral/90 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                COMMANDER MAINTENANT
                            </button>

                            <div className="text-center text-sm text-[#414141]">
                                <p className="flex items-center justify-center gap-2">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    Paiement 100% sécurisé à la livraison
                                </p>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        {product.delivery.available && (
                            <div className="bg-white border border-shopici-gray/30 rounded-xl p-5">
                                <h3 className="font-semibold text-shopici-black mb-3 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-shopici-blue" />
                                    Informations de livraison
                                </h3>
                                <div className="space-y-2 text-sm text-[#414141]">
                                    <p className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Livraison: {product.delivery.estimatedDays}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Zones: {product.delivery.areas.join(", ")}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        La livraison est gratuite dans certaines zones de Yaoundé.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Trust Badges - Cameroon Edition */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-shopici-gray/10 rounded-lg">
                                <Shield className="w-6 h-6 mx-auto mb-1 text-shopici-blue" />
                                <p className="text-xs font-semibold text-shopici-black">Paiement Sécurisé</p>
                            </div>
                            <div className="text-center p-3 bg-shopici-gray/10 rounded-lg">
                                <Package className="w-6 h-6 mx-auto mb-1 text-shopici-blue" />
                                <p className="text-xs font-semibold text-shopici-black">Livraison Rapide</p>
                            </div>
                            <div className="text-center p-3 bg-shopici-gray/10 rounded-lg">
                                <Star className="w-6 h-6 mx-auto mb-1 text-shopici-blue" />
                                <p className="text-xs font-semibold text-shopici-black">Top Qualité</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Description */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-shopici-black mb-4">Description du produit</h2>
                    <div className="bg-white border border-shopici-gray/30 rounded-xl p-6">
                        <p className="text-[#414141] leading-relaxed whitespace-pre-line">
                            {product.description}
                        </p>
                    </div>
                </div>

                {/* Testimonials */}
                {product.testimonials && product.testimonials.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-shopici-black mb-6 text-center">
                            Nos clients satisfaits partout au Cameroun
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {product.testimonials.map((testimonial) => (
                                <div key={testimonial.id} className="relative group">
                                    <div className="aspect-square bg-gradient-to-br from-shopici-gray to-shopici-blue/20 rounded-xl overflow-hidden">
                                        <img
                                            src={testimonial.imageUrl}
                                            alt={`Client de ${testimonial.city}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-xl">
                                        <p className="text-white font-semibold text-sm flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {testimonial.city}
                                        </p>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-[#414141] mt-4">
                            Plus de 500+ clients satisfaits à travers le Cameroun
                        </p>
                    </div>
                )}
            </div>

            {/* Order Modal */}
            {showOrderModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => setShowOrderModal(false)}
                    />

                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            {!orderSubmitted ? (
                                <div className="p-4 sm:p-6">
                                    {/* Modal Header - Sticky on mobile */}
                                    <div className="sticky top-0 bg-white z-10 pb-4 sm:pb-6 border-b sm:border-0 border-shopici-gray/20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl sm:text-2xl font-bold text-shopici-black">Finaliser la commande</h3>
                                            <button
                                                onClick={() => setShowOrderModal(false)}
                                                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full hover:bg-shopici-gray/20 flex items-center justify-center transition-colors flex-shrink-0"
                                            >
                                                <X className="w-6 h-6 sm:w-5 sm:h-5 text-[#414141]" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 sm:pt-0">
                                        {/* Order Summary */}
                                        <div className="bg-shopici-gray/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                                            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                                                <span className="text-xs sm:text-sm text-[#414141]">Produit:</span>
                                                <span className="font-semibold text-shopici-black text-xs sm:text-sm text-right flex-1 ml-2 line-clamp-1">{product.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                                                <span className="text-xs sm:text-sm text-[#414141]">Quantité:</span>
                                                <span className="font-semibold text-shopici-black text-sm sm:text-base">{quantity}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-shopici-gray/30">
                                                <span className="text-base sm:text-lg font-bold text-shopici-black">Total:</span>
                                                <span className="text-xl sm:text-2xl font-bold text-shopici-coral">
                                                    {formatPrice(product.price * quantity)} XAF
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

                                            {/* Step 3: WhatsApp - Big and Clear */}
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
                                                <p className="text-xs sm:text-sm text-[#414141] mt-2 text-center">
                                                    Choisissez comment vous voulez qu'on vous contacte
                                                </p>
                                            </div>

                                            {/* Step 4: City - Simple dropdown */}
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

                                            {/* Step 5: When to call - Big buttons */}
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
                                                            : 'bg-white border-shopici-gray/30 text-shopici-black  hover:border-shopici-blue'
                                                            }`}
                                                    >
                                                        🌙 SOIR (17h - 20h)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Big Submit Button - Sticky on mobile */}
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


                                                {/* Trust message */}
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
                                    <p className="text-sm sm:text-base text-[#414141] mb-3 sm:mb-4">
                                        Merci {orderForm.name}! Nous vous contacterons très bientôt pour finaliser votre commande.
                                    </p>
                                    <p className="text-xs sm:text-sm text-[#414141]">
                                        Numéro: {orderForm.phone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}