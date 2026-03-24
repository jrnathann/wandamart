"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

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
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white  border border-shopici-charcoal/10 rounded-xl hover:border-shopici-blue/30 transition-all duration-200 hover:shadow-md group"
      >
        <Calendar size={18} className="text-shopici-blue group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium text-shopici-black dark:text-shopici-foreground">
          {formatDateRange()}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-shopici-charcoal transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white  border-2 border-shopici-charcoal/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Quick Presets */}
            <div className="p-4 border-b border-shopici-charcoal/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-shopici-charcoal  mb-3">
                Quick Select
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Last 7 days', days: 6 },
                  { label: 'Last 14 days', days: 13 },
                  { label: 'Last 30 days', days: 29 },
                  { label: 'Last 60 days', days: 59 },
                  { label: 'Last 90 days', days: 89 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset.days)}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-shopici-blue/5 hover:bg-shopici-blue/10 text-shopici-blue border border-shopici-blue/20 hover:border-shopici-blue/40 transition-all duration-200 hover:scale-105"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-shopici-charcoal  mb-3">
                Custom Range
              </p>
              <div className="space-y-3">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-shopici-charcoal  mb-1.5">
                    From
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartChange}
                      className="w-full px-3 py-2.5 pl-10 border-2 border-shopici-charcoal/10 rounded-lg bg-shopici-blue/5 dark:bg-shopici-charcoal/20 text-shopici-black dark:text-shopici-foreground text-sm font-medium focus:outline-none focus:border-shopici-blue/50 focus:ring-2 focus:ring-shopici-blue/20 transition-all"
                    />
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-shopici-blue pointer-events-none" />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-shopici-charcoal  mb-1.5">
                    To
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndChange}
                      className="w-full px-3 py-2.5 pl-10 border-2 border-shopici-charcoal/10 rounded-lg bg-shopici-coral/5 dark:bg-shopici-charcoal/20 text-shopici-black dark:text-shopici-foreground text-sm font-medium focus:outline-none focus:border-shopici-coral/50 focus:ring-2 focus:ring-shopici-coral/20 transition-all"
                    />
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-shopici-coral pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-shopici-blue to-shopici-coral text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Apply Date Range
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}