"use client";

import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  required,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      {/* INDUSTRIAL LABEL */}
      <label className="block">
        <span className="text-[10px] font-black text-shopici-black uppercase tracking-[0.15em] flex items-center gap-1">
          {label}
          {required && (
            <span className="text-shopici-coral text-[12px] leading-none" title="Requis">
              *
            </span>
          )}
        </span>
      </label>

      {/* INPUT CONTAINER */}
      <div className={`relative ${error ? "group-error" : ""}`}>
        {children}
      </div>

      {/* ERROR MESSAGE - Industrial Warning Style */}
      {error && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-shopici-coral/10 border-l-2 border-shopici-coral animate-in fade-in slide-in-from-left-1 duration-200">
          <AlertCircle size={10} className="text-shopici-coral" strokeWidth={3} />
          <p className="text-[9px] font-black text-shopici-coral uppercase tracking-wider">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}