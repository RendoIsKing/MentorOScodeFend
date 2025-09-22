"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { baseServerUrl } from '@/lib/utils';

type DM = { id: string; sender: string; text: string; createdAt: string };

export default function MajenDMPage(){
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DM[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Poll messages every 2s
  useEffect(() => {
    let timer: any;
    async function ensureAndPoll(){
      try {
        // ensure thread
        if (!threadId) {
          const r = await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/thread`, { credentials: 'include' });
          const j = await r.json();
          setThreadId(String(j?.threadId || ''));
        }
        // fetch messages
        const idToUse = threadId || (await (async ()=>{
          const r = await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/thread`, { credentials: 'include' });
          const j = await r.json();
          return String(j?.threadId || '');
        })());
        if (!idToUse) return;
        const rm = await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/messages`, { credentials: 'include' });
        const jm = await rm.json();
        const list: DM[] = Array.isArray(jm?.messages) ? jm.messages.map((m: any) => ({ id: String(m._id || m.id), sender: String(m.sender), text: String(m.text), createdAt: m.createdAt })) : [];
        list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        setMessages(list);
      } catch {}
      timer = setTimeout(ensureAndPoll, 2000);
    }
    ensureAndPoll();
    return () => { if (timer) clearTimeout(timer); };
  }, [threadId]);

  async function send(){
    if (!input.trim() || loading) return;
    const optimistic = { id: `tmp-${Date.now()}`, sender: 'me', text: input.trim(), createdAt: new Date().toISOString() } as DM;
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setLoading(true);
    try {
      await fetch(`${baseServerUrl}/v1/interaction/chat/coach-majen/message`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: optimistic.text })
      });
    } catch {
      setMessages(prev => prev.filter(m => m !== optimistic));
      setInput(optimistic.text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-md px-6 md:px-8 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Messages with Coach Majen</h1>
        <a href="/coach-majen" className="text-sm underline">Switch to Avatar</a>
      </div>
      <div className="rounded border p-4 h-[60vh] overflow-y-auto bg-background/50">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">Send a message to start.</div>
        )}
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-md px-3 py-2 text-sm border ${m.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <form className="space-y-2" onSubmit={(e)=>{ e.preventDefault(); send(); }}>
        <Textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Skriv melding..." className="h-28" />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
        </div>
      </form>
    </div>
  );
}


