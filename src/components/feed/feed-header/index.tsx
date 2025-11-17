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
      <nav className="mx-auto max-w-[680px] w-full px-3 relative">
        {/* Centered dropdown switcher (desktop) */}
        <div className="relative h-10">
          {/* Center the chip over the media column */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5 text-sm font-semibold text-foreground shadow border border-border">
                  {label}
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-1 border-border bg-card">
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
        </div>
      </nav>
    </div>
  );
};

export default FeedHeader;
