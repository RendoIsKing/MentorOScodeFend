import React, { Suspense } from "react";
import ChatIframeClient from "./ChatIframeClient";

export default function ChatIframePage() {
  return (
    <Suspense fallback={<div className="h-dvh w-full" />}>
      <ChatIframeClient />
    </Suspense>
  );
}
