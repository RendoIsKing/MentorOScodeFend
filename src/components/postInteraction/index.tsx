import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useGetUserProfilePhotoQuery } from "@/redux/services/haveme/user";

import { baseServerUrl, cn, getInitials } from "@/lib/utils";
import MobileFeed from "@/components/mobile-feed";
import DesktopFeed from "@/components/desktop-feed";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PostMediaFileObject } from "@/contracts/responses/IPostContentResponse";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";

type ButtonNamesTypeNew = ButtonName[];

type ButtonName = {
  label: string;
  value: number;
};

export const RadioButtonGroup = ({ label = "Tip Amount" }) => {
  const form = useFormContext();
  const [selectedButton, setSelectedButton] = useState("$1");

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    button: ButtonName
  ) => {
    event.preventDefault();
    setSelectedButton(button.label);
    form.setValue("amount", button.value, { shouldValidate: true });
  };

  const buttonNamesNew: ButtonNamesTypeNew = [
    {
      label: "$1",
      value: 1,
    },
    {
      label: "$5",
      value: 5,
    },
    {
      label: "$10",
      value: 10,
    },
    {
      label: "$20",
      value: 20,
    },
    { label: "Custom", value: 50 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Label>{label}</Label>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="number"
                className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...field}
                onChange={(e) => field.onChange(+e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex w-full flex-wrap">
        {buttonNamesNew.map((button, index) => (
          <Button
            key={index}
            className={cn(
              "rounded-[var(--radius)] text-[hsl(var(--foreground))] flex-grow mx-1 bg-[hsl(var(--secondary))] focus:outline-none",
              selectedButton === button.label && "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            )}
            onClick={(e) => handleButtonClick(e, button)}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

interface IPostInteractionProps {
  postDetails: IPostObjectResponse;
  currentUserId?: string | null;
}
interface IMyUserDataProps {
  userData?: {
    userPhoto: PostMediaFileObject;
    _id: string;
    isLiked?: boolean; // Make isLiked property optional
    userInfo?: any;
    likesCount: number;
    commentsCount: number;
    savedCount: number;
  };
}

const PostInteraction: React.FC<IPostInteractionProps> = ({ postDetails, currentUserId }) => {
  const directPath = postDetails?.userPhoto?.[0]?.path || postDetails?.userInfo?.[0]?.photo?.path;
  const photoId = postDetails?.userInfo?.[0]?.photoId;
  const { data: userPhotoData } = useGetUserProfilePhotoQuery(photoId, { skip: !photoId });
  const fetchedPath = userPhotoData?.path;
  const resolvedPath = directPath || fetchedPath;
  const imageUrl = resolvedPath ? `${baseServerUrl}/${resolvedPath}` : undefined;
  const router = useRouter();
  const { isMobile } = useClientHardwareInfo();
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-center ">
        <div className="flex flex-col">
          {isMobile ? (
            <div className="md:hidden">
              <MobileFeed feedData={postDetails} />
            </div>
          ) : (
            <DesktopFeed feedData={postDetails} currentUserId={currentUserId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostInteraction;
