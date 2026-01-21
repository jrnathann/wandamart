"use client";

import { useState, useEffect } from "react";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";
import LiveOrderNotifications from "./LiveOrderNotification";
import Script from "next/script";
import { storeConfig } from "@/data/configData";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState("");
  const [mounted, setMounted] = useState(false);

  // Ensure client-only components render after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CartProvider>
      {/* Facebook Pixel */}
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${storeConfig.tracking.facebookPixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img height="1" width="1" style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${storeConfig.tracking.facebookPixelId}&ev=PageView&noscript=1`} />
      </noscript>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      {mounted && <LiveOrderNotifications />}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {mounted && <CartToast show={showToast} productName={lastAddedProduct} />}
    </CartProvider>
  );
}
