"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronRightIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { ABeeZee } from "next/font/google";
import { useAppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth";
import { useDeleteAccountMutation } from "@/redux/services/haveme/user";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { toast } from "../ui/use-toast";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const Settings: React.FC = () => {
  const router = useRouter();
  const { isMobile } = useClientHardwareInfo();
  const appDispatcher = useAppDispatch();
  const { user } = useUserOnboardingContext();
  const [deleteAccountTrigger] = useDeleteAccountMutation();

  const handleLogout = async () => {
    await appDispatcher(logout());
    router.push("/signup");
  };

  const handleDeleteAccount = () => {
    deleteAccountTrigger(user?._id)
      .unwrap()
      .then((res) => {
        toast({
          description: "Account deleted successfully",
          variant: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: "Something went wrong",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="lg:flex lg:flex-col lg:justify-center lg:h-fit lg:align-middle ">
      <div className="px-4 lg:rounded-lg lg:bg-muted lg:w-11/12 lg:mx-auto lg:p-8">
        <div className="my-2">
          <h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">
            Account Control
          </h2>
          <div className="flex justify-between items-center">
            <h3 className=" ">Delete Account</h3>
            <AlertDialog>
              <AlertDialogTrigger>
                <h1 className="text-destructive">Delete this account</h1>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteAccount()}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <Separator />
        <div
          className="my-2 cursor-pointer"
          onClick={() => router.push("/settings/download-data")}
        >
          <h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">
            Data
          </h2>
          <div className="flex justify-between items-center cursor-pointer">
            <div>
              <h3 className={`   ${fontItalic.className}`}>
                Download your data
              </h3>
              <p className="text-sm lg:text-muted-foreground ">
                Get a copy of your MentorOS data
              </p>
            </div>
            <ChevronRightIcon className="text-primary" />
          </div>
        </div>
        <Separator />
        <div className="my-2">
          <h2 className="text-sm text-muted-foreground lg:pb-2 lg:text-lg">
            Notifications
          </h2>
          <div className="flex justify-between items-center">
            <h3 className={`   ${fontItalic.className}`}>Push Notifications</h3>
            <Switch id="private-account" />
          </div>
          <p className="text-sm lg:text-muted-foreground">
            Stay on top of notifications for likes, comments, the latest videos,{" "}
            {!isMobile && <br />}
            and more on mobile. You can turn them off anytime.
          </p>
        </div>
        <div className="flex justify-between items-center my-2 cursor-pointer">
          <div onClick={() => router.push("/settings/system-settings")}>
            <h3 className={`   ${fontItalic.className}`}>
              All System Notifications
            </h3>
            <p className="text-sm lg:text-muted-foreground">
              Get all system updates
            </p>
          </div>
          <ChevronRightIcon className="text-primary" />
        </div>
        <Separator />
        {isMobile && (
          <div className="w-full flex align-middle justify-center">
            <Button
              onClick={handleLogout}
              variant={"destructive"}
              className="mt-4 w-3/4"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
