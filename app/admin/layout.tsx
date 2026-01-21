"use client"
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </SessionProvider>
  );
}
