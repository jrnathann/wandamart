"use client";

interface ProHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  pluralLabel?: string;
}

export default function ProHeader({
  title,
  subtitle = "Base de données système",
  count,
  pluralLabel = "Entrée",
}: ProHeaderProps) {
  // Gestion propre du pluriel sans underscores
  const label = count !== undefined && count > 1 ? `${pluralLabel}s` : pluralLabel;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-shopici-black/[0.08] pb-10">
      <div className="space-y-4">
        {/* TITRE : Impact visuel fort */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-shopici-black leading-none">
          {title}
        </h1>

        {/* SUBTITLE : Typographie technique aérée */}
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-8 bg-shopici-coral" />
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-shopici-black/40">
            {subtitle}
          </p>
        </div>
      </div>

      {/* STATS BADGE : Look industriel rigide */}
      {count !== undefined && (
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="bg-shopici-black text-white px-5 py-3 flex items-baseline gap-2 min-w-[140px] justify-center sm:justify-end">
            <span className="text-2xl font-black tabular-nums leading-none">
              {count.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {label}
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/20 mr-1">
            Registre consolidé
          </span>
        </div>
      )}
    </div>
  );
}