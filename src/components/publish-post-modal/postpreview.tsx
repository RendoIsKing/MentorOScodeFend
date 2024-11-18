import React from "react";
import { ChevronRight } from "lucide-react";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

import Tag from "@/assets/images/popup/tag-user.svg";
import Music from "@/assets/images/popup/music.svg";
import Eye from "@/assets/images/popup/eye.svg";

function PostPreview() {
  return (
    <div>
      <div className="min-h-1/4">
        <img
          className="w-screen h-[50vh]"
          src="https://images.pexels.com/photos/11481760/pexels-photo-11481760.jpeg?auto=compress&cs=tinysrgb&w=400&lazy=load"
        />
      </div>
      <Textarea
        className="bg-background/10 resize-none rounded-none border-none my-4 "
        placeholder="Write post description...."
      />
      <Separator />

      <div className="min-h-3/4 p-4">
        <div className="flex flex-col gap-4 mx-auto w-full max-w-sm">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Tag className="fill-foreground" />
              Tag people
            </div>
            <ChevronRight />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Music className="fill-foreground" />
              Add Music
            </div>
            <ChevronRight />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Eye className="fill-foreground" />
              Public
            </div>
            <ChevronRight />
          </div>
          <Separator />
        </div>
        <Button className="w-full mt-4">Post</Button>
      </div>
    </div>
  );
}

export default PostPreview;
