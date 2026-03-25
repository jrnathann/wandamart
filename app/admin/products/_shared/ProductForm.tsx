"use client";

import {
    Upload, X, Plus, Trash2, ImageIcon,
    AlertCircle, Package, DollarSign, Tag, Truck, Star,
    MapPin, Layers, ChevronDown, ChevronUp, Move, CheckCircle2,
    Loader2,
} from "lucide-react";
import FormField from "@/components/FormFields";
import Section from "@/components/Section";
import type { ProductFormHook } from "./useProductForm";

interface ProductFormProps {
    form: ProductFormHook;
}

/**
 * ProductForm
 *
 * Pure UI component. Receives all state and handlers from the
 * useProductForm hook via the `form` prop. This means any design
 * change here is instantly reflected on both the New and Edit pages.
 */
export default function ProductForm({ form }: ProductFormProps) {
    const {
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
        errors,
        progressItems,
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
    } = form;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left Column ── */}
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
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                    placeholder="Ajouter un tag..."
                                    className="input-field flex-1"
                                />
                                <button
                                    onClick={addTag}
                                    type="button"
                                    className="px-4 py-2 bg-shopici-blue/10 text-shopici-blue hover:bg-shopici-blue/20 rounded-lg font-semibold transition-all active:scale-95"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-shopici-gray/20 text-shopici-charcoal rounded-lg flex items-center gap-2 text-sm animate-in fade-in zoom-in-95 duration-200"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-shopici-coral transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </FormField>
                </Section>

                {/* Images */}
                <Section icon={<ImageIcon />} title="Images" error={errors.images}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((img, idx) => {
                            const isDeleting = deletingImageId === img.id;
                            const isNew = newImageIds.has(img.id);
                            const isDragging = draggedIndex === idx;
                            return (
                                <div
                                    key={img.id}
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    className={`relative group aspect-square rounded-none overflow-hidden border-2 bg-slate-50
                                        shadow-[4px_4px_0px_rgba(0,0,0,0.05)] cursor-grab active:cursor-grabbing transition-all duration-300
                                        ${isNew ? "animate-in zoom-in-95 fade-in duration-500" : ""}
                                        ${isDeleting ? "scale-90 opacity-0 border-shopici-coral" : "border-shopici-black hover:border-shopici-blue"}
                                        ${isDragging ? "opacity-50 scale-95 rotate-1" : ""}`}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.alt}
                                        className={`w-full h-full object-cover transition-all duration-300 pointer-events-none
                                            ${isDeleting ? "grayscale brightness-50" : "grayscale-[0.3] group-hover:grayscale-0"}`}
                                    />
                                    {idx === 0 && !isDeleting && (
                                        <div className="absolute top-0 left-0 px-2 py-1 bg-shopici-blue text-white text-[8px] font-black uppercase tracking-widest border-b-2 border-r-2 border-shopici-black z-10">
                                            Principal
                                        </div>
                                    )}
                                    {!isDeleting ? (
                                        <button
                                            onClick={(e) => { e.preventDefault(); removeImage(img); }}
                                            className="absolute top-0 right-0 p-2 bg-shopici-coral text-white border-b-2 border-l-2 border-shopici-black opacity-0 group-hover:opacity-100 transition-all hover:bg-shopici-black z-20 active:scale-90"
                                        >
                                            <Trash2 size={14} strokeWidth={3} />
                                        </button>
                                    ) : (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-shopici-black/40">
                                            <Loader2 size={20} className="text-white animate-spin" />
                                        </div>
                                    )}
                                    {!isDeleting && (
                                        <div className="absolute inset-0 bg-shopici-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                                            <div className="p-1 bg-white border-2 border-shopici-black">
                                                <Move size={16} className="text-shopici-black" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Upload trigger */}
                        <label
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("bg-shopici-blue/10", "border-shopici-blue"); }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("bg-shopici-blue/10", "border-shopici-blue"); }}
                            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("bg-shopici-blue/10", "border-shopici-blue"); if (e.dataTransfer.files) handleImageUpload({ target: { files: e.dataTransfer.files } } as any); }}
                            className="group relative aspect-square border-2 border-shopici-black border-dashed md:border-solid rounded-none flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50 transition-all overflow-hidden"
                        >
                            <div className={`z-10 flex flex-col items-center transition-transform ${uploadingImage ? "scale-90" : "group-hover:scale-110"}`}>
                                {uploadingImage
                                    ? <Loader2 size={24} strokeWidth={3} className="mb-2 text-shopici-blue animate-spin" />
                                    : <Upload size={24} strokeWidth={3} className="mb-2 text-shopici-black" />
                                }
                                <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">
                                    {uploadingImage ? `${uploadProgress}%` : "Glisser ou Cliquer"}
                                </span>
                            </div>
                            {uploadingImage && (
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 border-t border-shopici-black">
                                    <div
                                        className="h-full bg-shopici-blue transition-all duration-500 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}
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
                <Section icon={<Layers size={20} />} title="Section alternée (Image + Texte)">
                    <div className="bg-shopici-blue/5 border border-shopici-blue/20 rounded-xl p-4 mb-5">
                        <div className="flex gap-3">
                            <AlertCircle size={20} className="text-shopici-blue flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-shopici-charcoal">
                                <p className="font-semibold mb-1">Blocs de contenu enrichis</p>
                                <p>Chaque bloc affiche une image à gauche et du texte à droite, en alternant. Idéal pour les caractéristiques clés.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {contentBlocks.map((block, index) => {
                            const isCollapsed = collapsedBlocks.has(block.id);
                            const isUploading = uploadingBlockId === block.id;
                            const isRemoving = removingBlockId === block.id;
                            return (
                                <div
                                    key={block.id}
                                    className={`border-2 border-shopici-charcoal/10 rounded-xl overflow-hidden transition-all duration-300
                                        ${isRemoving ? "opacity-0 scale-95 -translate-y-1" : "opacity-100"}
                                        animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    <div className="flex items-center gap-3 px-4 py-3 bg-shopici-gray/10">
                                        <span className="shrink-0 w-7 h-7 rounded-full bg-shopici-blue text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
                                        <span className="flex-1 text-sm font-semibold text-shopici-black truncate">{block.heading.trim() || "Nouveau bloc"}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => moveBlock(index, "up")} disabled={index === 0} className="p-1 rounded hover:bg-shopici-charcoal/10 disabled:opacity-30 transition-colors active:scale-90"><ChevronUp size={16} /></button>
                                            <button onClick={() => moveBlock(index, "down")} disabled={index === contentBlocks.length - 1} className="p-1 rounded hover:bg-shopici-charcoal/10 disabled:opacity-30 transition-colors active:scale-90"><ChevronDown size={16} /></button>
                                        </div>
                                        <button onClick={() => removeContentBlock(block)} disabled={isRemoving} className="p-1.5 text-shopici-coral hover:bg-shopici-coral/10 rounded-lg transition-colors active:scale-90 disabled:opacity-50">
                                            {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                        <button onClick={() => toggleCollapse(block.id)} className="p-1.5 hover:bg-shopici-charcoal/10 rounded-lg transition-colors">
                                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                        </button>
                                    </div>

                                    {!isCollapsed && (
                                        <div className="p-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <FormField label="Image du bloc" required>
                                                {block.image.url ? (
                                                    <div className={`relative group w-full aspect-video rounded-xl overflow-hidden border-2 border-shopici-charcoal/10 transition-all duration-200
                                                        ${removingBlockImageId === block.id ? "opacity-0 scale-95" : "opacity-100"}`}>
                                                        <img src={block.image.url} alt={block.image.alt} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => removeBlockImage(block)}
                                                            disabled={removingBlockImageId === block.id}
                                                            className="absolute top-2 right-2 p-1.5 bg-shopici-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 disabled:opacity-50"
                                                        >
                                                            {removingBlockImageId === block.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-shopici-charcoal/30 rounded-xl cursor-pointer hover:border-shopici-blue/50 hover:bg-shopici-blue/5 transition-all">
                                                        {isUploading
                                                            ? <><Loader2 size={28} className="text-shopici-blue mb-2 animate-spin" /><span className="text-sm font-semibold text-shopici-blue">Téléchargement...</span></>
                                                            : <><Upload size={28} className="text-shopici-charcoal/50 mb-2" /><span className="text-sm font-semibold text-shopici-charcoal">Uploader une image</span><span className="text-xs text-shopici-charcoal/50 mt-1">16:9 recommandé</span></>
                                                        }
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
                                            <FormField label="Label eyebrow (optionnel)">
                                                <input type="text" value={block.eyebrow ?? ""} onChange={(e) => updateBlock(block.id, { eyebrow: e.target.value })} placeholder="Ex: Matériaux premium" className="input-field" />
                                            </FormField>
                                            <FormField label="Titre du bloc" required>
                                                <input type="text" value={block.heading} onChange={(e) => updateBlock(block.id, { heading: e.target.value })} placeholder="Ex: Fabriqué pour durer" className="input-field" />
                                            </FormField>
                                            <FormField label="Texte descriptif" required>
                                                <textarea
                                                    value={block.body}
                                                    onChange={(e) => updateBlock(block.id, { body: e.target.value })}
                                                    placeholder={"Décrivez cette caractéristique...\n\nUtilisez des sauts de ligne pour créer des paragraphes."}
                                                    rows={4}
                                                    className="input-field"
                                                />
                                                <p className="text-xs text-shopici-charcoal/50 mt-1">Les sauts de ligne créent des paragraphes distincts.</p>
                                            </FormField>
                                            <FormField label="Points clés (optionnel)">
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={highlightInputs[block.id] ?? ""}
                                                            onChange={(e) => setHighlightInputs((prev) => ({ ...prev, [block.id]: e.target.value }))}
                                                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight(block.id))}
                                                            placeholder="Ex: Garantie 2 ans incluse"
                                                            className="input-field flex-1"
                                                        />
                                                        <button onClick={() => addHighlight(block.id)} type="button" className="px-4 py-2 bg-shopici-blue/10 text-shopici-blue hover:bg-shopici-blue/20 rounded-lg font-semibold transition-all active:scale-95"><Plus size={18} /></button>
                                                    </div>
                                                    {(block.highlights ?? []).length > 0 && (
                                                        <ul className="space-y-2">
                                                            {(block.highlights ?? []).map((h, i) => (
                                                                <li key={i} className="flex items-center gap-2 px-3 py-2 bg-shopici-gray/10 rounded-lg text-sm text-shopici-charcoal animate-in fade-in slide-in-from-left-2 duration-200">
                                                                    <span className="w-5 h-5 rounded-full bg-shopici-blue/20 text-shopici-blue text-[10px] font-bold flex items-center justify-center shrink-0">✓</span>
                                                                    <span className="flex-1">{h}</span>
                                                                    <button onClick={() => removeHighlight(block.id, i)} className="text-shopici-coral hover:text-shopici-coral/70 transition-colors active:scale-90"><X size={14} /></button>
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
                            className="w-full py-4 border-2 border-dashed border-shopici-charcoal/30 rounded-xl flex items-center justify-center gap-2 text-shopici-charcoal font-semibold hover:border-shopici-blue/50 hover:bg-shopici-blue/5 hover:text-shopici-blue transition-all active:scale-[0.98]"
                        >
                            <Plus size={20} /> Ajouter un bloc de contenu
                        </button>
                    </div>
                </Section>

                {/* Delivery */}
                <Section icon={<Truck size={20} />} title="Livraison">
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={deliveryAvailable} onChange={(e) => setDeliveryAvailable(e.target.checked)} className="w-5 h-5 text-shopici-blue rounded" />
                            <span className="font-semibold text-shopici-black dark:text-shopici-foreground">Livraison disponible</span>
                        </label>
                        {deliveryAvailable && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                <FormField label="Délai estimé">
                                    <input type="text" value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} placeholder="Ex: 2-5 jours" className="input-field" />
                                </FormField>
                                <FormField label="Zones de livraison">
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={areaInput}
                                                onChange={(e) => setAreaInput(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDeliveryArea())}
                                                placeholder="Ex: Douala, Yaoundé..."
                                                className="input-field flex-1"
                                            />
                                            <button onClick={addDeliveryArea} type="button" className="px-4 py-2 bg-shopici-coral/10 text-shopici-coral hover:bg-shopici-coral/20 rounded-lg font-semibold transition-all active:scale-95"><Plus size={18} /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {deliveryAreas.map((area) => (
                                                <span key={area.id} className="px-3 py-1 bg-shopici-blue/10 text-shopici-blue rounded-lg flex items-center gap-2 text-sm animate-in fade-in zoom-in-95 duration-200">
                                                    <MapPin size={14} /> {area.name}
                                                    <button onClick={() => removeDeliveryArea(area.id)} className="hover:text-shopici-coral transition-colors"><X size={14} /></button>
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
                <Section icon={<Star size={20} />} title="Témoignages (Social Proof)">
                    <div className="bg-shopici-blue/5 border border-shopici-blue/20 rounded-xl p-4 mb-4">
                        <div className="flex gap-3">
                            <AlertCircle size={20} className="text-shopici-blue flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-shopici-charcoal">
                                <p className="font-semibold mb-1">Témoignages contrôlés par admin</p>
                                <p>Uploadez des photos de clients satisfaits avec leur ville.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {testimonials.map((test) => {
                            const isDeletingTest = deletingTestimonialId === test.id;
                            return (
                                <div key={test.id} className={`relative group transition-all duration-300 ${isDeletingTest ? "opacity-0 scale-90" : "opacity-100 animate-in fade-in zoom-in-95 duration-300"}`}>
                                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-shopici-charcoal/10">
                                        <img src={test.imageUrl} alt={test.city} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className="text-sm font-semibold text-shopici-charcoal flex items-center justify-center gap-1"><MapPin size={12} /> {test.city}</p>
                                    </div>
                                    <button onClick={() => removeTestimonial(test)} disabled={isDeletingTest} className="absolute top-2 right-2 p-1.5 bg-shopici-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 disabled:opacity-50">
                                        {isDeletingTest ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            );
                        })}
                        <label className="aspect-square border-2 border-dashed border-shopici-charcoal/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-shopici-coral/50 hover:bg-shopici-coral/5 transition-all">
                            {uploadingTestimonial ? <Loader2 size={24} className="text-shopici-coral mb-2 animate-spin" /> : <Upload size={24} className="text-shopici-charcoal/50 mb-2" />}
                            <span className="text-xs font-semibold text-shopici-charcoal text-center px-2">{uploadingTestimonial ? "Upload..." : "Ajouter"}</span>
                            <input ref={testimonialInputRef} type="file" accept="image/*" onChange={handleTestimonialUpload} className="hidden" disabled={uploadingTestimonial} />
                        </label>
                    </div>
                    {pendingTestimonial && (
                        <div className="border-2 border-shopici-black bg-slate-50 p-4 animate-in fade-in zoom-in-95 duration-200 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 border-2 border-shopici-black shrink-0 overflow-hidden">
                                    <img src={pendingTestimonial.url} className="w-full h-full object-cover grayscale" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-shopici-black">Localisation Requise</p>
                                    <input
                                        autoFocus
                                        value={cityInput}
                                        onChange={(e) => setCityInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && confirmTestimonial()}
                                        placeholder="EX: YAOUNDÉ"
                                        className="w-full bg-white border-2 border-shopici-black px-3 py-2 text-[11px] font-bold uppercase tracking-widest focus:bg-shopici-blue focus:text-white outline-none transition-colors placeholder:text-shopici-black/20"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={confirmTestimonial} className="flex-1 bg-shopici-black text-white py-2 text-[10px] font-black uppercase tracking-widest hover:bg-shopici-blue transition-colors">
                                    Confirmer l'entrée
                                </button>
                                <button onClick={() => setPendingTestimonial(null)} className="px-4 border-2 border-shopici-black text-[10px] font-black uppercase tracking-widest hover:bg-shopici-coral hover:text-white transition-colors">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </Section>
            </div>

            {/* ── Right Column ── */}
            <div className="space-y-6">
                <Section icon={<DollarSign size={20} />} title="Prix & Stock">
                    <FormField label="Prix" required error={errors.price}>
                        <div className="relative">
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="input-field pr-16" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-shopici-charcoal font-semibold">XAF</span>
                        </div>
                    </FormField>
                    <FormField label="Prix barré (optionnel)">
                        <div className="relative">
                            <input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="0" className="input-field pr-16" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-shopici-charcoal font-semibold">XAF</span>
                        </div>
                    </FormField>
                    <FormField label="Stock" required error={errors.stock}>
                        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="input-field" />
                    </FormField>
                </Section>

                <Section icon={<Tag size={20} />} title="Statut">
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-shopici-gray/10 transition-colors">
                            <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="w-5 h-5 text-shopici-blue rounded" />
                            <div>
                                <p className="font-semibold text-shopici-black dark:text-shopici-foreground">Produit disponible</p>
                                <p className="text-xs text-shopici-charcoal">Visible et achetable sur le site</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-shopici-gray/10 transition-colors">
                            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 text-shopici-blue rounded" />
                            <div>
                                <p className="font-semibold text-shopici-black dark:text-shopici-foreground">Produit en vedette</p>
                                <p className="text-xs text-shopici-charcoal">Affiché en priorité</p>
                            </div>
                        </label>
                    </div>
                </Section>

                {/* Sticky tips + progress card */}
                <div className="sticky top-4">
                    <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 border-2 border-shopici-charcoal/10 rounded-2xl p-5">
                        <h3 className="font-bold text-shopici-black dark:text-shopici-foreground mb-3 flex items-center gap-2">
                            <AlertCircle size={18} className="text-shopici-blue" />
                            Conseils rapides
                        </h3>
                        <ul className="space-y-2 text-sm text-shopici-charcoal mb-5">
                            <li className="flex gap-2"><span className="text-shopici-blue">•</span><span>Ajoutez au moins 3-5 images de qualité</span></li>
                            <li className="flex gap-2"><span className="text-shopici-coral">•</span><span>Description claire = plus de ventes</span></li>
                            <li className="flex gap-2"><span className="text-shopici-blue">•</span><span>Tags pertinents pour la recherche</span></li>
                            <li className="flex gap-2"><span className="text-shopici-coral">•</span><span>Les blocs image+texte augmentent la conversion</span></li>
                            <li className="flex gap-2"><span className="text-shopici-blue">•</span><span>Témoignages renforcent la confiance</span></li>
                        </ul>

                        <div className="pt-6 mt-6 border-t-2 border-shopici-black space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-shopici-black">Statut d'avancement</p>
                                <div className="px-2 py-0.5 bg-shopici-black text-white text-[9px] font-black uppercase tracking-tighter">
                                    {progressItems.filter((i) => i.done).length} / {progressItems.length} OK
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                {progressItems.map(({ label, done }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <div className={`shrink-0 w-4 h-4 border-2 flex items-center justify-center transition-all duration-300 ${done ? "bg-shopici-blue border-shopici-black" : "bg-white border-shopici-black/20"}`}>
                                            {done && <CheckCircle2 size={10} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[11px] uppercase tracking-wider transition-colors duration-300 ${done ? "font-black text-shopici-black" : "font-bold text-shopici-black/30"}`}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-slate-100 border-2 border-shopici-black relative overflow-hidden">
                                    <div
                                        className="h-full bg-shopici-blue transition-all duration-700 ease-out border-r-2 border-shopici-black"
                                        style={{ width: `${(progressItems.filter((i) => i.done).length / progressItems.length) * 100}%` }}
                                    />
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:10%_100%]" />
                                </div>
                                <p className="text-[9px] font-black text-shopici-black/40 uppercase tracking-[0.15em] text-right">
                                    Opération en cours... {Math.round((progressItems.filter((i) => i.done).length / progressItems.length) * 100)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}