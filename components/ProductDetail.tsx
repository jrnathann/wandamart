"use client"

import { useState, useEffect } from "react";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addOrder } from "@/helper/order";
import type { CustomerInfo } from "@/types/OrderTracking";
import { Product } from "@/types/Product";
import ProductDetailsSkeleton from "./admin/products/ProductDetailSkeleton";
import UrgencyBanner from "./UrgencyBanner";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import TestimonialsSection from "./TestimonialsSection";
import OrderModal from "./OrderModal";
import AlternatingContentSection from "./AlternatingContentSection";
import ShippingTicker from "./ShipperTicker";
import { StickyPurchase } from "./StickyPurchase";

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
    const [paymentMode, setPaymentMode] = useState<"cod" | "online" | null>(null);
    const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

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

    const handleFormChange = (form: typeof EMPTY_FORM) => {
        if (paymentError && form.phone !== orderForm.phone) {
            setPaymentError(null);
        }
        setOrderForm(form);
    };

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

            setFailedOrderId(null);
            setPaymentError(null);
            window.location.href = `/order/${data.orderId}?payment=success`;
        } catch (error: any) {
            setPaymentError(error.message ?? "Une erreur s'est produite.");
            setSubmitting(false);
        }
    };

    if (loading) return <ProductDetailsSkeleton />;

    if (!product) {
        return (
            <div className="min-h-screen bg-[var(--shopici-background)] flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <Package className="w-16 h-16 mx-auto mb-6 text-shopici-gray opacity-20" />
                    <h1 className="text-3xl font-black text-shopici-black uppercase tracking-tighter mb-4">Produit non trouvé</h1>
                    <Link href="/products" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-shopici-blue border-b-2 border-shopici-blue pb-1">
                        <ArrowLeft className="w-4 h-4" /> Retour à la boutique
                    </Link>
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
        <div className="min-h-screen bg-[var(--shopici-background)]">
            <UrgencyBanner timeLeft={timeLeft} />
            <ShippingTicker />
            {paymentMode === null && (
                <StickyPurchase
                    product={product}
                    onOrderClick={() => setPaymentMode("cod")}
                    onMobileMoneyClick={() => setPaymentMode("online")}
                    formatPrice={formatPrice}
                />
            )}
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                {/* Back Link */}
                <Link
                    href="/products"
                    className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-shopici-blue transition-colors duration-300 mb-10"
                >
                    {/* The arrow now has a subtle move animation to feel "light" */}
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />

                    <span className="relative py-1">
                        Retour Boutique
                        {/* A very thin, light underline that only appears on hover */}
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-shopici-blue/40 transition-all duration-300 group-hover:w-full" />
                    </span>
                </Link>

                {/* Hero Section: Gallery & Purchase */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24 md:mb-32">
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

                {/* Description Section */}
                <div className="mb-24 md:mb-32">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-1 bg-shopici-coral" />
                        <h2 className="text-3xl md:text-5xl font-black text-shopici-black uppercase tracking-tighter">
                            Description du <span className="text-shopici-blue">Produit.</span>
                        </h2>
                    </div>
                    <div className="bg-white border border-shopici-gray/10 p-8 md:p-12 shadow-sm">
                        <p className=" whitespace-pre-line max-w-4xl text-shopici-black/70 leading-relaxed text-sm md:text-base font-medium">
                            {product.description}
                        </p>
                    </div>
                </div>

                {/* Visual Content Blocks */}
                {product.contentBlocks && product.contentBlocks.length > 0 && (
                    <div className="mb-24 md:mb-32">
                        <AlternatingContentSection
                            blocks={product.contentBlocks}
                        />
                    </div>
                )}

                {/* Testimonials */}
                <TestimonialsSection testimonials={product.testimonials} />
            </div>

            {/* Modal Logic */}
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