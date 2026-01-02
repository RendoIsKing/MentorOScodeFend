"use client";

import React from "react";
import Image from "next/image";

export default function DesignAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const logo = "/assets/images/mentorio-logo.svg";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src={logo} alt="Mentorio" width={64} height={64} className="h-16 w-16" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">{title}</h1>
          {subtitle ? <p className="text-gray-500">{subtitle}</p> : null}
        </div>

        {children}
      </div>
    </div>
  );
}


