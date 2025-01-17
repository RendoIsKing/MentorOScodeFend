import { Input } from "@/components/ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import SimpleAvatar from "./shared/simple-avatar";
import { ABeeZee } from "next/font/google";
import { useState } from "react";
import TipDrawerComponent from "./shared/tip-drawer-component";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface messageData {
  _id: number;
  imgSrc: string;
  message: string;
  name: string;
  tipAmount: string;
}

const liveMessages: messageData[] = [
  {
    _id: 1,
    imgSrc: "",
    name: "Johnny Christ",
    message: "This is demo comment text used here",
    tipAmount: "",
  },
  {
    _id: 2,
    imgSrc: "",
    name: "Johnny Christ",
    message: "This is demo comment text used here",
    tipAmount: "",
  },
  {
    _id: 3,
    imgSrc: "",
    name: "Johnny Christ",
    message: "This is demo comment text used here",
    tipAmount: "$1",
  },
  {
    _id: 4,
    imgSrc: "",
    name: "Johnny Christ",
    message: "This is demo comment text used here",
    tipAmount: "",
  },
];

export function LivePostPopup() {
  const { isMobile } = useClientHardwareInfo();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <div className="flex justify-center relative ">
            <SimpleAvatar
              avatarClass="size-16 border-2 border-destructive"
              imageUrl="/assets/images/search/small-profile-img.svg"
              ImageFallBackText="CJ"
            />
            <span className="absolute rounded-full -bottom-2 ">
              <Badge
                className={`rounded-lg h-4 p-1 font-light  ${fontItalic.className}`}
                variant={"destructive"}
              >
                Live
              </Badge>
            </span>
          </div>
          <div className="flex justify-center">
            <h2 className="text-sm mt-1 ">Christiana</h2>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        className={isMobile ? "p-0 h-screen w-screen" : "p-0 max-w-[25vw] "}
      >
        <div className="relative ">
          <DialogHeader className="absolute p-3 mt-2">
            <div>
              <div className="flex gap-3 ">
                <div className="flex justify-center relative ">
                  <SimpleAvatar
                    avatarClass="size-16 border-2 border-destructive"
                    imageUrl="/assets/images/search/small-profile-img.svg"
                    ImageFallBackText="CJ"
                  />
                  <span className="absolute rounded-full -bottom-2 ">
                    <Badge
                      className={`rounded-lg h-4 p-1 font-light  ${fontItalic.className}`}
                      variant={"destructive"}
                    >
                      Live
                    </Badge>
                  </span>
                </div>
                <div className="mt-1">
                  <p className={` text-lg text-white ${fontItalic.className}`}>
                    Christina Stanton
                  </p>
                  <p className="text-sm text-white text-left">
                    @christinastanton
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <img
            src="/assets/images/popup/live-post-popup.svg"
            alt="W"
            className="w-full h-full object-cover border-0 border-t-muted"
          />

          <div className="absolute bottom-0 w-full p-3">
            <div className="flex flex-col justify-end gap-2 ">
              {liveMessages.map((value, index) => {
                return (
                  <div className="flex gap-2" key={value._id}>
                    <div>
                      <img
                        src="\assets\images\Notification\user1.svg"
                        alt="W"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="md:text-base text-white text-sm">
                          {value.name}
                        </p>
                        {value.tipAmount !== "" && (
                          <p className="text-xs bg-[#eb5757] px-2 text-white pb-1">
                            <span className="text-xs text-white">
                              {value.tipAmount}
                            </span>{" "}
                            Amout Tipped
                          </p>
                        )}
                      </div>
                      <p className="md:text-sm text-white text-xs">
                        {value.message}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-4 mt-1 justify-between mb-3 ">
                <div className="relative  grow ">
                  <Input
                    className="px-2 outline-none"
                    type="text"
                    placeholder="Write comment..."
                  />
                  <img
                    src="\assets\images\inbox\send-message.svg"
                    alt=""
                    className="absolute top-1 right-2"
                  />
                </div>

                <div>
                  <img
                    src="\assets\images\Creator-center\heart.svg"
                    alt=""
                    className="h-8 w-8"
                  />
                </div>

                <TipDrawerComponent />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
