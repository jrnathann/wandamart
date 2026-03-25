"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";

interface ActionButtonProps {
  onClick?: () => void;
  href?: string; // 👈 new
  isLoading?: boolean;
  isDisabled?: boolean;
  label: string;
  subLabel?: string;
  icon?: ReactNode;
  target?: string; // for external links
}

export default function ActionButton({
  onClick,
  href,
  isLoading = false,
  isDisabled = false,
  label,
  subLabel = "Traitement système",
  icon = <Download className="w-4 h-4" />,
  target,
}: ActionButtonProps) {
  const disabled = isLoading || isDisabled;

  const baseClasses = `
    relative w-full sm:w-auto px-8 py-4 border transition-all duration-300 rounded-none overflow-hidden
    flex items-center gap-4 justify-center group
    ${
      disabled
        ? "bg-shopici-black/5 border-shopici-black/10 text-shopici-black/20 cursor-not-allowed"
        : "bg-shopici-black border-shopici-black text-white hover:bg-white hover:text-shopici-black active:bg-shopici-black/5"
    }
  `;

  const content = (
    <>
      {/* LOADING SCAN */}
      {isLoading && (
        <div className="absolute inset-0 z-0">
          <div className="h-full w-1/3 bg-white/10 skew-x-[-20deg] animate-[scan_1.5s_infinite_linear]" />
        </div>
      )}

      {/* ICON */}
      <div className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
        ) : (
          <div className="group-hover:translate-y-0.5 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>

      {/* TEXT */}
      <div className="relative z-10 flex flex-col items-start leading-none">
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">
          {isLoading ? "Traitement..." : label}
        </span>
        {subLabel && (
          <span
            className={`
              hidden sm:block text-[8px] font-bold uppercase tracking-widest mt-1.5 transition-opacity
              ${disabled ? "opacity-20" : "opacity-40"}
            `}
          >
            {subLabel}
          </span>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          from {
            transform: translateX(-150%) skewX(-20deg);
          }
          to {
            transform: translateX(350%) skewX(-20deg);
          }
        }
      `}</style>
    </>
  );

  // 🔥 CASE 1: LINK MODE
  if (href) {
    return (
      <Link
        href={href}
        target={target}
        className={baseClasses}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        {content}
      </Link>
    );
  }

  // 🔥 CASE 2: BUTTON MODE
  return (
    <button onClick={onClick} disabled={disabled} className={baseClasses}>
      {content}
    </button>
  );
}