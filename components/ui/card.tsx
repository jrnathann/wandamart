import * as React from "react";
import { cn } from "@/lib/uitils";
/*
  Shopici Card UI
  - Soft, modern, SaaS-style surface
  - Brand-safe (uses CSS variables)
  - Works for KPI cards, charts, tables, etc.
*/

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-white shadow-sm",
        "border border-[var(--shopici-gray)]/40",
        "transition-all duration-200",
        "hover:shadow-md",
        className
      )}
      {...props}
    />
  );
});

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between px-6 pt-6",
      className
    )}
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-sm font-medium text-[var(--shopici-charcoal)]",
      className
    )}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 pb-6 pt-4", className)}
    {...props}
  />
);

export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between px-6 pb-6",
      className
    )}
    {...props}
  />
);
