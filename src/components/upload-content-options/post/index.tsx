import React, { useState } from "react";
import PublishModalDropBox from "@/components/publish-modal-dropbox";
import PostPreviewScreen from "./post-preview-screen";

interface IPostProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setIsContentUploadOpen?: ((value: boolean) => void) | undefined;
  onFileUpload: (value: boolean) => void;
  orientation: string;
}
const Story: React.FC<IPostProps> = ({
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
    <PostPreviewScreen
      file={file}
      setFile={setFile}
      nextStep={nextStep}
      setIsContentUploadOpen={setIsContentUploadOpen}
      onFileUpload={onFileUpload}
    />
  ) : (
    <div>
      <PublishModalDropBox
        uploadString="post"
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
