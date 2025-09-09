"use client";
import { useRouter } from "next/navigation";

export default function MobileTopBar({ title, right }: { title: string; right?: React.ReactNode }) {
  const router = useRouter();
  const stopAll = (e: any) => {
    try { e.preventDefault(); } catch {}
    try { e.stopPropagation(); } catch {}
    try { e.nativeEvent?.stopImmediatePropagation?.(); } catch {}
  };
  return (
    <div className="md:hidden pt-safe sticky top-0 z-40 flex items-center justify-between bg-background/95 backdrop-blur px-3 py-2 border-b">
      <button aria-label="Tilbake" onClick={() => router.back()}
        className="h-9 w-9 flex items-center justify-center rounded-full border hover:bg-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="flex-1 text-center font-semibold text-base truncate">{title}</div>
      <div
        className="min-w-[44px] flex items-center justify-center"
        onClickCapture={stopAll}
        onMouseDown={stopAll}
        onTouchStart={stopAll}
      >
        {right || null}
      </div>
    </div>
  );
}


