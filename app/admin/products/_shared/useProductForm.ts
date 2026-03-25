"use client";

import { useRef, useState } from "react";
import type { ContentBlock } from "@/types/Product";
import type {
    ProductImage,
    Testimonial,
    DeliveryArea,
    CloudinaryUploadResult,
    ProductFormState,
} from "./ProductFormTypes";
import { defaultProductFormState } from "./ProductFormTypes";
import { useNotify } from "@/context/NotifyContext";

export const emptyBlock = (): ContentBlock => ({
    id: `block-${Date.now()}`,
    image: { id: "", url: "", alt: "" },
    eyebrow: "",
    heading: "",
    body: "",
    highlights: [],
});

/**
 * useProductForm
 *
 * Encapsulates all state and event handlers shared between the
 * New Product page and the Edit Product page.
 *
 * @param initialState - Pass `defaultProductFormState` for new products,
 *                       or a pre-populated object for editing.
 */
export function useProductForm(initialState: ProductFormState = defaultProductFormState) {
    const { notify } = useNotify();

    // ── Basic Info ────────────────────────────────────────────────────────────
    const [name, setName] = useState(initialState.name);
    const [slug, setSlug] = useState(initialState.slug);
    const [category, setCategory] = useState(initialState.category);
    const [shortDescription, setShortDescription] = useState(initialState.shortDescription);
    const [description, setDescription] = useState(initialState.description);
    const [tags, setTags] = useState<string[]>(initialState.tags);
    const [tagInput, setTagInput] = useState("");

    // ── Pricing & Stock ───────────────────────────────────────────────────────
    const [price, setPrice] = useState(initialState.price);
    const [compareAtPrice, setCompareAtPrice] = useState(initialState.compareAtPrice);
    const [stock, setStock] = useState(initialState.stock);
    const [isAvailable, setIsAvailable] = useState(initialState.isAvailable);
    const [isFeatured, setIsFeatured] = useState(initialState.isFeatured);

    // ── Images ────────────────────────────────────────────────────────────────
    const [images, setImages] = useState<ProductImage[]>(initialState.images);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newImageIds, setNewImageIds] = useState<Set<string>>(new Set());
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    // ── Delivery ──────────────────────────────────────────────────────────────
    const [deliveryAvailable, setDeliveryAvailable] = useState(initialState.deliveryAvailable);
    const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>(initialState.deliveryAreas);
    const [areaInput, setAreaInput] = useState("");
    const [estimatedDays, setEstimatedDays] = useState(initialState.estimatedDays);

    // ── Testimonials ──────────────────────────────────────────────────────────
    const [testimonials, setTestimonials] = useState<Testimonial[]>(initialState.testimonials);
    const [uploadingTestimonial, setUploadingTestimonial] = useState(false);
    const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);
    const [pendingTestimonial, setPendingTestimonial] = useState<{ id: string; url: string } | null>(null);
    const [cityInput, setCityInput] = useState("");
    const testimonialInputRef = useRef<HTMLInputElement | null>(null);

    // ── Content Blocks ────────────────────────────────────────────────────────
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(initialState.contentBlocks);
    const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
    const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());
    const [highlightInputs, setHighlightInputs] = useState<Record<string, string>>({});
    const [removingBlockId, setRemovingBlockId] = useState<string | null>(null);
    const [removingBlockImageId, setRemovingBlockImageId] = useState<string | null>(null);
    const blockImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // ── Form meta ─────────────────────────────────────────────────────────────
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // ── Cloudinary ────────────────────────────────────────────────────────────
    const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "shopici_admin");
        formData.append("cloud_name", "domw8nvul");
        const res = await fetch(`https://api.cloudinary.com/v1_1/domw8nvul/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return { url: data.secure_url, publicId: data.public_id };
    };

    const deleteFromCloudinary = async (publicId: string) => {
        await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
        });
    };

    // ── Image drag-and-drop ───────────────────────────────────────────────────
    const handleDragStart = (index: number) => setDraggedIndex(index);

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const next = [...images];
        const dragged = next[draggedIndex];
        next.splice(draggedIndex, 1);
        next.splice(index, 0, dragged);
        setDraggedIndex(index);
        setImages(next);
    };

    const handleDragEnd = () => setDraggedIndex(null);

    // ── Name / slug auto-sync ─────────────────────────────────────────────────
    const handleNameChange = (value: string) => {
        setName(value);
        if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-")) {
            setSlug(
                value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
            );
        }
    };

    // ── Images ────────────────────────────────────────────────────────────────
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingImage(true);
        setUploadProgress(0);
        try {
            for (let i = 0; i < files.length; i++) {
                const { url, publicId } = await uploadToCloudinary(files[i]);
                const newImg: ProductImage = { id: publicId, url, alt: name || "Product image" };
                setImages((prev) => [...prev, newImg]);
                setNewImageIds((prev) => new Set(prev).add(publicId));
                setTimeout(() => {
                    setNewImageIds((prev) => {
                        const n = new Set(prev);
                        n.delete(publicId);
                        return n;
                    });
                }, 600);
                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            }
            notify("Images ajoutées", `${files.length} image(s) uploadée(s) avec succès.`, "success");
        } catch {
            notify("Erreur Système", "Échec du téléchargement des images.", "error");
        } finally {
            setTimeout(() => {
                setUploadingImage(false);
                setUploadProgress(0);
            }, 500);
            if (imageInputRef.current) imageInputRef.current.value = "";
        }
    };

    const removeImage = async (img: ProductImage) => {
        setDeletingImageId(img.id);
        await new Promise((r) => setTimeout(r, 300));
        setImages((prev) => prev.filter((i) => i.id !== img.id));
        setDeletingImageId(null);
        try {
            await deleteFromCloudinary(img.id);
        } catch {
            notify("Erreur Système", "Impossible de supprimer l'image du serveur.", "error");
        }
    };

    // ── Tags ──────────────────────────────────────────────────────────────────
    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

    // ── Delivery ──────────────────────────────────────────────────────────────
    const addDeliveryArea = () => {
        if (areaInput.trim()) {
            setDeliveryAreas([...deliveryAreas, { id: `area-${Date.now()}`, name: areaInput.trim() }]);
            setAreaInput("");
        }
    };

    const removeDeliveryArea = (id: string) =>
        setDeliveryAreas(deliveryAreas.filter((a) => a.id !== id));

    // ── Testimonials ──────────────────────────────────────────────────────────
    const handleTestimonialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingTestimonial(true);
        try {
            const { url, publicId } = await uploadToCloudinary(file);
            setPendingTestimonial({ id: publicId, url });
        } catch {
            notify("ERREUR SYSTÈME", "Échec du transfert vers le Cloud", "error");
        } finally {
            setUploadingTestimonial(false);
            if (testimonialInputRef.current) testimonialInputRef.current.value = "";
        }
    };

    const confirmTestimonial = () => {
        if (!pendingTestimonial || !cityInput.trim()) return;
        setTestimonials((prev) => [
            ...prev,
            { id: pendingTestimonial.id, imageUrl: pendingTestimonial.url, city: cityInput },
        ]);
        notify("SYSTÈME", `Témoignage de ${cityInput} indexé`, "success");
        setPendingTestimonial(null);
        setCityInput("");
    };

    const removeTestimonial = async (test: Testimonial) => {
        setDeletingTestimonialId(test.id);
        await new Promise((r) => setTimeout(r, 300));
        setTestimonials((prev) => prev.filter((t) => t.id !== test.id));
        setDeletingTestimonialId(null);
        try {
            await deleteFromCloudinary(test.id);
        } catch {
            notify("Erreur", "Impossible de supprimer le témoignage.", "error");
        }
    };

    // ── Content Blocks ────────────────────────────────────────────────────────
    const addContentBlock = () => {
        const block = emptyBlock();
        setContentBlocks((prev) => [...prev, block]);
        setCollapsedBlocks((prev) => {
            const n = new Set(prev);
            n.delete(block.id);
            return n;
        });
    };

    const removeContentBlock = async (block: ContentBlock) => {
        setRemovingBlockId(block.id);
        await new Promise((r) => setTimeout(r, 300));
        if (block.image.id) await deleteFromCloudinary(block.image.id);
        setContentBlocks((prev) => prev.filter((b) => b.id !== block.id));
        setRemovingBlockId(null);
    };

    const updateBlock = (id: string, patch: Partial<ContentBlock>) =>
        setContentBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

    const toggleCollapse = (id: string) =>
        setCollapsedBlocks((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });

    const handleBlockImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        blockId: string
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBlockId(blockId);
        try {
            const { url, publicId } = await uploadToCloudinary(file);
            updateBlock(blockId, { image: { id: publicId, url, alt: "" } });
        } catch {
            notify("Erreur", "Échec du téléchargement. Veuillez réessayer.", "error");
        } finally {
            setUploadingBlockId(null);
            const ref = blockImageInputRefs.current[blockId];
            if (ref) ref.value = "";
        }
    };

    const removeBlockImage = async (block: ContentBlock) => {
        setRemovingBlockImageId(block.id);
        await new Promise((r) => setTimeout(r, 200));
        if (block.image.id) await deleteFromCloudinary(block.image.id);
        updateBlock(block.id, { image: { id: "", url: "", alt: "" } });
        setRemovingBlockImageId(null);
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

    const removeHighlight = (blockId: string, index: number) =>
        setContentBlocks((prev) =>
            prev.map((b) =>
                b.id === blockId
                    ? { ...b, highlights: (b.highlights ?? []).filter((_, i) => i !== index) }
                    : b
            )
        );

    const moveBlock = (index: number, direction: "up" | "down") => {
        const next = [...contentBlocks];
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= next.length) return;
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
        setContentBlocks(next);
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Le nom est requis";
        if (!slug.trim()) e.slug = "Le slug est requis";
        if (!category.trim()) e.category = "La catégorie est requise";
        if (!description.trim()) e.description = "La description est requise";
        if (!price || parseFloat(price) <= 0) e.price = "Le prix doit être supérieur à 0";
        if (!stock || parseInt(stock) < 0) e.stock = "Le stock doit être >= 0";
        if (images.length === 0) e.images = "Au moins une image est requise";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Progress checklist ────────────────────────────────────────────────────
    const progressItems = [
        { label: "Nom", done: !!name.trim() },
        { label: "Description", done: !!description.trim() },
        { label: "Prix", done: !!price && parseFloat(price) > 0 },
        { label: "Images", done: images.length > 0 },
        { label: "Catégorie", done: !!category.trim() },
    ];

    // ── Build product payload ─────────────────────────────────────────────────
    const buildPayload = (existingId?: string) => ({
        id: existingId ?? `prod-${Date.now()}`,
        slug,
        name,
        description,
        shortDescription: shortDescription || undefined,
        isFeatured,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        currency: "XAF" as const,
        images,
        category,
        tags: tags.length > 0 ? tags : undefined,
        stock: parseInt(stock),
        isAvailable,
        testimonials: testimonials.length > 0 ? testimonials : undefined,
        delivery: {
            available: deliveryAvailable,
            areas: deliveryAreas.map((a) => a.name),
            estimatedDays: estimatedDays || "2-5 jours",
        },
        contentBlocks: contentBlocks.filter((b) => b.image.url && b.heading.trim()),
        updatedAt: new Date().toISOString(),
    });

    return {
        // State
        name, slug, category, shortDescription, description,
        tags, tagInput, setTagInput,
        price, setPrice,
        compareAtPrice, setCompareAtPrice,
        stock, setStock,
        isAvailable, setIsAvailable,
        isFeatured, setIsFeatured,
        images,
        uploadingImage, uploadProgress, newImageIds, deletingImageId, draggedIndex,
        imageInputRef,
        deliveryAvailable, setDeliveryAvailable,
        deliveryAreas,
        areaInput, setAreaInput,
        estimatedDays, setEstimatedDays,
        testimonials,
        uploadingTestimonial, deletingTestimonialId,
        pendingTestimonial, cityInput, setCityInput,
        testimonialInputRef,
        contentBlocks,
        uploadingBlockId, collapsedBlocks,
        highlightInputs, setHighlightInputs,
        removingBlockId, removingBlockImageId,
        blockImageInputRefs,
        errors, isSaving, setIsSaving,
        progressItems,

        // Handlers
        handleNameChange,
        setSlug,
        setCategory,
        setShortDescription,
        setDescription,
        addTag, removeTag,
        handleDragStart, handleDragOver, handleDragEnd,
        handleImageUpload,
        removeImage,
        addDeliveryArea, removeDeliveryArea,
        handleTestimonialUpload,
        confirmTestimonial,
        removeTestimonial,
        setPendingTestimonial,
        addContentBlock,
        removeContentBlock,
        updateBlock,
        toggleCollapse,
        handleBlockImageUpload,
        removeBlockImage,
        addHighlight, removeHighlight,
        moveBlock,
        validate,
        buildPayload,
    };
}

export type ProductFormHook = ReturnType<typeof useProductForm>;