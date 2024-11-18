"use client";
import React, { useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface SharedPopupsProps {
  openPopup: boolean;
  titleText: string;
  titleDescription?: string;
  btnText: string;
  exitText?: string;
  setOpenPopup: (a1: boolean) => void;
  imageUrl: string;
  handleSubmit?: () => void;
}
const NotificationSettingModal = ({
  openPopup,
  setOpenPopup,
  titleText,
  titleDescription = "",
  btnText,
  exitText = "",
  imageUrl,
  handleSubmit,
}: SharedPopupsProps) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedOptionGroup1, setSelectedOptionGroup1] = useState("");

  const handleOptionChangeGroup1 = (value: string) => {
    setSelectedOptionGroup1(value);
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

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
        className="py-10 bg-[#171a1f] w-full p-6 border-none bg-background max-w-[40rem]"
        ref={dialogRef}
      >
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h1 className={`text-2xl  ${fontItalic.className}`}>
              Notification Settings
            </h1>
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setOpenPopup(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            <Label>
              Personalized post and LIVE notifications are based, on viewing
              frequency and other data.
            </Label>
          </div>
        </div>
        <Separator />
        <div className="flex gap-6">
          <div className="w-6/12">
            <Label
              className={` font-normal text-base ${fontItalic.className}`}
            >{`Jaylon's Posts`}</Label>
          </div>
          <div>
            <Label
              className={` font-normal text-base ${fontItalic.className}`}
            >{`Jaylon's LIVE Videos`}</Label>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="bg-secondary/40 w-6/12">
            <RadioGroup
              defaultValue="txt"
              value={selectedOptionGroup1}
              onValueChange={handleOptionChangeGroup1}
              className="gap-4"
            >
              <div className="flex items-center space-x-2 mt-3">
                <RadioGroupItem value="option1" id="r1" className="mx-3" />
                <div>
                  <Label htmlFor="r1" className="font-normal text-base">
                    All
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="r2" className="mx-3" />
                <div>
                  <Label htmlFor="r2" className="font-normal text-base">
                    Personalized
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="option3" id="r3" className="mx-3" />
                <div>
                  <Label htmlFor="r3" className="font-normal text-base">
                    None
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-secondary/40 w-6/12 ml-[14px]">
            <RadioGroup
              defaultValue="txt"
              value={selectedOption}
              onValueChange={handleOptionChange}
              className="gap-4"
            >
              <div className="flex items-center space-x-2 mt-3">
                <RadioGroupItem value="option1" id="r1" className="mx-3" />
                <div>
                  <Label htmlFor="r1" className="font-normal text-base">
                    All
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="r2" className="mx-3" />
                <div>
                  <Label htmlFor="r2" className="font-normal text-base">
                    Personalized
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="option3" id="r3" className="mx-3" />
                <div>
                  <Label htmlFor="r3" className="font-normal text-base">
                    None
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="mt-3 p-4 flex justify-center">
          <Button
            className=" bg-primary h-14 w-56 rounded-[30px]"
            onClick={() => setOpenPopup(false)}
          >
            <p className="font-light text-base">Save</p>
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotificationSettingModal;
