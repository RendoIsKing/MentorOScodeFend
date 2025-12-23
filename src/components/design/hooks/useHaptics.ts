"use client";

export function useHaptics() {
  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    try {
      if (typeof navigator === "undefined") return;
      if (!("vibrate" in navigator)) return;
      const ms = type === "heavy" ? 40 : type === "medium" ? 25 : 15;
      (navigator as any).vibrate?.(ms);
    } catch {}
  };

  return { triggerHaptic };
}


