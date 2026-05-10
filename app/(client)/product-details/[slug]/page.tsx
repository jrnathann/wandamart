"use client"

import { use } from "react";
import ProductDetailsPage from "@/components/ProductDetail"; 

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  return (
    <div>
      <ProductDetailsPage slug={slug} />
    </div>
  );
}