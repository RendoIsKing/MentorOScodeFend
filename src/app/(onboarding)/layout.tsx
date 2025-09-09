"use client";
import { ChevronLeft } from "lucide-react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

export default function OnBoardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isMobile } = useClientHardwareInfo();
  return (
    <div className="p-5 lg:flex lg:flex-col lg:justify-center lg:items-center h-screen">
      {isMobile && (
        <div className="mb-4 mt-8">
          <ChevronLeft />
        </div>
      )}
      {children}
      {/* {!isMobile && <h1 className="fixed bottom-8">© 2024 MentorOS</h1>} */}
    </div>
  );
}
