"use client";
import { useRef } from "react";

type Props = {
  onPick: (files: File[]) => void;
  accept?: string;
  maxBytes?: number;
};

export default function MobileMediaPicker({ onPick, accept, maxBytes }: Props) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const libRef   = useRef<HTMLInputElement>(null);

  const MAX = maxBytes ?? 200 * 1024 * 1024;

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    const ok = list.filter(f => f.size <= MAX);
    if (ok.length !== list.length) {
      alert("Some files were too large and were skipped.");
    }
    if (ok.length) onPick(ok);
    e.target.value = "";
  }

  return (
    <div className="md:hidden grid grid-cols-3 gap-2">
      <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handle} />
      <input ref={videoRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={handle} />
      <input ref={libRef}   type="file" accept={accept || "image/*,video/*"} multiple className="hidden" onChange={handle} />

      <button type="button" onClick={() => photoRef.current?.click()}
        className="h-11 rounded-xl border bg-background text-sm">
        Kamera
      </button>
      <button type="button" onClick={() => videoRef.current?.click()}
        className="h-11 rounded-xl border bg-background text-sm">
        Video
      </button>
      <button type="button" onClick={() => libRef.current?.click()}
        className="h-11 rounded-xl border bg-background text-sm">
        Galleri
      </button>
    </div>
  );
}


