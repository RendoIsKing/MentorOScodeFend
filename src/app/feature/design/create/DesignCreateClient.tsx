"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CreatePostFlowWired, { type CreateFlowResult } from "@/components/design/CreatePostFlowWired";
import { createPostOrStory, uploadMedia } from "@/lib/api/content";

const DEFAULT_FEEDS: Array<{ id: string; name: string; emoji: string }> = [];

export default function DesignCreateClient({ initialType }: { initialType: "post" | "story" }) {
  const router = useRouter();

  async function onPost(postData: CreateFlowResult) {
    // Widgets: UI-only for now (we can wire later)
    if (postData.widgetType) {
      router.replace("/feature/design/home-wired");
      return;
    }

    const file = postData.file;
    if (!file) return;

    const uploaded = await uploadMedia(file);
    const mediaType: "image" | "video" = (file.type || "").startsWith("video/") ? "video" : "image";

    await createPostOrStory({
      type: postData.type === "story" ? "story" : "post",
      caption: postData.caption || "",
      privacy: "public",
      media: [{ mediaId: uploaded.id, mediaType }],
    });

    // For now, return to the feed. (We can add a story viewer later.)
    router.replace("/feature/design/home-wired");
  }

  return (
    <CreatePostFlowWired
      onClose={() => router.back()}
      onPost={(p) => onPost({ ...p, type: p.type || (initialType as any) })}
      customFeeds={DEFAULT_FEEDS}
    />
  );
}


