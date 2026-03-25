// components/admin/orders/shared/StatCard.tsx
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  percentage?: number;
  trend?: 'up' | 'down';
  accentColor?: string; // e.g., "coral" or "blue"
}

export default function StatCard({ 
  title, 
  value, 
  icon,
  percentage,
  trend,
  accentColor = "coral" 
}: StatCardProps) {
  
  // Logic to handle colors based on the accentColor prop
  const isCoral = accentColor === "coral";
  const themeClass = isCoral ? "text-shopici-coral" : "text-shopici-blue";
  const bgClass = isCoral ? "bg-shopici-coral" : "bg-shopici-blue";

  return (
    <div className="group relative bg-white border border-shopici-black/[0.08] hover:border-shopici-black/20 transition-all duration-500 rounded-none p-6 flex flex-col justify-between h-full min-h-[180px] overflow-hidden">
      
      {/* 1. HEADER SECTION: Title & Live Sync Status */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-shopici-black/50 leading-none">
            {title}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full ${bgClass} animate-pulse`} />
            <span className="text-[9px] font-bold text-shopici-black/20 uppercase tracking-tighter italic">
              Live Sync
            </span>
          </div>
        </div>

        {/* 2. ICON CONTAINER: Refined Blueprint Style */}
        {icon && (
          <div className="bg-shopici-black p-2">
            <div className="scale-90">
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* 3. VALUE SECTION: Big Data & Trends */}
      <div className="mt-8 flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black tracking-tighter text-shopici-black tabular-nums leading-none">
            {value}
          </p>
          <span className="text-[10px] font-black uppercase text-shopici-black/20 italic">
            Units
          </span>
        </div>

        {/* TREND BADGE: Logic for Up/Down/Neutral */}
        {percentage !== undefined && (
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
            trend === 'up' ? 'text-green-600' : 'text-shopici-coral'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            <span>{percentage > 0 ? '+' : ''}{percentage}%</span>
            <span className="text-shopici-black/10 font-bold lowercase tracking-tighter">vs prev</span>
          </div>
        )}
      </div>

      {/* 4. FOOTER: Industrial Precision Line */}
      <div className="mt-6 space-y-3">
        <div className="w-full h-[1px] bg-shopici-black/[0.05] relative overflow-hidden">
          <div className={`absolute inset-y-0 left-0 w-1/3 ${bgClass} opacity-40`} />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-bold uppercase tracking-widest text-shopici-black/20">
            Registre consolidé
          </span>
          {/* Blueprint Dots */}
          <div className="flex gap-1">
            <div className="w-0.5 h-0.5 bg-shopici-black/10" />
            <div className="w-0.5 h-0.5 bg-shopici-black/10" />
            <div className="w-0.5 h-0.5 bg-shopici-black/10" />
          </div>
        </div>
      </div>

      {/* Subtle Corner Detail */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-2 right-2 w-1 h-1 bg-shopici-black/10" />
      </div>
    </div>
  );
}