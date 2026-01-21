"use client";

interface VintageHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  pluralLabel?: string;
}

export default function VintageHeader({
  title,
  subtitle = "Base de données complète",
  count,
  pluralLabel = "client",
}: VintageHeaderProps) {
  const plural = count !== undefined && count > 1 ? "s" : "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="relative">
        <h1 className="text-3xl md:text-4xl font-bold text-shopici-black mb-2">
          {title}
        </h1>

        <div className="h-1 w-24 bg-gradient-to-r from-shopici-coral via-shopici-blue to-transparent rounded-full" />

        {(count !== undefined || subtitle) && (
          <p className="text-sm text-shopici-charcoal mt-2">
            {count !== undefined && (
              <>
                {count} {pluralLabel}
                {plural}
              </>
            )}
            {count !== undefined && subtitle && " • "}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
