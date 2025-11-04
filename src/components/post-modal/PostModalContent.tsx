"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetPostByIdQuery } from "@/redux/services/haveme/posts";
import { baseServerUrl } from "@/lib/utils";

export default function PostModalContent({ postId }: any) {
  const router = useRouter();
  const { data, isLoading, error } = useGetPostByIdQuery(postId);
  const post: any = (data as any)?.data || data;

  const mediaSrc = useMemo(() => {
    if (!post) return undefined;
    const base = baseServerUrl || "/api/backend";
    const fileId = post?.mediaFiles?.[0]?._id || post?.mediaFiles?.[0]?.id || post?.media?.[0]?.mediaId;
    if (fileId) return `${base}/v1/user/files/${String(fileId)}`;
    const path = post?.mediaFiles?.[0]?.path;
    return path ? `${base}/${path}` : undefined;
  }, [post]);

  const isVideo = Boolean(post?.media?.[0]?.mediaType === "video" || post?.mediaFiles?.[0]?.mediaType === "video");

  return (
    <div className="w-full h-[80vh] max-w-5xl bg-[#0B0F14] rounded-lg shadow flex items-center justify-center relative">
      <button
        aria-label="Close"
        className="absolute right-3 top-3 text-white/70 hover:text-white"
        onClick={() => router.back()}
      >
        ×
      </button>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-muted-foreground">Failed to load post.</div>}
      {!isLoading && !error && (
        mediaSrc ? (
          isVideo ? (
            <video className="h-[70vh] w-auto" src={mediaSrc} controls autoPlay />
          ) : (
            <img className="h-[70vh] w-auto object-contain" src={mediaSrc} alt="post media" />
          )
        ) : (
          <div className="text-sm text-muted-foreground">No media</div>
        )
      )}
    </div>
  );
}


