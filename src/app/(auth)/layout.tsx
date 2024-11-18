"use client";
import Logo from "@/components/shared/Logo";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

export default function OnBoardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile } = useClientHardwareInfo();

  return (
    <div className="p-5 lg:flex lg:flex-col lg:items-center lg:justify-center h-screen">
      {isMobile && (
        <div className="my-12">
          <Logo />
        </div>
      )}
      {children}
      {!isMobile && <h1 className="fixed bottom-12">© 2024 HaveMe</h1>}
    </div>
  );
}
