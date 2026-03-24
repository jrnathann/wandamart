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

const EMPTY_FORM = {
    name: "", phone: "", phoneConfirmed: false,
    deliveryZone: "", quartier: "", callTime: "",
    hasWhatsApp: false, hasCash: null as boolean | null,
};

function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match?.[2];
}

export default function ProductDetailsPage({ slug }: ProductDetailsPageProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [timeLeft, setTimeLeft] = useState(3600);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orderSubmitted, setOrderSubmitted] = useState(false);
    const [checkoutTracked, setCheckoutTracked] = useState(false);
    const [orderForm, setOrderForm] = useState(EMPTY_FORM);

    // "cod" | "online" | null — null means modal is closed
    const [paymentMode, setPaymentMode] = useState<"cod" | "online" | null>(null);

    // Retry state — persists the failed order so backend can reuse it
    const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
    const [paymentError, setPaymentError]   = useState<string | null>(null);

    // ── Fetch product ─────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/product-details/${slug}`);
                if (!res.ok) throw new Error("Produit non trouvé");
                const data = await res.json();
                setProduct(data);
                if (typeof window !== "undefined" && (window as any).fbq) {
                    (window as any).fbq("track", "ViewContent", {
                        content_name: data.name,
                        content_ids: [data._id],
                        content_type: "product",
                        value: data.price,
                        currency: "XAF",
                    });
                }
            } catch (err) {
                console.error(err);
                alert("Produit non trouvé");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    // ── Countdown timer ───────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // ── FB InitiateCheckout (fires once when modal opens) ─────────────────────
    useEffect(() => {
        if (paymentMode && product && !checkoutTracked) {
            if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq("track", "InitiateCheckout", {
                    content_name: product.name,
                    content_ids: [product._id],
                    value: product.price * quantity,
                    currency: "XAF",
                    num_items: quantity,
                });
            }
            setCheckoutTracked(true);
        }
    }, [paymentMode, product, checkoutTracked, quantity]);

    const handleCloseModal = () => {
        setPaymentMode(null);
        setOrderSubmitted(false);
        setOrderForm(EMPTY_FORM);
        setCheckoutTracked(false);
        setFailedOrderId(null);
        setPaymentError(null);
    };

    // ── Clear payment error when user edits the phone field ───────────────────
    const handleFormChange = (form: typeof EMPTY_FORM) => {
        if (paymentError && form.phone !== orderForm.phone) {
            setPaymentError(null);
        }
        setOrderForm(form);
    };

    // ── COD submit ────────────────────────────────────────────────────────────
    // normalizedPhone is the 237XXXXXXXXX value computed synchronously in the
    // modal before calling this — no state race possible.
    const handleCodSubmit = async (normalizedPhone: string) => {
        setSubmitting(true);
        const customer: CustomerInfo = {
            name: orderForm.name,
            phone: normalizedPhone,
            hasWhatsApp: orderForm.hasWhatsApp,
            deliveryZone: `${orderForm.quartier}, ${orderForm.deliveryZone}`,
            callTime: orderForm.callTime as "now" | "morning" | "afternoon" | "evening",
        };
        const facebookTracking = {
            _fbp: getCookie("_fbp"),
            _fbc: getCookie("_fbc"),
            _ua: navigator.userAgent,
        };
        try {
            const newOrder = await addOrder([{ product: product!, quantity }], customer, facebookTracking);
            setOrderSubmitted(true);
            if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq("track", "Lead", {
                    content_name: product!.name,
                    content_category: product!.category,
                    value: product!.price * quantity,
                    currency: "XAF",
                    order_id: newOrder.id,
                });
            }
        } catch (error) {
            console.error("COD order error:", error);
            alert("Une erreur s'est produite. Veuillez réessayer.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Online (Mobile Money) submit — retry-safe ─────────────────────────────
    // normalizedPhone is the 237XXXXXXXXX value computed synchronously in the
    // modal before calling this — no state race possible.
    const handleOnlineSubmit = async (normalizedPhone: string) => {
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
                    items: [{ productId: product!._id, quantity, price: product!.price }],
                    customer,
                    _fbp: getCookie("_fbp"),
                    _fbc: getCookie("_fbc"),
                    _ua: navigator.userAgent,
                    // Pass back the failed order ID on retry so the backend
                    // reuses the existing document instead of creating a duplicate
                    existingOrderId: failedOrderId ?? undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.orderId) setFailedOrderId(data.orderId);
                const msg = (data.detail as string | undefined) ?? (data.error as string | undefined) ?? "Erreur lors du paiement";
                setPaymentError(msg);
                setSubmitting(false);
                return;
            }

            // Success — clear retry state
            setFailedOrderId(null);
            setPaymentError(null);

            // FB pixel before redirect
            if (typeof window !== "undefined" && (window as any).fbq) {
                (window as any).fbq("track", "InitiateCheckout", {
                    content_name: product!.name,
                    value: product!.price * quantity,
                    currency: "XAF",
                    num_items: quantity,
                    payment_type: "mobile_money",
                });
            }

            window.location.href = `/order/${data.orderId}?payment=success`;
            // Don't setSubmitting(false) — page is navigating away

        } catch (error: any) {
            console.error("Online payment error:", error);
            setPaymentError(error.message ?? "Une erreur s'est produite. Veuillez réessayer.");
            setSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) return <ProductDetailsSkeleton />;

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-24 h-24 mx-auto mb-4 text-[#414141]/40" />
                    <h1 className="text-2xl font-bold text-shopici-black mb-2">Produit non trouvé</h1>
                    <p className="text-[#414141] mb-6">Le produit que vous recherchez n'existe pas.</p>
                    <a href="/products" className="inline-block px-6 py-3 bg-shopici-black hover:bg-shopici-blue text-white font-semibold rounded-lg transition-colors">
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
                        onOrderClick={() => setPaymentMode("cod")}
                        onMobileMoneyClick={() => setPaymentMode("online")}
                        formatPrice={formatPrice}
                        calculateDiscount={calculateDiscount}
                    />
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-shopici-black mb-4">Description du produit</h2>
                    <div className="bg-white border border-shopici-gray/30 rounded-xl p-6">
                        <p className="text-[#414141] leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                </div>

                <TestimonialsSection testimonials={product.testimonials} />
            </div>

            {paymentMode !== null && (
                <OrderModal
                    product={product}
                    quantity={quantity}
                    orderForm={orderForm}
                    orderSubmitted={orderSubmitted}
                    submitting={submitting}
                    paymentMode={paymentMode}
                    paymentError={paymentError}
                    onClose={handleCloseModal}
                    onFormChange={handleFormChange}
                    onSubmit={paymentMode === "cod" ? handleCodSubmit : handleOnlineSubmit}
                    onRetry={handleOnlineSubmit}
                    formatPrice={formatPrice}
                />
            )}
        </div>
    );
}