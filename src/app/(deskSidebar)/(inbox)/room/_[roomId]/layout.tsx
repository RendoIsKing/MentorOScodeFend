"use client";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import ChatHistory from "@/components/chat/chat-history";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile } = useClientHardwareInfo();

  return (
    <>
      {isMobile ? (
        <div className="h-screen">
          <ChatHistory />
        </div>
      ) : (
        <>
          <div className="h-screen">
            {/* MVP: avatar-only chat – hide conversation picker */}
            <ChatHistory />
          </div>
        </>
      )}
    </>
  );
}
