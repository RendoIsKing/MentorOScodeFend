"use client";
import React from "react";

export default function MonogramArrow({ size = 28, className = "" }: { size?: number, className?: string }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={className} aria-label="Mentorio monogram arrow" fill="none">
      <defs>
        <linearGradient id="mv2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6C2EF5" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      {/* Outer M */}
      <path d="M2 22V4l5 6 5-6 5 6 5-6v18" stroke="url(#mv2)" strokeWidth="2.2" strokeLinejoin="round"/>
      {/* Up arrow in negative space (drawn as stroke) */}
      <path d="M7 16l5-6 5 6" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}


