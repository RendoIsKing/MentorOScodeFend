"use client";
import React, { useEffect, useRef, useState } from 'react';
import AssetsRoot, { Trigger as AssetsTrigger, Portal as AssetsPortal } from "@/components/chat/AssetsMenu";
import ChatFooter from "@/components/chat/chat-footer";
import AvatarChatHistory from "@/components/chat/avatar-chat";
import { Separator } from "@/components/ui/separator";
import { baseServerUrl } from '@/lib/utils';

type ChatMessage = { role: 'user'|'assistant'|'system'; content: string };

export default function CoachMajenChatPage(){
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hei! Jeg er Coach Majen. Hva er målet ditt akkurat nå?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/assets/images/inbox/the-pt.jpg");
  const [displayName, setDisplayName] = useState<string>("Coach Majen");

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' }); }, [messages]);

  // Load persisted thread on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/thread`, { credentials: 'include' });
        const j = await r.json();
        if (!cancelled && Array.isArray(j?.messages)) {
          const restored = j.messages.map((m:any)=>({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
          if (restored.length) setMessages(restored);
        }
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Resolve Majen profile photo and name from backend profile
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const tryNames = ["coachmajen", "coach-majen"]; // prefer the created username, then fallback
        for (const uname of tryNames) {
          const r = await fetch(`${baseServerUrl}/v1/user/find?userName=${encodeURIComponent(uname)}`, { credentials: 'include' });
          if (!r.ok) continue;
          const j = await r.json();
          const photoPath = j?.data?.photo?.path;
          const name = String(j?.data?.fullName || j?.data?.userName || "Coach Majen");
          if (!cancelled) {
            setDisplayName(name);
            if (photoPath) setAvatarUrl(`${baseServerUrl}/${photoPath}`);
          }
          break;
        }
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  async function send(){
    if (!input.trim() || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${baseServerUrl}/v1/interaction/chat/majen`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: next[next.length-1].content, history: next.slice(-10) }),
      });
      const data = await res.json();
      // Persist user message into thread storage
      try { await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/message`, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sender:'user', text: String(next[next.length-1].content||'') }) }); } catch {}
      try {
        if (typeof window !== 'undefined') {
          // persist last msg and avatar for inbox row
          const payload = { name: displayName || 'Coach Majen', last: String(next[next.length-1].content || ''), avatar: avatarUrl };
          window.localStorage.setItem('chat-coach-majen', '1');
          window.localStorage.setItem('inbox-conv-coach-majen', JSON.stringify(payload));
          window.dispatchEvent(new Event('inbox-refresh'));
        }
      } catch {}
      if (data?.reply) {
        setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
        // Persist assistant reply
        try { await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/message`, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sender:'assistant', text: String(data.reply||'') }) }); } catch {}
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Beklager, noe gikk galt. Prøv igjen.' }]);
    } finally {
      setLoading(false);
    }
  }

  const historyMessages = messages.map(m => ({ sender: m.role === 'user' ? 'user' : 'other', text: m.content }));

  return (
    <AssetsRoot>
      <div className="flex flex-col h-screen relative">
        <AssetsPortal />
        <div>
          <div className="relative bg-gray-900/30 flex flex-col justify-end overflow-visible pt-24 mx-auto  top-0 right-0 left-0 h-[20vh] lg:h-[10vh]">
            <div className="flex items-center px-4 py-2 z-10  justify-between">
              <div className="flex items-center gap-x-8 ">
                <div className="flex align-middle mb-2">
                  <div>
                    <img alt="profile picture" src={avatarUrl} className="rounded-full ring ring-white ring-offset-0 cursor-pointer h-14 w-14 object-cover" />
                  </div>
                  <div className="ml-4 text-white h-full mt-2">
                    <h2 className="z-10 gap-y-1 overflow-hidden leading-6 ">{displayName}</h2>
                  </div>
                </div>
                <div className="flex gap-6 justify-center items-center align-middle ">
                  <AssetsTrigger />
                </div>
              </div>
              <div className="flex gap-3" />
            </div>
            <Separator />
          </div>
        </div>

        <div className="p-2 flex-grow mb-16 overflow-y-auto scrollbar">
          <AvatarChatHistory messages={historyMessages} isLoading={loading} />
        </div>
        <div className="bg-background/90 absolute bottom-0 w-full">
          <ChatFooter
            inputMessage={input}
            handleSendMessage={send}
            handleInputChange={(e:any)=>setInput(e.target.value)}
          />
        </div>
      </div>
    </AssetsRoot>
  );
}


