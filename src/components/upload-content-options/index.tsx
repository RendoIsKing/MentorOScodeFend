"use client";
import React, { useEffect, useRef, useState } from "react";

import { useContentUploadContext } from "@/context/open-content-modal";
import UploadContentButton from "../profile-header/UploadContentButton";
import ContentUploadAlert from "./content-upload-alert";
import { useParams } from "next/navigation";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useGetStoriesByUserNameQuery } from "@/redux/services/haveme/posts";
import UserStories from "../stories/user-story";
import { Stories } from "@/contracts/haveme/stories";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import UploadContentButtonMobile from "../profile-header/UploadContentButtonMobile";
import ContentUploadDrawer from "./content-upload-drawer";

function ContentUploadOptions() {
  const { isMobile } = useClientHardwareInfo();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [otherFunctionRendered, setOtherFunctionRendered] = useState(false);
  const [filePreview, setFilePreview] = useState(false);
  const [openLivestreamModal, setOpenLivestreamModal] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false); // Flag variable
  const path: { uid: string } = useParams();

  const userInfo = useUserOnboardingContext();

  const { userStoriesData } = useGetStoriesByUserNameQuery(
    { userName: path.uid, page: 1, perPage: 100 },
    {
      selectFromResult: ({ data }) => {
        return {
          userStoriesData: data?.data.map((story: Stories) => {
            return {
              type: story.media[0].mediaType,
              url: `${process.env.NEXT_PUBLIC_API_SERVER}/${story.mediaFiles[0].path}`,
              storyId: story._id,
              isLiked: story.isLiked,
              otherProfileFullName: story?.userInfo?.fullName,
              otherUserProfileImage: story?.userInfo?.photo?.[0]?.path || "defaultImagePath",
              id: story?.userInfo?._id,
            };
          }),
        };
      },
    }
  );
  
  
  const { isContentUploadOpen, toggleContentUploadOpen } =
    useContentUploadContext();

  const videoUploadDialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        videoUploadDialogRef.current &&
        !videoUploadDialogRef.current.contains(event.target as Node)
      ) {
        toggleContentUploadOpen(false);
        setSelectedFile(null);
        setOtherFunctionRendered(false);
        setFilePreview(false);
        setOpenLivestreamModal(false);
      }
    };

    if (isContentUploadOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isContentUploadOpen, toggleContentUploadOpen]);
  return (
    <>
      {userInfo?.user?.userName == path.uid && userInfo?.user?.hasDocumentVerified ?  (
        isMobile ? (
          <UploadContentButtonMobile />
        ) : (
          <UploadContentButton />
        )
      ) : (
        userStoriesData &&
        userStoriesData.length > 0 && (
          <UserStories
            id={userStoriesData[0].id}
            content={userStoriesData}
            userName={path.uid}
            fullName={userStoriesData[0].otherProfileFullName}
            imagePath={userStoriesData[0].otherUserProfileImage}
          />
        )
      )}

      {/* <ContentUploadAlert /> */}

      {isMobile ? <ContentUploadDrawer /> : <ContentUploadAlert />}
      {/* <ContentUploadAlert /> */}
    </>
  );
}

export default ContentUploadOptions;
