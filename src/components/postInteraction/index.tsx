import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

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
              "rounded-none text-foreground flex-grow first:rounded-l-2xl last:rounded-r-2xl bg-secondary focus:outline-none",
              selectedButton === button.label && "bg-primary"
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

const PostInteraction: React.FC<IPostInteractionProps> = ({ postDetails }) => {
  const imageUrl = `${baseServerUrl}/${postDetails?.userPhoto[0]?.path}`;
  const router = useRouter();
  const { isMobile } = useClientHardwareInfo();
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col justify-center w-fit p-2">
        <div
          onClick={() => router.push(`/${postDetails?.userInfo[0]?.userName}`)}
          className="flex justify-center relative cursor-pointer"
        >
          <Avatar className="size-16 ">
            <AvatarImage className="relative block" src={imageUrl} />
            <AvatarFallback>
              {getInitials(postDetails?.userInfo?.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute rounded-full -bottom-3 bg-primary">
            <Plus className="text-white p-1" />
          </span>
        </div>
      </div>
      <div className="flex justify-center ">
        <div className="flex flex-col">
          {isMobile ? (
            <MobileFeed feedData={postDetails} />
          ) : (
            <DesktopFeed feedData={postDetails} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostInteraction;
