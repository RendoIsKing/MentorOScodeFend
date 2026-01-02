import Image from "next/image";
import React from "react";

export default function Loading() {
  const logo = "/assets/images/mentorio-logo.svg";
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="flex flex-col items-center gap-4">
        <Image src={logo} alt="Mentorio" width={64} height={64} className="h-16 w-16" />
        <div className="h-6 w-6 rounded-full border-2 border-[#0078D7]/30 border-t-[#0078D7] animate-spin" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}


