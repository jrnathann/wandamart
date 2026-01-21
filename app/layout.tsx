// app/layout.tsx
import "./globals.css";
export const metadata = {
  title: "Shopici Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-shopici-charcoal/95">{children}</body>
    </html>
  );
}
