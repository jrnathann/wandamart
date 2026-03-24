// app/layout.tsx
import { ConfigProvider } from "@/context/ConfigContext";

export default function RootLayout({ children }:{ children: React.ReactNode }) {
  return (
        <ConfigProvider>
          {children}
        </ConfigProvider>
  );
}