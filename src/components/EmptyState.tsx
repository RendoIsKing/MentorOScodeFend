"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
  iconBgColor?: string;
}

// Verbatim port of the Figma export EmptyState component.
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = "hsl(var(--muted-foreground))",
  iconBgColor = "hsl(var(--muted)/0.1)",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 p-6 rounded-full" style={{ backgroundColor: iconBgColor }}>
        <Icon className="h-12 w-12" style={{ color: iconColor }} />
      </div>

      <h3 className="text-xl mb-2">{title}</h3>

      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>

      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}


