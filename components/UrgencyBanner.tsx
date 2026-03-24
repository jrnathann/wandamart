"use client";

import { Clock, Zap } from "lucide-react";

interface UrgencyBannerProps {
    timeLeft: number;
}

export default function UrgencyBanner({ timeLeft }: UrgencyBannerProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return {
            mins: mins.toString().padStart(2, "0"),
            secs: secs.toString().padStart(2, "0")
        };
    };

    const time = formatTime(timeLeft);

    return (
        <div className="relative bg-shopici-coral text-white py-2.5 px-4 overflow-hidden border-b border-white/10">
            {/* ── Background Pattern (Subtle motion) ── */}
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.1)_20px,rgba(255,255,255,0.1)_40px)] animate-[slide_20s_linear_infinite]" />

            <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-4">
                {/* Status Badge */}
                <div className="hidden md:flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-inner">
                    <Zap className="w-3 h-3 fill-current" />
                    Flash Sale
                </div>

                <div className="flex items-center gap-3 text-xs md:text-sm font-black uppercase tracking-[0.15em]">
                    <Clock className="w-4 h-4 animate-pulse text-white" />
                    <span className="shrink-0">L'offre expire dans :</span>
                    
                    {/* ── The Timer Digits ── */}
                    <div className="flex items-center gap-1 font-mono text-base md:text-lg tracking-tighter">
                        <div className="bg-white text-shopici-coral px-1.5 py-0.5 rounded shadow-sm">
                            {time.mins}
                        </div>
                        <span className="text-white animate-pulse">:</span>
                        <div className="bg-white text-shopici-coral px-1.5 py-0.5 rounded shadow-sm">
                            {time.secs}
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                    * Jusqu'à épuisement des stocks
                </div>
            </div>

            <style jsx>{`
                @keyframes slide {
                    from { background-position: 0 0; }
                    to { background-position: 500px 0; }
                }
            `}</style>
        </div>
    );
}