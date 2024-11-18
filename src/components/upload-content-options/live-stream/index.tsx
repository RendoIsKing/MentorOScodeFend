import LiveStreamDropbox from "@/components/live-post-modal";
import React, { useState } from "react";
import LiveStreamPreviewScreen from "./live-preview-screen";
import { LivePostPopup } from "@/components/live-post-popup";
import LiveStreamFinalScreen from "./live-final-screen";

interface ILiveStreamProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setIsContentUploadOpen?: ((value: boolean) => void) | undefined;
  setUploadString: React.Dispatch<React.SetStateAction<string>>
}

const LiveStream: React.FC<ILiveStreamProps> = ({
  file,
  setFile,
  setIsContentUploadOpen,
  setUploadString
}) => {
  const [contentStep, setContentStep] = useState(1);

  const changeStep = (stepKey?: string) => {
    if (stepKey === "back") {
      setUploadString("")
    } else {
      setContentStep(contentStep + 1);
    }
  };
  return contentStep === 1 ? (
    <LiveStreamPreviewScreen
      changeStep={changeStep}
      setIsContentUploadOpen={setIsContentUploadOpen}
    />
  ) : (
    <LiveStreamFinalScreen setIsContentUploadOpen={setIsContentUploadOpen}  />
  );
};

export default LiveStream;
