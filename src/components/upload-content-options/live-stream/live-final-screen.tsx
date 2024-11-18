import SimpleAvatar from "@/components/shared/simple-avatar";
import { Input } from "@/components/ui/input";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { X } from "lucide-react";
import React, { useState } from "react";
import { ABeeZee } from "next/font/google";
import TipDrawerComponent from "@/components/shared/tip-drawer-component";

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

interface ILiveStreamFinalScreenProps {
  setIsContentUploadOpen?: ((value: boolean) => void) | undefined;
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

const LiveStreamFinalScreen: React.FC<ILiveStreamFinalScreenProps> = ({
  setIsContentUploadOpen,
}) => {
  const { isMobile } = useClientHardwareInfo();
  const [tipMessage, setTipMessage] = useState("");

  return (
    <div className={isMobile ? "p-0 h-screen w-screen" : "p-0 max-w-lg"}>
      <div className="relative ">
        <div className="absolute p-3 mt-2 w-full justify-between">
          <div className="flex w-full justify-between">
            <div className="flex gap-3 ">
              <SimpleAvatar
                avatarClass="size-16 border-2 border-destructive"
                imageUrl="/assets/images/search/small-profile-img.svg"
                ImageFallBackText="CJ"
              />

              <div className="mt-1">
                <p className={` text-lg text-white ${fontItalic.className}`}>
                  Christina Stanton
                </p>
                <p className="text-sm text-white text-left">
                  @christinastanton
                </p>
              </div>
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
          src="https://images.pexels.com/photos/4750165/pexels-photo-4750165.jpeg?auto=compress&cs=tinysrgb&w=600"
          alt="W"
          className="w-full h-full object-cover border-0 border-t-muted"
        />

        <div className="absolute bottom-0 w-full pb-0 px-2 pt-3">
          <div className="flex flex-col justify-end gap-2 ">
            {liveMessages.map((value, index) => {
              return (
                <div className="flex gap-2" key={value._id}>
                  <div>
                    <img src="\assets\images\Notification\user1.svg" alt="W" />
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

            <div className="flex items-center gap-4 mt-1 justify-between pb-3 mb-0 ">
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
    </div>
  );
};

export default LiveStreamFinalScreen;
