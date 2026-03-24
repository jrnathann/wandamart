// app/layout.tsx
import { storeConfig } from "@/data/configData";
import ParentClient from "@/components/ParentClient";
import "./globals.css";

export const metadata = {
  title: "Shopici Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Dynamic CSS variables for theme colors
  const dynamicColors = `
    :root {
      --shopici-black: ${storeConfig.theme.colors.black};
      --shopici-blue: ${storeConfig.theme.colors.blue};
      --shopici-coral: ${storeConfig.theme.colors.coral};
    }
  `.replace(/\s+/g, ' '); // Optional minify

  return (
    <html lang="fr">
      <head>
        {/* Inject dynamic CSS variables */}
        <style dangerouslySetInnerHTML={{ __html: dynamicColors }} />
      </head>
      <body>
        {/* All client-side components go inside ParentClient */}
        <ParentClient>
          {children}
        </ParentClient>
      </body>
    </html>
  );
}