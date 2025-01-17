"use client";
import { Aperture, CircleX } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";

import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { UploadFileResponseObject } from "@/contracts/responses/IUploadFileResponse";
import { useUploadFileMutation } from "@/redux/services/haveme";

interface IWebcamCaptureProps {
  setOpenCapture: Dispatch<SetStateAction<boolean>>;
  updateProfilePhotoInfo?: (data: any) => void;
}

// Define the type of the Webcam component
type WebcamType = {
  getScreenshot: () => string;
};

const WebcamCapture: React.FC<IWebcamCaptureProps> = ({
  setOpenCapture,
  updateProfilePhotoInfo,
}) => {
  const webcamRef = useRef<WebcamType | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProfilePhoto] = useUploadFileMutation();

  // create a capture function
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  // Utility function to convert base64 to Blob
  const base64ToBlob = (base64: string) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleUpload = async () => {
    if (imgSrc) {
      setUploading(true);
      const blob = base64ToBlob(imgSrc);
      const formData = new FormData();
      formData.append("file", blob, "capture.png");
      try {
        const res = await uploadProfilePhoto(formData);
        if (res) {
          setUploading(false);
          updateProfilePhotoInfo({ file: res });
          return setOpenCapture(false);
        } else {
          setUploading(false);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
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
    <div className="container">
      <CircleX
        className="rounded-full mb-1 cursor-pointer "
        onClick={() => {
          setOpenCapture(false);
          return setImgSrc(null);
        }}
      />
      {imgSrc ? (
        <div className="flex-col justify-center w-full my-2">
          <img src={imgSrc} alt="webcam" />
          <div className="h-12 mx-4 my-2 w-11/12 justify-center flex">
            <Button className="" onClick={() => handleUpload()}>
              Upload Photo
            </Button>
          </div>
        </div>
      ) : (
        <Webcam
          height={600}
          width={600}
          ref={webcamRef as React.RefObject<Webcam>}
        />
      )}
      {!imgSrc && (
        <div className="btn-container flex w-full justify-center my-2">
          <Aperture onClick={capture} className="cursor-pointer" />
          {/* <button >Capture photo</button> */}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
