"use client"

import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle, X } from "lucide-react";

type Notification = {
    id: string;
    customerName: string;
    city: string;
    productName: string;
    timeAgo: string;
};

const cameroonianNames = ["Amadou", "Fatima", "Jean-Paul", "Marie", "Ibrahim", "Christelle", "Patrick", "Aissatou", "Emmanuel", "Sylvie", "Ngando", "Bintou", "François", "Hawa", "Roger", "Aminata", "Claude", "Mariam", "Pascal", "Fadimatou"];
const cameroonianCities = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Maroua", "Bamenda", "Ngaoundéré", "Bertoua", "Kribi", "Limbe"];
const products = ["Tondeuse Électrique", "Casque Bluetooth", "Montre Connectée", "Écouteurs Sans Fil", "Powerbank 20000mAh", "Lampe LED Rechargeable", "Ventilateur Portable", "Chargeur Rapide"];
const timeOptions = ["à l'instant", "il y a 2 min", "il y a 5 min", "il y a 8 min"];

const generateNotification = (): Notification => {
    return {
        id: Math.random().toString(36).substr(2, 9),
        customerName: cameroonianNames[Math.floor(Math.random() * cameroonianNames.length)],
        city: cameroonianCities[Math.floor(Math.random() * cameroonianCities.length)],
        productName: products[Math.floor(Math.random() * products.length)],
        timeAgo: timeOptions[Math.floor(Math.random() * timeOptions.length)]
    };
};

export default function LiveOrderNotifications() {
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const initialTimer = setTimeout(() => showNewNotification(), 6000);
        const interval = setInterval(() => {
            if (!isVisible) showNewNotification();
        }, 25000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [isVisible]);

    const showNewNotification = () => {
        const newNotif = generateNotification();
        setCurrentNotification(newNotif);
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 7000);
    };

    if (!currentNotification) return null;

    return (
        <>
            <div
                className={`fixed z-[100] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                    /* Mobile: Top center, slimmer */
                    top-4 left-4 right-4 sm:left-6 sm:right-auto sm:top-auto sm:bottom-6
                    ${isVisible 
                        ? "translate-y-0 opacity-100 scale-100" 
                        : "sm:-translate-x-8 -translate-y-12 opacity-0 scale-95 pointer-events-none"
                    }`}
            >
                <div className="relative overflow-hidden w-full sm:w-[320px] bg-[var(--shopici-background)] border border-shopici-gray/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-none">
                    {/* Progress Bar (Top) */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-shopici-gray/10">
                        <div
                            className="h-full bg-shopici-coral"
                            style={{ animation: isVisible ? "shrink 7s linear forwards" : "none" }}
                        />
                    </div>

                    <div className="p-4 flex items-center gap-4">
                        {/* Icon - Minimal */}
                        <div className="relative flex-shrink-0">
                            <div className="h-10 w-10 flex items-center justify-center bg-shopici-blue/5 border border-shopici-blue/10">
                                <ShoppingCart className="h-5 w-5 text-shopici-blue" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center bg-shopici-coral text-white rounded-full">
                                <CheckCircle className="h-2.5 w-2.5" />
                            </span>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-shopici-blue">
                                    Achat Récent
                                </p>
                                <button onClick={() => setIsVisible(false)} className="text-shopici-gray hover:text-shopici-black transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <p className="text-[13px] font-bold text-shopici-black leading-tight mt-0.5 truncate">
                                {currentNotification.customerName} à {currentNotification.city}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[11px] text-shopici-charcoal/70 truncate">
                                    {currentNotification.productName}
                                </p>
                                <span className="text-[10px] text-shopici-coral font-bold ml-auto flex-shrink-0 whitespace-nowrap">
                                    {currentNotification.timeAgo}
                                </span >
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </>
    );
}