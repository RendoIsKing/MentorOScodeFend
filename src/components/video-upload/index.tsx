import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "../ui/button";
import PublishModalDropBox from "../publish-modal-dropbox";
import { CircleFadingPlus, Grid3X3, Radio } from "lucide-react";
import LiveStreamDropbox from "../live-post-modal";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IVideoUploadModalProps {
  selectedFile: File | null;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  otherFunctionRendered: boolean;
  setOtherFunctionRendered: (value: boolean) => void;
  setFilePreview: (value: boolean) => void;
  setOpenLivestreamModal: (value: boolean) => void;
  openLivestreamModal: boolean;
  setIsVideoUploadOpen?: (value: boolean) => void;
}

const VideoUploadModal: React.FC<IVideoUploadModalProps> = ({
  selectedFile,
  handleFileChange,
  otherFunctionRendered,
  setOtherFunctionRendered,
  setFilePreview,
  setOpenLivestreamModal,
  openLivestreamModal,
  setIsVideoUploadOpen,
}) => {
  const [uploadString, setUploadString] = useState("");

  const handleUploadClick = (type: string) => {
    setUploadString(type);
    const fileInput = document.getElementById(`file-input-${type}`);
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleLiveStreamClick = () => {
    setOpenLivestreamModal(true);
    setUploadString("Live Stream");
  };
  const handleNextLiveStreamClick = () => {
    setIsVideoUploadOpen && setIsVideoUploadOpen(false);
  };

  const handleOtherFunctionClick = () => {
    setOtherFunctionRendered(true);
    setFilePreview(false);
  };

  const renderUploadOptions = () => (
    <div className="flex flex-col items-center justify-center space-y-4 h-auto">
      <div className="flex flex-col w-full gap-4 text-2xl border-none rounded-3xl">
        {["story", "post", "Live Stream"].map((type) => (
          <div
            key={type}
            className="w-full flex flex-col justify-center text-center h-auto my-1"
            onClick={
              type === "Live Stream"
                ? handleLiveStreamClick
                : () => handleUploadClick(type)
            }
          >
            <div
              className="w-full flex justify-center py-2 cursor-pointer"
              onClick={() => setUploadString(type)}
            >
              <div className="flex justify-between items-center w-11/12">
                <div>{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div>
                  {type === "story" && (
                    <CircleFadingPlus className="text-primary" />
                  )}
                  {type === "post" && <Grid3X3 className="text-primary" />}
                  {type === "Live Stream" && <Radio className="text-primary" />}
                </div>
              </div>
            </div>
            <input
              id={`file-input-${type}`}
              style={{ display: "none" }}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (true) {
      case otherFunctionRendered:
        return (
          <PublishModalDropBox
            uploadString={uploadString}
            selectedFile={selectedFile}
          />
        );
      case openLivestreamModal:
        return (
          // <Button onClick={handleNextLiveStreamClick}>s,sajlkj</Button>
          <LiveStreamDropbox />
        );
      case uploadString === "Live Stream":
        return (
          <div>
            <Button>Live</Button>
          </div>
        );
      case selectedFile !== null:
        return (
          <div className="p-1 relative">
            <video
              src={URL.createObjectURL(selectedFile)}
              controls
              controlsList="nodownload"
              className="w-full h-full max-h-[45rem]"
              id="video-preview"
            />
            <div className="absolute right-4 bottom-20 w-1/4">
              <Button
                className={`w-full h-8 ${fontItalic.className}`}
                onClick={handleOtherFunctionClick}
              >
                Next
              </Button>
            </div>
          </div>
        );
      default:
        return renderUploadOptions();
    }
  };

  return renderContent();
};

export default VideoUploadModal;
