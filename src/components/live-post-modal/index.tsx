import { Input } from "@/components/ui/input";

import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import SimpleAvatar from "../shared/simple-avatar";
import { Button } from "../ui/button";
import { Eye, Tag } from "lucide-react";
import { ABeeZee } from "next/font/google";

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

const LiveStreamDropbox = () => {
  const { isMobile } = useClientHardwareInfo();
  return (
    <div className="-m-8 -p-2">
      <img
        src="/assets/images/Home/nick-karvounis-tp_aLk0ngME-unsplash 1.svg"
        alt="live-stream-capture"
        className="w-full h-full"
      />
      {/* <Webcam
        height={"100%"}
        width={"100%"}
        ref={webcamRef as React.RefObject<Webcam>}
      /> */}
      <div className="flex justify-between  m-4">
        <div className="flex">
          <div className="flex items-center">
            <Tag />
            <Button variant={"link"} className="text-foreground">
              Tag People
            </Button>
          </div>
          <div className="flex items-center">
            <Eye />
            <Button variant={"link"} className="text-foreground">
              Public
            </Button>
          </div>
        </div>
        <div>
          <Dialog>
            <DialogTrigger>
              <Button className="lg:w-24">Live</Button>
            </DialogTrigger>

            <DialogContent
              onOpenAutoFocus={(e: Event) => e.preventDefault()}
              className={isMobile ? "p-0 h-screen w-screen" : "p-0 max-w-sm "}
            >
              <div className="relative ">
                <DialogHeader className="absolute p-3 mt-2">
                  <div>
                    <div className="flex gap-3 ">
                      <SimpleAvatar
                        avatarClass="size-16 border-2 border-destructive"
                        imageUrl="/assets/images/search/small-profile-img.svg"
                        ImageFallBackText="CJ"
                      />

                      <div className="mt-1">
                        <p
                          className={` text-lg text-white ${fontItalic.className}`}
                        >
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

                      <div>
                        <img src="\assets\images\Home\give-tip.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamDropbox;
