"use client";
import React from "react";
import dynamic from "next/dynamic";

const PostModalContent = dynamic(() => import("./PostModalContent"), {
  ssr: false,
  loading: () => <div className="w-full h-[70vh] flex items-center justify-center" />,
});

export default function PostModal(props: any) {
  return <PostModalContent {...props} />;
}
