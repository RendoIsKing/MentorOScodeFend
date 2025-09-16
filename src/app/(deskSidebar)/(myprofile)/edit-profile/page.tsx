"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditProfile from "@/components/edit-profile";
import InnerPageHeader from "@/components/shared/inner-page-header";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import AvatarWithDescription from "@/components/shared/avatar-with-description";
// import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import {
  useGetUserProfilePhotoQuery,
  useUpdateMeMutation,
  useUpdateUserCoverPhotoMutation,
  useUpdateUserMutation,
  useUpdateUserPhotoMutation,
} from "@/redux/services/haveme/user";
import { baseServerUrl } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FileUploadForm from "@/components/file-upload";
import { useState } from "react";
import { CircleX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"
import MobileAvatarCoverPickers from "@/components/profile/MobileAvatarCoverPickers";

export default function EditProfilePage() {
  const { toast } = useToast();
  const { isMobile } = useClientHardwareInfo();
  const router = useRouter();
  const { user } = useUserOnboardingContext();
  const { data: userPhotoData } = useGetUserProfilePhotoQuery(user?.photoId, {
    skip: !user?.photoId,
  });
  const [updateUserPhotoInfoTrigger] = useUpdateMeMutation();
  const [updateCoverPhotoTrigger] = useUpdateMeMutation();
  const [openUploadProfilePopup, setOpenUploadProfilePopup] = useState(false);
  const [openUploadCoverPopup, setOpenUploadCoverPopup] = useState(false);

  const updatePhotoInfo = async (photoInfo) => {
    let photoInfoObject = {
      ...(photoInfo?.uploadedImageType === "cover"
        ? { coverPhotoId: photoInfo.file?.data?.id }
        : { photoId: photoInfo.file?.data?.id }),
    };
    if (photoInfo?.uploadedImageType === "cover") {
      await updateCoverPhotoTrigger(photoInfoObject)
        .unwrap()
        .then((res) => {
         // console.log("result:", res);
      
        })
        .catch((err) => {
          console.log("error:", err);
          toast({
           variant:'destructive',
            description: "Something went wrong",
          })
        });
    } else {
      await updateUserPhotoInfoTrigger(photoInfoObject)
        .unwrap()
        .then((res) => {
         // console.log("result:", res);
        })
        .catch((err) => {
          console.log("error:", err);
          toast({
            variant:'destructive',
             description: "Something went wrong",
           })
        });
    }
    // const newPhotoPath = `${baseServerUrl}/${
    //   photoInfo.file.data.path
    // }?t=${new Date().getTime()}`;

    // setPhotoId(photoInfo.file.data.id);
    // setPhotoPath(newPhotoPath);
  };

  return (
    <div className="min-h-[100dvh] overflow-y-auto pb-tabbar">
      <InnerPageHeader showBackButton={true} title="Edit Profile" />
      {!isMobile ? (
        <div>
          <div className="relative">
            <img
              className="w-full h-72"
              src={
                user?.coverPhoto?._id
                  ? `${baseServerUrl}/${user?.coverPhoto?.path}`
                  : "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
              alt="Fallback Text"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
          </div>
          <div className="flex px-4 -mt-24">
            <div className="flex justify-center relative">
              <Avatar className="size-52 ">
                <img
                  alt="Fallback Text"
                  src={
                    user?.photoId
                      ? `${baseServerUrl}/${userPhotoData?.path}`
                      : "assets/images/Signup/carbon_user-avatar-filled.svg"
                  }
                  className="mx-auto relative block object-cover size-52 rounded-full p-1"
                />
                {/* <AvatarFallback>CJ</AvatarFallback> */}
              </Avatar>
              <span className="absolute rounded-full bottom-24 -right-4 top-20">
                <AlertDialog open={openUploadProfilePopup}>
                  <AlertDialogTrigger>
                    <img
                      onClick={() => setOpenUploadProfilePopup(true)}
                      src="/assets/images/my-Profile/camera-icon.svg"
                      className="cursor-pointer"
                      alt="camera"
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader className="">
                      <div className="flex align-middle text-center">
                        <CircleX
                          className="rounded-full mb-1 cursor-pointer bg-secondary"
                          onClick={() => setOpenUploadProfilePopup(false)}
                        />
                        <AlertDialogTitle className="italic w-[90%] text-base pb-2">
                          Profile Photo
                        </AlertDialogTitle>
                      </div>
                    </AlertDialogHeader>
                    <div className="border-dashed border-2 lg:border-4 border-secondary rounded-md p-2">
                      <FileUploadForm
                        uploadType={"profile"}
                        close={() => setOpenUploadProfilePopup(false)}
                        updateProfilePhotoInfo={updatePhotoInfo}
                      />
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </span>
            </div>
            <div className="flex gap-6 flex-col relative w-8/12 m-6">
              <div>
                <div className="flex justify-between">
                  <div>
                    <div className="flex flex-col">
                      <h1 className="text-gray-100">{user?.fullName}</h1>
                      <h1 className="text-gray-300">{`@${user?.userName}`}</h1>
                    </div>
                  </div>
                  <div>
                    <AlertDialog open={openUploadCoverPopup}>
                      <AlertDialogTrigger>
                        <img
                          onClick={() => setOpenUploadCoverPopup(true)}
                          src="/assets/images/my-Profile/camera-icon.svg"
                          className="cursor-pointer"
                          alt="camera"
                        />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader className="">
                          <div className="flex align-middle text-center">
                            <CircleX
                              className="rounded-full mb-1 cursor-pointer bg-secondary"
                              onClick={() => setOpenUploadCoverPopup(false)}
                            />
                            <AlertDialogTitle className="italic w-[90%] text-base pb-2">
                              Profile Photo
                            </AlertDialogTitle>
                          </div>
                        </AlertDialogHeader>
                        <div className="border-dashed border-2 lg:border-4 border-secondary rounded-md p-2">
                          <FileUploadForm
                            uploadType={"cover"}
                            close={() => setOpenUploadCoverPopup(false)}
                            updateProfilePhotoInfo={updatePhotoInfo}
                          />
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <article className="relative isolate flex flex-col justify-end overflow-hidden pt-24 mx-auto">
            <img
              src={
                user?.coverPhoto?._id
                  ? `${baseServerUrl}/${user?.coverPhoto?.path}`
                  : "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
              alt="Cover"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
            <div className="flex items-center px-4 py-2 z-10 justify-between">
              <AvatarWithDescription
                isTextWhite={true}
                imageUrl={
                  user?.photoId
                    ? `${baseServerUrl}/${userPhotoData?.path}`
                    : "/assets/images/Home/small-profile-img.svg"
                }
                ImageFallBackText={"AK"}
                userName={`${user?.userName}`}
                userNameTag={`@${user?.userName}`}
              />

              {/* Removed floating camera icon on mobile header */}
            </div>
          </article>
          {/* Move mobile avatar/cover pickers below the header */}
          <MobileAvatarCoverPickers user={user} inline />
        </div>
      )}
      <EditProfile />
    </div>
  );
}
