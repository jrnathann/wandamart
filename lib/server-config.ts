// lib/server-config.ts
import { StoreConfigType } from "@/types/StoreConfig";
import { connectDB } from "./mongodb";
import { StoreConfig } from "@/models/SiteConfig";
export const defaultConfig: StoreConfigType = {
  name: "Shopici",
  logo: "",
  description: "",
  objective: "",
  currency: "XAF",
  contact: { email: "", phone: "", address: "" },
  social: { facebook: "", instagram: "" },
  tracking: { facebookPixelId: "", googleAnalyticsId: "" },
  theme: { colors: { black: "#020202", blue: "#869FAD", coral: "#E9796F" } },
  features: { mobileMoneyPayment: false },
  bannerSlides: [],
};

export async function getStoreConfig(): Promise<StoreConfigType> {
  try {
    await connectDB();

    const doc = await StoreConfig.findOne({}).lean<StoreConfigType>();

    if (!doc) {
      console.warn("[ServerConfig] No config found in DB, using default.");
      return defaultConfig;
    }

    return { ...defaultConfig, ...doc };
  } catch (err) {
    console.warn("[ServerConfig] DB error, using default config:", err);
    return defaultConfig;
  }
}