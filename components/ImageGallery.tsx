import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/Product";

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
    return (
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
                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={onPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft className="w-6 h-6 text-shopici-black" />
                                </button>
                                <button
                                    onClick={onNext}
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

                {product.compareAtPrice && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-shopici-coral text-white font-bold text-lg rounded-full shadow-lg">
                        -{calculateDiscount()}%
                    </div>
                )}

                {product.stock < 10 && (
                    <div className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white font-semibold text-sm rounded-full shadow-lg animate-pulse">
                        Plus que {product.stock} en stock!
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => onSelectImage(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImage === idx
                                    ? "border-shopici-blue ring-2 ring-shopici-blue/30"
                                    : "border-shopici-gray/30 hover:border-shopici-blue/50"
                            }`}
                        >
                            <img src={img.url} alt={img.alt || `Vue ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}