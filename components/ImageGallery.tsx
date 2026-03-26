"use client";

import { Package, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Product } from "@/types/Product";
import { CldImage } from 'next-cloudinary';

interface ImageGalleryProps {
    product: Product;
    selectedImage: number;
    onSelectImage: (idx: number) => void;
    onNext: () => void;
    onPrev: () => void;
    calculateDiscount: () => number;
}

export default function ImageGallery({
    product,
    selectedImage,
    onSelectImage,
    onNext,
    onPrev,
    calculateDiscount,
}: ImageGalleryProps) {
    const discount = calculateDiscount();

    return (
        <div className="space-y-6">
            {/* ── Main Display ── */}
            <div className="relative aspect-square bg-[var(--shopici-background)] rounded-[2rem] overflow-hidden group border border-shopici-gray/10 shadow-inner">
                {product.images.length > 0 ? (
                    <>
                        <CldImage
                            src={product.images[selectedImage].url}
                            alt={product.images[selectedImage].alt || product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />

                        {/* Navigation Arrows (Glass Effect) */}
                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={onPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 border border-white/30"
                                >
                                    <ChevronLeft className="w-6 h-6 text-shopici-black" />
                                </button>
                                <button
                                    onClick={onNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 border border-white/30"
                                >
                                    <ChevronRight className="w-6 h-6 text-shopici-black" />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-shopici-gray/10 to-shopici-blue/5 flex items-center justify-center">
                        <Package className="w-20 h-20 text-shopici-gray/30" />
                    </div>
                )}

                {/* ── Discount Badge (Editorial Style) ── */}
                {discount > 0 && (
                    <div className="absolute top-6 left-0 px-5 py-2 bg-shopici-coral text-white font-black text-xl uppercase tracking-tighter shadow-xl -skew-x-6 -translate-x-2">
                        -{discount}%
                    </div>
                )}

                {/* ── Low Stock Alert ── */}
                {/* {product.stock > 0 && product.stock < 10 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/90 backdrop-blur-sm border border-orange-500/20 text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-full shadow-lg flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        Plus que {product.stock} exemplaires
                    </div>
                )} */}
            </div>

            {/* ── Thumbnails Grid ── */}
            {/* ── Thumbnails Grid with Fixed Sizing & Coral Scrollbar ── */}
            {product.images.length > 1 && (
                <div
                    className={`
            flex gap-3 overflow-x-auto pt-2 pb-4 px-1
            /* Custom Tiny Coral Scrollbar */
            [&::-webkit-scrollbar]:h-[3px] 
            [&::-webkit-scrollbar-track]:bg-shopici-gray/5
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-shopici-coral
            [&::-webkit-scrollbar-thumb]:rounded-full
            [scrollbar-width:thin]
            [scrollbar-color:theme(colors.shopici-coral)_transparent]
        `}
                >
                    {product.images.map((img, idx) => (
                        <button
                            key={img.id || idx}
                            onClick={() => onSelectImage(idx)}
                            /* FIX: Added max-w-[80px] and min-w-[80px] to lock the size.
                               On desktop (md:), we bumped it slightly to 100px.
                            */
                            className={`relative min-w-[80px] max-w-[80px] md:min-w-[100px] md:max-w-[100px] aspect-square transition-all duration-300 p-1 rounded-2xl flex-shrink-0 ${selectedImage === idx
                                ? "ring-4 ring-shopici-blue ring-offset-2 scale-95"
                                : "opacity-70 hover:opacity-100 grayscale-[30%] hover:grayscale-0"
                                }`}
                        >
                            <div className="w-full h-full rounded-xl overflow-hidden relative shadow-sm border border-shopici-gray/10">
                                <CldImage
                                    src={img.url}
                                    alt={img.alt || `Vue ${idx + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 20vw, 10vw"
                                    className="object-cover"
                                />
                                {selectedImage === idx && (
                                    <div className="absolute inset-0 bg-shopici-blue/10" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}