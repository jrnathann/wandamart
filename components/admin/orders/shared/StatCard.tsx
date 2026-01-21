
// components/admin/orders/shared/StatCard.tsx
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  gradient: string;
  icon?: React.ReactNode;
  percentage?: number;
  trend?: 'up' | 'down';
}

export default function StatCard({ 
  title, 
  value, 
  gradient, 
  icon,
  percentage,
  trend 
}: StatCardProps) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-5 shadow-lg border-2 border-white/20 overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
      {/* Vintage pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:24px_24px]" />
      
      {/* Decorative corner elements */}
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
      
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80 drop-shadow-sm">
            {title}
          </p>
          {icon && (
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-white drop-shadow-md">
            {value}
          </p>
          
          {/* Percentage badge */}
          {percentage !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
              trend === 'up' 
                ? 'bg-white/90 text-green-600 border-white/50' 
                : trend === 'down'
                ? 'bg-white/90 text-red-600 border-white/50'
                : 'bg-white/90 text-gray-600 border-white/50'
            }`}>
              {trend === 'up' && <TrendingUp size={12} />}
              {trend === 'down' && <TrendingDown size={12} />}
              {percentage > 0 ? '+' : ''}{percentage}%
            </div>
          )}
        </div>
        
        {/* Decorative line */}
        <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
    </div>
  );
}