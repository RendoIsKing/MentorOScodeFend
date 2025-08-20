"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Home from "@/assets/images/Sidebar/home.svg";
import Inbox from "@/assets/images/Sidebar/sms.svg";
import Profile from "@/assets/images/Sidebar/profile-circle.svg";
import useOrientation from "@/hooks/use-orientation";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useTypedSelector } from "@/redux/store";

function FeedFooter() {
  const router = useRouter();
  const orientation = useOrientation();
  const isPortrait = orientation === "portrait-primary";
  const { user } = useUserOnboardingContext();
  const auth = useTypedSelector((state) => state.auth);

  const currentUserName = user?.userName || auth?.authenticated?.user?.userName;

  const goToProfile = () => {
    if (currentUserName && typeof currentUserName === "string") {
      router.push(`/${currentUserName}`);
    } else {
      // Fallback: go to home if username is unavailable
      router.push("/home");
    }
  };

  return (
    isPortrait && (
      <div className="flex justify-around items-center bg-background p-2 fixed w-full bottom-0 z-50">
        <div
          className="flex flex-col items-center gap-1"
          onClick={() => router.push("/home")}
        >
          <Home className="stroke-foreground" />
          <Label className="text-muted-foreground">Home</Label>
        </div>

        <div
          className="flex flex-col items-center gap-1 "
          onClick={() => router.push("/chat")}
        >
          <Inbox className="stroke-foreground" />
          <Label className="text-muted-foreground">Inbox</Label>
        </div>

        <div onClick={goToProfile} className="flex flex-col items-center gap-1">
          <Profile className="fill-foreground" />
          <Label className="text-muted-foreground">Profile</Label>
        </div>
      </div>
    )
  );
}

export default FeedFooter;
