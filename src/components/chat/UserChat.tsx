"use client";
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
export const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface UserChatProps {
  name: string;
  message: string;
  profilePhoto: string;
}

function UserChat({ name, message, profilePhoto }: UserChatProps) {
  const messageCount = 1;

  return (
    <div className="flex justify-between p-2 cursor-pointer rounded-lg hover:bg-muted transition delay-150 duration-300 ease-in-out lg:p-3 group/item">
      <div className="flex lg:gap-4">
        <Avatar className="size-12 ">
          <Image
            className="aspect-auto	max-w-fit	w-max"
            alt="Profile Photo"
            height={32}
            width={32}
            src={profilePhoto}
          />
        </Avatar>
        <div className="px-2">
          <h1 className={`${fontItalic.className}`}>{name}</h1>
          <h3 className="text-muted-foreground">{message}</h3>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div>
          <p className="text-sm text-muted-foreground">12:14 PM</p>
        </div>
        <div className="flex justify-end">
          <div className="h-6 w-6 rounded-full bg-primary">
            <div className="flex text-white justify-center">{messageCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserChat;
