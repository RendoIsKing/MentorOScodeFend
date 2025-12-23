"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/ChatPage.tsx` but wired to real backend data.
// We keep the export's layout/classes as close as practical, then iterate to pixel-parity.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmptyState from "@/components/EmptyState";
import MentorChatView from "@/components/MentorChatView";
import {
  Bell,
  Dumbbell,
  Flag,
  Heart,
  MessageCircle,
  MessagesSquare,
  Search,
  Send,
  User,
  Users,
  Paperclip,
  Smile,
  ArrowLeft,
} from "lucide-react";
import { ensureRealtimeStarted, getRealtimeSse } from "@/lib/realtime/sse";
import {
  createConversation,
  getUserById,
  listConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
  type ConversationMessage,
} from "@/lib/api/conversations";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetSubscriberListQuery } from "@/redux/services/haveme/user";
import { useGetNotificationQuery } from "@/redux/services/haveme/notifications";
import { format } from "date-fns";

type Conversation = {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    online: boolean;
    isMentor?: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
};

type Subscriber = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  goal: string;
  status: "on-track" | "needs-attention" | "urgent";
  memberSince: string;
  lastActive: string;
  userId: string;
};

type Notification = {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "subscriber" | "system";
  user: { name: string; username: string; avatar: string };
  content: string;
  timestamp: string;
  postImage?: string;
  read: boolean;
};

function relTimeCompact(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.max(0, Math.floor(diff / 60000));
  if (m < 1) return "Now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function avatarFromUser(u: any): string {
  const fallback = "/assets/images/Home/small-profile-img.svg";
  const rawPath = String(u?.photo?.path || u?.photoId?.path || u?.photoId || "").trim();
  if (rawPath && rawPath !== "undefined" && rawPath !== "null") {
    const p = rawPath.replace(/^\/+/, "");
    if (p.startsWith("http")) return p;
    return `/api/backend/${p}`;
  }
  return fallback;
}

function guessNotifType(n: any): Notification["type"] {
  const text = `${n?.title || ""} ${n?.description || ""} ${n?.type || ""}`.toLowerCase();
  if (text.includes("follow")) return "follow";
  if (text.includes("comment")) return "comment";
  if (text.includes("like")) return "like";
  if (text.includes("subscriber") || text.includes("subscribe")) return "subscriber";
  return "system";
}

function ChatInterface({
  conversation,
  myId,
  onBack,
}: {
  conversation: Conversation;
  myId: string;
  onBack: () => void;
}) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [msgs, setMsgs] = useState<Array<{ id: string; sender: "me" | "them"; text: string; createdAt: string; clientId?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listConversationMessages(conversation.id);
      setMsgs(
        list.map((m: ConversationMessage) => ({
          id: String(m.id),
          sender: String(m.sender) === myId ? "me" : "them",
          text: String(m.text || ""),
          createdAt: String(m.createdAt || new Date().toISOString()),
          clientId: m.clientId || null,
        }))
      );
      try { await markConversationRead(conversation.id); } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    ensureRealtimeStarted();
    const s = getRealtimeSse();
    const off = s.on("chat:message", (payload: any) => {
      if (String(payload?.threadId || "") !== String(conversation.id)) return;
      const m = payload?.message;
      if (!m?.id) return;
      setMsgs((prev) => {
        const cid = m.clientId ? String(m.clientId) : null;
        if (cid) {
          const idx = prev.findIndex((x) => x.clientId && String(x.clientId) === cid);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = {
              id: String(m.id),
              sender: String(m.sender) === myId ? "me" : "them",
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
          { id: String(m.id), sender: String(m.sender) === myId ? "me" : "them", text: String(m.text || ""), createdAt: String(m.createdAt || new Date().toISOString()), clientId: cid },
        ];
      });
    });
    return () => off();
  }, [conversation.id, myId]);

  const send = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const clientId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setMsgs((prev) => [...prev, { id: clientId, sender: "me", text: trimmed, createdAt: new Date().toISOString(), clientId }]);
    setMessage("");
    try {
      await sendConversationMessage(conversation.id, trimmed, clientId);
    } catch {}
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.user.avatar} />
              <AvatarFallback style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}>{conversation.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-gray-900 font-semibold truncate">{conversation.user.name}</div>
              <div className="text-xs text-gray-500 truncate">{conversation.user.username}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : (
          msgs.map((m) => {
            const mine = m.sender === "me";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`space-y-1 max-w-[75%] ${mine ? "flex flex-col items-end" : ""}`}>
                  <div className={`${mine ? "bg-[#0078D7] text-white rounded-2xl rounded-br-sm" : "bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100"} px-4 py-2.5`}>
                    <p className="text-sm" style={{ color: mine ? "#fff" : "#1F2937" }}>{m.text}</p>
                  </div>
                  <p className="text-xs px-2" style={{ color: "#9CA3AF" }}>
                    {(() => {
                      try { return format(new Date(m.createdAt), "h:mm a"); } catch { return ""; }
                    })()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0 pb-24">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Paperclip className="h-5 w-5" style={{ color: "#6B7280" }} />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-10 bg-gray-50 border-gray-200 rounded-full h-10"
              style={{ color: "#1F2937" }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 hover:bg-transparent">
              <Smile className="h-5 w-5" style={{ color: "#6B7280" }} />
            </Button>
          </div>
          <Button size="icon" className="bg-[#0078D7] hover:bg-[#0078D7]/90 rounded-full h-10 w-10" onClick={send} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {/* keep parity: placeholder overlay is controlled by isFocused in export */}
        <div className="hidden">{String(isFocused)}</div>
      </div>
    </div>
  );
}

export default function ChatPageWired() {
  const searchParams = useSearchParams();
  const preselectConversationId = (searchParams.get("conversationId") || searchParams.get("id") || "").trim();
  const preselectTo = (searchParams.get("to") || searchParams.get("u") || "").trim();

  const { data: me } = useGetUserDetailsQuery();
  const myId = String((me as any)?.data?._id || "");
  const isMentor = Boolean((me as any)?.data?.isMentor);

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "subscribers" | "notifications">("chats");
  const [chatFilter, setChatFilter] = useState<"all" | "users" | "mentors">("all");
  const [isFocused, setIsFocused] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const partnerCache = useRef<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  const { data: subscriberRes } = useGetSubscriberListQuery(myId as any, { skip: !isMentor || !myId });
  const subscribers: Subscriber[] = useMemo(() => {
    const list = ((subscriberRes as any)?.data ?? []) as any[];
    return list.map((s) => {
      const name = String(s.fullName || s.userName || "Subscriber");
      const uname = String(s.userName || "");
      return {
        id: String(s.userId),
        userId: String(s.userId),
        name,
        username: uname ? `@${uname}` : "",
        avatar: s.photoId ? `/api/backend/${String(s.photoId).replace(/^\/+/, "")}` : "/assets/images/Home/small-profile-img.svg",
        goal: "Your subscriber",
        status: "on-track",
        memberSince: "—",
        lastActive: "—",
      };
    });
  }, [subscriberRes]);

  const { data: notifRes } = useGetNotificationQuery({ page: 1, perPage: 50 } as any, { skip: !myId });
  const notifications: Notification[] = useMemo(() => {
    const list = ((notifRes as any)?.data ?? []) as any[];
    return list.map((n: any, idx: number) => {
      const fromName = String(n?.notificationFromUserDetails || "System");
      const t = guessNotifType(n);
      return {
        id: String(n?._id || n?.id || idx),
        type: t,
        user: { name: fromName, username: `@${fromName}`, avatar: "/assets/images/Notification/user-another1.svg" },
        content: String(n?.description || n?.title || ""),
        timestamp: relTimeCompact(n?.createdAt || n?.updatedAt || null),
        read: Boolean(n?.readAt),
      };
    });
  }, [notifRes]);

  const hydratePartner = async (id: string) => {
    if (!id) return null;
    if (partnerCache.current.has(id)) return partnerCache.current.get(id);
    try {
      const u = await getUserById(id);
      partnerCache.current.set(id, u);
      return u;
    } catch {
      return null;
    }
  };

  const refresh = async () => {
    if (!myId) return;
    setLoading(true);
    try {
      const list = await listConversations();
      const mapped: Conversation[] = [];
      for (const c of list) {
        const partnerId = (c.participants || []).map(String).find((p) => p !== myId) || "";
        const u = await hydratePartner(partnerId);
        const name = String(u?.fullName || u?.userName || "User");
        const uname = String(u?.userName || "");
        mapped.push({
          id: String(c.id),
          user: {
            id: partnerId,
            name,
            username: uname ? `@${uname}` : "",
            avatar: avatarFromUser(u),
            online: false,
            isMentor: Boolean(u?.isMentor),
          },
          lastMessage: String(c.lastMessageText || ""),
          timestamp: relTimeCompact(c.lastMessageAt || null),
          unreadCount: Number(c.unread || 0),
        });
      }
      setConversations(mapped);
    } finally {
      setLoading(false);
    }
  };

  // Deep-link support: open a conversation directly from other screens (profiles, etc.)
  useEffect(() => {
    if (preselectConversationId) {
      setSelectedChat(preselectConversationId);
      setSelectedSubscriber(null);
      setActiveTab("chats");
      return;
    }
    if (preselectTo) {
      createConversation(preselectTo)
        .then((id) => {
          setSelectedChat(String(id));
          setSelectedSubscriber(null);
          setActiveTab("chats");
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectConversationId, preselectTo]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  useEffect(() => {
    if (!myId) return;
    ensureRealtimeStarted();
    const s = getRealtimeSse();
    const offThread = s.on("chat:thread", () => refresh());
    const offRead = s.on("chat:read", () => refresh());
    return () => {
      offThread();
      offRead();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (chatFilter !== "all") {
      list = list.filter((c) => (chatFilter === "mentors" ? Boolean(c.user.isMentor) : !Boolean(c.user.isMentor)));
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.user.name.toLowerCase().includes(q) || (c.lastMessage || "").toLowerCase().includes(q));
  }, [conversations, chatFilter, searchQuery]);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter((n) => n.content.toLowerCase().includes(q) || n.user.name.toLowerCase().includes(q));
  }, [notifications, searchQuery]);

  // If a chat is selected, show the chat interface
  if (selectedChat !== null) {
    const conversation = conversations.find((c) => String(c.id) === String(selectedChat));
    if (conversation) {
      return <ChatInterface conversation={conversation} myId={myId} onBack={() => setSelectedChat(null)} />;
    }
    // fallback
    return (
      <div className="h-screen bg-white flex items-center justify-center text-sm text-gray-500">
        Loading conversation…
      </div>
    );
  }

  // If a subscriber is selected (mentor-only feature), show MentorChatView (design export behavior)
  if (selectedSubscriber) {
    return (
      <MentorChatView
        subscriber={{
          name: selectedSubscriber.name,
          avatar: selectedSubscriber.avatar,
          goal: selectedSubscriber.goal,
          status: selectedSubscriber.status,
          memberSince: selectedSubscriber.memberSince,
          lastActive: selectedSubscriber.lastActive,
        }}
        onBack={() => setSelectedSubscriber(null)}
      />
    );
  }

  // Otherwise show the inbox list
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden" data-test="design-chatpage-wired">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl text-gray-900">Messages</h1>
          </div>

          {/* Search */}
          <div className="relative">
            {!searchQuery && !isFocused && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-gray-400">
                <Search className="h-5 w-5 text-[#0078D7]" />
                <span>Search messages...</span>
              </div>
            )}
            <Input
              type="text"
              placeholder=""
              className="pl-4 h-12 bg-white border-2 border-gray-100 text-gray-900 placeholder:text-gray-400 rounded-2xl focus:ring-2 focus:ring-[#0078D7]/20 focus:border-[#0078D7]/30 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === "chats" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("chats")}
              className={activeTab === "chats" ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}
            >
              <MessagesSquare className="h-4 w-4 mr-2" />
              Chats
            </Button>
            {isMentor && (
              <Button
                variant={activeTab === "subscribers" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("subscribers")}
                className={activeTab === "subscribers" ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}
              >
                <Users className="h-4 w-4 mr-2" />
                Subscribers
              </Button>
            )}
            <div className="relative">
              <Button
                variant={activeTab === "notifications" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("notifications")}
                className={activeTab === "notifications" ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </div>
          </div>

          {/* Chat Filters */}
          {activeTab === "chats" && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatFilter("all")}
                className={`rounded-lg ${chatFilter === "all" ? "bg-gray-100 text-gray-900" : "text-gray-600"}`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatFilter("users")}
                className={`rounded-lg ${chatFilter === "users" ? "bg-gray-100 text-gray-900" : "text-gray-600"}`}
              >
                <User className="h-4 w-4 mr-1.5" />
                Users
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatFilter("mentors")}
                className={`rounded-lg ${chatFilter === "mentors" ? "bg-gray-100 text-gray-900" : "text-gray-600"}`}
              >
                <Dumbbell className="h-4 w-4 mr-1.5" />
                Mentors
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="divide-y">
          {activeTab === "subscribers" ? (
            subscribers.length === 0 ? (
              <EmptyState
                icon={Users as any}
                title="No subscribers yet"
                description="Your subscribers will appear here when they join your program."
                iconColor="hsl(var(--brand-medium-blue))"
                iconBgColor="hsl(var(--brand-medium-blue)/0.1)"
              />
            ) : (
              subscribers.map((subscriber) => (
                <button
                  key={subscriber.id}
                  onClick={() => setSelectedSubscriber(subscriber)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={subscriber.avatar} />
                      <AvatarFallback style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}>{subscriber.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="truncate" style={{ color: "#1F2937", fontWeight: "600", fontSize: "15px" }}>
                        {subscriber.name}
                      </h3>
                      <Flag className="w-4 h-4 flex-shrink-0 text-green-500 fill-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-1">{subscriber.goal}</p>
                    <p className="text-xs text-gray-400">
                      Member: {subscriber.memberSince} • Active {subscriber.lastActive}
                    </p>
                  </div>
                </button>
              ))
            )
          ) : activeTab === "chats" ? (
            loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading…</div>
            ) : filteredConversations.length === 0 ? (
              searchQuery ? (
                <div className="p-8 text-center text-muted-foreground">No conversations found</div>
              ) : (
                <EmptyState
                  icon={MessagesSquare as any}
                  title="No conversations yet"
                  description="Start connecting with others in the community. Send a message to begin a conversation!"
                  iconColor="hsl(var(--brand-medium-blue))"
                  iconBgColor="hsl(var(--brand-medium-blue)/0.1)"
                />
              )
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}>
                        {conversation.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.user.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="truncate" style={{ color: "#1F2937", fontWeight: "600", fontSize: "15px" }}>
                        {conversation.user.name}
                      </h3>
                      <span className="flex-shrink-0 ml-2 text-xs" style={{ color: "#9CA3AF" }}>
                        {conversation.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="text-sm truncate"
                        style={{
                          color: conversation.unreadCount > 0 ? "#1F2937" : "#6B7280",
                          fontWeight: conversation.unreadCount > 0 ? "500" : "400",
                        }}
                      >
                        {conversation.lastMessage || " "}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-2 h-2 bg-[#0078D7] rounded-full"></span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No notifications found</div>
          ) : (
            filteredNotifications.map((notification) => {
              const getNotificationIcon = () => {
                switch (notification.type) {
                  case "like":
                    return <Heart className="h-2.5 w-2.5 text-white" fill="white" />;
                  case "comment":
                    return <MessageCircle className="h-2.5 w-2.5 text-white" fill="white" />;
                  case "follow":
                    return <User className="h-2.5 w-2.5 text-white" />;
                  case "mention":
                    return <span className="text-white text-[9px] font-bold leading-none">@</span>;
                  case "subscriber":
                    return <Users className="h-2.5 w-2.5 text-white" />;
                  default:
                    return <Bell className="h-2.5 w-2.5 text-white" />;
                }
              };
              const bubbleBg =
                notification.type === "like"
                  ? "bg-rose-500"
                  : notification.type === "comment"
                    ? "bg-[hsl(var(--brand-medium-blue))]"
                    : notification.type === "follow"
                      ? "bg-emerald-500"
                      : notification.type === "subscriber"
                        ? "bg-[hsl(var(--brand-dark-blue))]"
                        : "bg-gray-500";
              return (
                <button
                  key={notification.id}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={notification.user.avatar} />
                      <AvatarFallback style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}>
                        {notification.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${bubbleBg}`}>
                      {getNotificationIcon()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="truncate" style={{ color: "#1F2937", fontWeight: "600", fontSize: "15px" }}>
                        {notification.user.name}
                      </div>
                      <span className="flex-shrink-0 ml-2 text-xs" style={{ color: "#9CA3AF" }}>
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{notification.content}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


