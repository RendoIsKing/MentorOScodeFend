/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";
import { ABeeZee } from "next/font/google";
import { useUploadFileMutation } from "@/redux/services/haveme";
import { toast } from "../ui/use-toast";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface UploadResponse {
  file: any;
  uploadedImageType?: string;
}
interface IFileUploadFormProps {
  close?: () => void;
  updateProfilePhotoInfo?: (data: UploadResponse) => void;
  uploadType?: string;
}

const FileUploadForm: React.FC<IFileUploadFormProps> = ({
  close,
  updateProfilePhotoInfo,
  uploadType,
}) => {
  const [fileSelected, setFileSelected] = useState(false);
  const [file, setFile] = useState<Blob | null>(null);
  const [imageURL, setImageURL] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [uploadProfilePhoto] = useUploadFileMutation();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Please select an Image",
        });
        return; // Exit the function if the file is not an image
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result;
        setFileSelected(true);
        setFile(selectedFile);
        setImageURL(URL.createObjectURL(selectedFile));
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFileSelected(false);
      setFile(null);
      setImageURL("");
    }
  };

  const handleUploadButtonClick = () => {
    const fileInput = document.getElementById("file-input");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleUpload = async () => {
    let formData = new FormData();
    if (file) {
      setUploading(true);
      formData.append("file", file);
      const res = await uploadProfilePhoto(formData);
      if (res) {
        setUploading(false);
        updateProfilePhotoInfo({ file: res, uploadedImageType: uploadType });
        return close();
      } else {
        setUploading(false);
      }
    } else {
      const fileInput = document.getElementById("file-input");
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-center w-full cursor-pointer p-4 flex-col">
        {fileSelected ? (
          <div className="flex w-full justify-center mb-4">
            <img
              src={imageURL}
              alt="Preview"
              className="w-40 h-40 rounded-full"
            />
          </div>
        ) : (
          <div className="space-y-2" onClick={handleUploadButtonClick}>
            <div className="w-full flex flex-col justify-center">
              <CloudUpload className="text-primary w-full justify-center" />
              <p
                className={`text-center mt-2 leading-4 pb-4 ${fontItalic.className}`}
              >
                Support jpg, jpeg, Png formats <br /> up to 5mb
              </p>
            </div>
            <Input
              disabled={uploading}
              id="file-input"
              data-test="file-input"
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
        <div className="w-full flex justify-center">
          <Button
            type="button"
            onClick={handleUpload}
            className="w-3/4"
            disabled={uploading}
            data-test="post-submit"
          >
            {uploading && (
              <svg
                className="animate-spin h-5 w-5 mr-3 ..."
                viewBox="0 0 24 24"
              />
            )}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadForm;
