"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import FormField from "@/components/FormFields";
import Section from "@/components/Section";
import type { ContentBlock } from "@/types/Product";

import {
    ArrowLeft, Save, Upload, X, Plus, Trash2, ImageIcon,
    AlertCircle, Package, DollarSign, Tag, Truck, Star,
    MapPin, Layers, ChevronDown, ChevronUp, CheckCircle2,
    Loader2, AlertTriangle, Info, Eye, EyeOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
    id: string;
    url: string;
    alt?: string;
}

interface Testimonial {
    id: string;
    imageUrl: string;
    city: string;
}

interface DeliveryArea {
    id: string;
    name: string;
}

interface CloudinaryUploadResult {
    url: string;
    publicId: string;
}

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

// ─── Toast component ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => {
                const styles: Record<ToastType, string> = {
                    success: "bg-emerald-50 border-emerald-300 text-emerald-800",
                    error:   "bg-red-50 border-red-300 text-red-800",
                    warning: "bg-amber-50 border-amber-300 text-amber-800",
                    info:    "bg-shopici-blue/5 border-shopici-blue/30 text-shopici-blue",
                };
                const Icon = {
                    success: CheckCircle2,
                    error:   AlertCircle,
                    warning: AlertTriangle,
                    info:    Info,
                }[t.type];

                return (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-slide-in ${styles[t.type]}`}
                        style={{ animation: "slideIn 0.25s ease-out" }}
                    >
                        <Icon size={18} className="shrink-0 mt-0.5" />
                        <span className="text-sm font-medium flex-1">{t.message}</span>
                        <button onClick={() => onRemove(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    loading,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-shopici-charcoal/10 p-6 max-w-sm w-full mx-4 animate-scale-in"
                style={{ animation: "scaleIn 0.2s ease-out" }}>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-shopici-black text-lg">{title}</h3>
                        <p className="text-sm text-shopici-charcoal mt-1">{message}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-shopici-charcoal/20 text-shopici-charcoal font-semibold rounded-xl hover:bg-shopici-gray/10 transition-all disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {confirmLabel ?? "Supprimer"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Image skeleton ───────────────────────────────────────────────────────────

function ImageSkeleton() {
    return (
        <div className="aspect-square rounded-xl bg-shopici-gray/20 animate-pulse flex items-center justify-center">
            <ImageIcon size={28} className="text-shopici-charcoal/20" />
        </div>
    );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function UploadProgress({ active, label }: { active: boolean; label: string }) {
    if (!active) return null;
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-shopici-blue/5 border border-shopici-blue/20 rounded-xl">
            <Loader2 size={18} className="animate-spin text-shopici-blue shrink-0" />
            <span className="text-sm font-medium text-shopici-blue">{label}</span>
        </div>
    );
}

// ─── Empty block factory ──────────────────────────────────────────────────────

const emptyBlock = (): ContentBlock => ({
    id: `block-${Date.now()}`,
    image: { id: "", url: "", alt: "" },
    eyebrow: "",
    heading: "",
    body: "",
    highlights: [],
});

// ─── Animations (injected once) ───────────────────────────────────────────────

const ANIMATION_STYLES = `
@keyframes slideIn {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
}
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}
`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams();

    // Inject animations
    useEffect(() => {
        if (document.getElementById("edit-product-anims")) return;
        const style = document.createElement("style");
        style.id = "edit-product-anims";
        style.textContent = ANIMATION_STYLES;
        document.head.appendChild(style);
    }, []);

    // ── Toast system ─────────────────────────────────────────────────────────
    const [toasts, setToasts] = useState<Toast[]>([]);
    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const toastId = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id: toastId, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), duration);
    }, []);
    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── Confirm dialog ────────────────────────────────────────────────────────
    const [confirm, setConfirm] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        onConfirm: () => Promise<void>;
        loading: boolean;
    }>({ open: false, title: "", message: "", onConfirm: async () => {}, loading: false });

    const askConfirm = (opts: {
        title: string;
        message: string;
        confirmLabel?: string;
        onConfirm: () => Promise<void>;
    }) => {
        setConfirm({ open: true, loading: false, ...opts });
    };

    const runConfirm = async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        try {
            await confirm.onConfirm();
        } finally {
            setConfirm((prev) => ({ ...prev, open: false, loading: false }));
        }
    };

    // ── Basic Info ────────────────────────────────────────────────────────────
    const [name, setName]                     = useState("");
    const [slug, setSlug]                     = useState("");
    const [category, setCategory]             = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription]       = useState("");
    const [tags, setTags]                     = useState<string[]>([]);
    const [tagInput, setTagInput]             = useState("");

    // ── Pricing & Stock ───────────────────────────────────────────────────────
    const [price, setPrice]                   = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [stock, setStock]                   = useState("");
    const [isAvailable, setIsAvailable]       = useState(true);
    const [isFeatured, setIsFeatured]         = useState(false);

    // ── Images ────────────────────────────────────────────────────────────────
    const [images, setImages]                 = useState<ProductImage[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

    // ── Delivery ──────────────────────────────────────────────────────────────
    const [deliveryAvailable, setDeliveryAvailable] = useState(true);
    const [deliveryAreas, setDeliveryAreas]   = useState<DeliveryArea[]>([]);
    const [areaInput, setAreaInput]           = useState("");
    const [estimatedDays, setEstimatedDays]   = useState("");

    // ── Testimonials ──────────────────────────────────────────────────────────
    const [testimonials, setTestimonials]           = useState<Testimonial[]>([]);
    const [uploadingTestimonial, setUploadingTestimonial] = useState(false);
    const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);

    // ── Content Blocks ────────────────────────────────────────────────────────
    const [contentBlocks, setContentBlocks]   = useState<ContentBlock[]>([]);
    const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
    const [deletingBlockId, setDeletingBlockId]   = useState<string | null>(null);
    const [collapsedBlocks, setCollapsedBlocks]   = useState<Set<string>>(new Set());
    const [highlightInputs, setHighlightInputs]   = useState<Record<string, string>>({});
    const blockImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // ── Form state ────────────────────────────────────────────────────────────
    const [errors, setErrors]   = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const imageInputRef       = useRef<HTMLInputElement | null>(null);
    const testimonialInputRef = useRef<HTMLInputElement | null>(null);

    // Mark form dirty on any change
    useEffect(() => {
        if (!loading) setIsDirty(true);
    }, [name, slug, category, shortDescription, description, tags, price,
        compareAtPrice, stock, isAvailable, isFeatured, images, deliveryAvailable,
        deliveryAreas, estimatedDays, testimonials, contentBlocks]);

    // Warn on unload if dirty
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty && !isSaving) { e.preventDefault(); e.returnValue = ""; }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty, isSaving]);

    // ── Fetch product ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        async function fetchProduct() {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (!res.ok) {
                    const err = await res.json();
                    addToast("error", err.error || "Produit non trouvé");
                    router.back();
                    return;
                }
                const data = await res.json();
                setName(data.name);
                setSlug(data.slug);
                setCategory(data.category);
                setShortDescription(data.shortDescription || "");
                setDescription(data.description);
                setTags(data.tags || []);
                setImages(data.images || []);
                setTestimonials(data.testimonials || []);
                setPrice(data.price.toString());
                setCompareAtPrice(data.compareAtPrice?.toString() || "");
                setStock(data.stock.toString());
                setIsAvailable(data.isAvailable ?? true);
                setIsFeatured(data.isFeatured ?? false);
                setDeliveryAvailable(data.delivery.available);
                setDeliveryAreas(
                    (data.delivery.areas || []).map((a: string) => ({
                        id: `area-${Date.now()}-${a}`,
                        name: a,
                    }))
                );
                setEstimatedDays(data.delivery.estimatedDays || "");
                if (data.contentBlocks?.length) {
                    setContentBlocks(data.contentBlocks);
                    setCollapsedBlocks(new Set(data.contentBlocks.map((b: ContentBlock) => b.id)));
                }
                setLoading(false);
                // reset dirty after hydration
                setTimeout(() => setIsDirty(false), 100);
            } catch {
                addToast("error", "Impossible de charger le produit");
            }
        }
        fetchProduct();
    }, [id]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const handleNameChange = (value: string) => {
        setName(value);
        if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-")) {
            setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
        }
    };

    const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "shopici_admin");
        formData.append("cloud_name", "domw8nvul");
        const response = await fetch(`https://api.cloudinary.com/v1_1/domw8nvul/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        return { url: data.secure_url, publicId: data.public_id };
    };

    const patchProduct = async (patch: Record<string, unknown>) => {
        const res = await fetch(`/api/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Erreur de mise à jour");
        }
        return res.json();
    };

    // ── Image handlers ────────────────────────────────────────────────────────

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setUploadingImage(true);
        try {
            const uploaded: ProductImage[] = [];
            for (let i = 0; i < files.length; i++) {
                const { url, publicId } = await uploadToCloudinary(files[i]);
                uploaded.push({ id: publicId, url, alt: name || "Product image" });
            }
            const updatedImages = [...images, ...uploaded];
            setImages(updatedImages);
            await patchProduct({ images: updatedImages });
            addToast("success", `${uploaded.length} image(s) ajoutée(s) avec succès`);
        } catch {
            addToast("error", "Échec du téléchargement des images");
        } finally {
            setUploadingImage(false);
            if (imageInputRef.current) imageInputRef.current.value = "";
        }
    };

    const removeImage = async (img: ProductImage) => {
        askConfirm({
            title: "Supprimer cette image ?",
            message: "Cette action est irréversible. L'image sera supprimée de Cloudinary et de la base de données.",
            confirmLabel: "Supprimer",
            onConfirm: async () => {
                setDeletingImageId(img.id);
                try {
                    await fetch("/api/cloudinary/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ publicId: img.id }),
                    });
                    const updatedImages = images.filter((i) => i.id !== img.id);
                    setImages(updatedImages);
                    await patchProduct({ images: updatedImages });
                    addToast("success", "Image supprimée");
                } catch {
                    addToast("error", "Impossible de supprimer l'image. Réessayez.");
                } finally {
                    setDeletingImageId(null);
                }
            },
        });
    };

    // ── Testimonial handlers ──────────────────────────────────────────────────

    const handleTestimonialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const city = prompt("Ville du témoignage:");
        if (!city) return;
        setUploadingTestimonial(true);
        try {
            const { url, publicId } = await uploadToCloudinary(file);
            const updated = [...testimonials, { id: publicId, imageUrl: url, city }];
            setTestimonials(updated);
            await patchProduct({ testimonials: updated });
            addToast("success", "Témoignage ajouté avec succès");
        } catch {
            addToast("error", "Échec du téléchargement du témoignage");
        } finally {
            setUploadingTestimonial(false);
            if (testimonialInputRef.current) testimonialInputRef.current.value = "";
        }
    };

    const removeTestimonial = async (test: Testimonial) => {
        askConfirm({
            title: "Supprimer ce témoignage ?",
            message: `Le témoignage de "${test.city}" sera définitivement supprimé.`,
            onConfirm: async () => {
                setDeletingTestimonialId(test.id);
                try {
                    await fetch("/api/cloudinary/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ publicId: test.id }),
                    });
                    const updated = testimonials.filter((t) => t.id !== test.id);
                    setTestimonials(updated);
                    await patchProduct({ testimonials: updated });
                    addToast("success", "Témoignage supprimé");
                } catch {
                    addToast("error", "Impossible de supprimer le témoignage");
                } finally {
                    setDeletingTestimonialId(null);
                }
            },
        });
    };

    // ── Tags ──────────────────────────────────────────────────────────────────

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    // ── Delivery areas ────────────────────────────────────────────────────────

    const addDeliveryArea = () => {
        if (areaInput.trim()) {
            setDeliveryAreas([...deliveryAreas, { id: `area-${Date.now()}`, name: areaInput.trim() }]);
            setAreaInput("");
        }
    };

    // ── Content Block helpers ─────────────────────────────────────────────────

    const addContentBlock = () => {
        const block = emptyBlock();
        setContentBlocks((prev) => [...prev, block]);
        setCollapsedBlocks((prev) => {
            const next = new Set(prev);
            next.delete(block.id);
            return next;
        });
        setTimeout(() => {
            document.getElementById(`block-${block.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const removeContentBlock = async (block: ContentBlock) => {
        askConfirm({
            title: "Supprimer ce bloc ?",
            message: block.heading
                ? `Le bloc "${block.heading}" sera définitivement supprimé.`
                : "Ce bloc de contenu sera définitivement supprimé.",
            onConfirm: async () => {
                setDeletingBlockId(block.id);
                try {
                    if (block.image.id) {
                        await fetch("/api/cloudinary/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ publicId: block.image.id }),
                        });
                    }
                    const updated = contentBlocks.filter((b) => b.id !== block.id);
                    setContentBlocks(updated);
                    await patchProduct({ contentBlocks: updated });
                    addToast("success", "Bloc supprimé");
                } catch {
                    addToast("error", "Impossible de supprimer le bloc");
                } finally {
                    setDeletingBlockId(null);
                }
            },
        });
    };

    const updateBlock = (id: string, patch: Partial<ContentBlock>) => {
        setContentBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    };

    const toggleCollapse = (id: string) => {
        setCollapsedBlocks((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBlockId(blockId);
        try {
            const { url, publicId } = await uploadToCloudinary(file);
            updateBlock(blockId, { image: { id: publicId, url, alt: "" } });
            addToast("success", "Image du bloc téléchargée");
        } catch {
            addToast("error", "Échec du téléchargement. Veuillez réessayer.");
        } finally {
            setUploadingBlockId(null);
            const ref = blockImageInputRefs.current[blockId];
            if (ref) ref.value = "";
        }
    };

    const removeBlockImage = async (block: ContentBlock) => {
        askConfirm({
            title: "Supprimer l'image du bloc ?",
            message: "L'image sera supprimée de Cloudinary et du bloc immédiatement.",
            onConfirm: async () => {
                try {
                    if (block.image.id) {
                        await fetch("/api/cloudinary/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ publicId: block.image.id }),
                        });
                    }
                    const updated = contentBlocks.map((b) =>
                        b.id === block.id ? { ...b, image: { id: "", url: "", alt: "" } } : b
                    );
                    setContentBlocks(updated);
                    await patchProduct({ contentBlocks: updated });
                    addToast("success", "Image du bloc supprimée");
                } catch {
                    addToast("error", "Impossible de supprimer l'image du bloc");
                }
            },
        });
    };

    const addHighlight = (blockId: string) => {
        const val = (highlightInputs[blockId] ?? "").trim();
        if (!val) return;
        setContentBlocks((prev) =>
            prev.map((b) =>
                b.id === blockId ? { ...b, highlights: [...(b.highlights ?? []), val] } : b
            )
        );
        setHighlightInputs((prev) => ({ ...prev, [blockId]: "" }));
    };

    const removeHighlight = (blockId: string, index: number) => {
        setContentBlocks((prev) =>
            prev.map((b) =>
                b.id === blockId
                    ? { ...b, highlights: (b.highlights ?? []).filter((_, i) => i !== index) }
                    : b
            )
        );
    };

    const moveBlock = (index: number, direction: "up" | "down") => {
        const next = [...contentBlocks];
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= next.length) return;
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
        setContentBlocks(next);
    };

    // ── Validation & Save ─────────────────────────────────────────────────────

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Le nom est requis";
        if (!slug.trim()) newErrors.slug = "Le slug est requis";
        if (!category.trim()) newErrors.category = "La catégorie est requise";
        if (!description.trim()) newErrors.description = "La description est requise";
        if (!price || parseFloat(price) <= 0) newErrors.price = "Le prix doit être supérieur à 0";
        if (!stock || parseInt(stock) < 0) newErrors.stock = "Le stock doit être >= 0";
        if (images.length === 0) newErrors.images = "Au moins une image est requise";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            addToast("error", "Veuillez corriger les erreurs avant d'enregistrer");
            // Scroll to first error
            const firstErrorEl = document.querySelector("[data-error]");
            firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (!id) { addToast("error", "ID du produit manquant"); return; }

        setIsSaving(true);
        setSaveSuccess(false);

        const updatedProduct = {
            slug, name, description,
            shortDescription: shortDescription || undefined,
            isFeatured,
            price: parseFloat(price),
            compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
            currency: "XAF" as const,
            images, category,
            tags: tags.length ? tags : undefined,
            stock: parseInt(stock),
            isAvailable,
            testimonials: testimonials.length ? testimonials : undefined,
            delivery: {
                available: deliveryAvailable,
                areas: deliveryAreas.map((a) => a.name),
                estimatedDays: estimatedDays || "2-5 jours",
            },
            contentBlocks: contentBlocks.filter((b) => b.image.url && b.heading.trim()),
            updatedAt: new Date().toISOString(),
        };

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
            });
            const data = await res.json();
            if (!res.ok) {
                addToast("error", data.error || "Impossible de mettre à jour le produit");
                return;
            }
            setSaveSuccess(true);
            setIsDirty(false);
            addToast("success", "Produit mis à jour avec succès !");
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch {
            addToast("error", "Impossible de mettre à jour le produit");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="mx-auto space-y-6 animate-pulse">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-shopici-gray/20" />
                            <div className="space-y-2">
                                <div className="h-8 w-48 bg-shopici-gray/20 rounded-lg" />
                                <div className="h-1 w-24 bg-shopici-gray/20 rounded-full" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 w-24 bg-shopici-gray/20 rounded-xl" />
                            <div className="h-10 w-32 bg-shopici-gray/20 rounded-xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="border border-shopici-charcoal/10 rounded-2xl p-6 space-y-4">
                                    <div className="h-6 w-40 bg-shopici-gray/20 rounded-lg" />
                                    <div className="h-10 bg-shopici-gray/20 rounded-xl" />
                                    <div className="h-10 bg-shopici-gray/20 rounded-xl" />
                                    <div className="h-24 bg-shopici-gray/20 rounded-xl" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-6">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="border border-shopici-charcoal/10 rounded-2xl p-6 space-y-4">
                                    <div className="h-6 w-32 bg-shopici-gray/20 rounded-lg" />
                                    <div className="h-10 bg-shopici-gray/20 rounded-xl" />
                                    <div className="h-10 bg-shopici-gray/20 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Central spinner overlay */}
                <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-shopici-charcoal/10 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-shopici-blue border-t-shopici-coral rounded-full animate-spin" />
                        <p className="text-base font-semibold text-shopici-black">
                            Chargement du produit…
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Global toast container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Confirm dialog */}
            <ConfirmDialog
                open={confirm.open}
                title={confirm.title}
                message={confirm.message}
                confirmLabel={confirm.confirmLabel}
                loading={confirm.loading}
                onConfirm={runConfirm}
                onCancel={() => setConfirm((prev) => ({ ...prev, open: false }))}
            />

            {/* Saving overlay */}
            {isSaving && (
                <div className="fixed inset-0 z-[9990] bg-black/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl border border-shopici-charcoal/10 flex flex-col items-center gap-3">
                        <Loader2 size={36} className="animate-spin text-shopici-blue" />
                        <p className="font-semibold text-shopici-black">Enregistrement en cours…</p>
                    </div>
                </div>
            )}

            <div className="min-h-screen">
                <div className="mx-auto space-y-6">

                    {/* ── Header ── */}
                    <div className="relative">
                        {/* Unsaved changes indicator */}
                        {isDirty && !isSaving && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-medium mb-3 w-fit">
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                Modifications non enregistrées
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-medium mb-3 w-fit"
                                style={{ animation: "fadeUp 0.3s ease-out" }}>
                                <CheckCircle2 size={14} />
                                Enregistré avec succès
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                                <button onClick={() => {
                                    if (isDirty && !window.confirm("Vous avez des modifications non enregistrées. Quitter quand même ?")) return;
                                    router.back();
                                }} className="p-2 hover:bg-shopici-gray/20 rounded-lg transition-colors">
                                    <ArrowLeft size={24} className="text-shopici-charcoal" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-shopici-black mb-2 truncate">
                                        Modifier Produit
                                    </h1>
                                    <div className="h-1 w-24 bg-gradient-to-r from-shopici-coral via-shopici-blue to-transparent rounded-full" />
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap sm:flex-nowrap mt-3 sm:mt-0">
                                <button
                                    onClick={() => router.back()}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white border border-shopici-charcoal/10 text-shopici-charcoal hover:border-shopici-charcoal/30 font-bold rounded-xl transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 border-2 border-white/20 disabled:opacity-50 ${
                                        saveSuccess
                                            ? "bg-emerald-500 text-white"
                                            : "bg-gradient-to-r from-shopici-blue to-shopici-coral text-white hover:scale-105"
                                    }`}
                                >
                                    {isSaving ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : saveSuccess ? (
                                        <CheckCircle2 size={18} />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    <span className="truncate">
                                        {isSaving ? "Enregistrement…" : saveSuccess ? "Enregistré !" : "Enregistrer"}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Left Column ── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Basic Info */}
                            <Section icon={<Package size={20} />} title="Informations de base">
                                <FormField label="Nom du produit" required error={errors.name}>
                                    <div data-error={errors.name ? true : undefined}>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            placeholder="Ex: Robe Africaine Élégante"
                                            className={`input-field transition-all ${errors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
                                        />
                                    </div>
                                </FormField>
                                <FormField label="Slug URL" required error={errors.slug}>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="robe-africaine-elegante"
                                        className={`input-field ${errors.slug ? "border-red-400 ring-2 ring-red-100" : ""}`}
                                    />
                                    {slug && (
                                        <p className="text-xs text-shopici-charcoal/50 mt-1">
                                            URL : /produits/<span className="font-mono text-shopici-blue">{slug}</span>
                                        </p>
                                    )}
                                </FormField>
                                <FormField label="Catégorie" required error={errors.category}>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="Ex: Mode Femme, Accessoires…"
                                        className={`input-field ${errors.category ? "border-red-400 ring-2 ring-red-100" : ""}`}
                                    />
                                </FormField>
                                <FormField label="Description courte">
                                    <textarea
                                        value={shortDescription}
                                        onChange={(e) => setShortDescription(e.target.value)}
                                        placeholder="Résumé rapide du produit…"
                                        rows={2}
                                        className="input-field"
                                    />
                                    <p className="text-xs text-shopici-charcoal/40 mt-1 text-right">
                                        {shortDescription.length} caractères
                                    </p>
                                </FormField>
                                <FormField label="Description complète" required error={errors.description}>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description détaillée du produit…"
                                        rows={6}
                                        className={`input-field ${errors.description ? "border-red-400 ring-2 ring-red-100" : ""}`}
                                    />
                                    <p className="text-xs text-shopici-charcoal/40 mt-1 text-right">
                                        {description.length} caractères
                                    </p>
                                </FormField>
                                <FormField label="Tags">
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                                placeholder="Ajouter un tag… (Entrée pour valider)"
                                                className="input-field flex-1"
                                            />
                                            <button
                                                onClick={addTag}
                                                type="button"
                                                disabled={!tagInput.trim()}
                                                className="px-4 py-2 bg-shopici-blue/10 text-shopici-blue hover:bg-shopici-blue/20 rounded-lg font-semibold transition-all disabled:opacity-40"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-3 py-1 bg-shopici-gray/20 text-shopici-charcoal rounded-lg flex items-center gap-2 text-sm group"
                                                        style={{ animation: "fadeUp 0.2s ease-out" }}
                                                    >
                                                        {tag}
                                                        <button
                                                            onClick={() => setTags(tags.filter((t) => t !== tag))}
                                                            className="text-shopici-charcoal/40 hover:text-shopici-coral transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormField>
                            </Section>

                            {/* Images */}
                            <Section icon={<ImageIcon size={20} />} title={`Images (${images.length})`} error={errors.images}>
                                <UploadProgress active={uploadingImage} label="Téléchargement des images en cours…" />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            className="relative group aspect-square rounded-xl overflow-hidden border border-shopici-charcoal/10 transition-all"
                                            style={{ animation: "fadeUp 0.3s ease-out" }}
                                        >
                                            {deletingImageId === img.id ? (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                                    <Loader2 size={24} className="animate-spin text-shopici-coral" />
                                                </div>
                                            ) : null}
                                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-shopici-blue text-white text-xs font-bold rounded">
                                                    Principal
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                            <button
                                                onClick={() => removeImage(img)}
                                                disabled={deletingImageId === img.id}
                                                className="absolute top-2 right-2 p-1.5 bg-shopici-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {uploadingImage && <ImageSkeleton />}
                                    <label className="aspect-square border border-dashed border-shopici-charcoal/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-shopici-blue/50 hover:bg-shopici-blue/5 transition-all">
                                        <Upload size={32} className="text-shopici-charcoal/50 mb-2" />
                                        <span className="text-sm font-semibold text-shopici-charcoal">
                                            {uploadingImage ? "Téléchargement…" : "Ajouter image"}
                                        </span>
                                        <span className="text-xs text-shopici-charcoal/40 mt-1">PNG, JPG, WEBP</span>
                                        <input
                                            ref={imageInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                </div>
                            </Section>

                            {/* Content Blocks */}
                            <Section icon={<Layers size={20} />} title="Sections alternées (Image + Texte)">
                                <div className="bg-shopici-blue/5 border border-shopici-blue/20 rounded-xl p-4 mb-5">
                                    <div className="flex gap-3">
                                        <Info size={18} className="text-shopici-blue flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-shopici-charcoal">
                                            <p className="font-semibold mb-1">Blocs de contenu enrichis</p>
                                            <p>Chaque bloc affiche une image et du texte en alternance. Seuls les blocs avec image <strong>et</strong> titre sont sauvegardés.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {contentBlocks.map((block, index) => {
                                        const isCollapsed = collapsedBlocks.has(block.id);
                                        const isUploading = uploadingBlockId === block.id;
                                        const isDeleting  = deletingBlockId === block.id;

                                        return (
                                            <div
                                                key={block.id}
                                                id={`block-${block.id}`}
                                                className={`border rounded-xl overflow-hidden transition-all ${
                                                    isDeleting
                                                        ? "opacity-50 border-red-200"
                                                        : "border-shopici-charcoal/10"
                                                }`}
                                                style={{ animation: "fadeUp 0.25s ease-out" }}
                                            >
                                                {/* Block header */}
                                                <div className="flex items-center gap-3 px-4 py-3 bg-shopici-gray/10">
                                                    <span className="shrink-0 w-7 h-7 rounded-full bg-shopici-blue text-white text-xs font-bold flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    {isCollapsed && block.image.url && (
                                                        <img
                                                            src={block.image.url}
                                                            alt=""
                                                            className="w-8 h-8 rounded-md object-cover shrink-0 border border-shopici-charcoal/10"
                                                        />
                                                    )}
                                                    <span className="flex-1 text-sm font-semibold text-shopici-black truncate">
                                                        {block.heading.trim() || (
                                                            <span className="text-shopici-charcoal/40 italic">Nouveau bloc</span>
                                                        )}
                                                    </span>

                                                    {/* Completion indicator */}
                                                    {block.image.url && block.heading.trim() ? (
                                                        <span className="shrink-0 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                                                            Complet
                                                        </span>
                                                    ) : (
                                                        <span className="shrink-0 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                                                            Incomplet
                                                        </span>
                                                    )}

                                                    {/* Move up/down */}
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => moveBlock(index, "up")}
                                                            disabled={index === 0}
                                                            className="p-1 rounded hover:bg-shopici-charcoal/10 disabled:opacity-30 transition-colors"
                                                            title="Monter"
                                                        >
                                                            <ChevronUp size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => moveBlock(index, "down")}
                                                            disabled={index === contentBlocks.length - 1}
                                                            className="p-1 rounded hover:bg-shopici-charcoal/10 disabled:opacity-30 transition-colors"
                                                            title="Descendre"
                                                        >
                                                            <ChevronDown size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => removeContentBlock(block)}
                                                        disabled={isDeleting}
                                                        className="p-1.5 text-shopici-coral hover:bg-shopici-coral/10 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Supprimer"
                                                    >
                                                        {isDeleting
                                                            ? <Loader2 size={16} className="animate-spin" />
                                                            : <Trash2 size={16} />
                                                        }
                                                    </button>

                                                    {/* Collapse toggle */}
                                                    <button
                                                        onClick={() => toggleCollapse(block.id)}
                                                        className="p-1.5 hover:bg-shopici-charcoal/10 rounded-lg transition-colors"
                                                        title={isCollapsed ? "Développer" : "Réduire"}
                                                    >
                                                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                                    </button>
                                                </div>

                                                {/* Block body */}
                                                {!isCollapsed && (
                                                    <div className="p-5 space-y-5">
                                                        {/* Image */}
                                                        <FormField label="Image du bloc" required>
                                                            {block.image.url ? (
                                                                <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-shopici-charcoal/10">
                                                                    <img src={block.image.url} alt={block.image.alt} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                                                    <button
                                                                        onClick={() => removeBlockImage(block)}
                                                                        className="absolute top-2 right-2 p-1.5 bg-shopici-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <label className={`flex flex-col items-center justify-center w-full aspect-video border border-dashed rounded-xl cursor-pointer transition-all ${
                                                                    isUploading
                                                                        ? "border-shopici-blue/50 bg-shopici-blue/5"
                                                                        : "border-shopici-charcoal/30 hover:border-shopici-blue/50 hover:bg-shopici-blue/5"
                                                                }`}>
                                                                    {isUploading ? (
                                                                        <>
                                                                            <Loader2 size={28} className="animate-spin text-shopici-blue mb-2" />
                                                                            <span className="text-sm font-semibold text-shopici-blue">Téléchargement…</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Upload size={28} className="text-shopici-charcoal/50 mb-2" />
                                                                            <span className="text-sm font-semibold text-shopici-charcoal">Uploader une image</span>
                                                                            <span className="text-xs text-shopici-charcoal/50 mt-1">16:9 recommandé</span>
                                                                        </>
                                                                    )}
                                                                    <input
                                                                        ref={(el) => { blockImageInputRefs.current[block.id] = el; }}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleBlockImageUpload(e, block.id)}
                                                                        className="hidden"
                                                                        disabled={isUploading}
                                                                    />
                                                                </label>
                                                            )}
                                                        </FormField>

                                                        {/* Eyebrow */}
                                                        <FormField label="Label eyebrow (optionnel)">
                                                            <input
                                                                type="text"
                                                                value={block.eyebrow ?? ""}
                                                                onChange={(e) => updateBlock(block.id, { eyebrow: e.target.value })}
                                                                placeholder="Ex: Matériaux premium"
                                                                className="input-field"
                                                            />
                                                        </FormField>

                                                        {/* Heading */}
                                                        <FormField label="Titre du bloc" required>
                                                            <input
                                                                type="text"
                                                                value={block.heading}
                                                                onChange={(e) => updateBlock(block.id, { heading: e.target.value })}
                                                                placeholder="Ex: Fabriqué pour durer"
                                                                className="input-field"
                                                            />
                                                        </FormField>

                                                        {/* Body */}
                                                        <FormField label="Texte descriptif" required>
                                                            <textarea
                                                                value={block.body}
                                                                onChange={(e) => updateBlock(block.id, { body: e.target.value })}
                                                                placeholder={"Décrivez cette caractéristique...\n\nUtilisez des sauts de ligne pour créer des paragraphes."}
                                                                rows={4}
                                                                className="input-field"
                                                            />
                                                            <p className="text-xs text-shopici-charcoal/40 mt-1 flex justify-between">
                                                                <span>Les sauts de ligne créent des paragraphes distincts.</span>
                                                                <span>{block.body.length} car.</span>
                                                            </p>
                                                        </FormField>

                                                        {/* Highlights */}
                                                        <FormField label="Points clés (optionnel)">
                                                            <div className="space-y-2">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={highlightInputs[block.id] ?? ""}
                                                                        onChange={(e) => setHighlightInputs((prev) => ({ ...prev, [block.id]: e.target.value }))}
                                                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight(block.id))}
                                                                        placeholder="Ex: Garantie 2 ans incluse"
                                                                        className="input-field flex-1"
                                                                    />
                                                                    <button
                                                                        onClick={() => addHighlight(block.id)}
                                                                        type="button"
                                                                        disabled={!(highlightInputs[block.id] ?? "").trim()}
                                                                        className="px-4 py-2 bg-shopici-blue/10 text-shopici-blue hover:bg-shopici-blue/20 rounded-lg font-semibold transition-all disabled:opacity-40"
                                                                    >
                                                                        <Plus size={18} />
                                                                    </button>
                                                                </div>
                                                                {(block.highlights ?? []).length > 0 && (
                                                                    <ul className="space-y-2">
                                                                        {(block.highlights ?? []).map((h, i) => (
                                                                            <li
                                                                                key={i}
                                                                                className="flex items-center gap-2 px-3 py-2 bg-shopici-gray/10 rounded-lg text-sm text-shopici-charcoal"
                                                                                style={{ animation: "fadeUp 0.2s ease-out" }}
                                                                            >
                                                                                <span className="w-5 h-5 rounded-full bg-shopici-blue/20 text-shopici-blue text-[10px] font-bold flex items-center justify-center shrink-0">✓</span>
                                                                                <span className="flex-1">{h}</span>
                                                                                <button
                                                                                    onClick={() => removeHighlight(block.id, i)}
                                                                                    className="text-shopici-coral/60 hover:text-shopici-coral transition-colors"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </FormField>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <button
                                        onClick={addContentBlock}
                                        type="button"
                                        className="w-full py-4 border border-dashed border-shopici-charcoal/30 rounded-xl flex items-center justify-center gap-2 text-shopici-charcoal font-semibold hover:border-shopici-blue/50 hover:bg-shopici-blue/5 hover:text-shopici-blue transition-all"
                                    >
                                        <Plus size={20} />
                                        Ajouter un bloc de contenu
                                    </button>
                                </div>
                            </Section>

                            {/* Delivery */}
                            <Section icon={<Truck size={20} />} title="Livraison">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-shopici-gray/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={deliveryAvailable}
                                            onChange={(e) => setDeliveryAvailable(e.target.checked)}
                                            className="w-5 h-5 text-shopici-blue rounded"
                                        />
                                        <div>
                                            <span className="font-semibold text-shopici-black">Livraison disponible</span>
                                            <p className="text-xs text-shopici-charcoal/60">Activer pour afficher les options de livraison</p>
                                        </div>
                                    </label>
                                    {deliveryAvailable && (
                                        <div className="pl-4 border-l-2 border-shopici-blue/20 space-y-4" style={{ animation: "fadeUp 0.2s ease-out" }}>
                                            <FormField label="Délai estimé">
                                                <input
                                                    type="text"
                                                    value={estimatedDays}
                                                    onChange={(e) => setEstimatedDays(e.target.value)}
                                                    placeholder="Ex: 2-5 jours"
                                                    className="input-field"
                                                />
                                            </FormField>
                                            <FormField label="Zones de livraison">
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={areaInput}
                                                            onChange={(e) => setAreaInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDeliveryArea())}
                                                            placeholder="Ex: Douala, Yaoundé…"
                                                            className="input-field flex-1"
                                                        />
                                                        <button
                                                            onClick={addDeliveryArea}
                                                            type="button"
                                                            disabled={!areaInput.trim()}
                                                            className="px-4 py-2 bg-shopici-coral/10 text-shopici-coral hover:bg-shopici-coral/20 rounded-lg font-semibold transition-all disabled:opacity-40"
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {deliveryAreas.map((area) => (
                                                            <span
                                                                key={area.id}
                                                                className="px-3 py-1 bg-shopici-blue/10 text-shopici-blue rounded-lg flex items-center gap-2 text-sm"
                                                                style={{ animation: "fadeUp 0.2s ease-out" }}
                                                            >
                                                                <MapPin size={12} />
                                                                {area.name}
                                                                <button
                                                                    onClick={() => setDeliveryAreas(deliveryAreas.filter((a) => a.id !== area.id))}
                                                                    className="text-shopici-blue/60 hover:text-shopici-coral transition-colors"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </FormField>
                                        </div>
                                    )}
                                </div>
                            </Section>

                            {/* Testimonials */}
                            <Section icon={<Star size={20} />} title={`Témoignages (${testimonials.length})`}>
                                <div className="bg-shopici-blue/5 border border-shopici-blue/20 rounded-xl p-4 mb-4">
                                    <div className="flex gap-3">
                                        <Info size={18} className="text-shopici-blue flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-shopici-charcoal">
                                            <p className="font-semibold mb-1">Témoignages contrôlés par admin</p>
                                            <p>Uploadez des photos de clients satisfaits avec leur ville.</p>
                                        </div>
                                    </div>
                                </div>
                                <UploadProgress active={uploadingTestimonial} label="Téléchargement du témoignage en cours…" />
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {testimonials.map((test) => (
                                        <div
                                            key={test.id}
                                            className="relative group"
                                            style={{ animation: "fadeUp 0.3s ease-out" }}
                                        >
                                            <div className={`aspect-square rounded-xl overflow-hidden border border-shopici-charcoal/10 transition-all ${
                                                deletingTestimonialId === test.id ? "opacity-40" : ""
                                            }`}>
                                                {deletingTestimonialId === test.id && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60">
                                                        <Loader2 size={20} className="animate-spin text-shopici-coral" />
                                                    </div>
                                                )}
                                                <img src={test.imageUrl} alt={test.city} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                                            </div>
                                            <div className="mt-2 text-center">
                                                <p className="text-sm font-semibold text-shopici-charcoal flex items-center justify-center gap-1">
                                                    <MapPin size={12} /> {test.city}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeTestimonial(test)}
                                                disabled={deletingTestimonialId === test.id}
                                                className="absolute top-2 right-2 p-1.5 bg-shopici-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {uploadingTestimonial && <ImageSkeleton />}
                                    <label className="aspect-square border border-dashed border-shopici-charcoal/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-shopici-coral/50 hover:bg-shopici-coral/5 transition-all">
                                        <Upload size={24} className="text-shopici-charcoal/50 mb-2" />
                                        <span className="text-xs font-semibold text-shopici-charcoal text-center px-2">
                                            {uploadingTestimonial ? "Upload…" : "Ajouter"}
                                        </span>
                                        <input
                                            ref={testimonialInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleTestimonialUpload}
                                            className="hidden"
                                            disabled={uploadingTestimonial}
                                        />
                                    </label>
                                </div>
                            </Section>
                        </div>

                        {/* ── Right Column ── */}
                        <div className="space-y-6">
                            <Section icon={<DollarSign size={20} />} title="Prix & Stock">
                                <FormField label="Prix" required error={errors.price}>
                                    <div className="relative" data-error={errors.price ? true : undefined}>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0"
                                            className={`input-field pr-16 ${errors.price ? "border-red-400 ring-2 ring-red-100" : ""}`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-shopici-charcoal font-semibold text-sm">XAF</span>
                                    </div>
                                </FormField>
                                <FormField label="Prix barré (optionnel)">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={compareAtPrice}
                                            onChange={(e) => setCompareAtPrice(e.target.value)}
                                            placeholder="0"
                                            className="input-field pr-16"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-shopici-charcoal font-semibold text-sm">XAF</span>
                                    </div>
                                    {price && compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                            <Tag size={12} />
                                            Réduction de {Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100)}%
                                        </div>
                                    )}
                                </FormField>
                                <FormField label="Stock" required error={errors.stock}>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        placeholder="0"
                                        className={`input-field ${errors.stock ? "border-red-400 ring-2 ring-red-100" : ""}`}
                                    />
                                    {stock && parseInt(stock) < 5 && parseInt(stock) >= 0 && (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                            <AlertTriangle size={12} />
                                            Stock faible ({stock} restant{parseInt(stock) > 1 ? "s" : ""})
                                        </div>
                                    )}
                                    {stock && parseInt(stock) === 0 && (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                            <AlertCircle size={12} />
                                            Rupture de stock
                                        </div>
                                    )}
                                </FormField>
                            </Section>

                            <Section icon={<Tag size={20} />} title="Statut">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-shopici-gray/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={isAvailable}
                                            onChange={(e) => setIsAvailable(e.target.checked)}
                                            className="w-5 h-5 text-shopici-blue rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-shopici-black flex items-center gap-2">
                                                Produit disponible
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                    isAvailable
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-shopici-gray/20 text-shopici-charcoal/60"
                                                }`}>
                                                    {isAvailable ? "En ligne" : "Hors ligne"}
                                                </span>
                                            </p>
                                            <p className="text-xs text-shopici-charcoal/60">Visible et achetable sur le site</p>
                                        </div>
                                        {isAvailable ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-shopici-charcoal/40" />}
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-shopici-gray/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={isFeatured}
                                            onChange={(e) => setIsFeatured(e.target.checked)}
                                            className="w-5 h-5 text-shopici-blue rounded"
                                        />
                                        <div>
                                            <p className="font-semibold text-shopici-black flex items-center gap-2">
                                                Produit en vedette
                                                {isFeatured && <Star size={14} className="text-amber-400 fill-amber-400" />}
                                            </p>
                                            <p className="text-xs text-shopici-charcoal/60">Affiché en priorité sur la page d'accueil</p>
                                        </div>
                                    </label>
                                </div>
                            </Section>

                            {/* Quick stats card */}
                            <div className="border border-shopici-charcoal/10 rounded-2xl p-5 space-y-3">
                                <h3 className="font-bold text-shopici-black text-sm uppercase tracking-wide">Récapitulatif</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-shopici-charcoal">Images</span>
                                        <span className={`font-semibold ${images.length === 0 ? "text-red-500" : "text-shopici-black"}`}>
                                            {images.length} {images.length < 3 ? "⚠️" : "✅"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-shopici-charcoal">Blocs contenu</span>
                                        <span className="font-semibold text-shopici-black">
                                            {contentBlocks.filter(b => b.image.url && b.heading.trim()).length} / {contentBlocks.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-shopici-charcoal">Témoignages</span>
                                        <span className="font-semibold text-shopici-black">{testimonials.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-shopici-charcoal">Tags</span>
                                        <span className="font-semibold text-shopici-black">{tags.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 border border-shopici-charcoal/10 rounded-2xl p-5">
                                <h3 className="font-bold text-shopici-black mb-3 flex items-center gap-2 text-sm">
                                    <Info size={16} className="text-shopici-blue" />
                                    Conseils rapides
                                </h3>
                                <ul className="space-y-2 text-sm text-shopici-charcoal">
                                    <li className="flex gap-2"><span className="text-shopici-blue">•</span><span>3-5 images de qualité minimum</span></li>
                                    <li className="flex gap-2"><span className="text-shopici-coral">•</span><span>Description claire = plus de ventes</span></li>
                                    <li className="flex gap-2"><span className="text-shopici-blue">•</span><span>Tags pertinents pour la recherche</span></li>
                                    <li className="flex gap-2"><span className="text-shopici-coral">•</span><span>Les blocs image+texte augmentent la conversion</span></li>
                                    <li className="flex gap-2"><span className="text-shopici-blue">•</span><span>Témoignages renforcent la confiance</span></li>
                                </ul>
                            </div>

                            {/* Sticky save button on mobile */}
                            <div className="lg:hidden sticky bottom-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border border-white/20 disabled:opacity-50 ${
                                        saveSuccess
                                            ? "bg-emerald-500 text-white"
                                            : "bg-gradient-to-r from-shopici-blue to-shopici-coral text-white"
                                    }`}
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
                                    {isSaving ? "Enregistrement…" : saveSuccess ? "Enregistré !" : "Enregistrer les modifications"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}