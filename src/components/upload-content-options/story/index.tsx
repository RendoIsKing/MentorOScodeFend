import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BackArrow from "@/assets/images/Signup/back.svg";
import PublishModalDropBox from "@/components/publish-modal-dropbox";
import StoryPreviewScreen from "./story-preview-screen";

interface IStoryProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setIsContentUploadOpen?: ((value: boolean) => void) | undefined;
  onFileUpload: (value: boolean) => void;
  orientation: string;
}
const Story: React.FC<IStoryProps> = ({
  file,
  setFile,
  setIsContentUploadOpen,
  onFileUpload,
  orientation,
}) => {
  const [contentStep, setContentStep] = useState(1);

  const nextStep = () => {
    setContentStep(contentStep + 1);
  };
  return contentStep === 1 ? (
    <StoryPreviewScreen
      file={file}
      setFile={setFile}
      nextStep={nextStep}
      setIsContentUploadOpen={setIsContentUploadOpen}
      onFileUpload={onFileUpload}
    />
  ) : (
    <div>
      <PublishModalDropBox
        uploadString="story"
        setFile={setFile}
        selectedFile={file}
        setIsContentUploadOpen={setIsContentUploadOpen}
        onFileUpload={onFileUpload}
        orientation={orientation}
      />
    </div>
  );
};

export default Story;
