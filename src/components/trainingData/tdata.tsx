"use client";
import React, { useState } from "react";
import ProfilePhoto from "../profile-photo";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "@/components/ui/textarea";
import WebcamCapture from "../capture-photo";
import SimpleAvatar from "../shared/simple-avatar";
import FileUploadPopup from "../shared/popup/file-upload-popup";
import { ABeeZee } from "next/font/google";
import { StickyNote } from "lucide-react";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const TrainingData: React.FC = () => {
  const [openCapture, setOpenCapture] = useState(false);
  const [capturedFile, setCapturedFile] = useState<Blob | null>(null);

  // Function to convert the captured image to a base64 string
  const convertToBase64 = (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to handle image capture and generate preview link
  const handleCapture = async (file: Blob) => {
    setCapturedFile(file); // Set the captured file
    const base64String = await convertToBase64(file); // Convert captured image to base64
    const previewLink = base64String; // You can construct a preview link using the base64 string
  };

  return (
    <div className="sm:mx-auto">
      <div className="p-5">
        <div>
          {openCapture ? (
            <div className="flex justify-center">
              <div className="sm:w-1/2">
                <WebcamCapture setOpenCapture={setOpenCapture} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 justify-evenly">
              <div className="flex justify-center">
                <SimpleAvatar
                  imageUrl="/assets/images/my-Profile/avtar-dummy.svg"
                  avatarClass="w-64 h-64"
                  ImageFallBackText="@shadcn"
                  imageHeight={256}
                  imageWidth={256}
                />
              </div>
            </div>
          )}

          <div className="text-center lg:text-primary text-muted-foreground mt-5">
            Change avatar appearence
          </div>

          <div className="flex justify-center mt-10">
            <div className="">
              <Button
                variant="outline"
                className={`border-2 border-foreground w-32 lg:w-40 mr-8 lg:${fontItalic.className} `}
                // onClick={() => setOpenCapture(true)}
              >
                Take Video
              </Button>
            </div>
            <div>
              <FileUploadPopup top={true} />
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div>
            <div className="p-3 border-t-2 border-b-2 border-secondary mt-5 sm:border-0 sm:mt-10">
              <p className={`text-lg  mb-3 ${fontItalic.className}`}>
                Avatar training data
              </p>
              <div className="mb-3">
                <Textarea
                  placeholder="Input text"
                  className="p-3 lg:border-secondary-muted/20 h-28 lg:h-36 rounded-3xl text-lg"
                />
              </div>
            </div>

            <div className="p-3 flex flex-col justify-between items-start">
              <div className="w-full flex justify-between items-start">
                <div className={`text-lg  ${fontItalic.className}`}>
                  Training data
                </div>
                <div>
                  <FileUploadPopup />
                </div>
              </div>
              <div className="flex w-full gap-2 my-2 border-b-2 border-secondary pb-4">
                <StickyNote  />
                <div>Document 1</div>
              </div>
              <div className="flex w-full gap-2 my-2 border-b-2 border-secondary pb-4">
                <StickyNote  />
                <div>Document 2</div>
              </div>
            </div>

            <div className="p-3">
              <div className="flex justify-between">
                <p className={`text-lg  ${fontItalic.className}`}>
                  Advertisement Partner Data
                </p>
                <div>
                  <FileUploadPopup />
                </div>
              </div>

              <div>
                <p className="mt-2 text-sm max-w-lg text-secondary-foreground/80">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Iusto totam sit blanditiis nulla consequuntur rerum
                  asperiores, velit eligendi vel architecto illo. Illo unde
                  recusandae rem quisquam id a earum nobis.
                </p>
              </div>
              <div className="flex w-full gap-2 my-4 border-b-2 border-secondary pb-4">
                <StickyNote  />
                <div>Document 1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingData;
