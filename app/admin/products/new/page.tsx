"use client";

import { useRef, useState } from "react";
import FormField from "@/components/FormFields";
import { ArrowLeft, Save, Upload, X, Plus, Trash2, ImageIcon, AlertCircle, Package, DollarSign, Tag, Truck, Star, MapPin, } from "lucide-react";
import Section from "@/components/Section";
import { useRouter } from "next/navigation";

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


export default function NewProductPage() {
    const router = useRouter();

    // Basic Info
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const testimonialInputRef = useRef<HTMLInputElement | null>(null);

    // Pricing & Stock
    const [price, setPrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [stock, setStock] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);

    // Images
    const [images, setImages] = useState<ProductImage[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Delivery
    const [deliveryAvailable, setDeliveryAvailable] = useState(true);
    const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
    const [areaInput, setAreaInput] = useState("");
    const [estimatedDays, setEstimatedDays] = useState("");

    // Testimonials
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [uploadingTestimonial, setUploadingTestimonial] = useState(false);

    // Form State
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setName(value);
        if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
            setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
        }
    };
    const removeImage = async (img: ProductImage) => {
        // 1️⃣ Delete from Cloudinary
        await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId: img.id }),
        });

        // 2️⃣ Remove from local state
        setImages(prev => prev.filter(i => i.id !== img.id));
    };
    const removeTestimonial = async (test: Testimonial) => {
        try {
            // 1️⃣ Delete from Cloudinary using publicId
            await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId: test.id }),
            });

            // 2️⃣ Remove from local state
            setTestimonials(prev => prev.filter(t => t.id !== test.id));
        } catch (error) {
            console.error("Failed to delete testimonial:", error);
            alert("Impossible de supprimer l'image du témoignage. Réessayez.");
        }
    };
    // Upload to Cloudinary
    const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'shopici_admin'); // Replace with your preset
        formData.append('cloud_name', 'domw8nvul'); // Replace with your cloud name

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/domw8nvul/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );
            const data = await response.json();
            console.log(data)

            return {
                url: data.secure_url,
                publicId: data.public_id, // ✅ important for deletion
            };
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    // Handle product image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploadingImage(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const { url, publicId } = await uploadToCloudinary(files[i]);
                setImages(prev => [...prev, {
                    id: publicId,
                    url,
                    alt: name || 'Product image',
                }]);
            }
        } catch (error) {
            alert('Échec du téléchargement. Veuillez réessayer.');
        } finally {
            setUploadingImage(false);
            // ✅ Reset input so the same file can be uploaded again
            if (imageInputRef.current) {
                imageInputRef.current.value = "";
            }
        }
    };

    // Handle testimonial image upload
    const handleTestimonialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingTestimonial(true);
        try {
            const { url, publicId } = await uploadToCloudinary(file);
            const city = prompt('Ville du témoignage:');
            if (city) {
                setTestimonials(prev => [...prev, {
                    id: publicId,
                    imageUrl: url,
                    city,
                }]);
            }
        } catch (error) {
            alert('Échec du téléchargement. Veuillez réessayer.');
        } finally {
            setUploadingTestimonial(false);
            // ✅ Reset input so the same file can be uploaded again
            if (testimonialInputRef.current) {
                testimonialInputRef.current.value = "";
            }
        }
    };

    // Add tag
    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    // Add delivery area
    const addDeliveryArea = () => {
        if (areaInput.trim()) {
            setDeliveryAreas([...deliveryAreas, {
                id: `area-${Date.now()}`,
                name: areaInput.trim(),
            }]);
            setAreaInput("");
        }
    };

    // Validate form
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
        return Object.keys(newErrors).length === 0;
    };

    // Save product
    const handleSave = async () => {
        if (!validate()) {
            alert("Veuillez corriger les erreurs avant de sauvegarder");
            return;
        }

        setIsSaving(true);

        const product = {
            id: `prod-${Date.now()}`,
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
                areas: deliveryAreas.map(a => a.name),
                estimatedDays: estimatedDays || "2-5 jours",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // TODO: Save to database
        console.log('Saving product:', product);

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save");

            alert("Produit enregistré avec succès !");
            router.push("/admin/products");
        } catch (error: any) {
            console.error(error);
            alert("Échec de l'enregistrement : " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen ">
            <div className="mx-auto space-y-6">

                {/* Header */}
                <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Left: Back button + Title */}
                        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-shopici-gray/20 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-shopici-charcoal" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-shopici-black mb-2 truncate">
                                    Nouveau Produit
                                </h1>
                                <div className="h-1 w-24 bg-gradient-to-r from-shopici-coral via-shopici-blue to-transparent rounded-full" />
                            </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex gap-3 flex-wrap sm:flex-nowrap mt-3 sm:mt-0">
                            <button
                                onClick={() => router.back()}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-white dark:bg-shopici-charcoal/50 border-2 border-shopici-charcoal/10 text-shopici-charcoal hover:border-shopici-charcoal/30 font-bold rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-shopici-blue to-shopici-coral text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2 border-2 border-white/20 disabled:opacity-50"
                            >
                                <Save size={18} />
                                <span className="truncate">{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
                            </button>
                        </div>

                    </div>

                    {/* Decorative line */}
                    <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Info */}
                        <Section icon={<Package size={20} />} title="Informations de base">
                            <FormField label="Nom du produit" required error={errors.name}>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Ex: Robe Africaine Élégante"
                                    className="input-field"
                                />
                            </FormField>

                            <FormField label="Slug URL" required error={errors.slug}>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="robe-africaine-elegante"
                                    className="input-field"
                                />
                            </FormField>

                            <FormField label="Catégorie" required error={errors.category}>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Ex: Mode Femme, Accessoires..."
                                    className="input-field"
                                />
                            </FormField>

                            <FormField label="Description courte">
                                <textarea
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    placeholder="Résumé rapide du produit..."
                                    rows={2}
                                    className="input-field"
                                />
                            </FormField>

                            <FormField label="Description complète" required error={errors.description}>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Description détaillée du produit..."
                                    rows={6}
                                    className="input-field"
                                />
                            </FormField>

                            <FormField label="Tags">
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Ajouter un tag..."
                                            className="input-field flex-1"
                                        />
                                        <button
                                            onClick={addTag}
                                            type="button"
                                            className="px-4 py-2 bg-shopici-blue/10 text-shopici-blue hover:bg-shopici-blue/20 rounded-lg font-semibold transition-all"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-shopici-gray/20 text-shopici-charcoal rounded-lg flex items-center gap-2 text-sm"
                                            >
                                                {tag}
                                                <button onClick={() => setTags(tags.filter(t => t !== tag))}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </FormField>
                        </Section>

                        {/* Images */}
                        <Section icon={<ImageIcon size={20} />} title="Images" error={errors.images}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-shopici-charcoal/10">
                                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-shopici-blue text-white text-xs font-bold rounded">
                                                    Principal
                                                </div>
                                            )}
                                            <button
                                                onClick={() => removeImage(img)}
                                                className="absolute top-2 right-2 p-1.5 bg-shopici-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="aspect-square border-2 border-dashed border-shopici-charcoal/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-shopici-blue/50 hover:bg-shopici-blue/5 transition-all">
                                        <Upload size={32} className="text-shopici-charcoal/50 mb-2" />
                                        <span className="text-sm font-semibold text-shopici-charcoal">
                                            {uploadingImage ? 'Téléchargement...' : 'Ajouter image'}
                                        </span>
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
                            </div>
                        </Section>

                        {/* Delivery */}
                        <Section icon={<Truck size={20} />} title="Livraison">
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={deliveryAvailable}
                                        onChange={(e) => setDeliveryAvailable(e.target.checked)}
                                        className="w-5 h-5 text-shopici-blue rounded"
                                    />
                                    <span className="font-semibold text-shopici-black dark:text-shopici-foreground">
                                        Livraison disponible
                                    </span>
                                </label>

                                {deliveryAvailable && (
                                    <>
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
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliveryArea())}
                                                        placeholder="Ex: Douala, Yaoundé..."
                                                        className="input-field flex-1"
                                                    />
                                                    <button
                                                        onClick={addDeliveryArea}
                                                        type="button"
                                                        className="px-4 py-2 bg-shopici-coral/10 text-shopici-coral hover:bg-shopici-coral/20 rounded-lg font-semibold transition-all"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {deliveryAreas.map(area => (
                                                        <span
                                                            key={area.id}
                                                            className="px-3 py-1 bg-shopici-blue/10 text-shopici-blue rounded-lg flex items-center gap-2 text-sm"
                                                        >
                                                            <MapPin size={14} />
                                                            {area.name}
                                                            <button onClick={() => setDeliveryAreas(deliveryAreas.filter(a => a.id !== area.id))}>
                                                                <X size={14} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </FormField>
                                    </>
                                )}
                            </div>
                        </Section>

                        {/* Testimonials */}
                        <Section icon={<Star size={20} />} title="Témoignages (Social Proof)">
                            <div className="bg-shopici-blue/5 border border-shopici-blue/20 rounded-xl p-4 mb-4">
                                <div className="flex gap-3">
                                    <AlertCircle size={20} className="text-shopici-blue flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-shopici-charcoal">
                                        <p className="font-semibold mb-1">Témoignages contrôlés par admin</p>
                                        <p>Uploadez des photos de clients satisfaits avec leur ville. Ces témoignages sont gérés manuellement pour garantir la qualité.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {testimonials.map(test => (
                                        <div key={test.id} className="relative group">
                                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-shopici-charcoal/10">
                                                <img src={test.imageUrl} alt={test.city} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="mt-2 text-center">
                                                <p className="text-sm font-semibold text-shopici-charcoal flex items-center justify-center gap-1">
                                                    <MapPin size={12} />
                                                    {test.city}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeTestimonial(test)}
                                                className="absolute top-2 right-2 p-1.5 bg-shopici-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="aspect-square border-2 border-dashed border-shopici-charcoal/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-shopici-coral/50 hover:bg-shopici-coral/5 transition-all">
                                        <Upload size={24} className="text-shopici-charcoal/50 mb-2" />
                                        <span className="text-xs font-semibold text-shopici-charcoal text-center px-2">
                                            {uploadingTestimonial ? 'Upload...' : 'Ajouter'}
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
                            </div>
                        </Section>
                    </div>

                    {/* Right Column - Pricing & Status */}
                    <div className="space-y-6">

                        {/* Pricing */}
                        <Section icon={<DollarSign size={20} />} title="Prix & Stock">
                            <FormField label="Prix" required error={errors.price}>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0"
                                        className="input-field pr-16"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-shopici-charcoal font-semibold">
                                        XAF
                                    </span>
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
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-shopici-charcoal font-semibold">
                                        XAF
                                    </span>
                                </div>
                            </FormField>

                            <FormField label="Stock" required error={errors.stock}>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="0"
                                    className="input-field"
                                />
                            </FormField>
                        </Section>

                        {/* Status */}
                        <Section icon={<Tag size={20} />} title="Statut">
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-shopici-gray/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isAvailable}
                                        onChange={(e) => setIsAvailable(e.target.checked)}
                                        className="w-5 h-5 text-shopici-blue rounded"
                                    />
                                    <div>
                                        <p className="font-semibold text-shopici-black dark:text-shopici-foreground">
                                            Produit disponible
                                        </p>
                                        <p className="text-xs text-shopici-charcoal">
                                            Visible et achetable sur le site
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-shopici-gray/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="w-5 h-5 text-shopici-blue rounded"
                                    />
                                    <div>
                                        <p className="font-semibold text-shopici-black dark:text-shopici-foreground">
                                            Produit en vedette
                                        </p>
                                        <p className="text-xs text-shopici-charcoal">
                                            Affiché en priorité
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </Section>

                        {/* Quick Tips */}
                        <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 border-2 border-shopici-charcoal/10 rounded-2xl p-5">
                            <h3 className="font-bold text-shopici-black dark:text-shopici-foreground mb-3 flex items-center gap-2">
                                <AlertCircle size={18} className="text-shopici-blue" />
                                Conseils rapides
                            </h3>
                            <ul className="space-y-2 text-sm text-shopici-charcoal">
                                <li className="flex gap-2">
                                    <span className="text-shopici-blue">•</span>
                                    <span>Ajoutez au moins 3-5 images de qualité</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-shopici-coral">•</span>
                                    <span>Description claire = plus de ventes</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-shopici-blue">•</span>
                                    <span>Tags pertinents pour la recherche</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-shopici-coral">•</span>
                                    <span>Témoignages renforcent la confiance</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}