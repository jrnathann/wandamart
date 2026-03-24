"use client";

import { useState } from "react";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";
import LiveOrderNotifications from "./LiveOrderNotification";
import Script from "next/script";
import { useConfig, useConfigReady } from "@/context/ConfigContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const storeConfig = useConfig();   // null until ready
  const configReady = useConfigReady(); // true only after mount + config loaded
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState("");

  return (
    <CartProvider>
      {/* Google Analytics — only inject once we have a real tracking ID */}
      {configReady && storeConfig?.tracking.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${storeConfig.tracking.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${storeConfig.tracking.googleAnalyticsId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel — only inject once we have a real pixel ID */}
      {configReady && storeConfig?.tracking.facebookPixelId && (
        <>
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
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${storeConfig.tracking.facebookPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />

      {configReady && <LiveOrderNotifications />}
      {configReady && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
      {configReady && <CartToast show={showToast} productName={lastAddedProduct} />}
    </CartProvider>
  );
}