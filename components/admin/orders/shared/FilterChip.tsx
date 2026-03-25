// components/admin/orders/shared/FilterChip.tsx

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  // We transition from soft 'color' strings to a unified 'variant' logic
  variant?: "black" | "blue" | "coral";
}

export default function FilterChip({ 
  label, 
  active, 
  onClick, 
  variant = "black" 
}: FilterChipProps) {
  
  // Industrial variant mapping
  const activeStyles = {
    black: "bg-shopici-black text-white border-shopici-black",
    blue: "bg-shopici-blue text-white border-shopici-blue",
    coral: "bg-shopici-coral text-white border-shopici-coral",
  }[variant];

  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 rounded-none border-1
        ${active 
          ? `${activeStyles} shadow-[4px_4px_0px_rgba(0,0,0,0.1)] translate-x-[-2px] translate-y-[-2px]` 
          : 'bg-white border-shopici-black/5 hover:border-shopici-black/20 hover:text-shopici-black text-shopici-black'
        }
      `}
    >
      <div className="flex items-center gap-2">
        {active && (
          <span className="w-1 h-1 bg-white animate-pulse" />
        )}
        {label}
      </div>
    </button>
  );
}