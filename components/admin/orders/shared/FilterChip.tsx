// components/admin/orders/shared/FilterChip.tsx
interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

export default function FilterChip({ label, active, onClick, color }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
        active 
          ? `${color} shadow-md` 
          : 'bg-white text-shopici-charcoal border-slate-200 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}