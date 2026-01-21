"use client"
import { useState, useEffect } from "react";
import { ShoppingCart, MapPin, CheckCircle, X } from "lucide-react";

type Notification = {
    id: string;
    customerName: string;
    city: string;
    productName: string;
    timeAgo: string;
};

// Sample realistic Cameroonian names and cities
const cameroonianNames = [
    "Amadou", "Fatima", "Jean-Paul", "Marie", "Ibrahim",
    "Christelle", "Patrick", "Aissatou", "Emmanuel", "Sylvie",
    "Ngando", "Bintou", "François", "Hawa", "Roger",
    "Aminata", "Claude", "Mariam", "Pascal", "Fadimatou"
];

const cameroonianCities = [
    "Yaoundé", "Douala", "Bafoussam", "Garoua", "Maroua",
    "Bamenda", "Ngaoundéré", "Bertoua", "Kribi", "Limbe",
    "Buea", "Ebolowa", "Kumba", "Edéa", "Dschang"
];

const products = [
    "Tondeuse Électrique",
    "Casque Bluetooth",
    "Montre Connectée",
    "Écouteurs Sans Fil",
    "Powerbank 20000mAh",
    "Lampe LED Rechargeable",
    "Ventilateur Portable",
    "Chargeur Rapide"
];

const timeOptions = [
    "à l'instant",
    "il y a 2 minutes",
    "il y a 5 minutes",
    "il y a 8 minutes",
    "il y a 12 minutes",
    "il y a 15 minutes"
];

// Generate random notification
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show first notification after 5 seconds
        const initialTimer = setTimeout(() => {
            showNewNotification();
        }, 5000);

        // Then show new notification every 15-25 seconds
        const interval = setInterval(() => {
            showNewNotification();
        }, Math.random() * 10000 + 15000); // Random between 15-25 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    const showNewNotification = () => {
        const newNotif = generateNotification();
        setCurrentNotification(newNotif);
        setIsVisible(true);
        setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep last 10

        // Auto-hide after 8 seconds
        setTimeout(() => {
            setIsVisible(false);
        }, 8000);
    };

    const closeNotification = () => {
        setIsVisible(false);
    };

    if (!currentNotification) return null;

    return (
        <>
            {/* Floating Notification */}
            <div
                className={`fixed bottom-4 left-4 z-40 w-[260px] sm:w-[300px] transition-all duration-300 ease-out ${isVisible
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0 pointer-events-none"
                    }`}
            >
                <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl shadow-lg border border-black/5">
                    {/* Accent gradient */}
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-sky-500" />

                    <div className="relative flex gap-3 p-3">
                        {/* Icon */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-semibold text-shopici-black">
                                    Commande confirmée
                                </p>
                                <button
                                    onClick={closeNotification}
                                    className="text-black/40 hover:text-black transition"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <p className="text-[11px] text-shopici-black leading-tight">
                                <span className="font-medium">
                                    {currentNotification.customerName}
                                </span>{" "}
                                <span className="text-black/50">
                                    • {currentNotification.city}
                                </span>
                            </p>

                            <p className="text-[10px] text-black/60 truncate">
                                {currentNotification.productName}
                            </p>

                            <div className="mt-1 flex items-center gap-1 text-[10px] text-black/50">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                </span>
                                {currentNotification.timeAgo}
                            </div>
                        </div>

                        {/* Cart icon */}
                        <ShoppingCart className="h-4 w-4 text-shopici-coral opacity-80" />
                    </div>

                    {/* Progress */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-sky-500"
                            style={{ animation: "shrink 8s linear forwards" }}
                        />
                    </div>
                </div>
            </div>
            {/* Styles for progress bar animation */}
            <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
        </>
    );
}

// Optional: Recent Orders List Component (can be shown in a modal or sidebar)
export function RecentOrdersList() {
    const [recentOrders] = useState<Notification[]>(
        Array.from({ length: 5 }, generateNotification)
    );

    return (
        <div className="bg-background border border-shopici-gray/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-shopici-black mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-shopici-coral" />
                Commandes récentes
            </h3>
            <div className="space-y-3">
                {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-start gap-3 p-3 bg-shopici-gray/10 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-shopici-black">
                                {order.customerName}
                            </p>
                            <p className="text-xs text-shopici-charcoal flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {order.city}
                            </p>
                            <p className="text-xs text-shopici-charcoal mt-1">
                                {order.productName} • {order.timeAgo}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-center text-shopici-charcoal mt-4">
                🔥 Plus de 2,500 commandes ce mois-ci
            </p>
        </div>
    );
}