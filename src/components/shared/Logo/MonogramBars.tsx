"use client";
import React from "react";

export default function MonogramBars({ size = 28, className = "" }: { size?: number, className?: string }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={className} aria-label="Mentorio monogram bars" fill="none">
      <defs>
        <linearGradient id="mviolet" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#12C8BE" />
          <stop offset="100%" stopColor="#6DE7DF" />
        </linearGradient>
      </defs>
      {/* Three rising bars forming an abstract M */}
      <rect x="2" y="10" width="4" height="12" rx="1.2" fill="url(#mviolet)"/>
      <rect x="10" y="6" width="4" height="16" rx="1.2" fill="url(#mviolet)"/>
      <rect x="18" y="2" width="4" height="20" rx="1.2" fill="url(#mviolet)"/>
      {/* Emerald baseline */}
      <rect x="2" y="22" width="20" height="1.5" rx="0.75" fill="#1E3A8A"/>
    </svg>
  );
}


