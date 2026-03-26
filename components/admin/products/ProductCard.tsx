"use client"

import { Edit, Trash2, ImageIcon, AlertTriangle, Star, X, Loader2 } from "lucide-react";
import type { Product } from "@/types/Product";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CldImage } from "next-cloudinary";

export default function ProductCard({ product, onDelete }: { product: Product, onDelete: (id: string) => void; }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
        : 0;

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/admin/products/${product._id}`);
    };

    const confirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setShowConfirm(false);

        try {
            const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            onDelete(product._id);
        } catch (error) {
            alert("ERREUR SYSTÈME : ÉCHEC DE LA SUPPRESSION");
            setIsDeleting(false);
        }
    };

    return (
        <div className="group relative bg-white border border-shopici-black/30 rounded-none overflow-hidden transition-all md:hover:shadow-[8px_8px_0px_rgba(0,0,0,0.1)] flex flex-col h-full">

            {/* --- DELETE CONFIRMATION OVERLAY --- */}
            {showConfirm && (
                <div className="absolute inset-0 z-50 bg-shopici-black flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        Confirmer la suppression ?
                    </p>
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                            className="flex-1 py-2 border border-white text-white text-[9px] font-black uppercase hover:bg-white hover:text-shopici-black transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            className="flex-1 py-2 bg-shopici-coral text-white text-[9px] font-black uppercase hover:bg-white hover:text-shopici-coral transition-all"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            )}

            {/* --- LOADING FEEDBACK OVERLAY --- */}
            {isDeleting && (
                <div className="absolute inset-0 z-[60] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-shopici-black" />
                    <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-shopici-black">Suppression...</span>
                </div>
            )}

            {/* 1. MEDIA SECTION */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden shrink-0">
                {product.images[0] ? (
                    <CldImage
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover grayscale-[0.2] md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-shopici-black/10" strokeWidth={1} />
                    </div>
                )}

                {/* INDUSTRIAL BADGES */}
                <div className="absolute top-0 left-0 flex flex-col items-start z-10">
                    {product.isFeatured && (
                        <div className="px-2 py-1 bg-shopici-blue text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> VEDETTE
                        </div>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                        <div className="px-2 py-1 bg-shopici-coral text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <AlertTriangle size={10} /> CRITIQUE
                        </div>
                    )}
                </div>

                {hasDiscount && (
                    <div className="absolute bottom-0 left-0 bg-shopici-coral text-white px-2 py-1 text-[9px] font-black tracking-tighter border-t-2 border-r-2 border-shopici-black/10 z-10">
                        -{discountPercent}%
                    </div>
                )}

                {/* DESKTOP-ONLY ACTIONS */}
                <div className="hidden md:flex absolute top-2 right-2 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={handleEdit} className="p-2 bg-white border-2 border-shopici-black/30 hover:bg-shopici-black hover:text-white transition-all">
                        <Edit size={14} strokeWidth={2.5} />
                    </button>
                    <button onClick={confirmDelete} className="p-2 bg-white border-2 border-shopici-black/30 hover:bg-shopici-coral hover:text-white transition-all">
                        <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* 2. CONTENT SECTION */}
            <div className="p-3 md:p-4 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between items-start">
                        <span className="text-[8px] md:text-[9px] font-black text-shopici-black/30 uppercase tracking-[0.2em] truncate max-w-[70%]">
                            {product.category}
                        </span>
                        {!product.isAvailable && (
                            <span className="text-[8px] font-black text-shopici-coral uppercase tracking-tighter">OUT OF STOCK</span>
                        )}
                    </div>
                    <h3 className="font-black text-shopici-black text-xs md:text-sm uppercase leading-tight line-clamp-2">
                        {product.name}
                    </h3>
                </div>

                <div className="pt-2 border-t border-shopici-black/5">
                    <div className="flex items-baseline gap-2">
                        <p className="text-base md:text-lg font-black text-shopici-black tabular-nums">
                            {product.price.toLocaleString()} <span className="text-[9px]">XAF</span>
                        </p>
                        {hasDiscount && (
                            <p className="text-[10px] font-bold line-through text-shopici-black/20 tabular-nums">
                                {product.compareAtPrice!.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. MOBILE ACTION BAR */}
            <div className="md:hidden flex border-t-2 border-shopici-black/10 h-12">
                <button
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white active:bg-slate-100"
                >
                    <Edit size={14} /> Modifier
                </button>
                <div className="w-[2px] bg-shopici-black" />
                <button
                    onClick={confirmDelete}
                    className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-shopici-coral bg-white active:bg-shopici-coral/5"
                >
                    <Trash2 size={14} /> Supprimer
                </button>
            </div>
        </div>
    );
}