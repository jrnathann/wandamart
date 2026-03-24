export type ProductImage = {
  id: string;
  url: string;
  alt?: string;
};

export type Testimonial = {
  id: string;
  imageUrl: string;
  city: string;
};

export type DeliveryInfo = {
  available: boolean;
  areas: string[];
  estimatedDays: string;
};

// ── NEW: one image+text block for the alternating content section ──────────
export type ContentBlock = {
  id: string;
  image: ProductImage;
  eyebrow?: string;
  heading: string;
  body: string;
  highlights?: string[];
};

export type Product = {
  _id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  isFeatured?: boolean;

  price: number;
  compareAtPrice?: number;
  currency: "XAF";

  images: ProductImage[];

  category: string;
  tags?: string[];

  stock: number;
  isAvailable: boolean;

  testimonials?: Testimonial[];

  delivery: DeliveryInfo;

  /** Rich alternating image + text blocks shown on the product detail page */
  contentBlocks?: ContentBlock[];

  createdAt: string;
  updatedAt: string;
};

export type CartItem = Product & {
  quantity: number;
};