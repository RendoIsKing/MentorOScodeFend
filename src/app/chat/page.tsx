import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import ChatIframeClient from "./ChatIframeClient";

export default function ChatIframePage(props: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const enabled =
    String(process.env.NEXT_PUBLIC_DESIGN_CHAT || "") === "1" ||
    String(process.env.NEXT_PUBLIC_DESIGN || "") === "1";

  if (enabled) {
    const sp = props?.searchParams || {};
    const toRaw = Array.isArray(sp.to) ? sp.to[0] : sp.to;
    const uRaw = Array.isArray(sp.u) ? sp.u[0] : sp.u;
    const conversationIdRaw = Array.isArray(sp.conversationId) ? sp.conversationId[0] : sp.conversationId;

    const qs = new URLSearchParams();
    const to = String(toRaw || uRaw || "").trim();
    const conversationId = String(conversationIdRaw || "").trim();
    if (conversationId) qs.set("conversationId", conversationId);
    if (to) qs.set("to", to);

    redirect(`/feature/design/chat-wired${qs.toString() ? `?${qs.toString()}` : ""}`);
  }

  return (
    <Suspense fallback={<div className="h-dvh w-full" />}>
      <ChatIframeClient />
    </Suspense>
  );
}
