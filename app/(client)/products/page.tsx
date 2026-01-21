"use client"

import ProductsPage from "@/components/ProductPage";
export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <div>
            <ProductsPage />
        </div>
    );
}