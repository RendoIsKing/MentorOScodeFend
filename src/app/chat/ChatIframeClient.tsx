"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

export default function ChatIframeClient() {
  const searchParams = useSearchParams();
  const to = (searchParams.get("to") || searchParams.get("u") || "").trim();
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const src = React.useMemo(() => {
    const qs = new URLSearchParams();
    if (to) qs.set("to", to);
    const suffix = qs.toString();
    return `/chat-mfe/index.html${suffix ? `?${suffix}` : ""}`;
  }, [to]);

  // Best-effort: also notify the iframe of the intended recipient.
  React.useEffect(() => {
    if (!to) return;
    const el = iframeRef.current;
    if (!el) return;

    const send = () => {
      try {
        el.contentWindow?.postMessage({ type: "chat:open", to }, window.location.origin);
      } catch {}
    };

    send();
    const onLoad = () => send();
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [to]);

  return (
    <div className="h-dvh w-full relative">
      <iframe
        ref={iframeRef}
        src={src}
        title="Chat"
        className="w-full h-full border-0"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}


