"use client";
import React, { useState } from "react";
import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import ContentUploadOptionsModal from "./content-upload-option-modal";
import { useContentUploadContext } from "@/context/open-content-modal";
import { cn } from "@/lib/utils";
import { useUserTagsContext } from "@/context/UserTags";

function ContentUploadAlert() {
  const [isFileUploaded, setIsFileUploaded] = useState(false); // Flag variable
  const { state, dispatch } = useUserTagsContext();

  const { isContentUploadOpen, toggleContentUploadOpen } =
    useContentUploadContext();

  const handleFileUpload = (isUploaded: boolean) => {
    setIsFileUploaded(isUploaded);
  };
  return (
    <AlertDialog
      open={isContentUploadOpen}
      onOpenChange={toggleContentUploadOpen}
    >
      <AlertDialogContent
        onCloseAutoFocus={() => {
          dispatch({ type: "RESET_TAGGED_USERS" });
        }}
        className={cn("py-10 p-0  bg-[#171a1f] border-none bg-background", {
          "rounded-md p-0 bg-background max-w-5xl": isFileUploaded,
        })}
      >
        <ContentUploadOptionsModal
          setIsContentUploadOpen={toggleContentUploadOpen}
          onFileUpload={handleFileUpload}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ContentUploadAlert;
