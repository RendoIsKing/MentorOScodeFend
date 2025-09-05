"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssetsSheet({ triggerLabel = "Assets" }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button aria-label="Assets" onClick={() => setOpen(true)}
        className="h-9 w-9 flex items-center justify-center rounded-full border hover:bg-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-background shadow-xl p-4 pb-safe" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted mb-3" />
            <h3 className="text-center font-semibold mb-2">{triggerLabel}</h3>
            <button className="w-full rounded-lg border py-3 px-4 text-left hover:bg-accent"
              onClick={() => { setOpen(false); router.push("/assets"); }}>
              View saved assets
            </button>
            <button className="mt-2 w-full rounded-lg border py-3 px-4 text-left hover:bg-accent"
              onClick={() => { setOpen(false); }}>
              Save last reply
            </button>
          </div>
        </div>
      )}
    </>
  );
}


