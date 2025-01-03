import CloseIcon from "@/assets/images/my-Profile/closeIcon";
import React from "react";
import { Progress } from "@/components/ui/progress";

const UploadModal1 = ({
  closeModal,
  uploadedImage,
  generateAvatarHandler,
  isLoading,
  progress,
  renderTrigger,
}: any) => {
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

          {isLoading ? (
            <>
              <div className="font-medium text-[#344044] text-2xl">
                Your Avatar is Almost Ready...
              </div>
              <Progress value={progress.current} className="w-full mt-4" />
            </>
          ) : (
            <div className="border-[#646464] bg-[#d4d4d4] rounded-[12px] bg-opacity-70 border-dashed border-[2px] p-6">
              <div className="flex flex-col items-center">
                {/* Circle Image Placeholder */}
                <div className="relative w-24 h-24 bg-gray-300 rounded-full border-2 border-dashed border-gray-400 shadow-[0_0_20px_10px_rgba(255,0,255,0.2)] overflow-hidden">
                  {uploadedImage ? (
                    // Show uploaded image if available
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="Uploaded"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    // Show "No Image" text if no image is uploaded
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">No Image</p>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex mt-5 space-x-4">
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-700 py-2 px-6 rounded-full shadow"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateAvatarHandler}
                    disabled={isLoading} // Disable button while loading
                    className={`py-2 px-6 rounded-full shadow ${
                      isLoading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-[#b913e2] text-white hover:text-black hover:bg-white hover:border-[#b913e2] hover:border transition"
                    }`}
                  >
                    {isLoading ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal1;
