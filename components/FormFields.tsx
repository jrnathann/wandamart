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
    <div>
      <label className="block mb-2">
        <span className="text-sm font-semibold text-shopici-charcoal dark:text-shopici-gray">
          {label}
          {required && <span className="text-shopici-coral ml-1">*</span>}
        </span>
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-shopici-coral flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
