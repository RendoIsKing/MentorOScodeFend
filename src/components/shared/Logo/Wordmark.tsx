"use client";
import React from "react";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["700","800"], display: "swap" });

export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`select-none whitespace-nowrap ${className}`} aria-label="Mentorio logo">
      <div className="flex items-end gap-0">
        {/* Monogram M with emerald arrow above */}
        <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden fill="none">
          {/* Solid violet M (no arrow) */}
          <path d="M2 22V4l5 6 5-6 5 6 5-6v18" stroke="#6C2EF5" strokeWidth="2.2" strokeLinejoin="round"/>
        </svg>

        {/* Word part 'entorio' with a standard i (no green dot). */}
        {/* Color split: first half violet, second half orange (no pink). */}
        <h1 className={`${sora.className} my-0 leading-none tracking-tight text-2xl md:text-3xl`}>
          <span
            className="inline-flex items-baseline"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #6C2EF5 0%, #6C2EF5 43%, #F97316 43%, #F97316 100%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            entorio
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


