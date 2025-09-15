"use client";
import { useEffect } from "react";

/** Sets --bottom-nav-h to your bottom bar’s live height. */
export function useBottomNavVar(selector = '[data-test="bottom-nav"]') {
  useEffect(() => {
    const el = document.querySelector(selector) as HTMLElement | null;
    const set = () => {
      const h = el?.offsetHeight ?? 80;
      document.documentElement.style.setProperty('--bottom-nav-h', `${h}px`);
    };
    set();
    if (!el) return;
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selector]);
}


