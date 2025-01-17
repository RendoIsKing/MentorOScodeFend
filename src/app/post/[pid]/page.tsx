"use client";
import PostModal from "@/components/post-modal";
import PostModalMobile from "@/components/post-modal/PostModalMobile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useParams } from "next/navigation";
import React from "react";

function DynamicnoPostPage() {
  const postId = useParams();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div>
      {isMobile ? (
        <PostModalMobile postId={postId.pid} />
      ) : (
        <div className="h-screen  flex justify-center items-center">
          {" "}
          <PostModal postId={postId.pid} />
        </div>
      )}
    </div>
  );
}

export default DynamicnoPostPage;
