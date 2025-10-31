import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface IAvatarWithDescriptionProps {
  imageUrl?: string;
  ImageFallBackText: string;
  userName: string;
  userNameTag: string;
  isTextWhite?: boolean;
  isTextMuted?: boolean;
}

const AvatarWithDescription: React.FC<IAvatarWithDescriptionProps> = ({
  imageUrl,
  ImageFallBackText,
  userName,
  userNameTag,
  isTextWhite = false,
  isTextMuted = false,
}) => {
  return (
    <div className="flex items-center">
      <Avatar>
        {imageUrl && !String(imageUrl).includes('undefined') ? (
          <AvatarImage className="object-cover" src={imageUrl} alt="@user" />
        ) : null}

        {/* <img
          className="aspect-automax-w-fit	w-max"
          alt="Profile Photo"
          height={32}
          width={32}
          src={imageUrl}
        /> */}
        <AvatarFallback>{ImageFallBackText}</AvatarFallback>
      </Avatar>
      <div className="ml-4">
        <h2 className={cn("text-lg", isTextWhite && "text-gray-100")}>
          {userName}
        </h2>
        <p
          className={cn(
            "text-sm ",
            isTextMuted && "text-muted-foreground",
            isTextWhite && "text-gray-300"
          )}
        >
          {userNameTag}
        </p>
      </div>
    </div>
  );
};

export default AvatarWithDescription;
