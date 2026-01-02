"use client";

import React from "react";
import InboxBody from "@/components/inbox-body";
import { useParams, useRouter } from "next/navigation";

export default function InboxThreadPage() {
  const router = useRouter();
  const params = useParams() as any;
  const roomId = String(params?.roomId || "");

  React.useEffect(() => {
    const designEnabled =
      String(process.env.NEXT_PUBLIC_DESIGN_CHAT || "") === "1" ||
      String(process.env.NEXT_PUBLIC_DESIGN || "") === "1";
    if (designEnabled) {
      router.replace("/feature/design/chat-wired");
      return;
    }
    const enabled = String(process.env.NEXT_PUBLIC_UI_V2_INBOX || "") === "1";
    if (!enabled) return;
    // Best-effort: if old route is used, land in ui-v2 inbox.
    // (We don't have a stable mapping from old roomId -> conversationId here.)
    router.replace("/feature/ui-v2/inbox");
  }, [router, roomId]);

  return (
    <div className="h-screen">
      <InboxBody />
    </div>
  );
}
