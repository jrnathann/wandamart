import { Edit, Trash2, ImageIcon } from "lucide-react";
import type { Product } from "@/types/Product";
import { useRouter } from "next/navigation";

export default function ProductListItem({ product, onDelete }: { product: Product, onDelete: (id: string) => void; }) {
    const router = useRouter();

    const hasDiscount =
        product.compareAtPrice && product.compareAtPrice > product.price;
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
        <div className="bg-white dark:bg-shopici-charcoal/95 rounded-2xl hover:shadow-sm border border-shopici-charcoal/10 p-4 flex gap-4">
            <div className="w-24 h-24 bg-shopici-gray/10 rounded-xl overflow-hidden">
                {product.images[0] ? (
                    <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-shopici-charcoal/30" />
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-shopici-black dark:text-shopici-foreground">
                    {product.name}
                </h3>
                <p className="text-sm text-shopici-charcoal line-clamp-2">
                    {product.shortDescription || product.description}
                </p>

                <div className="mt-2 font-bold">
                    {product.price.toLocaleString()} XAF
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button onClick={handleEdit} className="p-2 bg-shopici-blue/10 hover:bg-shopici-blue hover:text-white rounded-lg">
                    <Edit size={18} />
                </button>
                <button onClick={handleDelete} className="p-2 bg-shopici-coral/10 hover:bg-shopici-coral hover:text-white rounded-lg">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
