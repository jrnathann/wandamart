import type { ContentBlock } from "@/types/Product";

export interface ProductImage {
    id: string;
    url: string;
    alt?: string;
}

export interface Testimonial {
    id: string;
    imageUrl: string;
    city: string;
}

export interface DeliveryArea {
    id: string;
    name: string;
}

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
}

/** The shape of form state shared between New and Edit pages */
export interface ProductFormState {
    // Basic Info
    name: string;
    slug: string;
    category: string;
    shortDescription: string;
    description: string;
    tags: string[];

    // Pricing & Stock
    price: string;
    compareAtPrice: string;
    stock: string;
    isAvailable: boolean;
    isFeatured: boolean;

    // Images
    images: ProductImage[];

    // Delivery
    deliveryAvailable: boolean;
    deliveryAreas: DeliveryArea[];
    estimatedDays: string;

    // Testimonials
    testimonials: Testimonial[];

    // Content Blocks
    contentBlocks: ContentBlock[];
}

/** Default empty state for the "New Product" page */
export const defaultProductFormState: ProductFormState = {
    name: "",
    slug: "",
    category: "",
    shortDescription: "",
    description: "",
    tags: [],
    price: "",
    compareAtPrice: "",
    stock: "",
    isAvailable: true,
    isFeatured: false,
    images: [],
    deliveryAvailable: true,
    deliveryAreas: [],
    estimatedDays: "",
    testimonials: [],
    contentBlocks: [],
};