"use client";
import SearchField from "@/components/shared/search-field";
import { Suspense } from "react";

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="p-5 lg:p-10 min-h-screen">
      <Suspense fallback={<h1>Loading... </h1>}>
        <SearchField />
        {children}
      </Suspense>
    </div>
  );
}
