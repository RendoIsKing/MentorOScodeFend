"use client";

// Verbatim MentorInbox UI (from Figma export) with REAL backend wiring.
// Goal: pixel parity first, then data correctness; keep markup/classes as close as possible.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Send,
  Plus,
  Paperclip,
  Star,
  Flag,
  Archive,
  Dumbbell,
  Utensils,
  FileText,
  Smile,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureRealtimeStarted, getRealtimeSse } from "@/lib/realtime/sse";
import {
  createConversation,
  getUserById,
  listConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
  type ConversationMessage,
  type ConversationSummary,
} from "@/lib/api/conversations";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetSubscriberListQuery } from "@/redux/services/haveme/user";
import { useGetNotificationQuery } from "@/redux/services/haveme/notifications";
import { format } from "date-fns";

type ConversationRow = {
  id: string;
  user: { id: string; name: string; avatar: string };
  lastMessage: string;
  timestamp: string;
  unread: number;
  isImportant: boolean;
  needsFollowUp: boolean;
};

function relTimeCompact(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.max(0, Math.floor(diff / 60000));
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function avatarFromUser(u: any): string {
  // Prefer backend served files; fall back to default.
  const fallback = "/assets/images/Home/small-profile-img.svg";
  const rawPath = String(u?.photo?.path || u?.photoId?.path || u?.photoId || "").trim();
  if (rawPath && rawPath !== "undefined" && rawPath !== "null") {
    const p = rawPath.replace(/^\/+/, "");
    if (p.startsWith("http")) return p;
    return `/api/backend/${p}`;
  }
  return fallback;
}

export default function MentorInboxWired() {
  const router = useRouter();
  const { data: me } = useGetUserDetailsQuery();
  const myId = String((me as any)?.data?._id || "");
  const isMentor = Boolean((me as any)?.data?.isMentor);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickSend, setShowQuickSend] = useState(false);

  const [threads, setThreads] = useState<ConversationRow[]>([]);
  const partnerCache = useRef<Map<string, any>>(new Map());
  const [loadingThreads, setLoadingThreads] = useState(true);

  const [messages, setMessages] = useState<
    Array<{ id: string; sender: "user" | "mentor"; text: string; timestamp: string; clientId?: string | null }>
  >([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { data: subscriberRes } = useGetSubscriberListQuery(myId as any, { skip: !isMentor || !myId });
  const subscribers: Array<{ userId: string; fullName?: string; userName?: string; photoId?: string | null }> =
    ((subscriberRes as any)?.data ?? []) as any;

  const { data: notifRes } = useGetNotificationQuery({ page: 1, perPage: 50 } as any, { skip: !myId });
  const notifications: any[] = ((notifRes as any)?.data ?? []) as any;

  const hydratePartner = async (partnerId: string) => {
    if (!partnerId) return null;
    if (partnerCache.current.has(partnerId)) return partnerCache.current.get(partnerId);
    try {
      const u = await getUserById(partnerId);
      partnerCache.current.set(partnerId, u);
      return u;
    } catch {
      return null;
    }
  };

  const refreshThreads = async () => {
    if (!myId) return;
    setLoadingThreads(true);
    try {
      const list = await listConversations();
      const rows: ConversationRow[] = [];
      for (const t of list) {
        const partnerId = (t.participants || []).map(String).find((p) => p !== myId) || "";
        const partner = await hydratePartner(partnerId);
        const name = String(partner?.fullName || partner?.userName || "User");
        rows.push({
          id: String(t.id),
          user: {
            id: partnerId,
            name,
            avatar: avatarFromUser(partner),
          },
          lastMessage: String(t.lastMessageText || ""),
          timestamp: relTimeCompact(t.lastMessageAt || null),
          unread: Number(t.unread || 0),
          // Backend doesn't support these yet; keep false to preserve layout.
          isImportant: false,
          needsFollowUp: false,
        });
      }
      setThreads(rows);
      if (!selectedConversationId && rows.length) {
        setSelectedConversationId(rows[0].id);
      }
    } finally {
      setLoadingThreads(false);
    }
  };

  const selectedConversation = useMemo(() => {
    return threads.find((c) => c.id === selectedConversationId) || null;
  }, [threads, selectedConversationId]);

  const loadMessages = async (id: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await listConversationMessages(id);
      setMessages(
        msgs.map((m: ConversationMessage) => ({
          id: String(m.id),
          sender: String(m.sender) === myId ? "mentor" : "user",
          text: String(m.text || ""),
          timestamp: (() => {
            try {
              return format(new Date(m.createdAt), "h:mm a");
            } catch {
              return "";
            }
          })(),
          clientId: m.clientId || null,
        }))
      );
      try {
        await markConversationRead(id);
      } catch {}
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    refreshThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(selectedConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);

  // SSE live updates
  useEffect(() => {
    if (!myId) return;
    ensureRealtimeStarted();
    const s = getRealtimeSse();
    const offThread = s.on("chat:thread", () => refreshThreads());
    const offRead = s.on("chat:read", () => refreshThreads());
    const offMsg = s.on("chat:message", (payload: any) => {
      const tid = String(payload?.threadId || "");
      if (tid) refreshThreads();
      if (selectedConversationId && tid === selectedConversationId) {
        const m = payload?.message;
        if (!m?.id) return;
        setMessages((prev) => {
          const cid = m.clientId ? String(m.clientId) : null;
          if (cid) {
            const idx = prev.findIndex((x) => x.clientId && String(x.clientId) === cid);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = {
                id: String(m.id),
                sender: String(m.sender) === myId ? "mentor" : "user",
                text: String(m.text || ""),
                timestamp: (() => {
                  try {
                    return format(new Date(m.createdAt), "h:mm a");
                  } catch {
                    return "";
                  }
                })(),
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
              sender: String(m.sender) === myId ? "mentor" : "user",
              text: String(m.text || ""),
              timestamp: (() => {
                try {
                  return format(new Date(m.createdAt), "h:mm a");
                } catch {
                  return "";
                }
              })(),
              clientId: cid,
            },
          ];
        });
      }
    });
    return () => {
      offThread();
      offRead();
      offMsg();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, selectedConversationId]);

  const handleSendMessage = async () => {
    if (!selectedConversationId) return;
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const clientId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setMessages((prev) => [
      ...prev,
      {
        id: clientId,
        sender: "mentor",
        text: trimmed,
        timestamp: format(new Date(), "h:mm a"),
        clientId,
      },
    ]);
    setMessageText("");

    try {
      await sendConversationMessage(selectedConversationId, trimmed, clientId);
    } catch {
      // leave optimistic message; UI parity first
    }
  };

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((c) => {
      const name = c.user.name.toLowerCase();
      const last = (c.lastMessage || "").toLowerCase();
      return name.includes(q) || last.includes(q);
    });
  }, [threads, searchQuery]);

  const openSubscriber = async (subUserId: string) => {
    try {
      const existing = threads.find((t) => t.user.id === subUserId)?.id;
      if (existing) return setSelectedConversationId(existing);
      const id = await createConversation(subUserId);
      await refreshThreads();
      setSelectedConversationId(id);
    } catch {}
  };

  return (
    <div className="h-screen bg-white flex flex-col" data-test="design-mentor-inbox-wired">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-gray-900">Mentor Inbox</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0078D7] z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 h-12 bg-white border-2 border-gray-100 text-gray-900 placeholder:text-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0078D7]/20 focus:border-[#0078D7]/30 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="mx-3 mt-3 grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="subscribers">
                <Users className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="important">Important</TabsTrigger>
              <TabsTrigger value="followup">Follow-up</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-y-auto mt-0">
              {loadingThreads ? (
                <div className="p-4 text-sm text-gray-500">Loading…</div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No conversations</div>
              ) : (
                filteredThreads.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors border-b ${
                      selectedConversationId === conversation.id ? "bg-gray-100" : ""
                    }`}
                    data-test="design-thread-row"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.user.avatar} />
                        <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                      </Avatar>
                      {conversation.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(var(--brand-medium-blue))] text-white rounded-full flex items-center justify-center text-xs">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{conversation.user.name}</h4>
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      <div className="flex gap-1 mt-1">
                        {conversation.isImportant && (
                          <div className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-xs">
                            Important
                          </div>
                        )}
                        {conversation.needsFollowUp && (
                          <div className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs">
                            Follow-up
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </TabsContent>

            <TabsContent value="subscribers" className="flex-1 overflow-y-auto mt-0">
              {!isMentor ? (
                <div className="p-4 text-sm text-gray-500">Become a mentor to see subscribers.</div>
              ) : (
                subscribers.map((subscriber: any) => (
                  <button
                    key={String(subscriber.userId)}
                    onClick={() => openSubscriber(String(subscriber.userId))}
                    className="w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors border-b"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={subscriber.photoId ? `/api/backend/${String(subscriber.photoId).replace(/^\/+/, "")}` : "/assets/images/Home/small-profile-img.svg"} />
                      <AvatarFallback>{String(subscriber.fullName || subscriber.userName || "S")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{subscriber.fullName || subscriber.userName}</h4>
                        <Flag className="w-4 h-4 text-green-500 fill-green-500" />
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-1">{String(subscriber.userName ? `@${subscriber.userName}` : "")}</p>
                      <p className="text-xs text-gray-400">Member • Active</p>
                    </div>
                  </button>
                ))
              )}
            </TabsContent>

            <TabsContent value="important" className="flex-1 overflow-y-auto mt-0">
              <div className="p-4 text-sm text-gray-500">No “Important” flag in backend yet.</div>
            </TabsContent>

            <TabsContent value="followup" className="flex-1 overflow-y-auto mt-0">
              <div className="p-4 text-sm text-gray-500">No “Follow-up” flag in backend yet.</div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation?.user.avatar || "/assets/images/Home/small-profile-img.svg"} />
                <AvatarFallback>{String(selectedConversation?.user.name || "C")[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedConversation?.user.name || "Select a conversation"}</h3>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" />
                  Mark as Important
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="w-4 h-4 mr-2" />
                  Needs Follow-up
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Student Center</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-gray-500">No messages yet.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "mentor" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] ${
                      message.sender === "mentor"
                        ? "bg-[hsl(var(--brand-medium-blue))] text-white rounded-2xl rounded-tr-sm"
                        : "bg-gray-100 rounded-2xl rounded-tl-sm"
                    } px-4 py-2`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === "mentor" ? "text-white/70" : "text-gray-500"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Send Tools */}
          {showQuickSend && (
            <div className="border-t p-3 bg-gray-100/50">
              <p className="text-xs text-gray-500 mb-2">Quick Send</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Workout
                </Button>
                <Button variant="outline" size="sm">
                  <Utensils className="w-4 h-4 mr-2" />
                  Meal Plan
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Template
                </Button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickSend(!showQuickSend)}
                className={showQuickSend ? "bg-gray-100" : ""}
              >
                <Plus className="w-5 h-5" />
              </Button>
              <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-2xl px-4 py-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Paperclip className="w-5 h-5" />
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!messageText.trim() || !selectedConversationId}
                className="bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))] text-white shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications are used by the normal ChatPage export; kept here for wiring completeness */}
      <div className="hidden" data-test="design-notifications-count">
        {notifications.length}
      </div>
    </div>
  );
}


