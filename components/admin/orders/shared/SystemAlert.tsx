"use client";
import { AlertTriangle } from "lucide-react";

interface SystemAlertProps {
  isOpen: boolean;
  setNotify: (val: boolean) => void;
  titre?: string;
  message?: string;
}

export default function SystemAlert({ 
  isOpen, 
  setNotify, 
  titre = "Erreur de registre", 
  message = "Aucune commande détectée pour l'exportation" 
}: SystemAlertProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
      <div className="flex items-center gap-6 bg-white border-2 border-shopici-black p-6 shadow-[12px_12px_0px_rgba(0,0,0,0.1)] rounded-none min-w-[340px] relative overflow-hidden">
        
        <div className="w-14 h-14 bg-shopici-coral flex items-center justify-center text-white shrink-0">
          <AlertTriangle size={24} strokeWidth={3} />
        </div>

        <div className="flex flex-col gap-1.5 pr-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-shopici-black leading-none">
            {titre}
          </h4>
          <p className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/40 leading-relaxed max-w-[180px]">
            {message}
          </p>
        </div>

        <button 
          onClick={() => setNotify(false)}
          className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-shopici-black/20 hover:text-shopici-black transition-colors"
        >
          Fermer
        </button>

        <div className="absolute bottom-0 left-0 h-[3px] bg-shopici-coral/20 w-full">
          <div className="h-full bg-shopici-coral animate-[progress_3s_linear_forwards] origin-left" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}