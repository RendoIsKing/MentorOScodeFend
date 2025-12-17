"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";
import { ensureRealtimeStarted, getRealtimeSse } from "@/lib/realtime/sse";
import {
  getUserById,
  listConversations,
  listConversationMessages,
  markConversationRead,
  sendConversationMessage,
  type ConversationMessage,
} from "@/lib/api/conversations";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { cn } from "@/lib/utils";
import { getUserAvatarUrl } from "@/lib/media";

export function UiV2ThreadClient() {
  const params = useParams() as any;
  const threadId = String(params?.id || "");
  const { data: me } = useGetUserDetailsQuery();
  const myId = String((me as any)?.data?._id || "");

  const [messages, setMessages] = React.useState<ConversationMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [partner, setPartner] = React.useState<any>(null);

  const load = React.useCallback(async () => {
    if (!threadId) return;
    setLoading(true);
    try {
      const msgs = await listConversationMessages(threadId);
      setMessages(msgs);
      try {
        await markConversationRead(threadId);
      } catch {}
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Resolve partner info for header
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!threadId || !myId) return;
      try {
        const conv = await listConversations();
        const mine = conv.find((c) => String(c.id) === String(threadId));
        const partnerId = (mine?.participants || []).map(String).find((p) => p !== String(myId));
        if (!partnerId) return;
        const u = await getUserById(partnerId);
        if (alive) setPartner(u);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [threadId, myId]);

  // Realtime updates
  React.useEffect(() => {
    ensureRealtimeStarted();
    const s = getRealtimeSse();
    const off = s.on("chat:message", (payload: any) => {
      if (String(payload?.threadId || "") !== threadId) return;
      const m = payload?.message;
      if (!m?.id) return;
      setMessages((prev) => {
        // If we have an optimistic message with same clientId, replace it.
        const cid = m.clientId ? String(m.clientId) : null;
        if (cid) {
          const idx = prev.findIndex((x) => x.clientId && String(x.clientId) === cid);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = {
              id: String(m.id),
              sender: String(m.sender),
              text: String(m.text || ""),
              createdAt: String(m.createdAt || new Date().toISOString()),
              clientId: cid,
            };
            return copy;
          }
        }
        if (prev.some((x) => x.id === String(m.id))) return prev;
        return [
          ...prev,
          {
            id: String(m.id),
            sender: String(m.sender),
            text: String(m.text || ""),
            createdAt: String(m.createdAt || new Date().toISOString()),
            clientId: cid,
          },
        ];
      });
    });
    return () => off();
  }, [threadId]);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !threadId) return;
    if (sending) return;
    setSending(true);
    const clientId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // optimistic append
    setMessages((prev) => [
      ...prev,
      { id: clientId, sender: myId || "me", text: trimmed, createdAt: new Date().toISOString(), clientId },
    ]);
    setText("");

    try {
      await sendConversationMessage(threadId, trimmed, clientId);
    } catch {
      // mark failed
      setMessages((prev) =>
        prev.map((m) => (m.id === clientId ? { ...m, text: `${m.text} (failed)` } : m))
      );
    } finally {
      setSending(false);
      try {
        await markConversationRead(threadId);
      } catch {}
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col" data-test="thread-root">
      {/* Header (Figma-style) */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon" className="rounded-full text-gray-900 hover:bg-gray-100">
              <Link href="/feature/ui-v2/inbox" aria-label="Back">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={getUserAvatarUrl(partner, "/assets/images/Home/small-profile-img.svg")}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-gray-900 font-semibold truncate">
                  {String(partner?.fullName || partner?.userName || "Chat")}
                </div>
                <div className="text-xs text-gray-500 truncate">@{String(partner?.userName || "")}</div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-gray-900 hover:bg-gray-100" aria-label="More">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No messages yet.</div>
            ) : (
              messages.map((m) => {
                const mine = myId && String(m.sender) === String(myId);
                return (
                  <div
                    key={m.id}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                    data-test="thread-message"
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                        mine
                          ? "bg-[hsl(var(--brand-medium-blue))] text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="h-12 rounded-2xl border-2 border-gray-100 focus-visible:ring-2 focus-visible:ring-[#0078D7]/20 focus-visible:border-[#0078D7]/30 shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
            data-test="thread-input"
          />
          <Button
            onClick={onSend}
            disabled={sending || !text.trim()}
            className="h-12 w-12 rounded-2xl bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-medium-blue))]/90"
            data-test="thread-send"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}


