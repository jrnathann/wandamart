"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  error?: string;
}

export default function Section({ icon, title, children, error }: SectionProps) {
  return (
    <div className="bg-white dark:bg-shopici-charcoal/95 rounded-2xl border-2 border-shopici-charcoal/10 p-4">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-shopici-charcoal/10">
        <div className="p-2 bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-lg text-shopici-blue">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-shopici-black dark:text-shopici-foreground">
          {title}
        </h2>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-shopici-coral/10 border border-shopici-coral/30 rounded-lg flex items-center gap-2 text-shopici-coral text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
