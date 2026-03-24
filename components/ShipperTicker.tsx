"use client";

import { Truck, MapPin } from "lucide-react";

const CITIES = [
    "Douala", "Yaoundé", "Garoua", "Bamenda", "Maroua", 
    "Bafoussam", "Kousseri", "Ngaoundéré", "Kumba", "Loum"
];

const TICKER_CITIES = [...CITIES, ...CITIES, ...CITIES];

export default function ShippingTicker() {
    return (
        <div className="relative w-full bg-shopici-black py-3 md:py-4 border-y-2 border-shopici-coral overflow-hidden">
            {/* ── Scoped CSS Animations ── */}
            <style jsx>{`
                @keyframes ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @keyframes shopici-blink {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.92); }
                }
                .animate-ticker {
                    display: flex;
                    width: max-content;
                    animation: ticker-scroll 20s linear infinite;
                }
                .animate-shopici-blink {
                    animation: shopici-blink 1.2s ease-in-out infinite;
                }
            `}</style>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-2 md:gap-0">
                
                {/* ── Header Badge (Responsive Layout) ── */}
                <div className="relative z-10 flex items-center gap-3 bg-shopici-black px-4 md:pr-8 md:border-r border-white/10 shrink-0">
                    <div className="bg-shopici-coral p-1.5 md:p-2 rounded-lg animate-shopici-blink">
                        <Truck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-shopici-coral leading-none mb-1">
                            Zones Éligibles
                        </span>
                        <h2 className="text-base md:text-xl font-black italic uppercase tracking-tighter text-white leading-none">
                            Livraison <span className="text-shopici-blue">Gratuite</span>
                        </h2>
                    </div>
                </div>

                {/* ── The Moving Ticker ── */}
                <div className="flex-1 w-full overflow-hidden relative mt-1 md:mt-0">
                    <div className="animate-ticker">
                        {TICKER_CITIES.map((city, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center gap-2 px-4 md:px-8"
                            >
                                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-shopici-blue" />
                                <span className="text-sm md:text-lg font-black italic uppercase tracking-tight text-white/90 whitespace-nowrap">
                                    {city}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Fades for Mobile/Desktop Depth */}
                    <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-shopici-black to-transparent z-0" />
                    <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-shopici-black to-transparent z-0" />
                </div>
            </div>
        </div>
    );
}