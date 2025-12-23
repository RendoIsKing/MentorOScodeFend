"use client";

// Port of `Edit Design Request (1)/src/components/MentorChatView.tsx`.
// Note: the export used `emoji-picker-react`; we keep the UX but use a tiny built-in emoji palette
// to avoid adding another dependency.

import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  Bot,
  User,
  Info,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Flag,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Subscriber = {
  name: string;
  username?: string;
  avatar: string;
  goal: string;
  status: "on-track" | "needs-attention" | "urgent";
  memberSince?: string;
  lastActive?: string;
};

interface MentorChatViewProps {
  subscriber: Subscriber;
  onBack: () => void;
}

type MessageType = "summary" | "warning" | "action" | "yellow-flag" | "red-flag";

interface Message {
  id: number;
  sender: "user" | "ai" | "mentor";
  content: string;
  timestamp: string;
  type?: MessageType;
  flagDetails?: { issue: string; action: string };
}

const emojiPalette = ["😀", "💪", "🔥", "🎯", "✅", "🥗", "🏋️", "👏", "😊", "⚡️"];

export default function MentorChatView({ subscriber, onBack }: MentorChatViewProps) {
  const [activeTab, setActiveTab] = useState<"ai-user" | "mentor-user" | "mentor-ai">("ai-user");
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<Message | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) setShowEmojiPicker(false);
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) setShowAttachmentMenu(false);
    };
    if (showEmojiPicker || showAttachmentMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker, showAttachmentMenu]);

  const [aiUserMessages, setAiUserMessages] = useState<Message[]>([
    { id: 1, sender: "user", content: "Hey Coach! I just finished today's workout. Feeling great! 💪", timestamp: "9:15 AM" },
    { id: 2, sender: "ai", content: "Fantastic work! How are you feeling about the intensity level?", timestamp: "9:16 AM" },
  ]);

  const [mentorUserMessages, setMentorUserMessages] = useState<Message[]>([
    { id: 1, sender: "user", content: "Hi! I wanted to ask about modifying my diet plan for the holidays.", timestamp: "Yesterday 3:45 PM" },
    { id: 2, sender: "mentor", content: "Great question. What specific concerns do you have?", timestamp: "Yesterday 3:52 PM" },
  ]);

  const [mentorAiMessages, setMentorAiMessages] = useState<Message[]>([
    { id: 1, sender: "mentor", content: `Give me a summary of ${subscriber.name}'s progress this week.`, timestamp: "Today 8:30 AM" },
    {
      id: 2,
      sender: "ai",
      content:
        "Here's a weekly summary:\n\n✅ Workouts: 5/5 completed\n✅ Nutrition: 90% adherence\n✅ Weight: -1.2 lbs (on track)\n✅ Energy levels: High\n\nAreas to watch: hydration.",
      timestamp: "Today 8:31 AM",
      type: "summary",
    },
    {
      id: 3,
      sender: "ai",
      content: "Yellow Flag Alert",
      timestamp: "Today 8:33 AM",
      type: "yellow-flag",
      flagDetails: {
        issue: "User reported sharp pain in lower back during deadlifts.",
        action: "AI removed deadlifts from today’s workout and replaced with alternatives.",
      },
    },
    {
      id: 4,
      sender: "ai",
      content: "Red Flag Alert",
      timestamp: "Today 8:45 AM",
      type: "red-flag",
      flagDetails: {
        issue: "User insists on heavy squats despite persistent knee pain.",
        action: "AI is providing general wellness guidance while awaiting your decision.",
      },
    },
  ]);

  const getCurrentMessages = () => {
    if (activeTab === "ai-user") return aiUserMessages;
    if (activeTab === "mentor-user") return mentorUserMessages;
    return mentorAiMessages;
  };

  const getNextId = () => {
    const cur = getCurrentMessages();
    return cur.length > 0 ? Math.max(...cur.map((m) => m.id)) + 1 : 1;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage: Message = { id: getNextId(), sender: "mentor", content: message.trim(), timestamp: getCurrentTime() };
    if (activeTab === "mentor-user") setMentorUserMessages((prev) => [...prev, newMessage]);
    else if (activeTab === "mentor-ai") {
      setMentorAiMessages((prev) => [...prev, newMessage]);
      setTimeout(() => {
        const aiResponse: Message = { id: getNextId() + 1, sender: "ai", content: "Got it—analyzing and preparing suggestions…", timestamp: getCurrentTime(), type: "action" };
        setMentorAiMessages((prev) => [...prev, aiResponse]);
      }, 800);
    } else setAiUserMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setShowEmojiPicker(false);
  };

  const statusBadge = (() => {
    if (subscriber.status === "urgent") return <Badge className="bg-red-500/10 text-red-600 border border-red-200">Urgent</Badge>;
    if (subscriber.status === "needs-attention") return <Badge className="bg-yellow-500/10 text-yellow-700 border border-yellow-200">Needs attention</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-200">On track</Badge>;
  })();

  const renderFlagCard = (m: Message) => {
    const isRed = m.type === "red-flag";
    return (
      <button
        onClick={() => setSelectedFlag(m)}
        className={`w-full text-left p-3 rounded-xl border ${
          isRed ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
        } hover:opacity-90 transition`}
      >
        <div className="flex items-center gap-2">
          {isRed ? <ShieldAlert className="h-4 w-4 text-red-600" /> : <Flag className="h-4 w-4 text-yellow-700" />}
          <span className={`text-sm ${isRed ? "text-red-700" : "text-yellow-800"}`}>{m.content}</span>
          <ArrowRight className="ml-auto h-4 w-4 text-gray-500" />
        </div>
        {m.flagDetails?.issue ? <div className="mt-2 text-xs text-gray-700">{m.flagDetails.issue}</div> : null}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-test="mentor-chat-view">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={subscriber.avatar} />
            <AvatarFallback>{subscriber.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900 truncate">{subscriber.name}</div>
              {statusBadge}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {subscriber.goal}
              {subscriber.lastActive ? ` • Last active ${subscriber.lastActive}` : ""}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto rounded-full" onClick={() => setShowReviewModal(true)}>
            <Info className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-2">
            <Button variant={activeTab === "ai-user" ? "default" : "outline"} className="rounded-xl" onClick={() => setActiveTab("ai-user")}>
              <Bot className="h-4 w-4 mr-2" /> AI ↔ User
            </Button>
            <Button variant={activeTab === "mentor-user" ? "default" : "outline"} className="rounded-xl" onClick={() => setActiveTab("mentor-user")}>
              <MessageCircle className="h-4 w-4 mr-2" /> Mentor ↔ User
            </Button>
            <Button variant={activeTab === "mentor-ai" ? "default" : "outline"} className="rounded-xl" onClick={() => setActiveTab("mentor-ai")}>
              <User className="h-4 w-4 mr-2" /> Mentor ↔ AI
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {getCurrentMessages().map((m) => {
          const isMine = m.sender === "mentor";
          if (m.type === "yellow-flag" || m.type === "red-flag") return <div key={m.id}>{renderFlagCard(m)}</div>;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`${isMine ? "bg-[#0078D7] text-white rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"} rounded-2xl px-4 py-2 max-w-[82%] whitespace-pre-line`}>
                <div className="text-sm">{m.content}</div>
                <div className={`text-[10px] mt-1 ${isMine ? "text-white/80" : "text-gray-500"}`}>{m.timestamp}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="relative flex items-center gap-2">
          <div className="relative" ref={attachmentMenuRef}>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAttachmentMenu((v) => !v)}>
              <Paperclip className="h-5 w-5" />
            </Button>
            {showAttachmentMenu && (
              <div className="absolute bottom-12 left-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Upload image
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Upload doc
                </button>
              </div>
            )}
          </div>

          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="rounded-full"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSendMessage())}
          />

          <div className="relative" ref={emojiPickerRef}>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowEmojiPicker((v) => !v)}>
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-5 gap-1">
                {emojiPalette.map((e) => (
                  <button
                    key={e}
                    className="h-9 w-9 rounded-lg hover:bg-gray-50 text-lg"
                    onClick={() => {
                      setMessage((m) => `${m}${e}`);
                      inputRef.current?.focus();
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button className="rounded-full" onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Flag details modal */}
      {selectedFlag && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedFlag(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  {selectedFlag.type === "red-flag" ? (
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  ) : (
                    <Flag className="h-5 w-5 text-yellow-700" />
                  )}
                  {selectedFlag.content}
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedFlag(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Issue</div>
                  <div>{selectedFlag.flagDetails?.issue || "—"}</div>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">AI Action</div>
                  <div>{selectedFlag.flagDetails?.action || "—"}</div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setSelectedFlag(null)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={() => setSelectedFlag(null)}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  These actions are UI-only for now (no backend workflow yet).
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* "Review/Info" modal */}
      {showReviewModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowReviewModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold text-gray-900">Subscriber info</div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowReviewModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Goal</span>
                  <span className="font-medium">{subscriber.goal}</span>
                </div>
                {subscriber.memberSince ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Member since</span>
                    <span className="font-medium">{subscriber.memberSince}</span>
                  </div>
                ) : null}
                {subscriber.lastActive ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Last active</span>
                    <span className="font-medium">{subscriber.lastActive}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


