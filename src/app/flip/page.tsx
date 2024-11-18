"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, X } from "lucide-react";
import React from "react";
import PostInteraction from "@/components/postInteraction";
import { useRouter } from "next/navigation";

function FlipPage() {
  const router = useRouter();

  return (
    <div>
      <div className="size-full">
        <img
          className="relative h-screen w-screen rounded-2xl"
          src="https://images.pexels.com/photos/20881534/pexels-photo-20881534/free-photo-of-a-smiling-woman-standing-among-green-aquatic-plants-and-holding-a-bundle-of-stems.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        />
        <div
          className="flex gap-4 justify-between absolute top-4 w-full px-4"
          onClick={() => {
            router.back();
          }}
        >
          <ChevronLeft />
        </div>
        <div className="absolute top-16 right-0 flex flex-col justify-end gap-2 w-28 h-5/6 px-4">
          {/* <PostInteraction /> */}
        </div>
      </div>
    </div>
  );
}

export default FlipPage;
