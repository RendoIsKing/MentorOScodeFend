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

const FeedHeader = () => {
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
  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto max-w-[680px] px-4">
        <ul className="grid grid-cols-3 text-center">
          {[
            { key: "subscribed", label: "Subscribed" },
            { key: "foryou", label: "Feed" },
            { key: "following", label: "Following" },
          ].map((t) => (
            <li key={t.key}>
              <button
                className={
                  `w-full py-3 text-sm font-medium ` +
                  (homeHeaderFilter === t.key
                    ? "text-primary after:block after:h-0.5 after:w-8 after:mx-auto after:mt-1 after:rounded-full after:bg-primary"
                    : "text-muted-foreground")
                }
                onClick={() => handleItemClick(t.key)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default FeedHeader;
