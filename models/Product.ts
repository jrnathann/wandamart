import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: String,
  isFeatured: Boolean,
  price: Number,
  compareAtPrice: Number,
  currency: String,
  images: [
    {
      id: String, // Cloudinary publicId
      url: String,
      alt: String,
    },
  ],
  category: String,
  tags: [String],
  stock: Number,
  isAvailable: Boolean,
  testimonials: [
    {
      id: String,
      imageUrl: String,
      city: String,
    },
  ],
  delivery: {
    available: Boolean,
    areas: [String],
    estimatedDays: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = models.Product || model("Product", ProductSchema);
