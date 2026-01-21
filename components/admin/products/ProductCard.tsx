import { Edit, Trash2, ImageIcon } from "lucide-react";
import type { Product } from "@/types/Product";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, onDelete }: { product: Product, onDelete: (id: string) => void; }) {
    const router = useRouter();

    const hasDiscount =
        product.compareAtPrice && product.compareAtPrice > product.price;

    const discountPercent = hasDiscount
        ? Math.round(
            ((product.compareAtPrice! - product.price) /
                product.compareAtPrice!) *
            100
        )
        : 0;
    const handleEdit = () => {
        router.push(`/admin/products/${product._id}`);
    };

    const handleDelete = async () => {
        const confirmed = confirm(
            `Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`
        );
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/products/${product._id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Erreur lors de la suppression");

            alert("Produit supprimé avec succès");
            onDelete(product._id);
        } catch (error) {
            alert("Impossible de supprimer le produit. Réessayez.");
            console.error(error);
        }
    };

    return (
        <div className="group bg-white dark:bg-shopici-charcoal/95 rounded-2xl hover:shadow-sm border border-shopici-charcoal/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
            {/* Image */}
            <div className="relative aspect-square bg-shopici-gray/10 overflow-hidden">
                {product.images[0] ? (
                    <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={48} className="text-shopici-charcoal/30" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isFeatured && (
                        <span className="px-2 py-1 bg-shopici-blue text-white text-xs font-bold rounded-lg">
                            VEDETTE
                        </span>
                    )}
                    {!product.isAvailable && (
                        <span className="px-2 py-1 bg-shopici-charcoal text-white text-xs font-bold rounded-lg">
                            INDISPONIBLE
                        </span>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                        <span className="px-2 py-1 bg-shopici-coral text-white text-xs font-bold rounded-lg">
                            STOCK BAS
                        </span>
                    )}
                </div>

                {hasDiscount && (
                    <div className="absolute top-3 right-3 w-12 h-12 bg-shopici-coral rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                            -{discountPercent}%
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleEdit}
                        className="p-2 bg-white hover:bg-shopici-blue hover:text-white rounded-lg transition-colors"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 bg-white hover:bg-shopici-coral hover:text-white rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <span className="text-xs font-semibold text-shopici-blue uppercase">
                    {product.category}
                </span>

                <h3 className="mt-2 font-bold text-shopici-black dark:text-shopici-foreground line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold">
                        {product.price.toLocaleString()} XAF
                    </span>
                    {hasDiscount && (
                        <span className="text-sm line-through text-shopici-charcoal">
                            {product.compareAtPrice!.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className="mt-3 text-xs text-shopici-charcoal">
                    Livraison:{" "}
                    {product.delivery.available
                        ? product.delivery.estimatedDays
                        : "Non"}
                </div>
            </div>
        </div>
    );
}
