"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssetsSheet({ triggerLabel = "Assets", iconOnly = false, menu = "default" }: { triggerLabel?: string; iconOnly?: boolean; menu?: "default"|"plans" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function stopAll(e: any) {
    try { e.preventDefault(); } catch {}
    try { e.stopPropagation(); } catch {}
    try { e.nativeEvent?.stopImmediatePropagation?.(); } catch {}
    return false;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Assets"
        onClick={(e) => { stopAll(e); setOpen(true); }}
        onClickCapture={(e) => { stopAll(e); }}
        onMouseDown={(e) => { stopAll(e); }}
        onTouchStart={(e) => { stopAll(e); }}
        className={`pointer-events-auto min-h-[36px] min-w-[44px] ${iconOnly? 'px-0 w-9 h-9 rounded-full border' : 'px-3 rounded-full border'} flex items-center justify-center gap-2 bg-background hover:bg-accent active:scale-95`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        {!iconOnly && <span className="text-sm">{triggerLabel}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[10060]" aria-modal="true" role="dialog" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-background shadow-xl p-4 pb-safe pb-tabbar" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted mb-3" />
            <h3 className="text-center font-semibold mb-2">{triggerLabel}</h3>
            {menu === 'plans' ? (
              <>
                <button className="w-full rounded-lg border py-3 px-4 text-left hover:bg-accent"
                  onClick={() => { setOpen(false); const src = typeof window!=='undefined' ? window.location.pathname : '/chat'; router.push(`/plans/training?from=chat&src=${encodeURIComponent(src)}`); }}>
                  Training plan
                </button>
                <button className="mt-2 w-full rounded-lg border py-3 px-4 text-left hover:bg-accent"
                  onClick={() => { setOpen(false); const src = typeof window!=='undefined' ? window.location.pathname : '/chat'; router.push(`/plans/nutrition?from=chat&src=${encodeURIComponent(src)}`); }}>
                  Meal plan
                </button>
                <button className="mt-2 w-full rounded-lg border py-3 px-4 text-left hover:bg-accent"
                  onClick={() => { setOpen(false); const src = typeof window!=='undefined' ? window.location.pathname : '/chat'; router.push(`/plans/goals?from=chat&src=${encodeURIComponent(src)}`); }}>
                  Goals
                </button>
              </>
            ) : (
              <>
                <button className="w-full rounded-lg border py-3 px-4 text-left hover:bg-accent"
                  onClick={() => { setOpen(false); router.push("/assets"); }}>
                  View saved assets
                </button>
                <button className="mt-2 w-full rounded-lg border py-3 px-4 text-left hover:bg-accent"
                  onClick={() => { setOpen(false); }}>
                  Save last reply
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}


