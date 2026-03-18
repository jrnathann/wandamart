import { getHour } from "@/types/Ui";
// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <svg
      className="w-5 h-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── CallTimeSelector ─────────────────────────────────────────────────────────

export function CallTimeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const h = getHour();
  const slots = [
    ...(h >= 8 && h < 20
      ? [{ value: "now", emoji: "📲", label: "MAINTENANT", sub: "On vous appelle dans les minutes qui suivent", highlight: true, tomorrow: false }]
      : []),
    { value: "morning",   emoji: "🌅", label: "MATIN",      sub: h >= 12 ? "Demain 8h–12h"  : "Aujourd'hui 8h–12h",  highlight: false, tomorrow: h >= 12 },
    { value: "afternoon", emoji: "☀️", label: "APRÈS-MIDI", sub: h >= 17 ? "Demain 12h–17h" : "Aujourd'hui 12h–17h", highlight: false, tomorrow: h >= 17 },
    { value: "evening",   emoji: "🌙", label: "SOIR",       sub: h >= 20 ? "Demain 17h–20h" : "Aujourd'hui 17h–20h", highlight: false, tomorrow: h >= 20 },
  ];

  return (
    <div className="space-y-2">
      {slots.map((slot) => {
        const sel = value === slot.value;
        return (
          <button
            key={slot.value}
            type="button"
            onClick={() => onChange(slot.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center gap-3 ${
              sel
                ? slot.highlight
                  ? "bg-green-500 border-green-500 text-white shadow-md"
                  : "bg-shopici-blue border-shopici-blue text-white shadow-md"
                : "bg-white border-gray-200 text-shopici-black hover:border-shopici-blue"
            }`}
          >
            <span className="text-lg flex-shrink-0">{slot.emoji}</span>
            <span className="flex-1 text-left min-w-0">
              <span className="block text-sm leading-tight">{slot.label}</span>
              <span className={`block text-xs font-normal mt-0.5 ${sel ? "text-white/75" : "text-gray-400"}`}>
                {slot.sub}
              </span>
            </span>
            {slot.tomorrow && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${sel ? "bg-white/20 text-white" : "bg-orange-100 text-orange-500"}`}>
                demain
              </span>
            )}
            {slot.highlight && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${sel ? "bg-white/20 text-white" : "bg-green-100 text-green-600"}`}>
                dispo
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}