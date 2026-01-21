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

  images: {
    id: string;
    url: string;
    alt?: string;
  }[];

  category: string;
  tags?: string[];

  stock: number;
  isAvailable: boolean;

  testimonials?: {
    id: string;
    imageUrl: string;
    city: string;
  }[];

  delivery: {
    available: boolean;
    areas: string[];
    estimatedDays: string;
  };

  createdAt: string;
  updatedAt: string;
};

// Optional: Export CartItem type as well for reusability
export type CartItem = Product & {
  quantity: number;
};

// Optional: Helper type for product images
export type ProductImage = {
  id: string;
  url: string;
  alt?: string;
};

// Optional: Helper type for testimonials
export type Testimonial = {
  id: string;
  imageUrl: string;
  city: string;
};

// Optional: Helper type for delivery info
export type DeliveryInfo = {
  available: boolean;
  areas: string[];
  estimatedDays: string;
};