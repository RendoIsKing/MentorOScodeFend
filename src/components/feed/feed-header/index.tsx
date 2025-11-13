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
      <nav className="mx-auto max-w-[680px] w-full px-0">
        {/* Three fixed columns: left / center / right (no overlap) */}
        <div className="grid grid-cols-3 items-center w-full h-10">
          {/* Left: Feed */}
          {(() => {
            const active = homeHeaderFilter === "foryou";
            return (
              <button
                className={`justify-self-start text-left text-sm font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => handleItemClick("foryou")}
              >
                <span>Feed</span>
                <span className={`block h-0.5 w-8 mt-1 rounded-full ${active ? "bg-primary" : "bg-transparent"}`} />
              </button>
            );
          })()}

          {/* Center: Following */}
          {(() => {
            const active = homeHeaderFilter === "following";
            return (
              <button
                className={`justify-self-center text-center text-sm font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => handleItemClick("following")}
              >
                <span>Following</span>
                <span className={`block h-0.5 w-8 mt-1 rounded-full mx-auto ${active ? "bg-primary" : "bg-transparent"}`} />
              </button>
            );
          })()}

          {/* Right: Subscribed */}
          {(() => {
            const active = homeHeaderFilter === "subscribed";
            return (
              <button
                className={`justify-self-end text-right text-sm font-medium ${
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
