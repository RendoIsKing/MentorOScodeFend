"use client";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDraft, removeDraft } from "@/lib/idbDrafts";

export default function ComposePage() {
  const router = useRouter();
  const q = useSearchParams();
  const id = Number(q.get("draft"));
  const [blob, setBlob] = useState<Blob | null>(null);
  const [name, setName] = useState<string>("draft");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'subscribers'>("public");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const d = await getDraft(id);
      if (!d) { router.replace("/upload"); return; }
      setBlob(d.blob);
      setName(d.name || "draft");
    })();
  }, [id, router]);

  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  // Send JSON body to a proxy that forwards to /api/backend/v1/post
  const CREATE_URL = "/api/app-create-post";

  function buildUploadForm(fileOrBlob: File, caption: string, tagsInput: string) {
    const isVideo = (fileOrBlob.type || "").startsWith("video/");
    const tagsArray = tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const data = new FormData();
    // Backend validators
    data.append("content", caption || "");
    data.append("privacy", "public");
    data.append("status", "published");
    data.append("type", "post"); // use "story" only if you're creating a Story
    for (const t of tagsArray) data.append("tags", t);
    data.append("tagsJson", JSON.stringify(tagsArray));
    // File under common keys
    data.append("file", fileOrBlob);
    data.append("media", fileOrBlob);
    return data;
  }

  async function postNow() {
    if (!blob) return;
    setBusy(true); setErr(null);
    try {
      const file = new File([blob], name, { type: blob.type || "image/jpeg" });
      // 1) Upload the media file to your existing file API (reusing /api/app-upload)
      const mediaForm = new FormData();
      mediaForm.append("file", file);
      const mediaRes = await fetch("/api/app-media", { method: "POST", credentials: "include", body: mediaForm });
      const mediaText = await mediaRes.text();
      if (!mediaRes.ok) throw new Error(`Media upload failed ${mediaRes.status}: ${mediaText || "no body"}`);
      let mediaData: any = {};
      try { mediaData = JSON.parse(mediaText); } catch {}

      // Expect a file id/path; map to server MediaDto
      const mediaDto = [{ mediaId: mediaData?.id || mediaData?.data?.id || mediaData?.fileId || "", mediaType: (file.type || "image/jpeg").startsWith("video/") ? "video" : "image" }];

      // 2) Create the post with validated fields
      const tagsArray = tags.split(",").map(s=>s.trim()).filter(Boolean);
      const payload = {
        content: caption || "",
        tags: tagsArray,
        privacy: visibility === 'subscribers' ? 'subscriber' : visibility,
        status: "published",
        type: "post",
        media: mediaDto,
      };
      const res = await fetch(CREATE_URL, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}
      if (!res.ok) throw new Error(`Upload failed ${res.status}: ${text || "no body"}`);

      await removeDraft(id);
      const to = data?.postUrl || "/profile";
      router.replace(to);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-screen-md p-4 pb-24 md:pb-0">
      <h1 className="text-lg font-semibold mb-3">Compose</h1>
      {url && (
        <div className="mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="preview" className="aspect-square w-full rounded-lg object-cover md:max-w-sm" />
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Caption</label>
          <textarea value={caption} onChange={(e)=>setCaption(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Write a caption…" />
        </div>
        <div>
          <label className="block text-sm mb-1">Tags (comma separated)</label>
          <input value={tags} onChange={(e)=>setTags(e.target.value)} className="w-full h-10 rounded-lg border px-3 text-sm" placeholder="fitness, strength, daily" />
        </div>
        <div>
          <label className="block text-sm mb-1">Visibility</label>
          <div className="flex gap-2">
            <select value={visibility} onChange={(e)=>setVisibility(e.target.value as any)} className="h-10 rounded-lg border px-3 text-sm">
              <option value="public">Public</option>
              <option value="followers">Followers</option>
              <option value="subscribers">Subscribers</option>
            </select>
          </div>
        </div>
        {err && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</div>}
        <div className="flex items-center gap-2">
          <button disabled={busy || !blob} onClick={postNow} className="h-11 rounded-xl bg-primary px-4 text-primary-foreground disabled:opacity-50" data-test="post-submit">{busy ? "Posting…" : "Post"}</button>
          <button onClick={()=>router.back()} className="h-11 rounded-xl border px-4">Back</button>
        </div>
      </div>
    </main>
  );
}


