"use client";
import { Button } from "@/components/ui/button";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { Bell, CircleUserRound } from "lucide-react";
import Home from "@/assets/images/Sidebar/home.svg";
import Search from "@/assets/images/Sidebar/search.svg";
import Sms from "@/assets/images/Sidebar/sms.svg";
import Wallet from "@/assets/images/Sidebar/wallet.svg";
import CreatorCenter from "@/assets/images/Sidebar/creator-active.svg";
import Upload from "@/assets/images/Sidebar/upload.svg";
import { useContentUploadContext } from "@/context/open-content-modal";
import ContentUploadAlert from "../upload-content-options/content-upload-alert";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

type SidebarTypes = {
  id: number;
  url: string;
  name: string;
  icon: JSX.Element;
  segment: string;
  hasDocumentVerified?: boolean;
};

const SideBarRadioButton = () => {
  const router = useRouter();

  const selectedButton = useSelectedLayoutSegment();
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openLivestreamModal, setOpenLivestreamModal] = useState(false);
  const { toggleContentUploadOpen } = useContentUploadContext();
  const { user } = useUserOnboardingContext();

  const handleButtonClick = (
    buttonIndex: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (buttonIndex === 7) {
      toggleContentUploadOpen(true);
    }
  };

  const videoUploadDialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        videoUploadDialogRef.current &&
        !videoUploadDialogRef.current.contains(event.target as Node)
      ) {
        setIsVideoUploadOpen(false);
        setSelectedFile(null);
        setOpenLivestreamModal(false);
      }
    };

    if (isVideoUploadOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVideoUploadOpen, setIsVideoUploadOpen]);

  const sidebar: SidebarTypes[] = [
    {
      id: 1,
      name: "Home",
      url: "/home",
      icon: <Home />,
      segment: "(home)",
    },
    {
      id: 2,
      name: "Search",
      url: "/search",
      icon: <Search />,
      segment: "(search)",
      // hasDocumentVerified: !(user?.platformSubscription?.status ?? false),
      // hasDocumentVerified: !false,
      hasDocumentVerified: user?.platformSubscription?.status !== "active",
    },
    {
      id: 3,
      name: "Inbox",
      url: "/room",
      icon: <Sms />,
      segment: "(inbox)",
      // hasDocumentVerified: !(user?.platformSubscription?.status ?? false),
      // hasDocumentVerified: false,
      hasDocumentVerified: user?.platformSubscription?.status !== "active",
    },
    {
      id: 4,
      name: "Notifications",
      url: "/notification",
      icon: <Bell size={30} strokeWidth={1.5} absoluteStrokeWidth />,
      segment: "notification",
      // hasDocumentVerified: !(user?.platformSubscription?.status ?? false),
      // hasDocumentVerified: !false,
      hasDocumentVerified: user?.platformSubscription?.status !== "active",
    },
    {
      id: 5,
      name: "Wallet",
      url: "/wallet",
      icon: <Wallet />,
      segment: "wallet",
      // hasDocumentVerified: true,
    },
    {
      id: 6,
      name: "Creator Center",
      url: "/creator-center",
      icon: <CreatorCenter />,
      segment: "creator-center",
      // hasDocumentVerified: !(user?.platformSubscription?.status ?? false),
      // hasDocumentVerified: !false,
      hasDocumentVerified: user?.platformSubscription?.status !== "active",
    },
    {
      id: 7,
      name: "Upload",
      url: "",
      icon: <Upload />,
      segment: "(none)",
      hasDocumentVerified: user?.platformSubscription?.status !== "active",

      // hasDocumentVerified: !false,
      // hasDocumentVerified: !(user?.platformSubscription?.status ?? false),
    },
    {
      id: 8,
      name: "Profile",
      url: `/${user?.userName}`,
      icon: <CircleUserRound size={30} strokeWidth={1.5} absoluteStrokeWidth />,
      segment: user?.userName,
    },
    {
      id: 9,
      name: "Avatar Generator",
      url: "/avatar-generator",
      icon: <CircleUserRound size={30} strokeWidth={1.5} absoluteStrokeWidth />,
      segment: "myprofile",
      // hasDocumentVerified: !(user?.platformSubscription?.status ?? false),
      // hasDocumentVerified: !false,
      hasDocumentVerified: user?.platformSubscription?.status !== "active",
    },
  ];

  return (
    <>
      <div className="flex gap-4">
        <div className="flex flex-col w-full flex-wrap justify-start gap-4">
          {sidebar.map((button) => (
            <Button
              disabled={button.hasDocumentVerified}
              variant={"link"}
              key={button.id}
              className={`justify-start rounded-none text-foreground flex-grow first:rounded-l-2xl last:rounded-r-2xl focus:text-primary ${
                selectedButton === button.segment ? "text-primary" : ""
              }`}
              onClick={(e) => {
                handleButtonClick(button.id, e);
                router.replace(`${button.url}`);
              }}
            >
              <div className="flex  fill-background justify-start fill items-center gap-2 text-base">
                {React.cloneElement(button.icon, {
                  className:
                    selectedButton === button.segment
                      ? "stroke-primary"
                      : "stroke-foreground/80  ",
                })}
                {button.name}
              </div>
            </Button>
          ))}
          <ContentUploadAlert />
        </div>
      </div>
    </>
  );
};

export default SideBarRadioButton;
