import { Clock } from "lucide-react";

interface UrgencyBannerProps {
    timeLeft: number;
}

export default function UrgencyBanner({ timeLeft }: UrgencyBannerProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-gradient-to-r from-shopici-coral to-orange-600 text-white py-3 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm md:text-base font-semibold">
                <Clock className="w-5 h-5 animate-pulse" />
                <span>OFFRE LIMITÉE - Prix spécial expire dans: {formatTime(timeLeft)}</span>
            </div>
        </div>
    );
}