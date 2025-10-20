"use client";
import React from "react";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["700","800"], display: "swap" });

export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`select-none whitespace-nowrap ${className}`} aria-label="Mentorio logo">
      <div className="flex items-end gap-0">
        {/* Monogram M with emerald arrow above */}
        <svg width="34" height="34" viewBox="-3 -4 30 30" aria-hidden fill="none">
          <defs>
            <linearGradient id="mviolet" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#6C2EF5" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
          </defs>
          {/* Violet M */}
          <path d="M2 22V4l5 6 5-6 5 6 5-6v18" stroke="url(#mviolet)" strokeWidth="2.2" strokeLinejoin="round"/>
          {/* Emerald arrow ABOVE the M with generous clearance */}
          <path d="M12 -1.2l3 3.2M12 -1.2l-3 3.2" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>

        {/* Word part 'entorio' with emerald dot as the single i dot */}
        <h1 className={`${sora.className} my-0 leading-none tracking-tight text-2xl md:text-3xl`} style={{ background: "linear-gradient(135deg,#6C2EF5 0%,#D946EF 100%)", WebkitBackgroundClip: "text", color: "transparent" }}>
          <span className="inline-flex items-baseline">
            <span className="text-[--logo-primary]">entor</span>
            <span className="relative inline-block text-center" style={{ width: "0.6ch" }}>
              {/* dotless i so we can replace the dot */}
              <span className="text-[--logo-primary] leading-none">ı</span>
              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[--logo-accent]"></span>
            </span>
            <span className="text-[--logo-primary]">o</span>
          </span>
        </h1>
      </div>
      <style jsx global>{`
        :root { --logo-primary: #6C2EF5; --logo-accent: #10B981; }
        .dark { --logo-primary: #6C2EF5; --logo-accent: #10B981; }
      `}</style>
    </div>
  );
}


