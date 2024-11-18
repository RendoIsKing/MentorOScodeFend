"use client";
import React, { ChangeEvent, useState } from "react";
import AvatarWithDescription from "@/components/shared/avatar-with-description";
import UserIcon from "@/components/shared/user-icon";
import { SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const userData = {
  followersData: [
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
    },
  ],
};

const ChatSearchResult = () => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const resetField = () => {
    setInputValue("");
  };
  return (
    <div className="pt-8 px-4">
      <div className="relative">
        <Input
          type="text"
          onChange={handleChange}
          value={inputValue}
          className="px-12 text-muted-foreground bg-muted border border-muted h-10 w-full rounded-3xl text-sm"
          placeholder="Search Inbox"
        />
        <img
          src="/assets/images/search/search-normal.svg"
          alt="search"
          className="absolute left-4 top-2 text-primary"
        />

        {inputValue && (
          <X
            className="cancel-button absolute right-4 top-2 cursor-pointer"
            size={20}
            onClick={resetField}
          />
        )}
      </div>
      <div className="text-muted-foreground text-base my-2 mt-4">
        Recent Searches
      </div>
      <ScrollArea>
        <div className="flex flex-row ">
          {userData?.followersData?.map((data, index) => (
            <div key={index} className="flex justify-between my-4">
              <UserIcon
                imageUrl={data?.imageUrl}
                ImageFallBackText={data?.ImageFallBackText}
                userName={data?.userName}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="text-muted-foreground">Suggested</div>
      {userData?.followersData?.map((data, index) => (
        <div key={index} className="flex justify-between my-4">
          <AvatarWithDescription
            imageUrl={data?.imageUrl}
            ImageFallBackText={data?.ImageFallBackText}
            userName={data?.userName}
            userNameTag={data?.userNameTag}
          />
        </div>
      ))}
    </div>
  );
};

export default ChatSearchResult;
