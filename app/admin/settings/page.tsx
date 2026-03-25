"use client";

import { useState, useEffect, useRef } from "react";
import {
  Store, Phone, Mail, MapPin, Facebook, Instagram,
  BarChart2, Zap, Palette, Plus, Trash2, Upload,
  Save, Loader2, Check, AlertCircle, Sliders,
  LayoutTemplate, CreditCard, Globe, Image as ImageIcon,
  ChevronDown, ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import ActionButton from "@/components/admin/orders/shared/ActionButton";
import { useNotify } from "@/context/NotifyContext";
// ─── Types ────────────────────────────────────────────────────────────────────

interface BannerSlide {
  _id?: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  bgColor: string; // Always stored as Tailwind gradient: "from-X to-Y"
}

interface StoreConfig {
  name: string;
  logo: string;
  description: string;
  objective: string;
  contact: { email: string; phone: string; address: string };
  currency: string;
  social: { facebook: string; instagram: string };
  tracking: { facebookPixelId: string; googleAnalyticsId: string };
  bannerSlides: BannerSlide[];
  theme: { colors: { black: string; blue: string; coral: string } };
  features: { mobileMoneyPayment: boolean };
}

const defaultConfig: StoreConfig = {
  name: "",
  logo: "",
  description: "",
  objective: "",
  contact: { email: "", phone: "", address: "" },
  currency: "XAF",
  social: { facebook: "", instagram: "" },
  tracking: { facebookPixelId: "", googleAnalyticsId: "" },
  bannerSlides: [],
  theme: { colors: { black: "#020202", blue: "#869FAD", coral: "#E9796F" } },
  features: { mobileMoneyPayment: true },
};

// ─── bgColor normalization ────────────────────────────────────────────────────

const FALLBACK_GRADIENT = "from-blue-500 to-purple-600";

/**
 * Ensures bgColor is always a valid Tailwind gradient string.
 * If it's a hex, empty, or unrecognized format, returns the fallback.
 */
function normalizeBgColor(value: string | undefined | null): string {
  if (!value) return FALLBACK_GRADIENT;
  // Already a valid gradient string
  if (value.includes("from-") && value.includes("to-")) return value;
  // It's a hex or something else — replace with fallback
  return FALLBACK_GRADIENT;
}

/**
 * Normalize all banner slides coming from the API.
 */
function normalizeSlides(slides: BannerSlide[]): BannerSlide[] {
  return slides.map(slide => ({
    ...slide,
    bgColor: normalizeBgColor(slide.bgColor),
  }));
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "general", label: "Général", icon: Store },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "social", label: "Réseaux", icon: Globe },
  { id: "tracking", label: "Analytics", icon: BarChart2 },
  { id: "theme", label: "Thème", icon: Palette },
  { id: "banners", label: "Bannières", icon: LayoutTemplate },
  { id: "features", label: "Fonctions", icon: Zap },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Primitives ───────────────────────────────────────────────────────────────

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-2 relative">
      {/* Label: Shifted to high-contrast black with extra tracking for a 'technical' feel */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-black text-shopici-black uppercase tracking-[0.15em] leading-none">
          {label}
        </label>
        <div className="h-[1px] flex-1 bg-shopici-black/5 group-focus-within:bg-shopici-blue/20 transition-colors" />
      </div>

      {/* Input Slot */}
      <div className="relative">
        {children}
      </div>

      {/* Hint: Formatted like a code comment // */}
      {hint && (
        <p className="text-[10px] font-mono text-shopici-charcoal/40 mt-0.5 flex items-start gap-1">
          <span className="text-shopici-blue/40 font-bold">//</span>
          {hint}
        </p>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 text-[13px] font-bold border border-shopici-charcoal/15 rounded-none
        focus:outline-none focus:border-shopici-blue focus:bg-white
        bg-shopici-gray/5 text-shopici-black placeholder:text-shopici-charcoal/20 
        transition-all duration-200 border-l-2 focus:border-l-shopici-blue"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 text-[13px] font-bold border border-shopici-charcoal/15 rounded-none
        focus:outline-none focus:border-shopici-blue focus:bg-white
        bg-shopici-gray/5 text-shopici-black placeholder:text-shopici-charcoal/20 
        transition-all duration-200 border-l-2 focus:border-l-shopici-blue resize-none
        scrollbar-thin scrollbar-thumb-shopici-charcoal/20"
    />
  );
}

function IconInput({ value, onChange, placeholder, type = "text", icon }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative">
      {/* Icon Wrapper: High contrast background on focus for a 'modular' look */}
      <span className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center 
        text-shopici-charcoal/40 group-focus-within:text-shopici-blue 
        border-r border-shopici-charcoal/10 transition-colors pointer-events-none">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-14 pr-4 py-3 text-[13px] font-bold border border-shopici-charcoal/15 rounded-none
          focus:outline-none focus:border-shopici-blue focus:bg-white
          bg-shopici-gray/5 text-shopici-black placeholder:text-shopici-charcoal/20 
          transition-all duration-200 border-l-2 focus:border-l-shopici-blue"
      />
    </div>
  );
}
// ─── Image upload ─────────────────────────────────────────────────────────────

function ImageUpload({ value, onChange, label = "Charger l'Asset", previewSize = "md" }: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewSize?: "sm" | "md" | "lg";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  // Industrial scale: slightly larger, strictly square
  const sizeClass = previewSize === "sm" ? "h-16 w-16" : previewSize === "lg" ? "h-32 w-32" : "h-24 w-24";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onChange(data.url);
    } catch {
      setError("ERREUR_SYS: Échec de l'upload.");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-6 group">
      {/* Asset Preview Frame */}
      <div className={`${sizeClass} relative border border-shopici-charcoal/20 bg-shopici-gray/5 
        flex items-center justify-center overflow-hidden shrink-0 transition-all
        group-hover:border-shopici-blue/40`}>

        {value ? (
          <img src={value} alt="asset-preview" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon size={20} className="text-shopici-charcoal/20" />
            <span className="text-[8px] font-black uppercase text-shopici-charcoal/20 tracking-tighter">No_Data</span>
          </div>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-shopici-black/60 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-3 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em]
              bg-shopici-black text-white hover:bg-shopici-blue disabled:bg-shopici-charcoal/40 
              transition-all duration-200 shadow-sm"
          >
            {uploading ? "SÉQUENCE_CHARGEMENT..." : label}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[9px] font-bold text-shopici-coral/60 hover:text-shopici-coral 
                uppercase tracking-widest text-left pt-1 transition-colors"
            >
              [ Effacer L'entrée ]
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2 bg-shopici-coral/5 border-l-2 border-shopici-coral">
            <AlertCircle size={12} className="text-shopici-coral" />
            <span className="text-[10px] font-mono font-bold text-shopici-coral">{error}</span>
          </div>
        )}
      </div>

      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
// ─── Color field ──────────────────────────────────────────────────────────────

function ColorField({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 group">
      {/* Small Technical Label */}
      <label className="text-[10px] font-black text-shopici-charcoal/40 uppercase tracking-[0.2em]">
        {label}
      </label>

      <div className="flex items-stretch gap-0">
        {/* Integrated Color Swatch & Native Picker */}
        <div className="relative w-12 h-12 border border-shopici-charcoal/20 shrink-0 bg-white p-1">
          <div
            className="w-full h-full transition-colors duration-300"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* HEX Data Input */}
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-shopici-charcoal/30 font-bold pointer-events-none">
            HEX_
          </span>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="#000000"
            className="w-full h-full pl-12 pr-4 text-[13px] font-mono font-bold border border-l-0 border-shopici-charcoal/20 rounded-none
              focus:outline-none focus:border-shopici-blue focus:bg-white
              bg-shopici-gray/5 text-shopici-black transition-all uppercase"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Feature toggle ───────────────────────────────────────────────────────────

function FeatureToggle({ label, description, icon, value, onChange }: {
  label: string;
  description: string;
  icon: React.ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={`flex items-center justify-between p-5 border transition-all duration-300
      ${value
        ? "border-shopici-blue/30 bg-shopici-blue/[0.02]"
        : "border-shopici-charcoal/10 bg-transparent"}`}>

      <div className="flex items-center gap-4">
        {/* Modular Icon Housing */}
        <div className={`w-12 h-12 flex items-center justify-center border transition-colors
          ${value
            ? "border-shopici-blue bg-shopici-blue/10 text-shopici-blue"
            : "border-shopici-charcoal/10 bg-shopici-gray/5 text-shopici-charcoal/30"}`}>
          {icon}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-black uppercase tracking-tight text-shopici-black">
              {label}
            </p>
            {value && (
              <span className="text-[8px] font-black px-1.5 py-0.5 bg-green-500 text-white uppercase tracking-tighter">
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-shopici-charcoal/50 mt-1 leading-tight max-w-[280px]">
            {description}
          </p>
        </div>
      </div>

      {/* Industrial Rectangular Switch */}
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-14 h-7 border-2 transition-all duration-200 shrink-0
          ${value ? "border-green-500 bg-shopici-blue/5" : "border-shopici-charcoal/20 bg-shopici-gray/10"}`}
        aria-pressed={value}
        aria-label={label}
      >
        <div className={`absolute top-0.5 bottom-0.5 w-5 transition-all duration-300
          ${value
            ? "right-0.5 bg-green-500 shadow-[0_0_10px_rgba(134,159,173,0.5)]"
            : "left-0.5 bg-shopici-charcoal/30"}`}
        />
      </button>
    </div>
  );
}

// ─── Tailwind gradient builder ────────────────────────────────────────────────

const TW_COLORS = [
  { label: "Slate", stops: ["slate-300", "slate-400", "slate-500", "slate-600", "slate-700", "slate-800", "slate-900"] },
  { label: "Gray", stops: ["gray-300", "gray-400", "gray-500", "gray-600", "gray-700", "gray-800", "gray-900"] },
  { label: "Red", stops: ["red-300", "red-400", "red-500", "red-600", "red-700", "red-800"] },
  { label: "Orange", stops: ["orange-300", "orange-400", "orange-500", "orange-600", "orange-700"] },
  { label: "Amber", stops: ["amber-300", "amber-400", "amber-500", "amber-600", "amber-700"] },
  { label: "Yellow", stops: ["yellow-300", "yellow-400", "yellow-500", "yellow-600"] },
  { label: "Lime", stops: ["lime-300", "lime-400", "lime-500", "lime-600", "lime-700"] },
  { label: "Green", stops: ["green-300", "green-400", "green-500", "green-600", "green-700", "green-800"] },
  { label: "Teal", stops: ["teal-300", "teal-400", "teal-500", "teal-600", "teal-700", "teal-800"] },
  { label: "Cyan", stops: ["cyan-300", "cyan-400", "cyan-500", "cyan-600", "cyan-700"] },
  { label: "Sky", stops: ["sky-300", "sky-400", "sky-500", "sky-600", "sky-700", "sky-800"] },
  { label: "Blue", stops: ["blue-300", "blue-400", "blue-500", "blue-600", "blue-700", "blue-800"] },
  { label: "Indigo", stops: ["indigo-300", "indigo-400", "indigo-500", "indigo-600", "indigo-700", "indigo-800"] },
  { label: "Violet", stops: ["violet-300", "violet-400", "violet-500", "violet-600", "violet-700", "violet-800"] },
  { label: "Purple", stops: ["purple-300", "purple-400", "purple-500", "purple-600", "purple-700", "purple-800"] },
  { label: "Fuchsia", stops: ["fuchsia-300", "fuchsia-400", "fuchsia-500", "fuchsia-600", "fuchsia-700"] },
  { label: "Pink", stops: ["pink-300", "pink-400", "pink-500", "pink-600", "pink-700", "pink-800"] },
  { label: "Rose", stops: ["rose-300", "rose-400", "rose-500", "rose-600", "rose-700", "rose-800"] },
];

const GRADIENT_PRESETS = [
  { label: "Océan", value: "from-blue-500 to-cyan-400" },
  { label: "Coucher", value: "from-orange-400 to-pink-600" },
  { label: "Forêt", value: "from-green-500 to-teal-700" },
  { label: "Crépuscule", value: "from-purple-600 to-pink-500" },
  { label: "Nuit", value: "from-slate-800 to-blue-900" },
  { label: "Feu", value: "from-red-500 to-orange-400" },
  { label: "Lavande", value: "from-indigo-400 to-violet-500" },
  { label: "Menthe", value: "from-teal-400 to-green-300" },
  { label: "Rose Gold", value: "from-rose-400 to-amber-300" },
  { label: "Profond", value: "from-gray-900 to-slate-700" },
  { label: "Aqua", value: "from-cyan-500 to-blue-600" },
  { label: "Tropique", value: "from-lime-400 to-cyan-500" },
];

const DIR_OPTIONS = [
  { value: "r", label: "→" },
  { value: "l", label: "←" },
  { value: "b", label: "↓" },
  { value: "t", label: "↑" },
  { value: "br", label: "↘" },
  { value: "bl", label: "↙" },
  { value: "tr", label: "↗" },
  { value: "tl", label: "↖" },
];

function parseBgColor(val: string) {
  const fromMatch = val.match(/from-([\w-]+)/);
  const toMatch = val.match(/to-([\w-]+)/);
  const dirMatch = val.match(/bg-gradient-to-(\w+)/);
  return {
    from: fromMatch?.[1] ?? "blue-500",
    to: toMatch?.[1] ?? "purple-600",
    dir: dirMatch?.[1] ?? "r",
  };
}

function buildBgColor(from: string, to: string, dir: string) {
  return `bg-gradient-to-${dir} from-${from} to-${to}`;
}

const TW_HEX: Record<string, string> = {
  "slate-300": "#cbd5e1", "slate-400": "#94a3b8", "slate-500": "#64748b", "slate-600": "#475569", "slate-700": "#334155", "slate-800": "#1e293b", "slate-900": "#0f172a",
  "gray-300": "#d1d5db", "gray-400": "#9ca3af", "gray-500": "#6b7280", "gray-600": "#4b5563", "gray-700": "#374151", "gray-800": "#1f2937", "gray-900": "#111827",
  "red-300": "#fca5a5", "red-400": "#f87171", "red-500": "#ef4444", "red-600": "#dc2626", "red-700": "#b91c1c", "red-800": "#991b1b",
  "orange-300": "#fdba74", "orange-400": "#fb923c", "orange-500": "#f97316", "orange-600": "#ea580c", "orange-700": "#c2410c",
  "amber-300": "#fcd34d", "amber-400": "#fbbf24", "amber-500": "#f59e0b", "amber-600": "#d97706", "amber-700": "#b45309",
  "yellow-300": "#fde047", "yellow-400": "#facc15", "yellow-500": "#eab308", "yellow-600": "#ca8a04",
  "lime-300": "#bef264", "lime-400": "#a3e635", "lime-500": "#84cc16", "lime-600": "#65a30d", "lime-700": "#4d7c0f",
  "green-300": "#86efac", "green-400": "#4ade80", "green-500": "#22c55e", "green-600": "#16a34a", "green-700": "#15803d", "green-800": "#166534",
  "teal-300": "#5eead4", "teal-400": "#2dd4bf", "teal-500": "#14b8a6", "teal-600": "#0d9488", "teal-700": "#0f766e", "teal-800": "#115e59",
  "cyan-300": "#67e8f9", "cyan-400": "#22d3ee", "cyan-500": "#06b6d4", "cyan-600": "#0891b2", "cyan-700": "#0e7490",
  "sky-300": "#7dd3fc", "sky-400": "#38bdf8", "sky-500": "#0ea5e9", "sky-600": "#0284c7", "sky-700": "#0369a1", "sky-800": "#075985",
  "blue-300": "#93c5fd", "blue-400": "#60a5fa", "blue-500": "#3b82f6", "blue-600": "#2563eb", "blue-700": "#1d4ed8", "blue-800": "#1e40af",
  "indigo-300": "#a5b4fc", "indigo-400": "#818cf8", "indigo-500": "#6366f1", "indigo-600": "#4f46e5", "indigo-700": "#4338ca", "indigo-800": "#3730a3",
  "violet-300": "#c4b5fd", "violet-400": "#a78bfa", "violet-500": "#8b5cf6", "violet-600": "#7c3aed", "violet-700": "#6d28d9", "violet-800": "#5b21b6",
  "purple-300": "#d8b4fe", "purple-400": "#c084fc", "purple-500": "#a855f7", "purple-600": "#9333ea", "purple-700": "#7e22ce", "purple-800": "#6b21a8",
  "fuchsia-300": "#f0abfc", "fuchsia-400": "#e879f9", "fuchsia-500": "#d946ef", "fuchsia-600": "#c026d3", "fuchsia-700": "#a21caf",
  "pink-300": "#f9a8d4", "pink-400": "#f472b6", "pink-500": "#ec4899", "pink-600": "#db2777", "pink-700": "#be185d", "pink-800": "#9d174d",
  "rose-300": "#fda4af", "rose-400": "#fb7185", "rose-500": "#f43f5e", "rose-600": "#e11d48", "rose-700": "#be123c", "rose-800": "#9f1239",
};

function twHex(name: string) { return TW_HEX[name] ?? "#888888"; }

function ColorStop({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs text-shopici-charcoal/60 font-medium">{label}</label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 border border-shopici-charcoal/10 rounded-xl
          bg-shopici-gray/5 hover:border-shopici-charcoal/25 transition-all text-left">
        <span className="w-5 h-5 rounded-md border border-white/30 shrink-0"
          style={{ backgroundColor: twHex(value) }} />
        <span className="text-xs font-mono text-shopici-charcoal flex-1">{value}</span>
        <ChevronDown size={13} className="text-shopici-charcoal/40 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-1 w-72 bg-white rounded-xl border border-shopici-charcoal/15
          shadow-xl p-3 space-y-2 max-h-64 overflow-y-auto">
          {TW_COLORS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-shopici-charcoal/40 uppercase tracking-widest mb-1">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.stops.map(stop => (
                  <button key={stop} type="button"
                    onClick={() => { onChange(stop); setOpen(false); }}
                    title={stop}
                    className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${value === stop ? "border-shopici-blue scale-110" : "border-transparent"
                      }`}
                    style={{ backgroundColor: twHex(stop) }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GradientBuilder({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Always normalize before parsing — handles legacy hex values gracefully
  const normalized = normalizeBgColor(value);
  const parsed = parseBgColor(normalized);

  const [from, setFrom] = useState(parsed.from);
  const [to, setTo] = useState(parsed.to);
  const [dir, setDir] = useState(parsed.dir);

  // If the incoming value changes (e.g. slide switcher), resync local state
  useEffect(() => {
    const p = parseBgColor(normalizeBgColor(value));
    setFrom(p.from);
    setTo(p.to);
    setDir(p.dir);
  }, [value]);

  function update(newFrom: string, newTo: string, newDir: string) {
    onChange(buildBgColor(newFrom, newTo, newDir));
  }

  function handleFrom(v: string) { setFrom(v); update(v, to, dir); }
  function handleTo(v: string) { setTo(v); update(from, v, dir); }
  function handleDir(v: string) { setDir(v); update(from, to, v); }

  function applyPreset(preset: string) {
    const p = parseBgColor(preset);
    setFrom(p.from); setTo(p.to); setDir(p.dir);
    onChange(preset);
  }

  const previewStyle = {
    background: `linear-gradient(${{
      r: "to right", l: "to left", b: "to bottom", t: "to top",
      br: "to bottom right", bl: "to bottom left", tr: "to top right", tl: "to top left"
    }[dir] ?? "to right"
      }, ${twHex(from)}, ${twHex(to)})`,
  };

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div>
        <p className="text-xs text-shopici-charcoal/50 font-medium mb-2">Presets</p>
        <div className="grid grid-cols-4 gap-1.5">
          {GRADIENT_PRESETS.map(p => {
            const pp = parseBgColor(p.value);
            const isActive = normalized === p.value;
            return (
              <button key={p.value} type="button" onClick={() => applyPreset(p.value)}
                title={p.label}
                className={`h-8 rounded-lg border-2 transition-all hover:scale-105 text-[10px] font-bold text-white/90
                  ${isActive ? "border-shopici-blue scale-105 shadow-md" : "border-transparent"}`}
                style={{ background: `linear-gradient(to right, ${twHex(pp.from)}, ${twHex(pp.to)})` }}>
                {isActive ? "✓" : ""}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          {GRADIENT_PRESETS.map(p => (
            <span key={p.value} className="text-[10px] text-center text-shopici-charcoal/50">{p.label}</span>
          ))}
        </div>
      </div>

      {/* Custom builder */}
      <div className="grid grid-cols-2 gap-3">
        <ColorStop label="Couleur de départ" value={from} onChange={handleFrom} />
        <ColorStop label="Couleur d'arrivée" value={to} onChange={handleTo} />
      </div>

      {/* Direction */}
      <div>
        <p className="text-xs text-shopici-charcoal/50 font-medium mb-2">Direction</p>
        <div className="flex gap-1.5 flex-wrap">
          {DIR_OPTIONS.map(d => (
            <button key={d.value} type="button" onClick={() => handleDir(d.value)}
              className={`w-9 h-9 text-sm rounded-lg border transition-all ${dir === d.value
                ? "border-shopici-blue/50 bg-shopici-blue/10 text-shopici-blue font-bold"
                : "border-shopici-charcoal/10 text-shopici-charcoal/60 hover:border-shopici-charcoal/25"
                }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-xl h-12 border border-shopici-charcoal/10 transition-all" style={previewStyle} />

      {/* Output string */}
      <div className="flex items-center gap-2 px-3 py-2 bg-shopici-gray/5 border border-shopici-charcoal/10 rounded-xl">
        <span className="text-xs font-mono text-shopici-charcoal/60 flex-1 truncate">
          {buildBgColor(from, to, dir)}
        </span>
      </div>
    </div>
  );
}

// ─── Banner slide card ────────────────────────────────────────────────────────

function BannerSlideCard({ slide, index, onChange, onRemove }: {
  slide: BannerSlide; index: number;
  onChange: (s: BannerSlide) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);

  function set<K extends keyof BannerSlide>(key: K, val: BannerSlide[K]) {
    onChange({ ...slide, [key]: val });
  }

  const parsed = parseBgColor(normalizeBgColor(slide.bgColor));
  const swatchStyle = {
    background: `linear-gradient(to right, ${twHex(parsed.from)}, ${twHex(parsed.to)})`,
  };

  return (
    <div className="border border-shopici-charcoal/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-shopici-gray/5 cursor-pointer"
        onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-shopici-charcoal/10 shrink-0" style={swatchStyle} />
          <span className="text-sm font-semibold text-shopici-black">
            Slide {index + 1}
            {slide.title && <span className="font-normal text-shopici-charcoal/60 ml-2">— {slide.title}</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 text-shopici-coral/60 hover:text-shopici-coral hover:bg-shopici-coral/10 rounded-lg transition-all">
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={15} className="text-shopici-charcoal/40" />
            : <ChevronDown size={15} className="text-shopici-charcoal/40" />}
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Titre">
              <Input value={slide.title} onChange={v => set("title", v)} placeholder="Grande accroche" />
            </Field>
            <Field label="Bouton CTA">
              <Input value={slide.cta} onChange={v => set("cta", v)} placeholder="Commander maintenant" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Sous-titre">
                <Input value={slide.subtitle} onChange={v => set("subtitle", v)} placeholder="Texte d'accompagnement" />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-shopici-charcoal/10 overflow-hidden">
            <div className="px-4 py-2.5 bg-shopici-gray/5 border-b border-shopici-charcoal/8">
              <span className="text-xs font-semibold text-shopici-charcoal uppercase tracking-wider">
                Dégradé de fond
              </span>
            </div>
            <div className="p-4">
              <GradientBuilder value={slide.bgColor} onChange={v => set("bgColor", v)} />
            </div>
          </div>

          <Field label="Image du slide">
            <ImageUpload value={slide.image} onChange={v => set("image", v)}
              label="Upload image" previewSize="sm" />
          </Field>
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-shopici-charcoal/8 rounded-xl animate-pulse ${className}`} />;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-5 py-1">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-1.5">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      ))}
      <div className="space-y-1.5">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-20 w-full" />
      </div>
      <div className="space-y-1.5">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-10 w-40" />
      </div>
    </div>
  );
}

function Toast({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  const map = {
    saving: { icon: <Loader2 size={15} className="animate-spin" />, text: "Enregistrement…", cls: "bg-shopici-blue text-white" },
    saved: { icon: <Check size={15} />, text: "Paramètres sauvegardés", cls: "bg-green-500 text-white" },
    error: { icon: <AlertCircle size={15} />, text: "Échec, réessayez", cls: "bg-shopici-coral text-white" },
  };
  const { icon, text, cls } = map[status];
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3
      rounded-2xl shadow-xl text-sm font-semibold ${cls} transition-all`}>
      {icon} {text}
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function GeneralTab({ config, set }: { config: StoreConfig; set: (k: keyof StoreConfig, v: any) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Logo de la boutique">
        <ImageUpload value={config.logo} onChange={v => set("logo", v)}
          label="Upload logo" previewSize="lg" />
      </Field>
      <Field label="Nom de la boutique" hint="Affiché dans le header et les emails.">
        <Input value={config.name} onChange={v => set("name", v)} placeholder="Ma Boutique" />
      </Field>
      <Field label="Description">
        <Textarea value={config.description} onChange={v => set("description", v)}
          placeholder="Décrivez votre boutique en quelques phrases…" />
      </Field>
      <Field label="Mission / Objectif" hint="Votre promesse client.">
        <Textarea value={config.objective} onChange={v => set("objective", v)}
          placeholder="Notre mission est de…" rows={2} />
      </Field>
      <Field label="Devise">
        <div className="relative group">
          {/* Custom Indicator Chevron */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-shopici-charcoal/30 group-focus-within:text-shopici-blue transition-colors">
            <ChevronsUpDown size={14} strokeWidth={3} />
          </div>

          <select
            value={config.currency}
            onChange={e => set("currency", e.target.value)}
            className="w-full px-4 py-3 text-[13px] font-bold border border-shopici-charcoal/15 rounded-none
      appearance-none focus:outline-none focus:border-shopici-blue focus:bg-white
      bg-shopici-gray/5 text-shopici-black transition-all duration-200 
      border-l-2 focus:border-l-shopici-blue cursor-pointer"
          >
            {["XAF", "XOF", "USD", "EUR", "GBP", "NGN", "GHS", "KES"].map(c => (
              <option key={c} value={c} className="font-mono font-bold">
                {c}
              </option>
            ))}
          </select>
        </div>
      </Field>
    </div>
  );
}

function ContactTab({ config, setContact }: {
  config: StoreConfig;
  setContact: (k: keyof StoreConfig["contact"], v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Email">
        <IconInput value={config.contact.email} onChange={v => setContact("email", v)}
          placeholder="contact@boutique.com" type="email" icon={<Mail size={14} />} />
      </Field>
      <Field label="Téléphone">
        <IconInput value={config.contact.phone} onChange={v => setContact("phone", v)}
          placeholder="+237 6XX XXX XXX" type="tel" icon={<Phone size={14} />} />
      </Field>
      <Field label="Adresse" hint="Format : Rue, Quartier, Ville">
        <div className="group relative">
          {/* Map Icon Slot: Locked in a vertical sidebar for a technical feel */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center 
      text-shopici-charcoal/40 group-focus-within:text-shopici-blue 
      border-r border-shopici-charcoal/10 transition-colors pointer-events-none">
            <MapPin size={16} strokeWidth={2.5} />
          </div>

          <textarea
            value={config.contact.address}
            onChange={e => setContact("address", e.target.value)}
            placeholder="Entrez la localisation précise..."
            rows={2}
            className="w-full pl-14 pr-4 py-3 text-[13px] font-bold border border-shopici-charcoal/15 rounded-none
        focus:outline-none focus:border-shopici-blue focus:bg-white
        bg-shopici-gray/5 text-shopici-black placeholder:text-shopici-charcoal/20 
        transition-all duration-200 border-l-2 focus:border-l-shopici-blue resize-none
        scrollbar-thin scrollbar-thumb-shopici-charcoal/20"
          />
        </div>
      </Field>
    </div>
  );
}

function SocialTab({ config, setSocial }: {
  config: StoreConfig;
  setSocial: (k: keyof StoreConfig["social"], v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Facebook">
        <IconInput value={config.social.facebook} onChange={v => setSocial("facebook", v)}
          placeholder="https://facebook.com/maboutique" type="url" icon={<Facebook size={14} />} />
      </Field>
      <Field label="Instagram">
        <IconInput value={config.social.instagram} onChange={v => setSocial("instagram", v)}
          placeholder="https://instagram.com/maboutique" type="url" icon={<Instagram size={14} />} />
      </Field>
    </div>
  );
}

function TrackingTab({ config, setTracking }: {
  config: StoreConfig;
  setTracking: (k: keyof StoreConfig["tracking"], v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="p-4 bg-shopici-blue/5 border border-shopici-blue/15 rounded-xl text-xs text-shopici-charcoal/70 leading-relaxed">
        Ces identifiants sont injectés dans le{" "}
        <code className="font-mono bg-shopici-blue/10 px-1.5 py-0.5 rounded">&lt;head&gt;</code>{" "}
        de votre boutique pour activer le suivi des visiteurs et des conversions.
      </div>
      <Field label="Facebook Pixel ID" hint="Trouvez-le dans Meta Events Manager.">
        <Input value={config.tracking.facebookPixelId}
          onChange={v => setTracking("facebookPixelId", v)} placeholder="123456789012345" />
      </Field>
      <Field label="Google Analytics ID" hint="Format : G-XXXXXXXXXX">
        <Input value={config.tracking.googleAnalyticsId}
          onChange={v => setTracking("googleAnalyticsId", v)} placeholder="G-XXXXXXXXXX" />
      </Field>
    </div>
  );
}

function ThemeTab({ config, setColor }: {
  config: StoreConfig;
  setColor: (k: keyof StoreConfig["theme"]["colors"], v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <ColorField label="Noir (fond principal)" value={config.theme.colors.black} onChange={v => setColor("black", v)} />
      <ColorField label="Bleu (accent principal)" value={config.theme.colors.blue} onChange={v => setColor("blue", v)} />
      <ColorField label="Corail (accent secondaire)" value={config.theme.colors.coral} onChange={v => setColor("coral", v)} />
      <div className="rounded-xl overflow-hidden border border-shopici-charcoal/10">
        <div className="px-4 py-2 text-xs font-semibold text-shopici-charcoal/50 uppercase tracking-wider bg-shopici-gray/5">
          Aperçu en direct
        </div>
        <div className="h-14 flex items-center px-5 gap-3" style={{ backgroundColor: config.theme.colors.black }}>
          <span className="text-sm font-bold" style={{ color: config.theme.colors.blue }}>
            {config.name || "Boutique"}
          </span>
          <div className="flex gap-3 ml-4">
            {["Accueil", "Produits", "À propos"].map(l => (
              <span key={l} className="text-xs opacity-60" style={{ color: config.theme.colors.blue }}>{l}</span>
            ))}
          </div>
          <span className="ml-auto px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: config.theme.colors.coral, color: "#fff" }}>
            Commander
          </span>
        </div>
      </div>
    </div>
  );
}

function BannersTab({ config, addSlide, updateSlide, removeSlide }: {
  config: StoreConfig;
  addSlide: () => void;
  updateSlide: (i: number, s: BannerSlide) => void;
  removeSlide: (i: number) => void;
}) {
  return (
    <div className="space-y-3">
      {config.bannerSlides.length === 0 && (
        <div className="text-center py-12 text-shopici-charcoal/40 text-sm">
          <LayoutTemplate size={36} className="mx-auto mb-3 text-shopici-charcoal/20" />
          Aucun slide configuré.<br />Ajoutez-en un ci-dessous.
        </div>
      )}
      {config.bannerSlides.map((slide, i) => (
        <BannerSlideCard key={slide._id ?? i} slide={slide} index={i}
          onChange={s => updateSlide(i, s)} onRemove={() => removeSlide(i)} />
      ))}
      <button type="button" onClick={addSlide}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed
          border-shopici-charcoal/15 rounded-xl text-sm font-semibold text-shopici-charcoal/60
          hover:border-shopici-blue/40 hover:text-shopici-blue hover:bg-shopici-blue/5 transition-all">
        <Plus size={15} />
        Ajouter un slide
      </button>
    </div>
  );
}

function FeaturesTab({ config, setFeature }: {
  config: StoreConfig;
  setFeature: (k: keyof StoreConfig["features"], v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <FeatureToggle
        label="Paiement Mobile Money"
        description="Autoriser les paiements via MTN MoMo, Orange Money, etc."
        icon={<CreditCard size={16} />}
        value={config.features.mobileMoneyPayment}
        onChange={v => setFeature("mobileMoneyPayment", v)}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [config, setConfig] = useState<StoreConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const {notify} = useNotify();

  function set<K extends keyof StoreConfig>(key: K, val: StoreConfig[K]) {
    setConfig(c => ({ ...c, [key]: val }));
  }
  function setContact(key: keyof StoreConfig["contact"], val: string) {
    setConfig(c => ({ ...c, contact: { ...c.contact, [key]: val } }));
  }
  function setSocial(key: keyof StoreConfig["social"], val: string) {
    setConfig(c => ({ ...c, social: { ...c.social, [key]: val } }));
  }
  function setTracking(key: keyof StoreConfig["tracking"], val: string) {
    setConfig(c => ({ ...c, tracking: { ...c.tracking, [key]: val } }));
  }
  function setColor(key: keyof StoreConfig["theme"]["colors"], val: string) {
    setConfig(c => ({ ...c, theme: { ...c.theme, colors: { ...c.theme.colors, [key]: val } } }));
  }
  function setFeature(key: keyof StoreConfig["features"], val: boolean) {
    setConfig(c => ({ ...c, features: { ...c.features, [key]: val } }));
  }

  function addSlide() {
    setConfig(c => ({
      ...c,
      bannerSlides: [...c.bannerSlides, {
        title: "", subtitle: "", cta: "", image: "",
        bgColor: FALLBACK_GRADIENT,
      }],
    }));
  }
  function updateSlide(i: number, s: BannerSlide) {
    setConfig(c => { const sl = [...c.bannerSlides]; sl[i] = s; return { ...c, bannerSlides: sl }; });
  }
  function removeSlide(i: number) {
    setConfig(c => ({ ...c, bannerSlides: c.bannerSlides.filter((_, idx) => idx !== i) }));
  }

  useEffect(() => {
    setLoading(true);
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        if (data?.name) {
          setConfig({
            ...defaultConfig,
            ...data,
            // ✅ Normalize all slides on load — converts legacy hex bgColors to gradient strings
            bannerSlides: normalizeSlides(data.bannerSlides ?? []),
          });
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      notify("Saved","succesfully","success")
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      notify("Error","There was an error saving","error")
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  const activeTabMeta = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-screen">
      <Toast status={status} />
      <div className="mx-auto space-y-6 max-w-6xl">

        {/* Header */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-shopici-black flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-gradient-to-br from-shopici-blue/15 to-shopici-coral/15">
                  <Sliders size={20} className="text-shopici-blue" />
                </span>
                Paramètres
              </h1>
              <p className="text-sm text-shopici-charcoal/60 mt-1 ml-14">
                Configurez l'identité et les fonctionnalités de votre boutique.
              </p>
            </div>
            {/* <button type="button" onClick={handleSave} disabled={status === "saving" || loading}
              className="px-6 py-3 bg-gradient-to-r from-shopici-coral to-shopici-blue text-white text-sm font-bold
                rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2
                justify-center border-2 border-white/20 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
              {status === "saving" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Enregistrer
            </button> */}
            <ActionButton
              label="Enregistrer"
              subLabel="Paramètres"
              icon={<Save />}
              onClick={handleSave}
              isLoading={status === "saving"}
            />
          </div>
          <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
        </div>

        {loadError && (
          <div className="flex items-center gap-3 p-4 bg-shopici-coral/10 border border-shopici-coral/20 rounded-xl text-sm text-shopici-coral">
            <AlertCircle size={16} />
            Impossible de charger la configuration existante.
          </div>
        )}

        {/* Tab card */}
        <div className="bg-white rounded-2xl border border-shopici-charcoal/10 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-shopici-charcoal/10"
            style={{ scrollbarWidth: "none" }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap
                    transition-all relative shrink-0
                    ${active
                      ? "text-shopici-blue"
                      : "text-shopici-charcoal/50 hover:text-shopici-charcoal hover:bg-shopici-gray/5"}`}>
                  <Icon size={14} />
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5
                      bg-gradient-to-r from-shopici-coral to-shopici-blue rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="p-1.5 rounded-lg bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 text-shopici-blue">
                <activeTabMeta.icon size={15} />
              </span>
              <h2 className="text-sm font-bold text-shopici-black uppercase tracking-wide">
                {activeTabMeta.label}
              </h2>
              {loading && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-shopici-charcoal/50">
                  <Loader2 size={13} className="animate-spin" />
                  Chargement…
                </span>
              )}
            </div>

            {loading ? <SettingsSkeleton /> : (
              <>
                {activeTab === "general" && <GeneralTab config={config} set={set} />}
                {activeTab === "contact" && <ContactTab config={config} setContact={setContact} />}
                {activeTab === "social" && <SocialTab config={config} setSocial={setSocial} />}
                {activeTab === "tracking" && <TrackingTab config={config} setTracking={setTracking} />}
                {activeTab === "theme" && <ThemeTab config={config} setColor={setColor} />}
                {activeTab === "banners" && <BannersTab config={config} addSlide={addSlide} updateSlide={updateSlide} removeSlide={removeSlide} />}
                {activeTab === "features" && <FeaturesTab config={config} setFeature={setFeature} />}
              </>
            )}
          </div>
        </div>

        {/* Mobile sticky save */}
        <div className="sm:hidden sticky bottom-4 z-40">
            <ActionButton
              label="Enregistrer"
              subLabel="Format Tableur"
              icon={<Save />}
              onClick={handleSave}
              isLoading={status === "saving"}
            />
        </div>

      </div>
    </div>
  );
}