import React, { useState } from "react";
import { Input } from "../ui/input";
import AddCircle from "@/assets/images/inbox/add-circle.svg";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Image, Video } from "lucide-react";
import { useContentUploadContext } from "@/context/open-content-modal";
import ContentUploadAlert from "../upload-content-options/content-upload-alert";

export default function ChatFooter() {
  const { toggleContentUploadOpen } = useContentUploadContext();
  return (
    <div className="flex align-middle items-center gap-2 w-full h-full backdrop-brightness-50 p-4 ">
      {/* <AlertDialog open={open}>
        <AddCircle
          className="fill-foreground cursor-pointer"
          onClick={() => setOpen(true)}
        />
        <AlertDialogContent className="p-0 flex flex-col gap-0 rounded-md">
          <AlertDialogHeader className="">
            <div className="flex justify-between align-middle p-4 pb-1">
              <AlertDialogTitle className="italic w-[90%] text-xl font-normal pb-2">
                Select Video to Upload
              </AlertDialogTitle>
              <X
                className="rounded-full mb-1 cursor-pointer "
                onClick={() => setOpen(false)}
              />
            </div>
            <Separator />
          </AlertDialogHeader>
          <div className="border-dashed border-2 lg:border-4 border-secondary rounded-md p-2 m-6">
            <FileUploadForm />
          </div>
        </AlertDialogContent>
      </AlertDialog> */}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <AddCircle className="fill-foreground cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="p-0 rounded-2xl my-4 z-50 border-background light:bg-secondary dark:bg-background"
        >
          <DropdownMenuItem>
            <div
              className="p-3 flex justify-between items-center w-32 cursor-pointer"
              onClick={() => toggleContentUploadOpen(true)}
            >
              Photos
              <Image />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div
              className="p-3 flex justify-between items-center w-32 cursor-pointer"
              onClick={() => toggleContentUploadOpen(true)}
            >
              Video
              <Video />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ContentUploadAlert />
      <Input
        type="text"
        placeholder="Write a message..."
        className="relative p-4"
      />
      <div className="absolute cursor-pointer right-5 bottom-5 bg-primary rounded-full">
        <img src="/assets/images/inbox/send-message.svg" alt="send" />
      </div>
    </div>
  );
}
