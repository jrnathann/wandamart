import type { Metadata } from "next";
import "../globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "WandaMart",
  description:
    "WandaMart est une place de marché en ligne au Cameroun proposant des produits électroniques, des articles de mode, des articles ménagers et divers autres produits de consommation, avec des paiements sécurisés et des services de livraison pratiques.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <ClientLayout>
          {children}
        </ClientLayout>
  );
}
