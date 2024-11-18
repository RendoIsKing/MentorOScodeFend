"use client";
import React, { useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { X } from "lucide-react";
import { useParams } from "next/navigation";
import { Linkedin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramShareButton,
  EmailShareButton,
  InstapaperShareButton,
} from "react-share";

interface ShareOthersPopupProps {
  open: boolean;
  setOpenShareModel: (a: boolean) => void;
}

const ShareOthersPopup = ({
  open,
  setOpenShareModel,
}: ShareOthersPopupProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const shareUrl = `${window.location.origin}/${params.uid}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setOpenShareModel(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpenShareModel]);

  const copyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/${params.uid}`)
      .then(() => {
        // Optionally, you can show a message to the user that the link is copied
        toast({
          variant: "success",
          description: "Profile link copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not copy text!",
        });
      });
  };

  return (
    <div>
      <AlertDialog open={open}>
        {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}

        <AlertDialogContent
          className="rounded-lg p-0 pb-8 border-0"
          ref={dialogRef}
        >
          <AlertDialogTitle className="border-b-2 italic py-3 mb-5 flex justify-center items-center border-muted-foreground/10 ">
            <p className="mr-5 text-xl font-normal">Share Profile</p>

            <div className="relative">
              <X
                className="absolute -top-3 -right-40  text-[#3c434e] text-xl ml-10"
                onClick={() => setOpenShareModel(false)}
              />
            </div>
          </AlertDialogTitle>

          <div className="flex flex-col gap-8">
            <div className="flex justify-around px-5">
              <div className="flex flex-col">
                <WhatsappShareButton url={shareUrl}>
                  <div
                    className=" m-auto p-5 rounded-full  bg-muted-foreground/50"
                    onClick={() => copyLink()}
                  >
                    <img
                      src="\assets\images\ShareIcons\whatsapp 1.svg"
                      alt="Whatsapp"
                    />
                  </div>
                  <p className="mt-1 text-sm">Whatsapp</p>
                </WhatsappShareButton>
              </div>

              <div className="flex flex-col">
                <TelegramShareButton url={shareUrl}>
                  <div
                    className=" m-auto p-5 rounded-full  bg-muted-foreground/50"
                    onClick={() => copyLink()}
                  >
                    <img
                      src="\assets\images\ShareIcons\telegram-alt 1.svg"
                      alt="Telegram"
                    />
                  </div>
                  <p className="mt-1 text-sm">Telegram</p>
                </TelegramShareButton>
              </div>

              <div className="flex flex-col">
                <TwitterShareButton url={shareUrl} onClick={() => copyLink()}>
                  <div className=" p-5 m-auto rounded-full  bg-muted-foreground/50">
                    <img
                      src="\assets\images\ShareIcons\twitter-alt 1.svg"
                      alt="Twitter"
                    />
                  </div>
                  <p className="mt-1 text-sm ml-2">Twitter</p>
                </TwitterShareButton>
              </div>

              <div className="flex flex-col">
                <EmailShareButton url={shareUrl}>
                  <div className=" p-5 m-auto rounded-full  bg-muted-foreground/50">
                    <img
                      src="\assets\images\ShareIcons\alternate_email.svg"
                      alt="E-mail"
                    />
                  </div>
                  <p className="mt-1 text-sm ml-3">E-mail</p>
                </EmailShareButton>
              </div>
            </div>

            <div className="flex justify-around px-5">
              <div className="flex flex-col">
                <FacebookShareButton url={shareUrl}>
                  {/* <img
                    src="\assets\images\ShareIcons\facebook1.svg"
                    alt="Facebook"
                  /> */}
                  <div className=" m-auto p-5 rounded-full  bg-muted-foreground/50">
                    <img
                      src="\assets\images\ShareIcons\facebook1.svg"
                      alt="Facebook"
                    />
                  </div>
                </FacebookShareButton>
                <p className="mt-1 text-sm">Facebook</p>
              </div>

              <div className="flex flex-col">
                {/* <InstapaperShareButton url={shareUrl}> */}
                <div
                  className=" m-auto p-5 rounded-full  bg-muted-foreground/50"
                  onClick={() => copyLink()}
                >
                  <img
                    src="\assets\images\ShareIcons\instagram2.svg"
                    alt="Instagram"
                  />
                </div>
                <p className="mt-1 text-sm">Instagram</p>

                {/* </InstapaperShareButton> */}
              </div>

              <div className="flex flex-col">
                <LinkedinShareButton url={shareUrl}>
                  <div className=" m-auto p-5 rounded-full  bg-muted-foreground/50">
                    {/* <img
                      src="\assets\images\ShareIcons\share2.svg"
                      alt="More"
                    /> */}
                    <Linkedin />
                  </div>
                  <p className="mt-1 text-sm ml-1">LinkedIn</p>
                </LinkedinShareButton>
              </div>

              <div className="flex flex-col">
                <div className=" p-5 m-auto rounded-full  bg-muted-foreground/50">
                  <img
                    src="\assets\images\ShareIcons\copy-alt 1.svg"
                    alt="Copy link"
                    onClick={() => copyLink()}
                  />
                </div>
                <p className="mt-1 text-sm">Copy link</p>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShareOthersPopup;
