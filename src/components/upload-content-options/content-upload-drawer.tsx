"use client";
import React, { useState } from "react";
import { useContentUploadContext } from "@/context/open-content-modal";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent } from "../ui/drawer";
import ContentUploadOptionsDrawer from "./content-upload-options-drawer";

function ContentUploadDrawer() {
  const [isFileUploaded, setIsFileUploaded] = useState(false); // Flag variable
  const { isContentUploadOpen, toggleContentUploadOpen } =
    useContentUploadContext();

  const handleFileUpload = (isUploaded: boolean) => {
    setIsFileUploaded(isUploaded);
  };
  return (
    <Drawer open={isContentUploadOpen} onOpenChange={toggleContentUploadOpen}>
      <DrawerContent
        className={cn("py-10 p-0  bg-[#171a1f] border-none bg-background", {
          "rounded-md p-0 bg-background max-w-5xl": isFileUploaded,
        })}
      >
        <ContentUploadOptionsDrawer
          setIsContentUploadOpen={toggleContentUploadOpen}
          onFileUpload={handleFileUpload}
        />
      </DrawerContent>
    </Drawer>
  );
}

export default ContentUploadDrawer;
