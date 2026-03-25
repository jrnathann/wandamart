"use client";

import React from "react";
import { AlertCircle, Square } from "lucide-react";

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  error?: string;
}

export default function Section({ icon, title, children, error }: SectionProps) {
  return (
    <div className="bg-white border-2 border-shopici-black rounded-none overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
      
      {/* INDUSTRIAL HEADER */}
      <div className="flex items-center gap-3 bg-shopici-black p-3 md:p-4">
        {/* Fixed: Wrap icon in a div to avoid cloneElement type errors */}
        <div className="text-white shrink-0 flex items-center justify-center w-5 h-5 [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-[2.5]">
          {icon}
        </div>
        
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
          {title}
        </h2>
        
        <div className="ml-auto opacity-20 text-white">
          <Square size={10} fill="currentColor" />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-shopici-coral text-white flex items-start gap-3 rounded-none">
          <AlertCircle size={18} strokeWidth={3} className="shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Attention</span>
            <span className="text-[11px] font-bold leading-tight uppercase tracking-tight">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="p-4 md:p-6 space-y-5">
        {children}
      </div>
    </div>
  );
}