"use client"

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Homepage from "@/components/Home";
import FAQSection from "@/components/Faqs";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";

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
      <FAQSection />
    </div>
  );
}