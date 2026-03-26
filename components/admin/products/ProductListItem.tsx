"use client";

import { Edit, Trash2, ImageIcon, AlertCircle, X } from "lucide-react";
import type { Product } from "@/types/Product";
import { useRouter } from "next/navigation";
import { useNotify } from "@/context/NotifyContext";
import { useState } from "react";
import { CldImage } from "next-cloudinary";

export default function ProductListItem({ product, onDelete }: { product: Product, onDelete: (id: string) => void; }) {
    const router = useRouter();
    const { notify } = useNotify();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = () => {
        router.push(`/admin/products/${product._id}`);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();

            notify("MISE À JOUR", "Inventaire actualisé : Produit supprimé", "success");
            onDelete(product._id);
        } catch (error) {
            notify("ERREUR", "Impossible de supprimer l'entrée", "error");
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className={`
            group relative bg-white border border-shopici-black/10 flex flex-col sm:flex-row transition-all duration-300
            ${isDeleting ? "opacity-40 bg-slate-50" : "hover:border-shopici-black/30 hover:shadow-md"}
        `}>
            {/* IMAGE: Responsive height for mobile, fixed for desktop */}
            <div className="w-full sm:w-28 h-40 sm:h-auto bg-slate-50 border-b sm:border-b-0 sm:border-r border-shopici-black/5 shrink-0 overflow-hidden">
                {product.images?.[0] ? (
                    <CldImage
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-shopici-black/10" />
                    </div>
                )}
            </div>

            {/* CONTENT: Better spacing for touch targets */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-[13px] sm:text-[12px] uppercase tracking-wider text-shopici-black truncate flex-1">
                        {product.name}
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-shopici-black bg-slate-50 border border-shopici-black/5 px-2 py-0.5 whitespace-nowrap">
                        {product.price.toLocaleString()} XAF
                    </span>
                </div>

                <p className="text-[10px] text-shopici-black/40 uppercase tracking-tight line-clamp-2 sm:line-clamp-1 mb-4 sm:mb-3">
                    {product.shortDescription || product.description}
                </p>

                <div className="flex gap-2 items-center">
                    <span className="text-[8px] font-black text-white bg-shopici-black px-1.5 py-0.5 uppercase tracking-tighter">
                        {product.category || "General"}
                    </span>
                    <span className="text-[9px] font-bold text-shopici-black/20 font-mono">
                        REF_{String(product._id).slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* ACTIONS: Optimized for thumbs on mobile */}
            <div className="flex sm:flex-col border-t sm:border-t-0 sm:border-l border-shopici-black/5 min-h-[56px] sm:min-h-0">
                {!showConfirm ? (
                    <>
                        <button
                            onClick={handleEdit}
                            aria-label="Edit"
                            className="flex-1 p-4 sm:p-3 text-shopici-black/30 hover:text-shopici-blue hover:bg-shopici-blue/5 transition-all flex items-center justify-center border-r sm:border-r-0 sm:border-b border-shopici-black/5 active:bg-slate-100"
                        >
                            <Edit size={18} className="sm:size-4" />
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            aria-label="Delete"
                            className="flex-1 p-4 sm:p-3 text-shopici-black/30 hover:text-shopici-coral hover:bg-shopici-coral/5 transition-all flex items-center justify-center active:bg-slate-100"
                        >
                            <Trash2 size={18} className="sm:size-4" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-1 sm:flex-col h-full bg-shopici-coral/5 animate-in slide-in-from-bottom-2 sm:slide-in-from-right-2 duration-200">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-[3] sm:flex-1 px-4 py-4 sm:py-3 bg-shopici-coral text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={14} />
                            {isDeleting ? "..." : "CONFIRMER"}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 p-4 sm:p-2 text-shopici-black/40 hover:text-shopici-black border-l sm:border-l-0 sm:border-t border-shopici-black/10 flex items-center justify-center"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}