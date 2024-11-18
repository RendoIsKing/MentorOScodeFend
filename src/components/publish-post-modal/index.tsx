"use client";
import React from "react";
import PublishModalDropBox from "../publish-modal-dropbox";
interface SharedPopupsProps {
  uploadString: string;
  selectedFile: File | null;
}
const PublishPostModal = ({
  uploadString,
  selectedFile,
}: SharedPopupsProps) => {
  return (
    <div>
        <PublishModalDropBox uploadString={uploadString} selectedFile={selectedFile} />
    </div>
  );
};

export default PublishPostModal;
