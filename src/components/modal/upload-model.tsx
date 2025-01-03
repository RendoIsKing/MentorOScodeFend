import CloseIcon from "@/assets/images/my-Profile/closeIcon";
import React, { useState, useRef } from "react";

const UploadModal = ({ closeModal, handleImageUpload }: any) => {
  const fileInputRef = useRef(null); // Reference for the hidden file input

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-[600px]">
        <div className="bg-white p-16 rounded-lg relative">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>

          {/* Modal Content */}
          <div className="border-[#646464] bg-[#d4d4d4] rounded-[12px] bg-opacity-70 border-dashed border-[2px] p-6 text-center">
            {/* Upload Support Text */}
            <p className="text-[#646464] font-normal text-base">
              Support mp3, avi & mp4 up to 5mb
            </p>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageChange}
              style={{ display: "none" }}
            />

            {/* Upload Button */}
            <button
              onClick={triggerFileInput}
              className="mt-8 bg-[#b913e2] text-white py-2 px-6 rounded-full shadow hover:bg-white hover:text-black hover:border hover:border-[#b913e2] transition"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
