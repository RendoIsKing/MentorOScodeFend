'use client';

import { ArrowLeft } from "lucide-react";

export default function ChatIframePage() {
  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/home";
    }
  };

  return (
    <div className="h-dvh w-full relative">
      <iframe
        src="/chat-mfe/index.html"
        title="Chat"
        className="w-full h-full border-0"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
