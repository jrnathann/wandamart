"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import VintageHeader from "@/components/VintageHeader";
import ActionButton from "@/components/admin/orders/shared/ActionButton";
import { useNotify } from "@/context/NotifyContext";
import { useProductForm } from "../_shared/useProductForm";
import { defaultProductFormState } from "../_shared/ProductFormTypes";
import ProductForm from "../_shared/ProductForm";
import type { ProductFormState } from "../_shared/ProductFormTypes";

/**
 * Maps a raw API product response to the shape expected by useProductForm.
 * Adjust the field mapping to match your actual API response shape.
 */
function mapProductToFormState(product: any): ProductFormState {
    return {
        name: product.name ?? "",
        slug: product.slug ?? "",
        category: product.category ?? "",
        shortDescription: product.shortDescription ?? "",
        description: product.description ?? "",
        tags: product.tags ?? [],
        price: product.price != null ? String(product.price) : "",
        compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
        stock: product.stock != null ? String(product.stock) : "",
        isAvailable: product.isAvailable ?? true,
        isFeatured: product.isFeatured ?? false,
        images: product.images ?? [],
        deliveryAvailable: product.delivery?.available ?? true,
        deliveryAreas: (product.delivery?.areas ?? []).map((name: string, i: number) => ({
            id: `area-${i}`,
            name,
        })),
        estimatedDays: product.delivery?.estimatedDays ?? "",
        testimonials: product.testimonials ?? [],
        contentBlocks: product.contentBlocks ?? [],
    };
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { notify } = useNotify();
    const productId = params?.id as string;

    const [loadingProduct, setLoadingProduct] = useState(true);
    const [initialState, setInitialState] = useState<ProductFormState>(defaultProductFormState);
    const [isReady, setIsReady] = useState(false);

    // Fetch the product first, then mount the form with pre-filled state
    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                if (!res.ok) throw new Error("Product not found");
                const data = await res.json();
                setInitialState(mapProductToFormState(data));
                setIsReady(true);
            } catch (error: any) {
                notify("Erreur", "Impossible de charger le produit.", "error");
                router.push("/admin/products");
            } finally {
                setLoadingProduct(false);
            }
        };
        fetchProduct();
    }, [productId]);

    // Render loading state while fetching
    if (loadingProduct || !isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-shopici-charcoal">
                    <Loader2 size={32} className="animate-spin text-shopici-blue" />
                    <p className="text-sm font-semibold uppercase tracking-widest">Chargement du produit...</p>
                </div>
            </div>
        );
    }

    return <EditForm productId={productId} initialState={initialState} />;
}

/**
 * Separate inner component so useProductForm is only called once
 * the initial state is ready (avoids stale state from defaultProductFormState).
 */
function EditForm({ productId, initialState }: { productId: string; initialState: ProductFormState }) {
    const router = useRouter();
    const { notify } = useNotify();

    const form = useProductForm(initialState);
    const { validate, buildPayload, isSaving, setIsSaving } = form;

    const handleSave = async () => {
        if (!validate()) {
            notify("Formulaire incomplet", "Veuillez corriger les erreurs avant de sauvegarder.", "warning");
            return;
        }
        setIsSaving(true);
        const product = {
            ...buildPayload(productId),  // passes existing ID so it's preserved
            // createdAt is intentionally omitted — we don't overwrite it on edit
        };
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            notify("Produit mis à jour", "Les modifications ont été sauvegardées !", "success");
            setTimeout(() => router.push("/admin/products"), 1200);
        } catch (error: any) {
            console.error(error);
            notify("Échec de l'enregistrement", error.message ?? "Une erreur est survenue.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto space-y-6">

                {/* Header */}
                <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                            <button
                                onClick={() => router.back()}
                                className="group relative p-2.5 bg-white border-2 border-shopici-black hover:bg-shopici-black transition-all rounded-none"
                            >
                                <ArrowLeft size={20} strokeWidth={3} className="text-shopici-black group-hover:text-white group-hover:-translate-x-1 transition-all" />
                                <div className="absolute -top-[2px] -left-[2px] w-1 h-1 bg-shopici-black group-hover:bg-white" />
                            </button>
                            <VintageHeader title="Modifier le Produit" pluralLabel="éditer" />
                        </div>
                        <div className="flex gap-3 flex-wrap sm:flex-nowrap mt-3 sm:mt-0">
                            <ActionButton label="Sauvegarder" subLabel="modifications" icon={<Save />} onClick={handleSave} isLoading={isSaving} />
                        </div>
                    </div>
                    <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
                </div>

                {/* Shared form — identical UI to the new product page */}
                <ProductForm form={form} />

            </div>
        </div>
    );
}