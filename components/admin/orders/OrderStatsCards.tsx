import { Package, Clock, Truck, CheckCircle } from "lucide-react";
import StatCard from "./shared/StatCard";

interface OrderStatsCardsProps {
  stats: {
    total: number;
    enPreparation: number;
    enRoute: number;
    livre: number;
  };
}

export default function OrderStatsCards({ stats }: OrderStatsCardsProps) {
  // Calculate percentages (mock data - replace with actual calculations)
  const totalOrders = stats.total || 1; // Avoid division by zero
  const preparationPercent = Math.round((stats.enPreparation / totalOrders) * 100);
  const enRoutePercent = Math.round((stats.enRoute / totalOrders) * 100);
  const livrePercent = Math.round((stats.livre / totalOrders) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total Commandes" 
        value={stats.total} 
        gradient="from-shopici-charcoal via-shopici-charcoal/90 to-shopici-black" 
        icon={<Package size={18} className="text-white" />}
        percentage={12}
        trend="up"
      />
      <StatCard 
        title="En préparation" 
        value={stats.enPreparation} 
        gradient="from-shopici-coral via-shopici-coral/90 to-orange-600" 
        icon={<Clock size={18} className="text-white" />}
        percentage={preparationPercent}
      />
      <StatCard 
        title="En route" 
        value={stats.enRoute} 
        gradient="from-shopici-blue via-shopici-blue/90 to-blue-700" 
        icon={<Truck size={18} className="text-white" />}
        percentage={enRoutePercent}
      />
      <StatCard 
        title="Livré" 
        value={stats.livre} 
        gradient="from-green-500 via-green-600 to-emerald-700" 
        icon={<CheckCircle size={18} className="text-white" />}
        percentage={livrePercent}
      />
    </div>
  );
}
