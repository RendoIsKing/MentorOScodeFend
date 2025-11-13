import React, { useState } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ABeeZee, Inter_Tight, Orbitron } from "next/font/google";
import { useHomeHeaderFilter } from "@/context/HomeFeedHeader";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});
const fontLogo = Orbitron({ subsets: ["latin"], weight: ["700", "800"] });

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

  return (
    <div className={wrapperClass}>
      <nav className="mx-auto max-w-[680px] px-0">
        {/* Precise left / center / right using absolute positions on a full-width container */}
        <div className="relative w-full h-10">
          {/* Left */}
          {(() => {
            const active = homeHeaderFilter === "foryou";
            return (
              <button
                className={`absolute left-0 top-1/2 -translate-y-1/2 text-left text-sm font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => handleItemClick("foryou")}
              >
                <span>Feed</span>
                <span className={`block h-0.5 w-8 mt-1 rounded-full ${active ? "bg-primary" : "bg-transparent"}`} />
              </button>
            );
          })()}

          {/* Center */}
          {(() => {
            const active = homeHeaderFilter === "following";
            return (
              <button
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => handleItemClick("following")}
              >
                <span>Following</span>
                <span className={`block h-0.5 w-8 mt-1 rounded-full mx-auto ${active ? "bg-primary" : "bg-transparent"}`} />
              </button>
            );
          })()}

          {/* Right */}
          {(() => {
            const active = homeHeaderFilter === "subscribed";
            return (
              <button
                className={`absolute right-0 top-1/2 -translate-y-1/2 text-right text-sm font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => handleItemClick("subscribed")}
              >
                <span>Subscribed</span>
                <span className={`block h-0.5 w-8 mt-1 rounded-full ml-auto ${active ? "bg-primary" : "bg-transparent"}`} />
              </button>
            );
          })()}
        </div>
      </nav>
    </div>
  );
};

export default FeedHeader;
