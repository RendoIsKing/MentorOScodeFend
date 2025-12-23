"use client";

// NOTE: This is a near-verbatim port of `Edit Design Request (1)/src/pages/MentorInbox.tsx`
// to validate pixel-parity styling inside the Next.js app before wiring real backend data.

import React, { useState } from "react";
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

const conversations = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    },
    lastMessage: "Thanks for the meal plan! Quick question about...",
    timestamp: "2m ago",
    unread: 2,
    isImportant: true,
    needsFollowUp: false,
  },
  {
    id: 2,
    user: {
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    lastMessage: "Completed week 4! Feeling stronger 💪",
    timestamp: "1h ago",
    unread: 0,
    isImportant: false,
    needsFollowUp: true,
  },
  {
    id: 3,
    user: {
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
    lastMessage: "Should I adjust my protein intake?",
    timestamp: "3h ago",
    unread: 1,
    isImportant: false,
    needsFollowUp: false,
  },
];

const subscribers = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    goal: "Lose 20 lbs and build strength",
    status: "on-track",
    memberSince: "3 months",
    lastActive: "2h ago",
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    goal: "Marathon training & nutrition",
    status: "needs-attention",
    memberSince: "6 months",
    lastActive: "1d ago",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    goal: "Weight loss journey - 30 lbs",
    status: "urgent",
    memberSince: "1 month",
    lastActive: "3d ago",
  },
  {
    id: 4,
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    goal: "Muscle gain & meal prep",
    status: "on-track",
    memberSince: "4 months",
    lastActive: "5h ago",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    goal: "Post-pregnancy fitness",
    status: "on-track",
    memberSince: "2 months",
    lastActive: "1h ago",
  },
  {
    id: 6,
    name: "David Martinez",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    goal: "Strength training for seniors",
    status: "needs-attention",
    memberSince: "5 months",
    lastActive: "2d ago",
  },
];

const messages = [
  {
    id: 1,
    sender: "user",
    text: "Hey! I just finished the workout plan you sent. It was challenging but I loved it!",
    timestamp: "10:24 AM",
  },
  {
    id: 2,
    sender: "mentor",
    text: "That's awesome! How did you feel during the HIIT portion?",
    timestamp: "10:26 AM",
  },
  {
    id: 3,
    sender: "user",
    text: "Pretty intense! My heart rate was definitely up there. Do you think I should increase the rest periods?",
    timestamp: "10:27 AM",
  },
  {
    id: 4,
    sender: "mentor",
    text: "If you completed it with good form, the rest periods are fine. We want that intensity! Keep it up and let me know how next week goes.",
    timestamp: "10:30 AM",
  },
  {
    id: 5,
    sender: "user",
    text: "Thanks for the meal plan! Quick question about protein timing—does it matter when I eat it?",
    timestamp: "2:15 PM",
  },
];

export default function MentorInboxStatic() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickSend, setShowQuickSend] = useState(false);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText("");
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col" data-test="design-mentor-inbox">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-900"
            >
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
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors border-b ${
                    selectedConversation.id === conversation.id ? "bg-gray-100" : ""
                  }`}
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
              ))}
            </TabsContent>

            <TabsContent value="subscribers" className="flex-1 overflow-y-auto mt-0">
              {subscribers.map((subscriber) => (
                <button
                  key={subscriber.id}
                  onClick={() =>
                    setSelectedConversation(
                      (conversations as any).find((c: any) => c.user.name === subscriber.name) ||
                        conversations[0]
                    )
                  }
                  className="w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors border-b"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={subscriber.avatar} />
                    <AvatarFallback>{subscriber.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{subscriber.name}</h4>
                      <Flag
                        className={`w-4 h-4 ${
                          subscriber.status === "on-track"
                            ? "text-green-500 fill-green-500"
                            : subscriber.status === "needs-attention"
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-red-500 fill-red-500"
                        }`}
                      />
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-1">{subscriber.goal}</p>
                    <p className="text-xs text-gray-400">
                      Member: {subscriber.memberSince} • Active {subscriber.lastActive}
                    </p>
                  </div>
                </button>
              ))}
            </TabsContent>

            <TabsContent value="important" className="flex-1 overflow-y-auto mt-0">
              {conversations
                .filter((c) => c.isImportant)
                .map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className="w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors border-b"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm">{conversation.user.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    </div>
                  </button>
                ))}
            </TabsContent>

            <TabsContent value="followup" className="flex-1 overflow-y-auto mt-0">
              {conversations
                .filter((c) => c.needsFollowUp)
                .map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className="w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors border-b"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm">{conversation.user.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    </div>
                  </button>
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation.user.avatar} />
                <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedConversation.user.name}</h3>
                <p className="text-xs text-gray-500">Active 2h ago</p>
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
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "mentor" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] ${
                    message.sender === "mentor"
                      ? "bg-[hsl(var(--brand-medium-blue))] text-white rounded-2xl rounded-tr-sm"
                      : "bg-gray-100 rounded-2xl rounded-tl-sm"
                  } px-4 py-2`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "mentor" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
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
                disabled={!messageText.trim()}
                className="bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))] text-white shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


