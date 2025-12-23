"use client";

import React from "react";
import { Home, Search, MessageCircle, User, Plus } from "lucide-react";
import { useHaptics } from "@/components/design/hooks/useHaptics";

interface BottomNavProps {
  currentPage: "home" | "search" | "chat" | "profile";
  onNavigate: (page: "home" | "search" | "chat" | "profile") => void;
  onCreateClick?: () => void;
}

// Verbatim port of the export BottomNav (minus Vite relative imports).
export default function DesignBottomNav({ currentPage, onNavigate, onCreateClick }: BottomNavProps) {
  const { triggerHaptic } = useHaptics();

  const navItems = [
    {
      id: "home" as const,
      icon: Home,
      label: "Home",
      color: "hsl(var(--brand-medium-blue))",
    },
    {
      id: "search" as const,
      icon: Search,
      label: "Search",
      color: "hsl(var(--brand-medium-blue))",
    },
    {
      id: "chat" as const,
      icon: MessageCircle,
      label: "Inbox",
      color: "hsl(var(--brand-medium-blue))",
    },
    {
      id: "profile" as const,
      icon: User,
      label: "Profile",
      color: "hsl(var(--brand-medium-blue))",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 pb-safe z-50">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-around py-2 relative">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic("light");
                  onNavigate(item.id);
                }}
                className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all hover:bg-muted/50 min-w-[70px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-medium-blue))] focus:ring-offset-2 focus:ring-offset-background"
                aria-label={item.label}
                tabIndex={0}
              >
                <Icon
                  className="h-6 w-6 transition-colors"
                  style={{
                    color: isActive ? item.color : "#6B7280",
                    fill: isActive ? item.color : "none",
                  }}
                />
                <span
                  className="text-xs transition-colors"
                  style={{
                    color: isActive ? item.color : "#6B7280",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Create Button in the Middle - Always visible */}
          <button
            onClick={() => {
              triggerHaptic("medium");
              onCreateClick?.();
            }}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all hover:bg-muted/50 min-w-[70px] relative focus:outline-none"
            aria-label="Create new post"
            tabIndex={0}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[hsl(var(--brand-light-blue))] to-[hsl(var(--brand-medium-blue))] rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:scale-110 transition-transform focus-within:ring-2 focus-within:ring-[hsl(var(--brand-medium-blue))] focus-within:ring-offset-2">
              <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="h-6" />
            <span className="text-xs transition-colors font-medium" style={{ color: "#6B7280" }}>
              Create
            </span>
          </button>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic("light");
                  onNavigate(item.id);
                }}
                className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all hover:bg-muted/50 min-w-[70px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-medium-blue))] focus:ring-offset-2 focus:ring-offset-background"
                aria-label={item.label}
                tabIndex={0}
              >
                <Icon
                  className="h-6 w-6 transition-colors"
                  style={{
                    color: isActive ? item.color : "#6B7280",
                    fill: isActive ? item.color : "none",
                  }}
                />
                <span
                  className="text-xs transition-colors"
                  style={{
                    color: isActive ? item.color : "#6B7280",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


