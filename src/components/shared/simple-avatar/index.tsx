import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface IAvatarWithDescriptionProps {
  avatarClass?: string;
  imageUrl: string;
  ImageFallBackText: string;
  imageHeight?: number;
  imageWidth?: number;
}

const SimpleAvatar: React.FC<IAvatarWithDescriptionProps> = ({
  avatarClass = "",
  imageUrl,
  ImageFallBackText,
  imageHeight = 64,
  imageWidth = 64,
}) => {
  return (
    <div className="flex items-center">
      <Avatar className={avatarClass}>
        <Image alt="Christina Jack" src={imageUrl} height={imageHeight} width={imageWidth} />
        <AvatarFallback>{ImageFallBackText}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default SimpleAvatar;
