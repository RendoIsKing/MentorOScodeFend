"use client";
import { Separator } from "@/components/ui/separator";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import BackArrow from "@/assets/images/Signup/back.svg";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface InnerPageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  showBackButton: boolean;
}
const InnerPageHeader: React.FC<InnerPageHeaderProps> = ({
  showBackButton,
  title,
  icon: Icon,
}) => {
  const { isMobile } = useClientHardwareInfo();
  const router = useRouter();

  return (
    <>
      {isMobile ? (
        <div className="flex justify-between w-11/12 p-3 mx-auto">
          <div
            className={cn("mt-1", !showBackButton && "invisible")}
            onClick={() => {
              router.back();
            }}
          >
            <ChevronLeft />
          </div>
          <div className="lg:italic lg:text-xl text-2xl">{title}</div>
          <div className={cn(!Icon && "invisible", "mt-1")}>{Icon}</div>
        </div>
      ) : (
        <>
          <div className="flex justify-between  pt-8 mx-auto ml-4">
            <div className={cn(!showBackButton && "invisible", "mt-1")}>
              <BackArrow
                className="fill-foreground mr-4 cursor-pointer"
                onClick={() => {
                  router.back();
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <div className={` text-2xl mb-4 ${fontItalic.className}`}>
                {title}
              </div>
              <Separator className="bg-foreground/40" />
            </div>
            <div
              className={cn(!Icon && "invisible", "mt-1 mx-6 cursor-pointer")}
            >
              {Icon}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default InnerPageHeader;
