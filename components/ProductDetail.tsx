import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { addOrder } from "@/helper/order";
import type { CustomerInfo } from "@/types/OrderTracking";
import { Product } from "@/types/Product";
import ProductDetailsSkeleton from "./admin/products/ProductDetailSkeleton";

import UrgencyBanner from "./UrgencyBanner";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import TestimonialsSection from "./TestimonialsSection";
import OrderModal from "./OrderModal";

interface ProductDetailsPageProps {
    slug: string;
}

export default function ProductDetailsPage({ slug }: ProductDetailsPageProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [timeLeft, setTimeLeft] = useState(3600);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderForm, setOrderForm] = useState({
        name: "",
        phone: "",
        phoneConfirmed: false,
        deliveryZone: "",
        quartier: "",
        callTime: "",
        hasWhatsApp: false,
        hasCash: null as boolean | null,
    });
    const [orderSubmitted, setOrderSubmitted] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState("");

    function getCookie(name: string): string | undefined {
        if (typeof document === "undefined") return undefined;
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match?.[2];
    }
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

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (showOrderModal && product) {
            if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq("trackCustom", "FormView", {
                    productName: product.name,
                    productId: product._id,
                });
            }
        }
    }, [showOrderModal, product]);

    if (loading) return <ProductDetailsSkeleton />;

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

    const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price);

    const calculateDiscount = () => {
        if (!product.compareAtPrice) return 0;
        return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    };

    const handleOrderSubmit = async () => {
        if (!orderForm.name || !orderForm.phone || !orderForm.phoneConfirmed || !orderForm.deliveryZone || !orderForm.quartier || !orderForm.callTime || !orderForm.hasCash) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }
        setSubmitting(true);
        const customer: CustomerInfo = {
            name: orderForm.name,
            phone: orderForm.phone,
            hasWhatsApp: orderForm.hasWhatsApp,
            deliveryZone: `${orderForm.quartier}, ${orderForm.deliveryZone}`,
            callTime: orderForm.callTime as "now" | "morning" | "afternoon" | "evening",
        };
        // ✅ Collect Facebook tracking data from the customer's browser at order time
        const facebookTracking = {
            _fbp: getCookie("_fbp"),   // Meta browser ID — always present if Pixel is installed
            _fbc: getCookie("_fbc"),   // Meta click ID — present if customer came from your ad
            _ua: navigator.userAgent,  // Browser/device info
            // Note: IP is collected server-side in the API route
        };

        try {
            const newOrder = await addOrder([{ product, quantity }], customer, facebookTracking);
            setCreatedOrderId(newOrder.id);
            setOrderSubmitted(true);
            if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq("track", "Lead", {
                    content_name: product.name,
                    content_category: product.category,
                    value: product.price * quantity,
                    currency: "XAF",
                    order_id: newOrder.id,
                    user_data: {
                        fn: orderForm.name.split(" ")[0]?.toLowerCase(),
                        ln: orderForm.name.split(" ")[1]?.toLowerCase(),
                        ph: `237${orderForm.phone.replace(/\D/g, "").replace(/^237/, "")}`,
                        ct: orderForm.deliveryZone.toLowerCase().replace(/\s/g, ""),
                        country: "cm"
                    }
                });
            }
            // Modal stays open — user closes it manually
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Une erreur s'est produite. Veuillez réessayer.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <UrgencyBanner timeLeft={timeLeft} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <ImageGallery
                        product={product}
                        selectedImage={selectedImage}
                        onSelectImage={setSelectedImage}
                        onNext={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                        onPrev={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                        calculateDiscount={calculateDiscount}
                    />
                    <ProductInfo
                        product={product}
                        quantity={quantity}
                        onQuantityChange={setQuantity}
                        onOrderClick={() => setShowOrderModal(true)}
                        formatPrice={formatPrice}
                        calculateDiscount={calculateDiscount}
                    />
                </div>

                {/* Description */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-shopici-black mb-4">Description du produit</h2>
                    <div className="bg-white border border-shopici-gray/30 rounded-xl p-6">
                        <p className="text-[#414141] leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                </div>

                <TestimonialsSection testimonials={product.testimonials} />
            </div>

            {showOrderModal && (
                <OrderModal
                    product={product}
                    quantity={quantity}
                    orderForm={orderForm}
                    orderSubmitted={orderSubmitted}
                    submitting={submitting}
                    onClose={() => {
                        setShowOrderModal(false);
                        setOrderSubmitted(false);
                        setCreatedOrderId("");
                        setOrderForm({ name: "", phone: "", phoneConfirmed: false, deliveryZone: "", quartier: "", callTime: "", hasWhatsApp: false, hasCash: null });
                    }}
                    onFormChange={setOrderForm}
                    onSubmit={handleOrderSubmit}
                    formatPrice={formatPrice}
                />
            )}
        </div>
    );
}