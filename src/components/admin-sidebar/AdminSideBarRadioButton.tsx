"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useContentUploadContext } from "@/context/open-content-modal";
import ContentUploadAlert from "../upload-content-options/content-upload-alert";
import { ServerCrash } from 'lucide-react';
import Sms from "@/assets/images/Sidebar/sms.svg";
import Home from "@/assets/images/Sidebar/home.svg";
import Wallet from "@/assets/images/Sidebar/wallet.svg";
import {
  BringToFront,
  CircleUserRound,
  MessageSquareHeart,
} from "lucide-react";

type SidebarTypes = {
  id: number;
  url: string;
  name: string;
  icon: JSX.Element;
  segment: string;
};

const AdminSideBarRadioButton = () => {
  const router = useRouter();
  const selectedButton = useSelectedLayoutSegment();

  const { toggleContentUploadOpen } = useContentUploadContext();

  const handleButtonClick = (
    buttonIndex: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (buttonIndex === 7) {
      toggleContentUploadOpen(true);
    }
  };

  const adminSidebar: SidebarTypes[] = [
    {
      id: 1,
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: <Home />,
      segment: "(dashboard)",
    },
    {
      id: 2,
      name: "User",
      url: "/admin/user",
      icon: <CircleUserRound size={36} strokeWidth={1.5} absoluteStrokeWidth />,
      segment: "(user)",
    },
    {
      id: 3,
      name: "Documents",
      url: "/admin/documents",
      icon: <Sms />,
      segment: "(documents)",
    },
    {
      id: 4,
      name: "Transactions ",
      url: "/admin/transactions",
      icon: <Wallet />,
      segment: "(transactions)",
    },
    {
      id: 5,
      name: "Interests",
      url: "/admin/interests",
      icon: <MessageSquareHeart />,
      segment: "(interests)",
    },
    {
      id: 6,
      name: "Posts",
      url: "/admin/posts",
      icon: <Sms />,
      segment: "(posts)",
    },
    {
      id: 6,
      name: "Entitlements",
      url: "/admin/entitlements",
      icon: <BringToFront />,
      segment: "(entitlements)",
    },
    {
      id: 7,
      name: "Problems",
      url: "/admin/problem",
      icon: <ServerCrash/>,
      segment: "(problem)",
    },
  ];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col w-full flex-wrap justify-start gap-4">
        {adminSidebar.map((button) => (
          <Button
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
      </div>
    </div>
  );
};

export default AdminSideBarRadioButton;
