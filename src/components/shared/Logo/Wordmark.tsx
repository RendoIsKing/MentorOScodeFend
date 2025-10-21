"use client";
import React from "react";
import { Manrope } from "next/font/google";
const manrope = Manrope({ subsets: ["latin"], weight: ["800"], display: "swap" });

export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`select-none whitespace-nowrap ${className}`} aria-label="Mentorio logo">
      <h1 className={`${manrope.className} my-0 leading-none tracking-tight text-3xl md:text-4xl text-primary`} style={{ letterSpacing: "0.1px" }}>
        Mentorio
      </h1>
    </div>
  );
}


