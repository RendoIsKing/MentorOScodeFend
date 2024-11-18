import React, { useState } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { Search } from "lucide-react";
import Link from "next/link";
import { ABeeZee, Inter_Tight } from "next/font/google";
import { useHomeHeaderFilter } from "@/context/HomeFeedHeader";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});
const fontHelvetica = Inter_Tight({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

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
            fontHelvetica.className
          } ${
            homeHeaderFilter === "subscribed"
              ? "lg:text-foreground italic"
              : "lg:text-gray-500"
          }`}
          onClick={() => handleItemClick("subscribed")}
        >
          {/* <button
          className={`cursor-pointer  ${
            fontItalic.className
          } text-lg lg:text-2xl ${
            homeHeaderFilter === "subscribed"
              ? "lg:text-foreground"
              : "lg:text-gray-500"
          }`}
          onClick={() => handleItemClick("subscribed")}
        > */}
          Subscribed
        </button>
        <button
          className={`cursor-pointer text-lg lg:text-2xl  ${
            fontHelvetica.className
          } ${
            homeHeaderFilter === "foryou"
              ? "lg:text-foreground italic"
              : "lg:text-gray-500"
          }`}
          onClick={() => handleItemClick("foryou")}
        >
          For Me
        </button>
        <button
          className={`cursor-pointer   text-lg lg:text-2xl  ${
            fontHelvetica.className
          } ${
            homeHeaderFilter === "following"
              ? "lg:text-foreground italic"
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
