"use client";

import { CircleX } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast"
import FileUploadForm from "@/components/file-upload";
import PageHeader from "@/components/shared/page-header";
import WebcamCapture from "@/components/capture-photo";
import { useRouter } from "next/navigation";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Logo from "@/components/shared/Logo";
import { Label } from "@radix-ui/react-dropdown-menu";
import BackArrow from "@/assets/images/Signup/back.svg";

import { ABeeZee } from "next/font/google";
import {
  useCreateUserMutation,
  useDeleteFileMutation,
  useSkipUserPhotoMutation,
} from "@/redux/services/haveme";
import { baseServerUrl, cn } from "@/lib/utils";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IProfilePhotoProps {
  isUpdating?: boolean;
}

const ProfilePhoto: React.FC<IProfilePhotoProps> = ({ isUpdating }) => {
  const { isMobile } = useClientHardwareInfo();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [openCapture, setOpenCapture] = useState(false);
  const [capturedFile, setCapturedFile] = useState<Blob | null>(null);
  const [photoPath, setPhotoPath] = useState(
    "assets/images/Signup/carbon_user-avatar-filled.svg"
  );

  const [photoId, setPhotoId] = useState<string | null>(null);

  const [savePhotoMethod] = useUpdateMeMutation();
  const [skipProfilePhoto] = useSkipUserPhotoMutation();
  const [deleteProfilePhoto] = useDeleteFileMutation();
  const { toast } = useToast()

  // Function to convert the captured image to a base64 string
  const convertToBase64 = (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to handle image capture and generate preview link
  const handleCapture = async (file: Blob) => {
    setCapturedFile(file); // Set the captured file
    const base64String = await convertToBase64(file); // Convert captured image to base64
    const previewLink = base64String; // You can construct a preview link using the base64 string
  };

  const updateProfilePhotoInfo = (photoInfo) => {
    const newPhotoPath = `${baseServerUrl}/${
      photoInfo.file.data.path
    }?t=${new Date().getTime()}`;

    setPhotoId(photoInfo.file.data.id);
    setPhotoPath(newPhotoPath);
  };

  const skipPhoto = () => {
    skipProfilePhoto({ isPhotoSkipped: true })
      .unwrap()
      .then((res) => {
        const userData = res?.data;
        // setUser(userData);
        router.replace("/user-tags");
      })
      .catch((err) => {
        console.log("error skipping photo", err);
        toast({
          variant: "destructive",
          description: "Error while skipping photo",
        });
      });
  };

  const removeProfilePhoto = () => {
    deleteProfilePhoto(photoId)
      .unwrap()
      .then((res) => {
        setPhotoId(null),
          setPhotoPath("assets/images/Signup/carbon_user-avatar-filled.svg");
      })
      .catch((err) => {
        console.log("Error deleting photo", err);
        toast({
          variant: "destructive",
          description: "Error while deleting photo",
        });
      });
  };

  const saveUserPhoto = () => {
    if (photoId) {
      let userPhotoObj = {
        photoId: photoId,
      };
      savePhotoMethod(userPhotoObj)
        .unwrap()
        .then((res) => {
          const userData = res?.data;
          // setUser(userData);
          router.replace("/user-tags");
        })
        .catch((err) => {
          console.log("Error saving photo", err);
          toast({
            variant: "destructive",
            description: "Error saving photo",
          });
        });
    }
  };

  return (
    <>
      {isMobile && (
        <>
          <button
            className={`text-lg  float-right -mt-10 ${fontItalic.className}`}
            onClick={() => skipPhoto()}
          >
            Skip
          </button>
          <div className="mt-4">
            <PageHeader
              title="Profile photo"
              description="Upload or capture your real profile photo."
            />
          </div>
        </>
      )}
      <div className="lg:flex">
        {/* {!isMobile && (
          <div className="mt-4 mr-4">
            <BackArrow
              className="fill-foreground mr-4 cursor-pointer"
              onClick={() => {
                router.back();
              }}
            />
          </div>
        )} */}

        {openCapture ? (
          <WebcamCapture
            setOpenCapture={setOpenCapture}
            updateProfilePhotoInfo={updateProfilePhotoInfo}
          />
        ) : (
          <div>
            <div
              className={cn(
                "lg:border-2 lg:border-solid lg:rounded-xl lg:border-muted-foreground/30 lg:min-w-fit lg:w-4/12 lg:my-0 lg:mr-auto lg:ml-auto lg:p-12 flex flex-col justify-around items-center lg:gap-0",
                photoId ? "gap-60" : "gap-72"
              )}
            >
              {!isMobile && (
                <>
                  <Logo />
                  <Label
                    className={`text-center  text-2xl ${fontItalic.className}`}
                  >
                    Add Profile Photo
                  </Label>
                </>
              )}

              <div className="mt-12 flex flex-col gap-1 justify-evenly">
                <div className="flex justify-center align-middle">
                  <Avatar className="w-64 h-64">
                    <AvatarImage src={photoPath} alt="avatar" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                {photoId && isMobile && (
                  <Button
                    variant={"link"}
                    onClick={() => setOpen(true)}
                    className="cursor-pointer"
                  >
                    Change
                  </Button>
                )}
              </div>
              {!isMobile && (
                <p className="text-muted-foreground text-xs mt-4">
                  Support jpg, jpeg, Png formats, Up to 5mb
                </p>
              )}

              {photoId && !isMobile && (
                <div className="flex">
                  <Button
                    variant={"link"}
                    onClick={() => setOpen(true)}
                    className="cursor-point er"
                  >
                    Change
                  </Button>
                  <Button
                    variant="link"
                    className="cursor-pointer"
                    onClick={() => removeProfilePhoto()}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {!isUpdating && !openCapture && (
                <div className="flex justify-center items-center mb-4 mx-auto  w-11/12">
                  {isMobile && !photoId && (
                    <Button
                      variant={"ghost"}
                      className="border-2 h-12 w-40 mx-2 mt-2"
                      onClick={() => setOpenCapture(true)}
                    >
                      Take a photo
                    </Button>
                  )}

                  <AlertDialog open={open}>
                    <div className="flex flex-col">
                      <Button
                        className="h-12 w-40 mx-2 lg:w-96 mt-2 lg:mt-6"
                        onClick={() => {
                          if (photoId) {
                            saveUserPhoto();
                          } else {
                            return setOpen(true);
                          }
                        }}
                      >
                        {photoId ? "Next" : "Upload Photo"}
                      </Button>

                      {!isMobile && (
                        <Button
                          className="h-12 w-40 mx-2 lg:w-96 mt-2 lg:mt-6"
                          onClick={() => skipPhoto()}
                        >
                          skip
                        </Button>
                      )}
                    </div>
                    <AlertDialogContent className="sm:w-11/12 w-4/5 rounded-md">
                      <AlertDialogHeader className="">
                        <div className="flex align-middle text-center">
                          <CircleX
                            className="rounded-full mb-1 cursor-pointer bg-secondary"
                            onClick={() => setOpen(false)}
                          />
                          <AlertDialogTitle className="italic w-[90%] text-base pb-2">
                            Profile Photo
                          </AlertDialogTitle>
                        </div>
                      </AlertDialogHeader>
                      <div className="border-dashed border-2 lg:border-4 border-secondary rounded-md p-2">
                        <FileUploadForm
                          close={() => setOpen(false)}
                          updateProfilePhotoInfo={updateProfilePhotoInfo}
                        />
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePhoto;
