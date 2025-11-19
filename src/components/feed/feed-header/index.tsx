import React, { useState } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHomeHeaderFilter } from "@/context/HomeFeedHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DsButton from "@/ui/ds/Button";

type Props = { floating?: boolean; className?: string };

const FeedHeader = ({ floating = false, className = "" }: Props) => {
  const { isMobile } = useClientHardwareInfo();
  const router = useRouter();
  const { homeHeaderFilter, setHomeHeaderFilter } = useHomeHeaderFilter();

  const handleItemClick = (item: string) => {
    setHomeHeaderFilter(item);
    try {
      router.refresh();
    } catch {
      if (typeof window !== 'undefined') window.location.reload();
    }
  };
  const wrapperClass = floating
    ? `z-20 ${className}`
    : `sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 ${className}`;

  // Hide tabs on mobile; use the new top-right dropdown in the overlay instead
  if (isMobile) {
    return null;
  }

  const label =
    homeHeaderFilter === "following"
      ? "Following"
      : homeHeaderFilter === "subscribed"
      ? "Subscribed"
      : "Feed";

  return (
    <div className={wrapperClass}>
      <nav className="mx-auto max-w-[680px] w-full px-4">
        {/* Centered dropdown switcher (desktop) */}
        <div className="h-10 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DsButton variant="secondary" className="gap-2 h-8 px-3 rounded-[var(--radius)] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
                {label} <ChevronDown size={14} />
              </DsButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <DropdownMenuItem onClick={() => handleItemClick("foryou")}>
                Feed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleItemClick("following")}>
                Following
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleItemClick("subscribed")}>
                Subscribed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
};

export default FeedHeader;
