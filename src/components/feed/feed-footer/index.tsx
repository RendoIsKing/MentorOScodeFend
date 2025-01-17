"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Home from "@/assets/images/Sidebar/home.svg";
import Inbox from "@/assets/images/Sidebar/sms.svg";
import Profile from "@/assets/images/Sidebar/profile-circle.svg";
import useOrientation from "@/hooks/use-orientation";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

function FeedFooter() {
  const router = useRouter();
  const orientation = useOrientation();
  const isPortrait = orientation === "portrait-primary";
  const { user } = useUserOnboardingContext();

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

        <div
          onClick={() => router.push(`/${user?.userName}`)}
          className="flex flex-col items-center gap-1"
        >
          <Profile className="fill-foreground" />
          <Label className="text-muted-foreground">Profile</Label>
        </div>
      </div>
    )
  );
}

export default FeedFooter;
