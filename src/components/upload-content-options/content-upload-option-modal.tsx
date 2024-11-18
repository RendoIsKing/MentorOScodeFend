import React, { ChangeEvent, useState } from "react";
import { CircleFadingPlus, Grid3X3, Radio, X } from "lucide-react";
import {
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContentType } from "@/lib/contentType";

import Story from "./story";
import Post from "./post";
import LiveStream from "./live-stream";
import { ABeeZee } from "next/font/google";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IContentUploadOptionsProps {
  setIsContentUploadOpen?: (value: boolean) => void;
  isContentUploadOpen?: boolean;
  onFileUpload: (value: boolean) => void;
}

const ContentUploadOptionsModal: React.FC<IContentUploadOptionsProps> = ({
  setIsContentUploadOpen,
  onFileUpload,
}) => {
  const [uploadString, setUploadString] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [orientation, setOrientation] = useState("landscape");

  const handleOptionClick = (optionType: string) => {
    setUploadString(optionType);
    if (optionType !== "Live Stream") {
      const fileInput = document.getElementById(`file-input-${optionType}`);
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   // setFilePreview(true);
  //   if (file) {
  //     const video = document.createElement("video");
  //     video.src = URL.createObjectURL(file);
  //     video.onloadedmetadata = () => {
  //       const duration = video.duration / 60;
  //       if (duration > 5) {
  //         alert(
  //           "The video duration exceeds the maximum limit of 5 minutes for stories."
  //         );
  //       }
  //       setSelectedFile(file);
  //       onFileUpload(true);
  //     };
  //   }
  // };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type.split("/")[0];
      if (fileType === "video") {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
          const duration = video.duration / 60;
          if (duration > 5) {
            alert(
              "The video duration exceeds the maximum limit of 5 minutes for stories."
            );
          } else {
            setSelectedFile(file);
            onFileUpload(true);
          }
          const width = video.videoWidth;
          const height = video.videoHeight;

          let orientation = "landscape";
          if (height > width) {
            orientation = "portrait";
            setOrientation(orientation);
          }
        };
      } else if (fileType === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const image = new Image();
          image.src = e.target.result as string;
          image.onload = () => {
            const width = image.width;
            const height = image.height;
            let orientation = "landscape";
            if (height > width) {
              orientation = "portrait";
              setOrientation(orientation);
            }
            setSelectedFile(file);
            onFileUpload(true);
          };
        };
        reader.readAsDataURL(file);
      } else {
        alert("Unsupported file type.");
      }
    }
  };

  const renderUploadOptions = () => (
    <>
      <AlertDialogHeader>
        <div className="flex  justify-between border-b border-secondary align-middle text-start px-3 pt-4 pb-2">
          <AlertDialogTitle
            className={`  text-base pb-2 ${fontItalic.className}`}
          >
            <div>
              <div className={`text-2xl  font-thin ${fontItalic.className}`}>
                {"Upload"}
              </div>
              <div
                className={` mb-2 text-muted-foreground ${fontItalic.className}`}
              >
                Support mp4, avi, webm, and mov video formats
              </div>
            </div>
          </AlertDialogTitle>
          <X
            className="mt-1 lg:size-9 cursor-pointer text-secondary-foreground/20"
            onClick={() => {
              setIsContentUploadOpen && setIsContentUploadOpen(false);
              // setSelectedFile(null);
              // setIsContentUploadOpen(false);
              // setOtherFunctionRendered(false);
              // setOpenLivestreamModal(false);
              // setFilePreview(false);
            }}
          />
        </div>
      </AlertDialogHeader>
      <div className="flex flex-col items-center justify-center space-y-4 h-auto p-2">
        <div className="flex flex-col w-full gap-2 text-xl border-none rounded-5xl ">
          {Object.values(ContentType).map((type) => (
            <div
              key={type}
              className="w-full flex flex-col justify-center text-center h-auto my-1 hover:bg-muted"
            >
              <div
                className="w-full flex justify-center py-1 cursor-pointer"
                onClick={() => handleOptionClick(type)}
              >
                <div className="flex justify-between items-center w-11/12 pb-2">
                  <div>{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                  <div>
                    {type === ContentType.STORY && (
                      <CircleFadingPlus className="text-primary text-lg" />
                    )}
                    {type === ContentType.POST && (
                      <Grid3X3 className="text-primary text-lg" />
                    )}
                    {type === ContentType.LIVE_STREAM && (
                      <Radio className="text-primary text-lg" />
                    )}
                  </div>
                </div>
              </div>
              <input
                id={`file-input-${type}`}
                style={{ display: "none" }}
                type="file"
                accept="video/*,image/png, image/gif, image/jpeg"
                onChange={handleFileChange}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (uploadString) {
      case "Live Stream":
        return (
          <LiveStream
            file={selectedFile}
            setFile={setSelectedFile}
            setIsContentUploadOpen={setIsContentUploadOpen}
            setUploadString={setUploadString}
          />
        );
      case "post":
        return selectedFile ? (
          <Post
            file={selectedFile}
            setFile={setSelectedFile}
            setIsContentUploadOpen={setIsContentUploadOpen}
            onFileUpload={onFileUpload}
            orientation={orientation}
          />
        ) : (
          renderUploadOptions()
        );
      case "story":
        return selectedFile ? (
          <Story
            file={selectedFile}
            setFile={setSelectedFile}
            setIsContentUploadOpen={setIsContentUploadOpen}
            onFileUpload={onFileUpload}
            orientation={orientation}
          />
        ) : (
          renderUploadOptions()
        );
      default:
        return renderUploadOptions();
    }
  };

  return renderContent();
};

export default ContentUploadOptionsModal;
