"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

export interface DsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110 focus-visible:ring-[hsl(var(--ring))] ring-offset-background",
  secondary:
    "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:brightness-110 focus-visible:ring-[hsl(var(--ring))] ring-offset-background",
  ghost:
    "bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] focus-visible:ring-[hsl(var(--ring))] ring-offset-background",
};

export function DsButton({ className, variant = "primary", ...props }: DsButtonProps) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export default DsButton;


