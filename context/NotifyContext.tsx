"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, AlertCircle, Info } from "lucide-react";

type NotifyType = "success" | "error" | "warning";

interface NotifyContextType {
  notify: (titre: string, message: string, type?: NotifyType) => void;
}

const NotifyContext = createContext<NotifyContextType | undefined>(undefined);

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{ titre: string; message: string; type: NotifyType } | null>(null);

  const notify = (titre: string, message: string, type: NotifyType = "success") => {
    setAlert({ titre, message, type });
    setTimeout(() => setAlert(null), 3500);
  };

  // Helper to get standard event colors and icons
  const getStatusStyles = (type: NotifyType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-[#10b981]", // Emerald 500
          lightBg: "bg-[#10b981]/10",
          icon: <CheckCircle2 size={24} strokeWidth={3} />
        };
      case "warning":
        return {
          bg: "bg-[#f59e0b]", // Amber 500
          lightBg: "bg-[#f59e0b]/10",
          icon: <AlertCircle size={24} strokeWidth={3} />
        };
      case "error":
        return {
          bg: "bg-[#e11d48]", // Rose 600
          lightBg: "bg-[#e11d48]/10",
          icon: <AlertTriangle size={24} strokeWidth={3} />
        };
    }
  };

  const status = alert ? getStatusStyles(alert.type) : null;

  return (
    <NotifyContext.Provider value={{ notify }}>
      {children}

      {alert && status && (
        <div className="fixed top-4 left-4 right-4 md:top-10 md:right-10 md:left-auto z-[999] animate-in slide-in-from-top-5 md:slide-in-from-right-10 duration-500">
          <div className="flex items-center gap-4 md:gap-6 bg-white border-2 border-shopici-black p-4 md:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_rgba(0,0,0,1)] rounded-none w-full md:min-w-[380px] relative overflow-hidden">
            
            {/* DYNAMIC ICON BOX - REAL EVENT COLORS */}
            <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white shrink-0 transition-colors duration-300 ${status.bg}`}>
              {status.icon}
            </div>

            {/* TEXT CONTENT */}
            <div className="flex flex-col gap-1 pr-4 text-left">
              <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-shopici-black leading-none">
                {alert.titre}
              </h4>
              <p className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/50 leading-tight md:leading-relaxed max-w-[180px] md:max-w-[220px]">
                {alert.message}
              </p>
            </div>

            {/* DYNAMIC PROGRESS BAR */}
            <div className={`absolute bottom-0 left-0 h-[4px] md:h-[5px] w-full ${status.lightBg}`}>
              <div 
                className={`h-full animate-[progress_3.5s_linear_forwards] origin-left ${status.bg}`} 
              />
            </div>
          </div>

          <style jsx>{`
            @keyframes progress {
              from { transform: scaleX(1); }
              to { transform: scaleX(0); }
            }
          `}</style>
        </div>
      )}
    </NotifyContext.Provider>
  );
}

export const useNotify = () => {
  const context = useContext(NotifyContext);
  if (!context) throw new Error("useNotify must be used within a NotifyProvider");
  return context;
};