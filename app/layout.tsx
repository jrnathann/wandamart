import { ConfigProvider } from "@/context/ConfigContext";
import ParentClient from "@/components/ParentClient";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ConfigProvider>
          <ParentClient>
            {children}
          </ParentClient>
        </ConfigProvider>
      </body>
    </html>
  );
}