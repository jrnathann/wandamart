import type { Metadata } from "next";
import "../globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Shopici",
  description:
    "Shopici est votre boutique en ligne pour des produits tendance et des essentiels du quotidien. Produits de qualité, prix malins et livraison dans tout le Cameroun",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-shopici-charcoal/95">
        {/* Only client-side dynamic components inside ClientLayout */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
