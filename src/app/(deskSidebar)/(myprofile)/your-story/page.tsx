"use client";
import PostInteraction from "@/components/postInteraction";
import { Label } from "@/components/ui/label";
import React from "react";

const listData = [
  {
    id: "1",
    url: "https://images.pexels.com/photos/18031828/pexels-photo-18031828/free-photo-of-composition-of-jewelry-dried-flowers-and-books.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

const UserStory = () => {
  return (
    <div>
      <div className="absolute top-0 -z-10">
        {listData?.map((image, index) => (
          <div className="relative h-dvh" key={index}>
            <img className="h-full" src={image?.url} alt="images" />
            <div className="absolute right-0 bottom-0 mb-20">
              {/* <PostInteraction /> */}
            </div>
          </div>
        ))}
        <div className="flex flex-col absolute bottom-16 p-2">
          <div className="">
            <Label>@DemoName</Label>
          </div>
          <div className="">
            <Label>This is demo text for sub-headings</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStory;
