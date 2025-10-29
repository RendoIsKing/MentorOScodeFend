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
import ContentUploadProvider, { useContentUploadContext } from "@/context/open-content-modal";
import SideBarRadioButton from "./SideBarRadioButton";
import { useAppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth";

function SideBar() {
  const router = useRouter();
  const appDispatcher = useAppDispatch();

  const handleLogout = async () => {
    await appDispatcher(logout());
    router.push("/signup");
  };

  return (
    <ContentUploadProvider>
      <div className="flex flex-col m-2">
        <div className="flex pt-6 pb-4 pl-2 pr-2 cursor-pointer h-[8vh]" onClick={() => router.push("/home")}>
          <Logo />
        </div>
        <div className="flex border-r-0 flex-col justify-between h-[90vh] pt-4">
          <SideBarRadioButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex gap-3 p-3 cursor-pointer">
                <MoreIcon className="stroke-foreground" />
                More
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 border-[#0B0F14] light:bg-secondary dark:bg-[#0B0F14]">
              <DropdownMenuItem>
                <div className="flex items-center gap-2">
                  <Settings className="fill-foreground" />
                  <Link href="/settings">
                    <Button variant={"link"} className="text-foreground p-0">
                      Settings
                    </Button>
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center gap-2">
                  <Report className="fill-foreground" />
                  <Link href="/settings/report-a-problem">
                    <Button variant={"link"} className="text-foreground p-0">
                      Report a problem
                    </Button>
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center gap-2">
                  <Logout className="stroke-foreground" />
                  <Button variant={"link"} className="text-foreground p-0" onClick={handleLogout}>
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
