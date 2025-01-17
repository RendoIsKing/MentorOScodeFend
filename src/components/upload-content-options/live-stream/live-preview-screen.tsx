import React from "react";
import BackArrow from "@/assets/images/Signup/back.svg";
import { Button } from "@/components/ui/button";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { Eye, X } from "lucide-react";
import { ABeeZee } from "next/font/google";
import Tag from "@/assets/images/popup/tag-user.svg";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface ILiveStreamPreviewProps {
  changeStep: (arg?: string) => void;
  setIsContentUploadOpen?: ((value: boolean) => void) | undefined;
}
const LiveStreamPreviewScreen: React.FC<ILiveStreamPreviewProps> = ({
  changeStep,
  setIsContentUploadOpen,
}) => {
  const { isMobile } = useClientHardwareInfo();
  return (
    <div className="-m-8 -p-2 bg-secondary ">
      <div className="p-4">
        <div
          className={`text-2xl  ${fontItalic.className} flex w-full justify-between items-center`}
        >
          <div className="flex">
            <BackArrow
              className="fill-foreground mr-4 cursor-pointer mt-1 "
              onClick={() => changeStep("back")}
            />
            {"Live Stream"}
          </div>
          <div>
            <X
              className="mt-1 lg:size-12 cursor-pointer text-secondary-foreground/20"
              onClick={() => {
                setIsContentUploadOpen && setIsContentUploadOpen(false);
              }}
            />
          </div>
        </div>
      </div>
      <img
        src="/assets/images/Home/nick-karvounis-tp_aLk0ngME-unsplash 1.svg"
        alt="live-stream-capture"
        className="w-full"
      />
      <div className="flex justify-between  m-4">
        <div className="flex gap-4">
          <div className="flex items-center">
            <Tag className="fill-foreground" />
            <Button
              variant={"link"}
              className="text-foreground text-md p-0 ps-2"
            >
              Tag People
            </Button>
          </div>
          <div className="flex items-center ">
            <Eye />
            <Button
              variant={"link"}
              className="text-foreground text-md p-0 ps-2"
            >
              Public
            </Button>
          </div>
        </div>
        <div>
          <Button className="w-40" onClick={() => changeStep()}>
            Live
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPreviewScreen;
