// app/layout.tsx
import { storeConfig } from "@/data/configData";
import "./globals.css";
export const metadata = {
  title: "Shopici Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Create an object for the CSS variables
const dynamicColors = `
    :root {
      --shopici-black: ${storeConfig.theme.colors.black};
      --shopici-blue: ${storeConfig.theme.colors.blue};
      --shopici-coral: ${storeConfig.theme.colors.coral};
    }
  `.replace(/\s+/g, ' '); // Optional: minify the string

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Injecting CSS variables directly into the head to prevent hydration mismatch */}
        <style dangerouslySetInnerHTML={{ __html: dynamicColors }} />
      </head>
      <body className="bg-white dark:bg-shopici-charcoal/95">{children}</body>
    </html>
  );
}
