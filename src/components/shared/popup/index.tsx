import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ABeeZee } from "next/font/google";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface AlertPopupProps {
  headerText: string;
  bodyText: string;
  footerText: string;
  color: boolean;
  showSubscribeButton?: boolean;
  showVerifiedIcon?: boolean;
  showTakeMeHomeButton?: boolean;
  showPreviewPlanButton?: boolean;
}
const AlertPopup = ({
  headerText,
  bodyText,
  footerText,
  color,
  showVerifiedIcon = true,
  showSubscribeButton = false,
  showTakeMeHomeButton = false,
  showPreviewPlanButton = false,
}: AlertPopupProps) => {
  const { isMobile } = useClientHardwareInfo();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          {showVerifiedIcon && (
            <img
              src="/assets/images/search/serach-profile-icon.svg"
              className="cursor-pointer"
              alt="verfiedUser"
            />
          )}

          {showSubscribeButton && (
            <Button
              variant={"secondary"}
              size="sleek"
              className="ml-4 py-1 px-4 italic font-medium lg: rounded-3xl bg-[#40A7EB]"
            >
              <img
                src="/assets/images/ShareIcons/subscribe.svg"
                alt="verified-user"
                className="w-6 h-5 mr-2 "
              />
              Subscribe
            </Button>
          )}

          {showTakeMeHomeButton && (
            <Button
              variant={"secondary"}
              size="sleek"
              className="ml-4 py-2 px-4 italic lg: rounded-3xl bg-[#8B5Cf6] w-36"
            >
              Take me home
            </Button>
          )}

          {showPreviewPlanButton && (
            <Button
              variant="outline"
              className={cn("lg:w-48 w-96", {
                "border-2 border-primary": !isMobile,
              })}
            >
              {isMobile ? "Preview the plan" : "Preview"}
            </Button>
          )}
        </div>
      </DialogTrigger>
      <div className="">
        <DialogContent className="xs:max-w-[450px] lg:max-w-sm border-0">
          <DialogHeader>
            <div className="flex justify-center ">
              <Avatar className="mb-3 h-[4.5rem] w-[4.5rem]">
                {color ? (
                  /* If 'color' is truthy, render nothing */
                  <>
                    <AvatarImage
                      alt="Christina Jack"
                      src="/assets/images/search/serach-profile-icon.svg"
                    />
                    <AvatarFallback>CJ</AvatarFallback>
                  </>
                ) : (
                  /* If 'color' is falsy, render Avatar components */

                  // <div className="w-full border-2 flex justify-center items-center rounded-full border-primary">
                  <div>
                    <AvatarImage
                      alt="Christina Jack"
                      src="/assets/images/Home/small-profile-img.svg"
                    />
                    <AvatarFallback>CJ</AvatarFallback>
                    {/* </div> */}
                  </div>
                )}
              </Avatar>
            </div>
            <div className="flex justify-center">
              <DialogTitle
                className={` font-normal text-2xl ${fontItalic.className}`}
              >
                {headerText}
              </DialogTitle>
            </div>

            <DialogDescription className="p-3 text-center">
              {bodyText}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            <Button
              type="submit"
              className={cn(
                "w-full",
                "bg-gradient-to-r from-[#6aaff0] to-[#7385dd]"
              )}
            >
              {footerText}
            </Button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default AlertPopup;
