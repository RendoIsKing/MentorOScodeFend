"use client";
import { useRef, useState } from "react";
import { uploadImage, patchProfile } from "@/lib/uploadClient";

export default function MobileAvatarCoverPickers({ user }: { user: any }) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef  = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"avatar" | "cover" | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>, kind: "avatar"|"cover") {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(kind);
    try {
      const url = await uploadImage(file);
      await patchProfile(kind === "avatar" ? { photoUrl: url } : { coverUrl: url });
      window.location.reload();
    } catch (err:any) {
      alert(err.message || "Failed to update image");
    } finally {
      setBusy(null);
      e.target.value = "";
    }
  }

  return (
    <>
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e)=>handleChange(e,"avatar")} />
      <input ref={coverRef}  type="file" accept="image/*" className="hidden" onChange={(e)=>handleChange(e,"cover")} />

      <button
        type="button"
        onClick={()=> avatarRef.current?.click()}
        className="absolute left-3 bottom-3 z-10 h-9 min-w-[90px] rounded-full border bg-background/80 backdrop-blur px-3 text-sm"
        disabled={busy==="avatar"}
      >
        {busy==="avatar" ? "Uploading…" : "Change Avatar"}
      </button>
      <button
        type="button"
        onClick={()=> coverRef.current?.click()}
        className="absolute right-3 bottom-3 z-10 h-9 min-w-[90px] rounded-full border bg-background/80 backdrop-blur px-3 text-sm"
        disabled={busy==="cover"}
      >
        {busy==="cover" ? "Uploading…" : "Change Cover"}
      </button>
    </>
  );
}


