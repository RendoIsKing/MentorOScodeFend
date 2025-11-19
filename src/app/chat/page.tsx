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
      {/* Back button overlay (top-left) */}
      <button
        type="button"
        onClick={goBack}
        aria-label="Back"
        className="fixed left-3 top-[calc(env(safe-area-inset-top)+10px)] z-[2147483647] h-10 w-10 rounded-full border bg-background/80 backdrop-blur flex items-center justify-center shadow"
      >
        <ArrowLeft size={18} />
      </button>

      <iframe
        src="/chat-mfe/index.html"
        title="Chat"
        className="w-full h-full border-0"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
