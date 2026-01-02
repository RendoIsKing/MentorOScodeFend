export type UploadMediaResult = {
  id: string;
};

export async function uploadMedia(file: File): Promise<UploadMediaResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/app-media", { method: "POST", credentials: "include", body: fd });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!res.ok) throw new Error(data?.message || `Media upload failed (${res.status})`);
  const id = String(data?.id || data?.data?.id || data?.fileId || "");
  if (!id) throw new Error("Media upload did not return an id");
  return { id };
}

export type CreateContentInput = {
  type: "post" | "story";
  caption: string;
  privacy: "public" | "followers" | "subscriber";
  tags?: string[];
  media: { mediaId: string; mediaType: "image" | "video" }[];
};

export async function createPostOrStory(input: CreateContentInput) {
  const res = await fetch("/api/app-create-post", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: input.caption || "",
      tags: input.tags || [],
      privacy: input.privacy,
      status: "published",
      type: input.type,
      media: input.media,
    }),
  });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error?.message || `Create failed (${res.status})`);
  return data;
}


