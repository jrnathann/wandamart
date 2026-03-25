"use client";

import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import VintageHeader from "@/components/VintageHeader";
import ActionButton from "@/components/admin/orders/shared/ActionButton";
import { useNotify } from "@/context/NotifyContext";
import { useProductForm } from "../_shared/useProductForm";
import { defaultProductFormState } from "../_shared/ProductFormTypes";
import ProductForm from "../_shared/ProductForm";

export default function NewProductPage() {
    const router = useRouter();
    const { notify } = useNotify();

    // Start with empty state — the only difference from the edit page
    const form = useProductForm(defaultProductFormState);
    const { validate, buildPayload, isSaving, setIsSaving } = form;

    const handleSave = async () => {
        if (!validate()) {
            notify("Formulaire incomplet", "Veuillez corriger les erreurs avant de sauvegarder.", "warning");
            return;
        }
        setIsSaving(true);
        const product = {
            ...buildPayload(),
            createdAt: new Date().toISOString(),
        };
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            notify("Produit enregistré", "Le produit a été créé avec succès !", "success");
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
                            <VintageHeader title="Nouveau Produit" pluralLabel="ajouter" />
                        </div>
                        <div className="flex gap-3 flex-wrap sm:flex-nowrap mt-3 sm:mt-0">
                            <ActionButton label="Enregistrer" subLabel="ajouter" icon={<Save />} onClick={handleSave} isLoading={isSaving} />
                        </div>
                    </div>
                    <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
                </div>

                {/* Shared form — all sections live here */}
                <ProductForm form={form} />

            </div>
        </div>
    );
}