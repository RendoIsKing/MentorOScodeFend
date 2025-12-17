"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetSubscriberListQuery } from "@/redux/services/haveme/user";
import { useGetNotificationQuery } from "@/redux/services/haveme/notifications";
import { ensureRealtimeStarted, getRealtimeSse } from "@/lib/realtime/sse";
import { getUserAvatarUrl } from "@/lib/media";
import { cn, formatTimestamp } from "@/lib/utils";
import NotificationRow from "@/components/shared/get-notification-description";
import {
  createConversation,
  getUserById,
  listConversations,
  type ConversationSummary,
} from "@/lib/api/conversations";

type Row = {
  id: string;
  partnerId: string;
  partner?: any;
  lastMessageText?: string;
  lastMessageAt?: string | null;
  unread?: number;
};

export function UiV2InboxClient() {
  const router = useRouter();
  const { data: me } = useGetUserDetailsQuery();
  const myId = String((me as any)?.data?._id || "");
  const isMentor = Boolean((me as any)?.data?.isMentor);

  const [tab, setTab] = React.useState<"chats" | "subscribers" | "notifications">("chats");
  const [chatFilter, setChatFilter] = React.useState<"all" | "users" | "mentors">("all");
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  const { data: subscriberRes } = useGetSubscriberListQuery(myId as any, { skip: !isMentor || !myId });
  const subscribers: Array<{ userId: string; fullName?: string; userName?: string; photoId?: string | null }> =
    ((subscriberRes as any)?.data ?? []) as any;

  const { data: notifRes } = useGetNotificationQuery({ page: 1, perPage: 50 } as any, { skip: !myId });
  const notifications: any[] = ((notifRes as any)?.data ?? []) as any;

  // Cache partner lookups
  const partnerCache = React.useRef<Map<string, any>>(new Map());

  const hydratePartners = React.useCallback(async (items: Row[]) => {
    const missing = items.map((r) => r.partnerId).filter((id) => id && !partnerCache.current.has(id));
    if (missing.length === 0) return;
    await Promise.all(
      missing.slice(0, 30).map(async (id) => {
        try {
          const u = await getUserById(id);
          partnerCache.current.set(id, u);
        } catch {}
      })
    );
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const conv = await listConversations();
      const mapped: Row[] = conv.map((c: ConversationSummary) => {
        const partnerId = (c.participants || []).map(String).find((p) => p !== myId) || "";
        return {
          id: c.id,
          partnerId,
          partner: partnerId ? partnerCache.current.get(partnerId) : undefined,
          lastMessageText: c.lastMessageText || "",
          lastMessageAt: c.lastMessageAt || null,
          unread: c.unread || 0,
        };
      });
      await hydratePartners(mapped);
      setRows(
        mapped.map((r) => ({
          ...r,
          partner: r.partnerId ? partnerCache.current.get(r.partnerId) : r.partner,
        }))
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [hydratePartners, myId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime updates via SSE
  React.useEffect(() => {
    ensureRealtimeStarted();
    const s = getRealtimeSse();
    const offThread = s.on("chat:thread", () => refresh());
    const offMsg = s.on("chat:message", () => refresh());
    const offRead = s.on("chat:read", () => refresh());
    return () => {
      offThread();
      offMsg();
      offRead();
    };
  }, [refresh]);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const qq = q.toLowerCase();
    const name = String(r.partner?.fullName || r.partner?.userName || "").toLowerCase();
    const last = String(r.lastMessageText || "").toLowerCase();
    return name.includes(qq) || last.includes(qq);
  });

  const chatsFiltered = React.useMemo(() => {
    if (chatFilter === "all") return filtered;
    return filtered.filter((r) => {
      const p = r.partner;
      const isPartnerMentor = Boolean((p as any)?.isMentor);
      return chatFilter === "mentors" ? isPartnerMentor : !isPartnerMentor;
    });
  }, [filtered, chatFilter]);

  const convoByPartnerId = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) {
      if (r.partnerId) m.set(String(r.partnerId), String(r.id));
    }
    return m;
  }, [rows]);

  const openDmWithUserId = React.useCallback(
    async (partnerId: string) => {
      const existing = convoByPartnerId.get(String(partnerId));
      if (existing) {
        router.push(`/feature/ui-v2/inbox/${encodeURIComponent(existing)}`);
        return;
      }
      try {
        const id = await createConversation(String(partnerId));
        router.push(`/feature/ui-v2/inbox/${encodeURIComponent(id)}`);
      } catch {
        // ignore
      }
    },
    [convoByPartnerId, router]
  );

  const subscriberFiltered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return subscribers;
    return subscribers.filter((s) => {
      const name = String(s.fullName || "").toLowerCase();
      const uname = String(s.userName || "").toLowerCase();
      return name.includes(qq) || uname.includes(qq);
    });
  }, [q, subscribers]);

  const subscriberRows = React.useMemo(() => {
    return subscriberFiltered.map((s) => {
      const partnerId = String(s.userId);
      const convId = convoByPartnerId.get(partnerId) || "";
      const convRow = rows.find((r) => String(r.partnerId) === partnerId);
      return {
        ...s,
        partnerId,
        conversationId: convId,
        lastMessageText: convRow?.lastMessageText || "",
        unread: convRow?.unread || 0,
        lastMessageAt: convRow?.lastMessageAt || null,
      };
    });
  }, [subscriberFiltered, convoByPartnerId, rows]);

  const notificationFiltered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return notifications;
    return notifications.filter((n) => {
      const title = String(n.title || "").toLowerCase();
      const desc = String(n.description || "").toLowerCase();
      const from = String(n.notificationFromUserDetails || "").toLowerCase();
      return title.includes(qq) || desc.includes(qq) || from.includes(qq);
    });
  }, [q, notifications]);

  const guessVerb = (n: any): string => {
    const text = `${n?.title || ""} ${n?.description || ""} ${n?.type || ""}`.toLowerCase();
    if (text.includes("follow")) return "follow";
    if (text.includes("like")) return "like_post";
    if (text.includes("comment")) return "comment";
    return "notification";
  };

  const resolveSubscriberAvatar = (photoId?: string | null) => {
    const p = String(photoId || "").trim().replace(/^\/+/, "");
    if (!p) return "/assets/images/Home/small-profile-img.svg";
    if (p.startsWith("http")) return p;
    // backend serves uploadRoot/public under /api/backend/*
    return `/api/backend/${p}`;
  };

  return (
    <div className="min-h-[100dvh] bg-background" data-test="inbox-root">
      <div className="mx-auto max-w-[720px] px-4 py-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl font-semibold">Inbox</h1>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className={cn("grid w-full", isMentor ? "grid-cols-3" : "grid-cols-2")}>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            {isMentor ? <TabsTrigger value="subscribers">Subscribers</TabsTrigger> : null}
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0078D7] z-10 pointer-events-none" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tab === "notifications" ? "Search notifications..." : "Search conversations..."}
                className="w-full pl-11 pr-4 h-12 rounded-2xl bg-white border-2 border-gray-100 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#0078D7]/20 focus-visible:border-[#0078D7]/30 shadow-sm transition-all"
              />
            </div>
          </div>

          <TabsContent value="chats" className="mt-3">
            {/* Filter tabs (matches export: all/users/mentors) */}
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChatFilter("all")}
                  className={cn(
                    "h-10 rounded-xl border text-sm font-medium transition-colors",
                    chatFilter === "all"
                      ? "bg-[hsl(var(--brand-medium-blue))] text-white border-transparent"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setChatFilter("users")}
                  className={cn(
                    "h-10 rounded-xl border text-sm font-medium transition-colors",
                    chatFilter === "users"
                      ? "bg-[hsl(var(--brand-medium-blue))] text-white border-transparent"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Users
                </button>
                <button
                  type="button"
                  onClick={() => setChatFilter("mentors")}
                  className={cn(
                    "h-10 rounded-xl border text-sm font-medium transition-colors",
                    chatFilter === "mentors"
                      ? "bg-[hsl(var(--brand-medium-blue))] text-white border-transparent"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Mentors
                </button>
              </div>
            </div>

            <ScrollArea className="h-[70vh] rounded-xl border">
              <div className="p-2">
                {loading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading…</div>
                ) : chatsFiltered.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No conversations.</div>
                ) : (
                  <div className="space-y-2">
                    {chatsFiltered.map((r) => {
                      const avatar = getUserAvatarUrl(r.partner, "/assets/images/Home/small-profile-img.svg");
                      const title = String(r.partner?.fullName || r.partner?.userName || "User");
                      const subtitle = r.lastMessageText || " ";
                      const ts = r.lastMessageAt ? formatTimestamp(String(r.lastMessageAt)) : "";
                      return (
                        <Link
                          key={r.id}
                          href={`/feature/ui-v2/inbox/${encodeURIComponent(r.id)}`}
                          className="flex items-start gap-3 rounded-2xl p-3 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 bg-white"
                          data-test="inbox-thread"
                        >
                          <div className="relative">
                            <img src={avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                            {r.unread ? (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(var(--brand-medium-blue))] text-white rounded-full flex items-center justify-center text-xs">
                                {r.unread}
                              </div>
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold text-sm text-gray-900 truncate">{title}</div>
                              <div className="text-xs text-gray-500 shrink-0">{ts}</div>
                            </div>
                            <div className="text-sm text-gray-500 truncate">{subtitle}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="subscribers" className="mt-3">
            <ScrollArea className="h-[70vh] rounded-xl border">
              <div className="p-2">
                {!isMentor ? (
                  <div className="p-4 text-sm text-muted-foreground">Mentor subscribers are only available for mentors.</div>
                ) : subscriberRows.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No subscribers.</div>
                ) : (
                  <div className="space-y-2">
                    {subscriberRows.map((s) => (
                      <button
                        key={String(s.userId)}
                        type="button"
                        onClick={() => openDmWithUserId(String(s.userId))}
                        className="w-full flex items-center gap-3 rounded-2xl p-3 hover:bg-muted transition-colors text-left"
                        data-test="inbox-subscriber"
                      >
                        <div className="relative">
                          <img
                            src={resolveSubscriberAvatar(s.photoId)}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          {s.unread ? (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(var(--brand-medium-blue))] text-white rounded-full flex items-center justify-center text-xs">
                              {s.unread}
                            </div>
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{s.fullName || s.userName || "Subscriber"}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {s.lastMessageText ? s.lastMessageText : `@${s.userName || ""}`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notifications" className="mt-3">
            <ScrollArea className="h-[70vh] rounded-xl border">
              <div className="p-2 space-y-2">
                {notificationFiltered.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No notifications.</div>
                ) : (
                  notificationFiltered.map((n, idx) => (
                    <div key={String(n?._id || n?.id || idx)} data-test="inbox-notification">
                      <NotificationRow
                        actorName={String(n?.notificationFromUserDetails || "System")}
                        verb={guessVerb(n)}
                        text={String(n?.description || n?.title || "")}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


