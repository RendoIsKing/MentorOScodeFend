import React, { useState } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { Search } from "lucide-react";
import Link from "next/link";
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
  const { homeHeaderFilter, setHomeHeaderFilter } = useHomeHeaderFilter();

  const handleItemClick = (item: string) => {
    setHomeHeaderFilter(item);
  };
  return (
    <div className="sticky top-0 mt-6 mb-2 ">
      <div
        className={
          isMobile
            ? "flex w-full mx-4 justify-between items-center"
            : "flex w-4/5 justify-between items-center"
        }
      >
        <button
          className={`cursor-pointer  text-lg lg:text-2xl  ${
            fontLogo.className
          } ${
            homeHeaderFilter === "subscribed"
              ? "lg:text-primary italic"
              : "lg:text-gray-500"
          }`}
          onClick={() => handleItemClick("subscribed")}
        >
          Subscribed
        </button>
        <button
          className={`cursor-pointer text-lg lg:text-2xl  ${
            fontLogo.className
          } ${
            homeHeaderFilter === "foryou"
              ? "lg:text-primary italic"
              : "lg:text-gray-500"
          }`}
          onClick={() => handleItemClick("foryou")}
        >
          Feed
        </button>
        <button
          className={`cursor-pointer   text-lg lg:text-2xl  ${
            fontLogo.className
          } ${
            homeHeaderFilter === "following"
              ? "lg:text-primary italic"
              : "lg:text-gray-500"
          }`}
          onClick={() => handleItemClick("following")}
        >
          Following
        </button>
        {isMobile && (
          <div className="mr-4">
            <Link href="search">
              <Search size={20} strokeWidth={1.5} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedHeader;
