"use client";
import React from "react";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["700","800"], display: "swap" });

export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`select-none whitespace-nowrap ${className}`} aria-label="Mentorio logo">
      <h1 className={`${sora.className} my-0 leading-none tracking-tight text-2xl md:text-3xl`}> 
        <span className="inline-flex items-baseline">
          <span className="text-[--logo-primary]">Mentor</span>
          <span className="relative">
            <span className="text-[--logo-primary]">i</span>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[--logo-accent]"></span>
          </span>
          <span className="text-[--logo-primary]">o</span>
        </span>
      </h1>
      <style jsx global>{`
        :root { --logo-primary: #6C2EF5; --logo-accent: #10B981; }
        .dark { --logo-primary: #6C2EF5; --logo-accent: #10B981; }
      `}</style>
    </div>
  );
}


