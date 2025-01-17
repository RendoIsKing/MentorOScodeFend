import React from "react";
import FileUploadForm from "@/components/file-upload";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CircleX, FolderUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ABeeZee } from "next/font/google";
import Image from "next/image";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const FileUploadPopup = ({ top = false }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {top ? (
          <Button className={`w-32 lg:w-40 ${fontItalic.className}`}>
            Upload
          </Button>
        ) : (
          <Button className="bg-transparent text-primary hover:bg-transparent h-fit py-0 pe-0">
            <Image
              className="mr-2"
              width={25}
              height={25}
              alt="upload"
              src="/assets/images/my-Profile/document-upload.svg"
            />
            Upload
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader className="">
          <div className="flex align-middle text-center">
            <AlertDialogCancel>
              <CircleX className="rounded-full mb-1 cursor-pointer" />
            </AlertDialogCancel>
            <AlertDialogTitle className="italic w-[90%]">
              Profile Photo
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <div className="border-dashed border-4 rounded-md p-2">
          <FileUploadForm />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FileUploadPopup;
