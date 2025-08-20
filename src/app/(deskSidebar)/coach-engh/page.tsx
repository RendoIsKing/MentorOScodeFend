"use client";
import React, { useEffect, useRef, useState } from 'react';
import { baseServerUrl } from '@/lib/utils';
import { useTypedSelector } from '@/redux/store';
import { selectIsAuthenticated } from '@/redux/slices/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ChatMessage = { role: 'user'|'assistant'|'system'; content: string };

export default function CoachEnghChatPage(){
  const isLoggedIn = useTypedSelector(selectIsAuthenticated);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(){
    if (!input.trim() || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${baseServerUrl}/v1/interaction/chat/engh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: next[next.length-1].content, history: next.slice(-10) }),
      });
      const data = await res.json();
      if (data?.reply) {
        setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Beklager, noe gikk galt. Prøv igjen.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-md px-6 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Coach Engh</h1>
      <div className="rounded border p-4 h-[60vh] overflow-y-auto bg-background/50">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">Start en samtale med Coach Engh.</div>
        )}
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-md px-3 py-2 text-sm border ${m.role==='user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{m.content}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <form
        className="space-y-2"
        onSubmit={(e)=>{ e.preventDefault(); send(); }}
      >
        <Textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Skriv melding..." className="h-28" />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
        </div>
      </form>
    </div>
  );
}


