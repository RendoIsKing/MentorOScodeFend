import React from "react";
import BackArrow from "@/assets/images/Signup/back.svg";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ABeeZee } from "next/font/google";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { cn } from "@/lib/utils";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IPostPreviewScreenProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  nextStep: () => void;
  setIsContentUploadOpen?: ((value: boolean) => void) | undefined;
  onFileUpload: (value: boolean) => void;
}
const PostPreviewScreen: React.FC<IPostPreviewScreenProps> = ({
  file,
  setFile,
  nextStep,
  setIsContentUploadOpen,
  onFileUpload,
}) => {
  const fileType = file.type.split("/")[0];
  const imgUrl = URL.createObjectURL(file);
  const { isMobile } = useClientHardwareInfo();

  return (
    <div className={cn({ "min-h-screen max-h-screen": isMobile })}>
      <div className="flex justify-between border-b border-secondary align-middle text-start px-3 pt-4 pb-2">
        <div className={` w-full text-base pb-2 ${fontItalic.className}`}>
          <div>
            <div
              className={`text-2xl  ${fontItalic.className} flex w-full justify-between items-center px-2`}
            >
              <div className="flex">
                <BackArrow
                  className="fill-foreground mr-4 cursor-pointer mt-1"
                  onClick={() => {
                    setFile(null);
                    onFileUpload(false);
                  }}
                />
                {fileType === "image" ? "Image Preview" : "Video Preview"}
              </div>
              <div>
                <X
                  className="mt-1 lg:size-12 cursor-pointer text-secondary-foreground/20"
                  onClick={() => {
                    onFileUpload(false);
                    setIsContentUploadOpen && setIsContentUploadOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {file && (
        <div
          className={cn("p-1 relative ", {
            "flex justify-end h-[80vh] items-center": isMobile,
          })}
        >
          {fileType === "image" ? (
            <img
              src={URL.createObjectURL(file)}
              className="w-full h-full max-h-[45rem] object-contain"
              alt="story"
            />
          ) : (
            <video
              src={URL.createObjectURL(file)}
              controls
              controlsList="nodownload"
              className="w-full h-full max-h-[45rem]"
              id="video-preview"
            />
          )}
          {/* <video
            src={URL.createObjectURL(file)}
            controls
            controlsList="nodownload"
            className="w-full h-full max-h-[45rem]"
            id="video-preview"
          /> */}
          <div className="absolute right-4 bottom-20 w-1/4">
            <Button
              className={` w-full h-8 ${fontItalic.className}`}
              onClick={() => nextStep()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPreviewScreen;
