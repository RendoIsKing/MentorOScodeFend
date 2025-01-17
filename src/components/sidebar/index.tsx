"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import Logo from "../shared/Logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import MoreIcon from "@/assets/images/Sidebar/Vector-more.svg";

import Link from "next/link";
import Settings from "@/assets/images/popup/setting-2.svg";
import Report from "@/assets/images/popup/info-circle.svg";
import Logout from "@/assets/images/popup/logout.svg";
import ContentUploadProvider, {
  useContentUploadContext,
} from "@/context/open-content-modal";
import SideBarRadioButton from "./SideBarRadioButton";
import { useAppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth";

type SidebarTypes = {
  id: number;
  url: string;
  name: string;
  icon: JSX.Element;
  segment: string;
};

function SideBar() {
  const router = useRouter();
  const appDispatcher = useAppDispatch();

  const handleLogout = async () => {
    await appDispatcher(logout());
    router.push("/signup");
  };

  return (
    <ContentUploadProvider>
      <div className="flex flex-col m-2  ">
        <div
          className="flex pt-10 pb-6 pl-4 pr-12 cursor-pointer h-[10vh]"
          onClick={() => router.push("/home")}
        >
          <Logo />
        </div>
        <div className="flex border-r-2 border-secondary flex-col justify-between h-[85vh] pt-10">
          <SideBarRadioButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex gap-6 p-4 cursor-pointer">
                {/* <img src="/assets/images/SideBar/Vector-more.svg"></img> */}
                <MoreIcon className="stroke-foreground" />
                More
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 border-[#0B0F14] light:bg-secondary dark:bg-[#0B0F14]">
              <DropdownMenuItem>
                <div className="flex items-center">
                  {/* <img src="/assets/images/popup/setting-2.svg" alt="settings" /> */}
                  <Settings className="fill-foreground" />
                  <Link href="/settings">
                    <Button variant={"link"} className="text-foreground">
                      Settings
                    </Button>
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center">
                  {/* <img
                src="/assets/images/popup/info-circle.svg"
                alt="report-a-problem"
              /> */}

                  <Report className="fill-foreground" />
                  <Link href="/settings/report-a-problem">
                    <Button variant={"link"} className="text-foreground">
                      Report a problem
                    </Button>
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center">
                  {/* <img src="/assets/images/popup/logout.svg" alt="" /> */}
                  <Logout className="stroke-foreground" />
                  <Button
                    variant={"link"}
                    className="text-foreground"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </ContentUploadProvider>
  );
}

export default SideBar;
