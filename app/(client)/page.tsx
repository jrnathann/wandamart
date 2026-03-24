"use client"

import { useState } from "react";
import Homepage from "@/components/Home";
import FAQSection from "@/components/Faqs";
import FeaturesSection from "@/components/FeaturedSection";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState("");

  const showAddedToast = (productName: string) => {
    setLastAddedProduct(productName);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div>
      <Homepage onProductAdded={showAddedToast} />
      <FeaturesSection/>
      <FAQSection />
    </div>
  );
}