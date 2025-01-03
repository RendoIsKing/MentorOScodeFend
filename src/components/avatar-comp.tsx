import React, { useRef } from "react";
import UploadIcon from "@/assets/images/my-Profile/textIcon1";
import MusicIcon from "@/assets/images/my-Profile/musicIcon";
import PlayIcon from "@/assets/images/my-Profile/playIcon";
import VoiceIcon from "@/assets/images/my-Profile/voiceIcon";
import Link from "next/link";
import DeleteIcon from "@/assets/images/my-Profile/deletecon";
import TextIcon from "@/assets/images/my-Profile/textIcon";

const AvatarComp = ({
  handleFileUpload,
  title,
  filesData,
  openDeleteModal,
}: any) => {
  const fileInputRef = useRef(null);
  // console.log("filesData", filesData);

  const acceptFiles = ".pdf, .doc, .docx, .txt, .mp3";

  const handleIconClick = () => {
    fileInputRef.current.click();
  };
  return (
    <>
      <h2 className="text-lg font-medium my-3">{title}</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptFiles}
          onChange={handleFileUpload}
        />

        {title === "Avatar Training Data" ? (
          <button
            type="button"
            className="mx-auto flex justify-center"
            onClick={handleIconClick}
          >
            <UploadIcon />
          </button>
        ) : (
          <div className="flex justify-center">
            <MusicIcon />
          </div>
        )}
        <p className="mt-2 text-sm font-medium">
          <button onClick={handleIconClick} className="text-[#b913e2]">
            Click to Upload{" "}
          </button>{" "}
          {/* or drag and drop */}
        </p>
        <p className="text-[#353535] text-xs font-normal">
          (Max. File size: 25 MB)
        </p>
      </div>

      {title === "Avatar Training Data" ? (
        <div className="mt-4 space-y-2">
          <h2 className="text-lg font-medium mb-0">Training Data</h2>
          {filesData
            ?.filter((item: any) => item?.fileType === "file")
            .map((item: any) => {
              return (
                <div
                  key={item?._id}
                  className="flex items-center justify-between p-2 rounded-lg"
                >
                  <div className="flex items-center">
                    <TextIcon />
                    <Link
                      href={item?.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 font-medium text-[16px]"
                    >
                      {item?.fileName}
                    </Link>
                  </div>
                  <button
                    onClick={() => openDeleteModal(item?._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="mt-4">
          {filesData
            ?.filter((item: any) => item?.fileType === "audio")
            .map((item: any, i) => {
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg"
                >
                  <div className="flex items-center">
                    <VoiceIcon />
                    <div className="ml-2">
                      <p className="text-gray-600"> {item?.fileName}</p>
                      <p className="text-sm text-gray-400">13m 24s — 3.9mb</p>
                    </div>
                  </div>
                  <button className="text-purple-500 hover:text-purple-700">
                    <PlayIcon />
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </>
  );
};

export default AvatarComp;
