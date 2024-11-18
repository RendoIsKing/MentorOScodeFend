import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface IUserIconProps {
  imageUrl: string;
  ImageFallBackText: string;
  userName: string;
}

const UserIcon: React.FC<IUserIconProps> = ({
  imageUrl,
  ImageFallBackText,
  userName,
}) => {
  return (
    <div>
      <div className="flex flex-col justify-center align-middle w-fit p-2">
        <div className="flex justify-center relative">
          <Avatar className="size-16 ">
            <AvatarImage className="relative block" src={imageUrl} />
            <AvatarFallback>{ImageFallBackText}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-center">
          <h2 className="text-sm mt-1">{userName}</h2>
        </div>
      </div>
    </div>
  );
};

export default UserIcon;
