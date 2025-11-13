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
      <nav className="mx-auto max-w-[680px] px-4">
        {/* hidden mobile switcher removed to avoid test role collisions */}
        <ul className="grid grid-cols-3 items-center">
          {[
            { key: "foryou", label: "Feed", align: "text-left after:ml-0 after:mr-auto" },
            { key: "following", label: "Following", align: "text-center after:mx-auto" },
            { key: "subscribed", label: "Subscribed", align: "text-right after:mr-0 after:ml-auto" },
          ].map((t) => {
            const active = homeHeaderFilter === t.key;
            const base =
              "w-full py-3 text-sm font-medium relative " +
              (active ? "text-primary " : "text-muted-foreground ");
            const underline =
              "after:block after:h-0.5 after:w-8 after:mt-1 after:rounded-full " +
              (active ? "after:bg-primary " : "after:bg-transparent ");
            return (
              <li key={t.key} className={t.align}>
                <button
                  className={base + underline}
                  onClick={() => handleItemClick(t.key)}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default FeedHeader;
