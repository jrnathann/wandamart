"use client";

import { useState } from "react";
import { Calendar, ChevronDown, ArrowRight } from "lucide-react";

interface DateFilterProps {
  start: Date;
  end: Date;
  onChange: (range: { start: Date; end: Date }) => void;
}

export default function DateFilter({ start, end, onChange }: DateFilterProps) {
  const [startDate, setStartDate] = useState(start.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(end.toISOString().split("T")[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    onChange({ start: new Date(e.target.value), end: new Date(endDate) });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    onChange({ start: new Date(startDate), end: new Date(e.target.value) });
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    onChange({ start, end });
    setIsOpen(false);
  };

  const formatDateRange = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('fr-FR', options)} — ${e.toLocaleDateString('fr-FR', { ...options, year: 'numeric' })}`;
  };

  return (
    <div className="relative">
      {/* BOUTON PRINCIPAL : Style Apple Pro / Industriel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 px-5 py-3 bg-white border border-shopici-black text-shopici-black hover:bg-shopici-black hover:text-white transition-all duration-300 rounded-none group"
      >
        <Calendar size={16} strokeWidth={2.5} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">
          {formatDateRange()}
        </span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-0 w-80 bg-white border-2 border-shopici-black shadow-[12px_12px_0px_rgba(0,0,0,0.1)] z-20 overflow-hidden rounded-none">
            
            {/* PRÉSÉLECTIONS RAPIDES */}
            <div className="p-5 border-b border-shopici-black/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-shopici-black/30 mb-4">
                Périodes prédéfinies
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Aujourd\'hui', days: 0 },
                  { label: '7 derniers jours', days: 6 },
                  { label: '30 derniers jours', days: 29 },
                  { label: '90 derniers jours', days: 89 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset.days)}
                    className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-widest border border-shopici-black/10 hover:border-shopici-black hover:bg-shopici-black hover:text-white transition-all rounded-none text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PLAGE PERSONNALISÉE */}
            <div className="p-5 bg-shopici-black/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-shopici-black/30 mb-4">
                Plage personnalisée
              </p>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/40 ml-1">Date de début</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartChange}
                    className="w-full px-3 py-3 border border-shopici-black/10 rounded-none bg-white text-xs font-bold focus:outline-none focus:border-shopici-black transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/40 ml-1">Date de fin</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleEndChange}
                    className="w-full px-3 py-3 border border-shopici-black/10 rounded-none bg-white text-xs font-bold focus:outline-none focus:border-shopici-black transition-all"
                  />
                </div>
              </div>

              {/* BOUTON D'APPLICATION */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-6 px-4 py-4 bg-shopici-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-none hover:bg-shopici-coral transition-colors flex items-center justify-center gap-3"
              >
                Appliquer les paramètres
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}