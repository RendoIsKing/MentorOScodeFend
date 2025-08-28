"use client";
import React, { useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface SendMessagePopupProps {
  openPopup: boolean;
  setOpenPopup: (a: boolean) => void;
}
const SendMessagePopup = ({
  openPopup,
  setOpenPopup,
}: SendMessagePopupProps) => {
  const router = useRouter();

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setOpenPopup(false);
      }
    };

    if (openPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPopup, setOpenPopup]);

  return (
    <AlertDialog open={openPopup}>
      <AlertDialogContent
        className="p-0 w-3/5 max-w-[500px] border-0 "
        ref={dialogRef}
      >
        <AlertDialogHeader>
          <div className="border-b flex justify-between py-2 px-4 items-center border-muted-foreground/40">
            <AlertDialogTitle className={`${fontItalic.className}`}>
              Send Message to The PT
            </AlertDialogTitle>
            <div onClick={() => setOpenPopup(false)} className="cursor-pointer">
              <X className="text-muted-foreground/40" />
            </div>
          </div>
        </AlertDialogHeader>

        <div className="px-5 pb-8">
          <Textarea
            placeholder="Type your message here."
            className="h-36 border-muted-foreground/40"
          />

          <div className="flex justify-between mt-5">
            <Button
              variant={"outline"}
              className="text-[#01b9ae] w-3/12 border border-[#01b9ae]"
              onClick={() => router.push("/chat/Coach%20Engh")}
            >
              Chat
            </Button>
            <Button className="w-2/5" onClick={() => setOpenPopup(false)}>
              Send Message
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SendMessagePopup;
