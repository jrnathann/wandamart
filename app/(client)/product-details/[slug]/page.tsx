"use client"

import { use } from "react";
import ProductDetailsPage from "@/components/ProductDetail"; 
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  return (
    <div>
      <ProductDetailsPage slug={slug} />
    </div>
  );
}