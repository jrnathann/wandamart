import mongoose, { Schema, model, models } from "mongoose";

const BannerSlideSchema = new Schema({
  title: String,
  subtitle: String,
  cta: String,
  image: String,
  bgColor: String,
});

const StoreConfigSchema = new Schema({
  name: { type: String, required: true },
  logo: String,
  description: String,
  objective: String,
  contact: {
    email: String,
    phone: String,
    address: String,
  },
  currency: { type: String, default: "XAF" },
  social: { facebook: String, instagram: String },
  tracking: { facebookPixelId: String, googleAnalyticsId: String },
  bannerSlides: [BannerSlideSchema],
  theme: {
    colors: {
      black: { type: String, default: "#020202" },
      blue: { type: String, default: "#869FAD" },
      coral: { type: String, default: "#E9796F" },
    }
  },
  features: {
    mobileMoneyPayment: { type: Boolean, default: true },
  }
}, { timestamps: true });

export const StoreConfig = models?.StoreConfig || model("StoreConfig", StoreConfigSchema);