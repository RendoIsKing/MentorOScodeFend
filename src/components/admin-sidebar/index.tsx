"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Logo from "../shared/Logo";
import BackArrow from "@/assets/images/Signup/back.svg";
import ContentUploadProvider from "@/context/open-content-modal";
import AdminSideBarRadioButton from "./AdminSideBarRadioButton";
import { useAppDispatch } from "@/redux/store";
import { logoutAdmin } from "@/redux/slices/admin";

function AdminSideBar() {
  const router = useRouter();
  const appDispatcher = useAppDispatch();

  const handleLogout = async () => {
    await appDispatcher(logoutAdmin());
    router.push("/admin");
  };

  return (
    <ContentUploadProvider>
      <div className="flex flex-col ">
        <div
          className="flex pt-10 pb-6 pl-4 pr-12 cursor-pointer "
          onClick={() => router.push("/admin")}
        >
          <Logo />
        </div>
        <div className="flex border-r-2 border-secondary flex-col justify-between h-[84.5vh] pt-10">
          <AdminSideBarRadioButton />
          <div
            className="flex items-center p-4 cursor-pointer"
            onClick={handleLogout}
          >
            <BackArrow className="fill-foreground mr-4 cursor-pointer mt-1" />
            Log Out
          </div>
        </div>
      </div>
    </ContentUploadProvider>
  );
}

export default AdminSideBar;
