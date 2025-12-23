"use client";
import Modal from "@/components/modal/upload-model";
import Modal1 from "@/components/modal/upload-model1";
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import AvatarComp from "@/components/avatar-comp";
import Skin1 from "@/assets/images/Creator-center/Skin1.png";
import DeleteModal from "@/components/modal/delete-modal";
import CloseIcon from "@/assets/images/my-Profile/closeIcon";
import TakePicture from "@/assets/images/my-Profile/takePicture";
import ArrowIcon from "@/assets/images/my-Profile/arrowIcon";
import {
  useGenerateAvatarMutation,
  useSaveFileMutation,
  useGetFilesQuery,
  useDeleteAvatarTrainingMutation,
} from "../../../redux/slices/chat&avatar";

import {
  useSubmitAvatarMutation,
  useGetAvatarQuery,
  useDeleteAvatarMutation,
} from "../../../redux/slices/userChats";
import EditStep from "@/components/edit-step";
import HairImg1 from "@/assets/images/Creator-center/HairImg1.png";
import FaceExpressionImg1 from "@/assets/images/Creator-center/FaceExpression1.png";
import BodyTypeImg1 from "@/assets/images/Creator-center/BodyType1.png";
import DressImg1 from "@/assets/images/Creator-center/Dress1.png";
import FinalAvatar from "@/components/final-avatar";
import Link from "next/link";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [avatar, setAvatar] = useState(false);
  const [isWebcamVisible, setIsWebcamVisible] = useState(false);
  const webcamRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const progress = useRef(0);
  const [imageModal, setImageModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [renderTrigger, setRenderTrigger] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [genereateButtonClicked, setGenerateButtonClicked] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const [generateAvatar, { data, isLoading, error }] =
    useGenerateAvatarMutation();

  const [
    saveFileAvatar,
    { data: saveFileData, isLoading: fileLoading, error: fileError },
  ] = useSaveFileMutation();

  const {
    data: filesData,
    isLoading: getFilesLoading,
    error: getFilesError,
    refetch: refetchFiles,
  } = useGetFilesQuery();

  const [deleteAvatar, { isLoading: newLoading, error: newError }] =
    useDeleteAvatarMutation();

  const [
    deleteTrainingAvatar,
    { isLoading: newTrainingLoading, error: newAvatarTrainingDeleteError },
  ] = useDeleteAvatarTrainingMutation();

  const [
    submitAvatar,
    { data: avtdata, isLoading: avtloading, error: avtError },
  ] = useSubmitAvatarMutation();

  const skinTones = [
    { name: "Ivory", imageSrc: Skin1 },
    { name: "Porcelain", imageSrc: Skin1 },
    { name: "Pale Ivory", imageSrc: Skin1 },
    { name: "Warm Ivory", imageSrc: Skin1 },
    { name: "Sand", imageSrc: Skin1 },
    { name: "Rose Beige", imageSrc: Skin1 },
    { name: "Limestone", imageSrc: Skin1 },
    { name: "Beige", imageSrc: Skin1 },
    { name: "Senna", imageSrc: Skin1 },
    { name: "Honey", imageSrc: Skin1 },
    { name: "Band", imageSrc: Skin1 },
    { name: "Almond", imageSrc: Skin1 },
    { name: "Chestnut", imageSrc: Skin1 },
    { name: "Bronze", imageSrc: Skin1 },
    { name: "Umber", imageSrc: Skin1 },
    { name: "Golden", imageSrc: Skin1 },
    { name: "Chocolate", imageSrc: Skin1 },
    { name: "Deep", imageSrc: Skin1 },
  ];

  const hairStyles = [
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
    { imageSrc: HairImg1 },
  ];

  const bodyType = [
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
    { imageSrc: BodyTypeImg1 },
  ];

  const dress = [
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
    { imageSrc: DressImg1 },
  ];

  const FaceExpression = [
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
    { imageSrc: FaceExpressionImg1 },
  ];

  const {
    data: getavtr,
    isLoading: avtrloading,
    error: avtrerror,
    refetch,
  } = useGetAvatarQuery(undefined);

  const handleFileUpload = async (e) => {
    try {
      const formData: any = new FormData();
      formData.append("File", e.target.files[0]);

      const res: any = await saveFileAvatar(formData);
      if (res?.data?.Details) {
        await refetchFiles();
      }
      console.log("res", res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageClick = () => {
    setImageModal(true);
  };

  const handleImageCloseModal = () => {
    setImageModal(false);
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageDataUrl = webcamRef.current.getScreenshot();

      // Convert data URL to Blob
      const dataUrlToBlob = (dataUrl) => {
        const byteString = atob(dataUrl.split(",")[1]);
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
      };

      const imageBlob = dataUrlToBlob(imageDataUrl);
      const imageFile = new File([imageBlob], "captured_image.png", {
        type: imageBlob.type,
      });

      setImageSrc(imageDataUrl);
      setUploadedImage(imageFile);
    }
  };

  const closeSuccessPopup = () => {
    if (selectedId) setIsSuccessPopupOpen(false);
    else setIsSuccessPopupOpen(false);
    setIsWebcamVisible(false);
    setAvatar(false);
  };

  const openDeleteModal = (id?: string) => {
    setIsDeleteModalOpen(true);
    setSelectedId(id);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      if (selectedId) {
        const response = await deleteTrainingAvatar(selectedId);
        if (response) {
          closeDeleteModal();
          await refetchFiles();
          setIsSuccessPopupOpen(true);
        }
      } else {
        const response = await deleteAvatar();
        if (response) {
          setImageSrc(null);
          closeDeleteModal();
          setIsSuccessPopupOpen(true);
        }
      }
    } catch (newError: any) {
      console.error("Error occurred:", newError);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageUpload = (imageFile) => {
    setUploadedImage(imageFile);
    setIsModalOpen(false);
    setIsModal1Open(true);
  };

  const closeModal1 = () => {
    setIsModal1Open(false);
  };

  const showWebcam = () => {
    setIsWebcamVisible(true);
    setImageSrc(null);
  };

  const generateAvatarHandler = async () => {
    setGenerateButtonClicked(true);
    progress.current = 10;
    setRenderTrigger((prev) => !prev);
    try {
      const formData: any = new FormData();
      formData.append("Image", uploadedImage);

      // First async step: generating avatar
      const response: any = await generateAvatar(formData).unwrap();
      if (response) {
        progress.current = 50;
        setRenderTrigger((prev) => !prev);

        // Second async step: submitting the avatar
        const updateAvatar = await submitAvatar({
          profileAvatar: response?.Details,
        }).unwrap();

        if (updateAvatar) {
          progress.current = 90; // Almost done after avatar submission
          setRenderTrigger((prev) => !prev);
          await refetch();

          // Final UI updates
          setIsModal1Open(false);
          setIsWebcamVisible(false);
          setAvatar(true);

          console.log("Avatar updated successfully", updateAvatar);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    progress.current = 100; // Completion progress
    setRenderTrigger((prev) => !prev);
    setGenerateButtonClicked(false);
  };

  const previousButton = () => {
    setCurrentStep((prevStep) => (prevStep > 1 ? prevStep - 1 : 1));
  };

  const nextButton = () => {
    setCurrentStep((prevStep) => (prevStep < 6 ? prevStep + 1 : 1));
  };
  useEffect(() => {
    if (getavtr) {
      // console.log("Fetched avatar data:", getavtr);
      // Set the avatar image source and close webcam view if avatar data is available
      setImageSrc(getavtr?.user?.profileAvatar);
      setIsWebcamVisible(false);
      setAvatar(true);
    }
  }, [getavtr]);

  useEffect(() => {
    let interval;

    if (genereateButtonClicked) {
      interval = setInterval(() => {
        if (progress.current < 100) {
          progress.current = progress.current + 5;
          setRenderTrigger((prev) => !prev);
        } else {
          progress.current = 100;
          clearInterval(interval);
        }
      }, 800);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [genereateButtonClicked]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-6">
        {/* <ToastContainer /> */}
        <div className="flex flex-col">
          <div className="flex items-center gap-x-4">
            <button onClick={previousButton}>
              <ArrowIcon />
            </button>

            <div className="font-medium text-[24px]">Robert Half</div>
          </div>
          <div className="flex-grow border-t mt-3  border-[#E1E3E7] border-[1px]"></div>
        </div>

        {avatar ? (
          <div className="text-center">
            <div className="font-medium text-[32px] text-black ">
              {edit
                ? currentStep === 6
                  ? "Final Avatar"
                  : "Edit Avatar"
                : "Generated Avatar Successfully!"}
            </div>
            <div className="font-normal text-[19px] text-[#444444]">
              Achieve unmatched quality with the professional avatar.
            </div>
            <div className="flex-grow border-t mx-[450px] mt-4 border-[#A652FA] border-2"></div>
          </div>
        ) : null}

        {edit && currentStep === 6 ? null : (
          <div className="flex flex-col items-center justify-center p-5 ">
            <div className="relative w-[400px] h-[400px] bg-[#d9d9d9] rounded-full flex items-center justify-center shadow-[0_0_20px_10px_rgba(255,0,255,0.2)]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="border-t-2 border-primary border-solid rounded-full w-12 h-12 animate-spin"></div>
                </div>
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  onClick={handleImageClick}
                  alt="Captured"
                  className="rounded-full w-[400px] h-[400px] object-cover cursor-pointer"
                />
              ) : (
                isWebcamVisible && (
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-full w-[400px] h-[400px] object-cover"
                  />
                )
              )}
            </div>

            {isWebcamVisible && (
              <div className="my-5 flex flex-col gap-y-4 items-center justify-center">
                <div className="font-medium text-[#344044] text-2xl">
                  Hold Still
                </div>
                <button onClick={capture}>
                  <TakePicture />{" "}
                  {/* Take picture using TakePicture component */}
                </button>
              </div>
            )}
            {isWebcamVisible ? (
              <div className="flex mt-5 space-x-4">
                <button
                  onClick={showWebcam}
                  className="bg-[#b913e2] font-medium text-white text-[16px] lg:text-[20px] py-2 px-6 rounded-full shadow hover:bg-white hover:border-2 hover:text-black hover:border-[#b913e2] transition"
                >
                  Retake Picture
                </button>

                {/* Button to show webcam and take a picture */}
                <button
                  disabled={isLoading}
                  onClick={generateAvatarHandler}
                  className={`border-[2px] font-medium border-[#b913e2] text-[16px] lg:text-[20px] py-2 px-8 rounded-full shadow hover:bg-[#b913e2] hover:text-white transition ${
                    isLoading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  Generate
                </button>
              </div>
            ) : (
              <div className="flex mt-5 space-x-4">
                {avatar ? (
                  <>
                    {edit ? null : (
                      <>
                        <button
                          onClick={() => {
                            setEdit(true);
                            setCurrentStep(1);
                          }}
                          className="bg-[#b913e2] font-medium text-white text-[16px] lg:text-[20px] py-2 px-14 rounded-full shadow hover:bg-white hover:text-black hover:border-[#b913e2] hover:border-2 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            openDeleteModal(null);
                          }}
                          className="border-[2px] font-medium border-[#b913e2] text-[16px] lg:text-[20px] py-2 px-10 rounded-full shadow hover:bg-[#b913e2] transition hover:text-white hover:border-[#b913e2] hover:border-2"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Upload and Take Picture buttons when avatar is false */}
                    <button
                      onClick={openModal} // Open modal to upload picture
                      className="bg-[#b913e2] font-medium text-white text-[16px] lg:text-[20px] py-2 px-6 rounded-full shadow hover:bg-white hover:text-black hover:border-2 hover:border-[#b913e2] transition"
                    >
                      Upload Picture
                    </button>
                    <button
                      onClick={showWebcam} // Show webcam to take a picture
                      className="border-[2px] font-medium border-[#b913e2] text-[16px] lg:text-[20px] py-2 px-8 rounded-full shadow hover:bg-[#b913e2] hover:text-white transition"
                    >
                      Take Picture
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {edit && currentStep === 6 ? (
          <FinalAvatar imageSrc={imageSrc} setEdit={setEdit} />
        ) : edit && currentStep === 5 ? (
          <EditStep
            title="Dress"
            data={dress}
            nextButton={nextButton}
            index={false}
          />
        ) : edit && currentStep === 4 ? (
          <EditStep
            title="Body Type"
            data={bodyType}
            nextButton={nextButton}
            index={false}
          />
        ) : edit && currentStep === 3 ? (
          <EditStep
            title="Face Expression"
            data={FaceExpression}
            nextButton={nextButton}
            index={false}
          />
        ) : edit && currentStep === 2 ? (
          <EditStep
            title="Hair Styles"
            data={hairStyles}
            nextButton={nextButton}
            index={false}
          />
        ) : edit ? (
          <EditStep
            title="Skin Tones Set"
            data={skinTones}
            nextButton={nextButton}
            index={true}
          />
        ) : (
          <div className="w-[700px] max-w-2xl mb-6 mx-auto p-6">
            <AvatarComp
              handleFileUpload={handleFileUpload}
              title="Avatar Training Data"
              filesData={filesData?.files}
              openDeleteModal={openDeleteModal}
            />

            <AvatarComp
              handleFileUpload={handleFileUpload}
              title="Avatar Voice Cloning"
              filesData={filesData?.files}
            />
          </div>
        )}

        {isModalOpen && (
          <Modal
            closeModal={closeModal}
            handleImageUpload={handleImageUpload}
          />
        )}

        {isModal1Open && (
          <Modal1
            closeModal={closeModal1}
            uploadedImage={uploadedImage}
            generateAvatarHandler={generateAvatarHandler}
            genereateButtonClicked={genereateButtonClicked}
            isLoading={isLoading}
            progress={progress}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteModal
            closeModal={closeDeleteModal}
            handleDelete={handleDelete}
          />
        )}

        {imageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="relative">
              <img
                src={imageSrc}
                alt="Full Size"
                className="max-w-full max-h-screen rounded-lg"
              />
              <button
                onClick={handleImageCloseModal}
                className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-900 rounded-full p-2"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}

        {isSuccessPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 w-[400px] h-40 px-12 rounded-2xl shadow-lg flex flex-col items-center justify-center">
              {/* Tick Icon */}
              {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              width="120px"
              height="120px"
              className="text-blue-500 mb-4"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                stroke="#3b82f6"
                strokeWidth="7"
                fill="#e0f2fe"
              />

              <path d="M15 24l7 7L35 17" stroke="#3b82f6" strokeWidth="4" />
            </svg> */}

              <h2 className="text-lg font-bold text-center">
                {selectedId
                  ? "Avatar Training Data Deleted Successfully"
                  : "Avatar Deleted Successfully"}
              </h2>

              <button
                onClick={closeSuccessPopup}
                className="mt-4 bg-[#b913e2] rounded-full text-white py-2 px-6 hover:bg-white hover:text-black hover:border-[#b913e2] hover:border-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
