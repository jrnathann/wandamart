import type { MetadataRoute } from "next";
import { storeConfig } from "@/data/configData";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${storeConfig.name}`,
    short_name: "Admin",
    description: `Administration Dashboard`,
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: storeConfig.theme.colors.black,
    theme_color: storeConfig.theme.colors.black,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}