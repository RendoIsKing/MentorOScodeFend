"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import VideoUploadModal from "@/components/video-upload";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import BackArrow from "@/assets/images/Signup/back.svg";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

function VideoUploadPage() {
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [otherFunctionRendered, setOtherFunctionRendered] = useState(false);
  const [filePreview, setFilePreview] = useState(false);
  const [openLivestreamModal, setOpenLivestreamModal] = useState(false);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFilePreview(true);
    if (file) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        const duration = video.duration / 60;
        if (duration > 5) {
          alert(
            "The video duration exceeds the maximum limit of 5 minutes for stories."
          );
        }
        setSelectedFile(file);
      };
    }
  };

  const videoUploadDialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        videoUploadDialogRef.current &&
        !videoUploadDialogRef.current.contains(event.target as Node)
      ) {
        setIsVideoUploadOpen(false);
        setSelectedFile(null);
        setOtherFunctionRendered(false);
        setFilePreview(false);
        setOpenLivestreamModal(false);
      }
    };

    if (isVideoUploadOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVideoUploadOpen, setIsVideoUploadOpen]);

  // console.log(otherFunctionRendered ? "publish" : filePreview ? "view" : "create");

  return (
    <AlertDialog open={isVideoUploadOpen}>
      <div className="flex items-center">
        <Button
          variant={"link"}
          size={"icon"}
          className="bg-transparent focus:bg-transparent w-24"
          onClick={() => setIsVideoUploadOpen(true)}
        >
          <img src="/assets/images/my-Profile/upload-with-border.svg" />
        </Button>
        Upload
      </div>
      <AlertDialogContent
        ref={videoUploadDialogRef}
        className={cn(
          !selectedFile
            ? `sm:w-11/12 w-4/5 rounded-md p-0 bg-background`
            : "py-10 p-0 bg-[#171a1f] w-full max-w-[58rem] border-none bg-background"
        )}
      >
        <AlertDialogHeader className="">
          <div className="flex justify-between border-b border-secondary align-middle text-start px-3 pt-4 pb-2">
            <AlertDialogTitle
              className={` w-full text-base pb-2 ${fontItalic.className}`}
            >
              {otherFunctionRendered ? (
                <div
                  className="flex gap-4 cursor-pointer text-2xl items-center"
                  onClick={() => {
                    setOtherFunctionRendered(false), setSelectedFile(null);
                  }}
                >
                  <BackArrow className="fill-foreground mr-4 cursor-pointer" />
                  {"Publish Your Post"}
                </div>
              ) : filePreview ? (
                <div
                  className="flex gap-4 cursor-pointer text-2xl items-center"
                  onClick={() => {
                    setOtherFunctionRendered(false), setSelectedFile(null);
                  }}
                >
                  <BackArrow className="fill-foreground mr-4 cursor-pointer" />
                  {"Video Preview"}
                </div>
              ) : openLivestreamModal ? (
                <div
                  className="flex gap-4 cursor-pointer text-2xl items-center"
                  onClick={() => {
                    setOtherFunctionRendered(false), setSelectedFile(null);
                  }}
                >
                  <BackArrow className="fill-foreground mr-4 cursor-pointer" />
                  {"Live Stream"}
                </div>
              ) : (
                <div>
                  <div className={`text-2xl  ${fontItalic.className}`}>
                    {"Upload"}
                  </div>
                  <div
                    className={` mb-2 text-muted-foreground ${fontItalic.className}`}
                  >
                    Support mp4, avi, webm, and mov video formats
                  </div>
                </div>
              )}
            </AlertDialogTitle>
            <X
              className="mt-1 lg:size-12 cursor-pointer text-secondary-foreground/20"
              onClick={() => {
                setSelectedFile(null);
                setIsVideoUploadOpen(false);
                setOtherFunctionRendered(false);
                setOpenLivestreamModal(false);
                setFilePreview(false);
              }}
            />
          </div>
        </AlertDialogHeader>

        <div
          className={cn(
            selectedFile ? "w-full -mt-4" : "w-11/12 mx-auto p-4 mb-4"
          )}
        >
          <VideoUploadModal
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            otherFunctionRendered={otherFunctionRendered}
            setOtherFunctionRendered={setOtherFunctionRendered}
            setFilePreview={setFilePreview}
            setOpenLivestreamModal={setOpenLivestreamModal}
            openLivestreamModal={openLivestreamModal}
            setIsVideoUploadOpen={setIsVideoUploadOpen}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default VideoUploadPage;
