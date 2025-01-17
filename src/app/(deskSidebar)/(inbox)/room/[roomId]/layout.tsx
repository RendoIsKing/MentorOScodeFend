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
          <div>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel
                className="min-w-96 max-w-[45vw]"
                defaultSize={40}
              >
                <div>{children}</div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={60}>
                <ChatHistory />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </>
      )}
    </>
  );
}
