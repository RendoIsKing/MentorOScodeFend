"use client";
import React from "react";
import { Manrope } from "next/font/google";
const manrope = Manrope({ subsets: ["latin"], weight: ["800"], display: "swap" });

export default function Wordmark({ className = "", highlightM = false }: { className?: string; highlightM?: boolean }) {
  return (
    <div className={`select-none whitespace-nowrap ${className}`} aria-label="Mentorio logo">
      <h1 className={`${manrope.className} my-0 leading-none tracking-tight text-3xl md:text-4xl`} style={{ letterSpacing: "0.1px" }}>
        {highlightM ? (
          <>
            <span className="text-primary">M</span>
            <span className="text-foreground">entorio</span>
          </>
        ) : (
          <span className="text-primary">Mentorio</span>
        )}
      </h1>
    </div>
  );
}


