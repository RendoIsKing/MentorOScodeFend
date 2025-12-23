import ChatPageWired from "@/components/design/ChatPageWired";
import React, { Suspense } from "react";

export default function DesignChatWiredPage() {
  return (
    <Suspense fallback={<div className="h-dvh w-full" />}>
      <ChatPageWired />
    </Suspense>
  );
}


