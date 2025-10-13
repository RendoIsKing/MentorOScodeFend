"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RealtimeBootstrap from "@/components/realtime/RealtimeBootstrap";
import ChatHistory from "@/components/chat/chat-history";
import MajenDMPage from "@/app/messages/majen/page";

export default function CoachMajenTabs() {
  const storageKey = 'coach-majen-last-tab';
  const [tab, setTab] = useState<'avatar'|'chat'>('avatar');
  useEffect(()=>{
    try { const v = window.localStorage.getItem(storageKey) as any; if (v === 'chat' || v === 'avatar') setTab(v); } catch {}
  },[]);
  function onChange(v: string){
    const val = (v === 'chat') ? 'chat' : 'avatar';
    setTab(val);
    try { window.localStorage.setItem(storageKey, val); } catch {}
  }
  return (
    <div className="mx-auto max-w-screen-md px-4 md:px-6 py-4">
      <RealtimeBootstrap />
      <div className="mb-3">
        <h1 className="text-xl font-semibold">Coach Majen</h1>
        <p className="text-sm text-muted-foreground">Avatar | Chat</p>
      </div>
      <Tabs value={tab} onValueChange={onChange} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="avatar">
          <ChatHistory />
        </TabsContent>
        <TabsContent value="chat">
          <MajenDMPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

