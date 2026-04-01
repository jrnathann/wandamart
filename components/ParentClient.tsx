"use client";

import { useConfig } from "@/context/ConfigContext";

export default function ParentClient({ children }: { children: React.ReactNode }) {
  const storeConfig = useConfig();

  const dynamicColors = `
    :root {
      --shopici-black: ${storeConfig?.theme.colors.black || "#020202"};
      --shopici-blue: ${storeConfig?.theme.colors.blue || "#869FAD"};
      --shopici-coral: ${storeConfig?.theme.colors.coral || "#E9796F"};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dynamicColors }} />
      {children}
    </>
  );
}