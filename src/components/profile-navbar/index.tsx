"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Menu, Settings, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import CreatorCenter from "@/assets/images/Sidebar/creator-active.svg";
import Wallet from "@/assets/images/Sidebar/wallet.svg";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

export default function ProfileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { data } = useGetUserDetailsQuery();

  const routeUid = String(params?.uid || "");
  const currentUserName = String(data?.data?.userName || "");
  const isOwnProfile = useMemo(() => currentUserName.toLowerCase() === routeUid.toLowerCase(), [currentUserName, routeUid]);

  return (
    <>
      <div className="p-2 flex justify-between sticky top-0 z-20 bg-background border-b-2 border-secondary/20">
        {isOwnProfile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <Menu />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-4 pb-tabbar z-[10050]">
              <div className="min-h-3/4 p-4">
                <div className="flex flex-col gap-4 mx-auto w-full max-w-sm mt-8">
                  <div
                    className="flex justify-between"
                    onClick={() => router.push("/creator-center")}
                  >
                    <div className="flex gap-2">
                      <CreatorCenter className="stroke-foreground" />
                      Creator Center
                    </div>
                    <ChevronRight />
                  </div>
                  <Separator />
                  <div
                    className="flex justify-between"
                    onClick={() => router.push("/wallet")}
                  >
                    <div className="flex gap-2">
                      <Wallet className="fill-background stroke-foreground" />
                      Wallet
                    </div>
                    <ChevronRight />
                  </div>
                  <Separator />
                  <div
                    className="flex justify-between"
                    onClick={() => router.push("/settings")}
                  >
                    <div className="flex gap-2">
                      <Settings />
                      Settings
                    </div>
                    <ChevronRight />
                  </div>
                  <Separator />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <div />
        )}
        <h1 className="text-2xl pt-1">Profile</h1>
        <div className="flex justify-center items-center" />
      </div>
    </>
  );
}
